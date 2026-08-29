# trends 出力プロファイル

`output` `collect` が「どこに・どの形式で書くか」の判定に使う正本。SvelteKit（`site/`）+ GitHub Actions + GitHub Pages 向けの設定。

このリポジトリは全自動運用（Claude Code on the web のスケジュールルーティンから毎朝実行）を前提としており、手動チェックによる絞り込みステップは無い。収集された記事は全件、一覧用の要約と詳細要約の両方を含む1つの JSON ファイルとして書き込む。

## 保存先

- 保存先ディレクトリ: `site/src/lib/data/`（リポジトリルート相対。SvelteKit がビルド時に `import.meta.glob` で読み込む）
- ファイル名: `YYYY-MM-DD.json`
- **日付は日本時間（Asia/Tokyo, UTC+9）基準**で判定する。実行環境のシステム時刻は UTC のため、素の `date` コマンドをそのまま使わないこと。`TZ=Asia/Tokyo date +%Y-%m-%d` で計算する（スケジュールルーティンは UTC 22:00 = 日本時間翌朝7:00 に起動するため、UTC のまま判定すると投稿日付が1日ずれる）
- 既存ファイルがある場合: 上書き・追記はせず、その旨だけ報告して終了する（1日1ファイルを一度に書き切る設計のため、部分追記は想定しない）
- ファイルが無い場合: 新規作成

## ファイル形式

`collect` が出力する `trends-collect-YYYY-MM-DD.json`（`schema: trends-collect/2`。フラットな `items` 配列、`category` フィールド、`interest`/`merged_urls`/`fetch_status`/`note` などの内部フィールドを含む）を、公開用に**カテゴリでグルーピングし、内部フィールドを落とした** JSON へ変換して書き込む。

**変換ルール**:

- `items` を先頭から順に処理する（配列順 = カテゴリ順→記事順、この順序をそのまま維持する）
- 同じ `category` の記事をひとつの `categories[].items` にまとめる（`categories` の順序 = 各カテゴリの初出順）
- 各記事から `title_ja` / `url` / `summary_ja` / `bullets` / `implication` だけを転記する
- `interest` / `merged_urls` / `fetch_status` / `note` はここでは出力しない（内部フィールド）。ただし `fetch_status` が `fallback` または `note` が空でない場合は、`bullets` の末尾にその注記を通常の一項目として追加してから `note` 自体は落とす

**フォーマット**（スキーマ名は特に持たない。SvelteKit 側の型は `site/src/lib/trends.ts` の `TrendDay` を正とする）:

```json
{
  "date": "YYYY-MM-DD",
  "categories": [
    {
      "name": "AI/エージェント開発・実装",
      "items": [
        {
          "title_ja": "日本語タイトル",
          "url": "https://...",
          "summary_ja": "記事内容のサマリを1〜2文で。業務文脈との接続を含めると良い。",
          "bullets": ["論点・事実 1", "論点・事実 2"],
          "implication": "業務への示唆を1行で"
        }
      ]
    }
  ]
}
```

## 中間ファイル

- 作業ディレクトリ: `./.trends-work/`（リポジトリルート相対）
- collect JSON: `./.trends-work/trends-collect-YYYY-MM-DD.json`（`collect` の出力。ファイル名の日付も日本時間基準）

`.trends-work/` は `.gitignore` 対象（コミットしない中間ファイル）。

## 収集プロファイルの場所

- 興味領域・収集ソース: Cloudflare D1 + Worker API（`https://daily-trends-interests-api.gooodev.workers.dev/`）
- 業務文脈・収集上限・カテゴリ粒度メモ: `../collect/guidance.md`

## 公開の仕組み

- サイト本体は `site/`（SvelteKit + `@sveltejs/adapter-static`）。ホームで日付一覧、`/[date]` で当日分の一覧＋詳細要約を表示する
- `site/src/lib/data/*.json` に追加・コミット・push すると、`.github/workflows/deploy.yml`（push トリガー）が `site/` をビルドし GitHub Pages にデプロイする（数分のタイムラグあり）
- Claude Code on the web からこのリポジトリに対して `/output` を実行した場合も、変更をコミット・push するところまで行うこと（push しないとサイトに反映されない。ビルド自体は GitHub Actions 側が行うため、ローカルで `pnpm run build` する必要はない）
- **全工程を1回のセッション内で同期的に完了させること**。バックグラウンドの subagent に処理を委譲してターンを終了すると、スケジュールルーティンはそのターンの完了時点で「成功」扱いになり、委譲先が後から出す結果は誰にも回収されない

## vault 版との違い・運用上の注意

- `~/vault`（Obsidian）にも同種のスキル一式があるが、そちらは Jekyll ではなく Obsidian のノート（Markdown）に書き、「収集→一覧をノートに書く→ユーザーが興味のある記事をチェック→チェック済みだけ詳細取得」という手動キュレーション込みの運用（`daily-trends-detail` 等の追加スキルを使う）。このリポジトリは無人実行が前提のため、そのステップを省いて全件を自動で詳細要約まで行う設計にしている
- 興味プロファイル（興味領域・収集ソース）はこのリポジトリでは Cloudflare D1 + Worker API を正本としており、vault 側の `interests.md`（ファイルベース）とはデータ源が異なる。vault 側の `/trends-tune` はチェック履歴からファイルを更新するだけで D1 には反映されない。D1 側を見直したい場合は `db/schema.sql` `db/seed.sql`（またはリポジトリの `wrangler d1 execute` コマンド）で直接更新する
