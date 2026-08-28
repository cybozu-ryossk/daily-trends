# daily-trends

日々の技術トレンドネタ収集ログ。GitHub Pages（Jekyll）で公開し、PC を問わずブラウザから閲覧できるようにしたもの。

もとは `~/vault`（Obsidian）内で運用していた `daily-trends` / `daily-trends-collect` 系スキルの出力先を、この公開用リポジトリに差し替えた派生。

## 使い方

Claude Code（ローカル・Claude Code on the web どちらでも）でこのリポジトリを開き、`/daily-trends` と発話するとその日のトレンドネタを収集して `_posts/` に投稿を追加する。

- `/daily-trends`: トレンドネタ収集・`_posts/YYYY-MM-DD-trends.md` への出力
- `/trends-detail`: 直近の投稿でチェック（`[x]`）した記事の詳細要約を追記
- `/trends-tune`: チェック履歴から収集プロファイル（`interests.md`）の見直し案を提示

実行後は変更を commit・push すること（push しないと GitHub Pages に反映されない）。

## 構成

- `_posts/`: 日別のトレンドまとめ（Jekyll の投稿）
- `.claude/skills/`: 収集・出力ロジック一式（vault 版と同じ設計。`daily-trends/output-profile.md` だけがこの環境向けに書き換えてある）
- `.trends-work/`（gitignore 対象）: 収集・詳細取得の中間 JSON

## 公開設定

- GitHub Pages: `main` ブランチ / ルートディレクトリ、Jekyll ビルド
- テーマ: `minima`（GitHub Pages 対応テーマをそのまま使用、カスタムビルド不要）

## 注意

- `interests.md`（収集の興味プロファイル）は vault 版とは別ファイル。`/trends-tune` の適用先は実行時のカレントディレクトリ側のみなので、両方運用する場合は手動で見比べて同期する
- `.claude/skills/daily-trends-collect/scripts/` の Python スクリプト（Zenn・Qiita・HF Papers 取得）を使う場合は、初回のみ `scripts/README.md` の手順で venv を作成する
