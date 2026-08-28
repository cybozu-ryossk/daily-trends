---
name: trends
description: "トレンドネタ収集（出力レイヤー）。収集済み JSON を出力プロファイルの形式に整形し、trends/YYYY-MM-DD.md に日本語要約付きで追記する。収集自体は daily-trends-collect が行う。"
---

# トレンドネタ収集（出力レイヤー）

`daily-trends-collect` が集めた記事情報を、`output-profile.md`（このスキルと同じディレクトリ）に従ってノートへ書き込む。ソース巡回・興味度判定・重複統合などの収集ロジックは持たない（`daily-trends-collect` の責務）。

## 実行手順

### 1. 出力プロファイル読み込み

このスキルと同じディレクトリの `output-profile.md` を読み込む。保存先・ファイル形式・中間ファイルの場所の正本。

### 2. 収集 JSON の取得

`output-profile.md` に記載の中間ファイル作業ディレクトリ配下の `trends-collect-YYYY-MM-DD.json`（当日分）を探す。

- 既に存在する → そのまま読み込む
- 存在しない → `daily-trends-collect` スキルを起動して生成させてから読み込む

### 3. 書き込み

まず「ネタ収集完了。」というメッセージを返してから、`output-profile.md` の保存先確定ルールに従って書き込む。

- 収集 JSON の `items` を先頭から順に処理する（配列順 = カテゴリ順→記事順）
- 各カテゴリの初出時に `##` 見出しを起こす
- 各記事は `output-profile.md` のフォーマット例どおり `- [ ] [title_ja](url)` + 次行に `summary_ja` をインデントなしで書く
- `interest` や `merged_urls` などスコアリング用の内部フィールドは出力に含めない

## 注意事項

- **保存先・ファイル形式は `output-profile.md` が正本**。このファイルを差し替えれば別環境・別形式に対応できる
- 収集 JSON が壊れている・`items` が空などの場合は、その旨を報告して書き込みを中断する
- チェックされた記事は後続の `/trends-detail` で本文を取得し、同ノートの `## 詳細要約` セクションに詳細要約を追記する運用
