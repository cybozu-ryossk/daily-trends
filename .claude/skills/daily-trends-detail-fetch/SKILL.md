---
name: trends-detail-fetch
description: "記事 URL リストの本文を取得し、詳細要約を JSON で出力する（収集レイヤー）。ノートのチェックボックス解釈・書き込みには関知しない。通常は `/trends-detail` から自動的に呼び出される。"
---

# トレンドネタ詳細取得（収集レイヤー）

渡された記事 URL リストの本文を取得し、記事ごとの詳細要約を **JSON ファイル** として出力する。どのノートのどのチェックボックスが対象かの判定・冪等性チェック・ファイルへの追記は関知しない（`/trends-detail` 等の出力レイヤー側の責務）。

## 入力

- `./.trends-work/trends-detail-request-YYYY-MM-DD.json`（`{title_ja, url}` の配列）があればそれを読む
- 無ければ、呼び出し側から直接渡された `{title_ja, url}` のリスト（引数）を使う
- どちらも無ければ、その旨を報告して終了する

## 出力先

`./.trends-work/trends-detail-YYYY-MM-DD.json`（カレントディレクトリ相対。ディレクトリが無ければ作成する）

## 実行手順

### 1. 記事本文の取得

対象各記事の本文を取得する。独立した記事は並列で取得してよい。

- **通常の記事 URL** → WebFetch で本文を取得
- **Hacker News コメントページ**（`news.ycombinator.com/item?id=` 形式）→ HN ページから元記事 URL を抽出して元記事本文も取得。HN コメントの主要な論点があれば 1〜2 点拾う
- **Reddit URL** → WebFetch は reddit.com をブロックするため、Bash で curl を使う。`www.reddit.com` の該当スレッドに `.json` を付けて取得（User-Agent: `neta-trend-collector/1.0 (trend analysis tool)`）。リンク投稿ならリンク先記事も WebFetch で取得
- **取得失敗時**（ペイウォール・ブロック等）→ はてブコメントページ（`https://b.hatena.ne.jp/entry/{URL}`）や Web 検索で内容を補完し、`note` に「※本文取得不可のため {補完元} から要約」と記録する。それでも情報が足りなければ簡潔な要約に留め、`fetch_status: "failed"` とする
- サンドボックス環境では curl がネットワーク制限で失敗することがある。その場合は `dangerouslyDisableSandbox: true` で実行する

### 2. 詳細要約の生成

記事ごとに以下を生成する：

- **`bullets`（5〜8 点）**: 記事の主要な論点・事実。数字・固有名詞（製品名・企業名・バージョン・CVE 番号等）は具体的に保持する。タイトルの繰り返しは禁止
- **`implication`（1 文）**: 業務への示唆。このスキルと同じディレクトリの `../daily-trends-collect/interests.md` の「## 業務文脈」を参照し、プリセールス・顧客提案・kintone・エンタープライズ・AI 活用などの文脈と接続する。`interests.md` が見つからない場合は一般的な技術者としての示唆に留める

### 3. JSON 出力

**フォーマット**（`schema: "trends-detail/1"`）:

```json
{
  "schema": "trends-detail/1",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "title_ja": "日本語タイトル",
      "url": "https://...",
      "bullets": [
        "論点・事実 1",
        "論点・事実 2"
      ],
      "implication": "業務への示唆を1行で",
      "fetch_status": "ok",
      "note": ""
    }
  ]
}
```

- `fetch_status`: `ok`（本文取得成功）/ `fallback`（補完元から要約）/ `failed`（本文取得失敗・簡潔な要約のみ）
- `note`: 補完元の注記が必要なときだけ記載。無ければ空文字列
- `items` の順序は入力（リクエスト）の順序を保持する

書き込み後、処理した記事数・取得失敗数を報告する。

## 注意事項

- 要約文は通常の日本語で書く（圧縮口調にしない）
- 英語記事も要約は日本語で書く
- 1 回の実行で全件処理する（件数が多くても省略しない）
- Reddit API のレート制限（1 分あたり 60 リクエスト程度）に注意
- **このスキルはノートのチェックボックス解釈・冪等性判定・ファイルへの追記に一切関知しない**（`/trends-detail` 等の出力レイヤーの責務）
