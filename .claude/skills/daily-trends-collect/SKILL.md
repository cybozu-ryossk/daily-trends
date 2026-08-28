---
name: trends-collect
description: "トレンドネタ収集（収集レイヤー）。はてブ・Hacker News 等から人気記事を収集し、重複統合・興味度判定した上で JSON として出力する。保存先・出力形式には関知しない。トリガーは「トレンド収集」「trends collect」など。通常は `/trends` から自動的に呼び出される。"
---

# トレンドネタ収集（収集レイヤー）

サイトから人気記事を収集し、興味領域とのマッチング・重複統合を行った上で **JSON ファイル** として出力する。保存先ディレクトリやファイル名・見出しレベル・チェックボックス形式などの「どこに・どう書くか」は関知しない（`/trends` 等の出力レイヤー側の責務）。このスキル単体では vault の存在を前提にしない。

## 出力先

`./.trends-work/trends-collect-YYYY-MM-DD.json`（カレントディレクトリ相対。ディレクトリが無ければ作成する）

既に当日分のファイルが存在する場合は上書きせず、その旨を報告して終了する（再収集したい場合はユーザーに確認の上で明示的に削除してから再実行する）。

## 実行手順

### 0. 収集プロファイル読み込み

このスキルと同じディレクトリの `interests.md` を読み込む。興味領域・収集ソース・カテゴリ粒度・業務文脈の正本（`/trends-tune` がチェック履歴に基づいて更新する）。

- 興味領域「コア」「上昇中」→ ★★★ 判定の基準
- 「監視中」→ 該当記事は ★★ として拾う
- 「収集抑制」→ 原則採用しない

### 1. トレンド情報の収集

`interests.md` の「## 収集ソース」に列挙されたソースから最新のトレンド情報を取得する（「除外・停止中ソース」は収集しない）。ソース種別ごとの取得方法：

**日本市場（はてブ IT）**

- interests.md 記載のカテゴリ URL を巡回
- 各エントリーの**タイトル、元記事 URL、ブックマーク数**を必ず取得すること
- はてブのエントリーページ URL ではなく、リンク先の元記事 URL を抽出

**グローバル（Hacker News）**

- 各記事の**タイトル、HN コメントページ URL（`https://news.ycombinator.com/item?id=XXXXX`形式）、ポイント数**を取得
- **元記事 URL ではなく HN のコメントページ URL を使用すること**（コメントも確認できるようにするため）
- **タイトルは日本語に翻訳して出力**

**セキュリティブログ**

- interests.md 記載の各ブログの最新 1-3 記事をチェックし、興味度 ★★★ のものがあれば注目トピックに含める

**エンタープライズ IT**

- interests.md 記載の各サイトのトップ・新着から記事を取得

**Reddit**

- interests.md 記載のサブレッドを巡回
- **重要**: WebFetch ツールは reddit.com をブロックするため、**Bash ツールで curl コマンドを使用**すること
- 各サブレッドから `/hot.json?t=day&limit=10` で上位 10 件を取得
- **www.reddit.com を使用**（old.reddit.com は 403 エラーが返されるため）
- User-Agent ヘッダーを設定: `"User-Agent: neta-trend-collector/1.0 (trend analysis tool)"`
- 各記事の**タイトル、Reddit コメントページの完全 URL、投票数（ups）、コメント数**を取得
- **タイトルは日本語に翻訳して出力**

取得例（Bash ツールで実行。サンドボックス下では名前解決に失敗するため `dangerouslyDisableSandbox` が必要）:

```bash
curl -s -H "User-Agent: neta-trend-collector/1.0 (trend analysis tool)" \
  "https://www.reddit.com/r/programming/hot.json?t=day&limit=10" | \
  jq -r '.data.children[] | "\(.data.title)|\(.data.ups)|\(.data.num_comments)|https://www.reddit.com\(.data.permalink)"'
```

データ構造:

- `data.children[].data.title`: タイトル
- `data.children[].data.ups`: 投票数
- `data.children[].data.num_comments`: コメント数
- `data.children[].data.permalink`: パス（`https://www.reddit.com` + permalink で完全 URL）

**生成 AI・研究**

- interests.md 記載の各ブログから最新記事を WebFetch で取得
- Hugging Face（ブログ）、Anthropic、OpenAI、Google DeepMind のブログは WebFetch で取得
- Hugging Face Papers（AI/ML 論文の日次トレンド）は **Python スクリプト** `scripts/fetch_hf_papers.py` で取得
- タイトルは日本語。英語記事は翻訳して掲載

**セキュリティブログ・研究（強化版）**

- Cloudflare、NCC Group、Trail of Bits も追加。各ブログの最新 2-3 記事を取得

**モダンデータスタック**

- dbt Blog、Databricks ブログは WebFetch で取得

**JavaScript/TypeScript・インフラ**

- TypeScript、Node.js、Deno、Astro、Kubernetes、CNCF、Docker の公式ブログは WebFetch で取得

**日本発信（Zenn・Qiita）**

- Zenn: **Python スクリプト** `scripts/fetch_zenn.py` で「ai」「typescript」「dataengineering」タグの記事取得（RSS フィード経由）
- Qiita: **Python スクリプト** `scripts/fetch_qiita.py` で直近の人気記事取得（Qiita API は sort パラメータに対応していないため、直近数日分を取得しいいね数でスクリプト側でソート）
- タグフィルタで関連度の高い記事のみ抽出
- 事前に `scripts/.venv` を作成し `pip install -r scripts/requirements.txt` を実行しておくこと（`scripts/README.md` 参照）。スクリプトは `--format json` で実行し JSON を読み取る

### 2. 分析

収集した情報を以下の観点で分析：

**興味領域マッチング（最優先）**

- 各記事を interests.md の興味領域と照合し、関連度を評価
- 「コア」「上昇中」に該当する記事を最上位に配置（`interest: 3`）
- 「収集抑制」に該当する記事は関連度を下げる（`interest: 1`。原則不採用）

**はてブ IT**

- 日本のエンジニアに刺さりやすい話題
- 議論を呼びそうなトピック
- 技術トレンド（AI、開発手法、ツール等）
- キャリア・働き方関連

**Hacker News**

- グローバルで話題の技術トレンド
- スタートアップ・プロダクト関連
- セキュリティ関連（脆弱性、攻撃手法、インシデント）
- 議論を呼んでいるトピック（ポイント数が高い）

**Reddit**

- 投票数（ups）とコメント数でコミュニティの反応を評価
- 議論が活発なトピック（コメント数が多い）を優先

### 3. 重複統合（必須）

JSON 化の前に、同一事案を扱う複数記事は **代表 1 件に統合する**。

**統合判定**:

- 同じインシデント・同じ製品リリース・同じ研究成果を扱っていれば「同一」と見なす（ソースが異なっていても）
- 例: 「Aikido の GitHub 侵害解説」と「同事案の reddit スレ」「同事案の gigazine 続報」→ 1 件に統合
- 例: 「Microsoft Defender 0-day を r/cybersecurity が報じる」と「同 0-day の続報」→ 1 件
- 例: 「Qwen 3.7 発表（gigazine）」と「Qwen 3.7 reddit 反応」→ 1 件
- 例: 「Anthropic 黒字化（日経）」と「同事案の海外コミュ反応」→ 1 件

**代表記事の選び方（優先順）**:

1. 日本語ソースを優先（ユーザーが業務で使いやすいため）
2. 一次情報・公式発表を優先（解説記事より公式）
3. より詳細・深掘りされている方を優先
4. 業務文脈（interests.md の「## 業務文脈」参照）で参照しやすい方を優先

**統合時の要約の書き方**:

- 統合された他記事の要点（数字・固有名詞・補足視点）を代表記事の要約に**1〜2 句だけ含める**
- 統合された他記事の URL は代表記事の `merged_urls` に記録する
- 例: 「VS Code 拡張機能経由で GitHub が侵害された事案」の要約に「220 万インストールの Nx Console が 18 分配信された経緯」と「3,800 の社内リポジトリへ波及」を両方織り込む

似ているが事案が違う場合（例: NGINX 0-day と Defender 0-day）は別項目のまま残す。

### 4. JSON 出力

まず「ネタ収集完了。」というメッセージを返してから、`./.trends-work/trends-collect-YYYY-MM-DD.json` へ書き込む。

出力方針:

- **全エントリーは載せない**。関連性の高い記事のみ（interests.md の「## 収集上限」を目安にする）
- **ソース横断のカテゴリ別**にする。はてブ / HN / Reddit / Aikido / Wiz など全ソースを 1 つのカテゴリにまとめる
- カテゴリ粒度は**中粒度**。カテゴリ例と細分化・統合の指示は interests.md の「カテゴリ粒度メモ」に従う
- カテゴリは固定リストではない。当日の記事に合わせて適切に切る。1 カテゴリ 2〜3 件しか無いなら近接カテゴリに統合してよい
- `items` 配列の順序が出力順（カテゴリ順→記事順）を表す。カテゴリ順は関連性の高いものから（ユーザー興味領域に直結するカテゴリを上に）、各カテゴリの初出順で決まる

**タイトル**: 全て日本語。英語ソースは翻訳して掲載。意訳可だが固有名詞（製品名・人名・CVE 番号）は保持。

**要約**: 「メモ」ではなく**記事内容のサマリ**を 1〜2 文で。何が書かれているか・なぜ重要か（業務文脈との接続）を端的に。タイトルの繰り返しは禁止。

**フォーマット**（`schema: "trends-collect/1"`）:

```json
{
  "schema": "trends-collect/1",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "title_ja": "日本語タイトル",
      "url": "https://...",
      "source": "hatena",
      "category": "AI/エージェント開発・実装",
      "summary_ja": "記事内容のサマリを1〜2文で。業務文脈との接続を含めると良い。",
      "interest": 3,
      "merged_urls": []
    }
  ],
  "stats": { "collected": 0, "published": 0 }
}
```

フィールド定義:

- `source`: ソース識別子（`hatena` / `hn` / `reddit` / `zenn` / `qiita` / `hf-papers` / それ以外はドメイン名）
- `interest`: 1〜3（★ 相当。出力レイヤーは通常これを表示しないが、上限超過時の削り判断に使う）
- `merged_urls`: 重複統合で代表に吸収された URL（無ければ空配列）
- `stats.collected`: 巡回で見つかった全記事数（統合前）、`stats.published`: `items` に採用した件数

## 注意事項

- WebFetch ツールを使用して情報を取得
- **すべての記事に URL リンクを必ず含める（リンクなしは不可）**
- **はてブは元記事の URL を必ず取得**（はてブページ URL ではなく）
- **Hacker News は HN コメントページ URL（`item?id=`形式）を使用**（元記事 URL ではなく）
- **Hacker News のタイトルは日本語に翻訳**
- **Reddit は Reddit コメントページの完全 URL（`https://www.reddit.com/r/subreddit/comments/...`形式）を使用**
- **Reddit のタイトルは日本語に翻訳**
- Reddit API レート制限に注意（1 分あたり 60 リクエスト程度）
- 投票数（ups）/コメント数が高い記事を優先（**指標自体は JSON に載せない**。重要度判定のためだけに使う）
- ポイント数/ブックマーク数が高い記事は特に注目
- **サンドボックス環境の注意**: Bash の curl（Reddit）や Python スクリプト（HF Papers・Zenn・Qiita）はサンドボックスのネットワーク制限で名前解決に失敗することがある。その場合は `dangerouslyDisableSandbox: true` で実行する
- カテゴリは中粒度・ソース横断。当日の記事に合わせて 5〜10 個程度に切る
- **同一事案を扱う複数記事は手順 3 の重複統合で代表 1 件にまとめる**（JSON 化前に必須）
- **このスキルは保存先・ファイル形式・Markdown 見出しレベル等に一切関知しない**（`/trends` 等の出力レイヤーの責務）
