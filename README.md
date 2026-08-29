# daily-trends

日々の技術トレンドネタ収集ログ。GitHub Pages（Jekyll）で公開し、PC を問わずブラウザから閲覧できるようにしたもの。

もとは `~/vault`（Obsidian）内で運用していた `daily-trends` / `daily-trends-collect` 系スキルの出力先を、この公開用リポジトリに差し替えた派生。

## 使い方

Claude Code（ローカル・Claude Code on the web どちらでも）でこのリポジトリを開き、`/daily-trends` と発話するとその日のトレンドネタを収集し、一覧と全記事分の詳細要約を`_posts/`に1回で書き込む。手動でのチェック・絞り込みステップは無い（無人実行前提のため、収集された記事は全件詳細要約まで自動生成される）。

- `/daily-trends`: トレンドネタ収集（`daily-trends-collect` を内部で呼び出す）・`_posts/YYYY-MM-DD-trends.md` への一覧＋詳細要約の出力

実行後は変更を commit・push すること（push しないと GitHub Pages に反映されない）。毎朝 7:00 (JST) に Claude Code のスケジュールルーティンから自動実行される。

## 構成

- `_posts/`: 日別のトレンドまとめ（Jekyll の投稿）。各記事は一覧＋詳細要約を含む
- `.claude/skills/daily-trends/`: 出力レイヤー（収集 JSON をノートに書き込む）
- `.claude/skills/daily-trends-collect/`: 収集レイヤー（巡回・重複統合・興味度判定に加え、公開対象全件の本文取得・詳細要約生成まで行う）
- `.trends-work/`（gitignore 対象）: 収集の中間 JSON

## 公開設定

- GitHub Pages: `main` ブランチ / ルートディレクトリ、Jekyll ビルド
- テーマ: `minima`（GitHub Pages 対応テーマをそのまま使用、カスタムビルド不要）

## 注意

- `interests.md`（収集の興味プロファイル）は vault 版とは別ファイル。このリポジトリ単体では自動チューニングを行わない（チェック履歴という学習信号が存在しないため）。プロファイルを見直したい場合は vault 側で `/trends-tune` を実行し、更新後の `interests.md` をこのリポジトリに手動で反映する
- `.claude/skills/daily-trends-collect/scripts/` の Python スクリプト（Zenn・Qiita・HF Papers 取得）を使う場合は、初回のみ `scripts/README.md` の手順で venv を作成する
- 収集対象の全記事について本文取得・詳細要約まで行うため、チェック式の絞り込みだった頃より1回の実行にかかる時間・WebFetch 呼び出し数が増える
