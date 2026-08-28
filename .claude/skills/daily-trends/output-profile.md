# trends 出力プロファイル

`/trends` `/trends-detail` `/trends-tune` が「どこに・どの形式で書くか」の判定に使う正本。この GitHub Pages（Jekyll）向けの設定（オリジナルは Obsidian vault 向け。vault 側の `output-profile.md` を差し替えて作られた派生）。

## 保存先

- 保存先ディレクトリ: `_posts/`（リポジトリルート相対。Jekyll の投稿ディレクトリ）
- ファイル名: `YYYY-MM-DD-trends.md`（Jekyll の投稿命名規則。日付プレフィックスは必須）
- 既存ファイルがある場合: ファイル末尾に追記
- ファイルが無い場合: 新規作成

## ファイル形式

- frontmatter: あり（Jekyll の投稿に必須）
  ```yaml
  ---
  layout: post
  title: "YYYY-MM-DD トレンド"
  date: YYYY-MM-DD
  categories: trends
  ---
  ```
- 先頭見出し: 付けない（タイトルは frontmatter の `title` が担うため、本文を `##` カテゴリ見出しから始める。Obsidian 版にあった `# YYYY-MM-DD` の本文見出しはここでは不要）
- カテゴリ見出しレベル: `##`
- リストアイテム: `- [ ] [日本語タイトル](URL)`（kramdown の GFM 拡張により GitHub Pages 上でチェックボックスとして表示される。ただし静的サイトのため閲覧者側でのクリック操作は状態を保持しない。チェック状態を変えたい場合はこのファイルを編集してコミットする）
- 要約行: リストアイテムの次行に**インデントなしで**フラットに置く（字下げしない）
- 詳細要約セクション: `## 詳細要約`（新設が必要な場合はカテゴリ別リスト群の末尾に置く） / 記事見出しは `### [日本語タイトル](URL)`

**フォーマット例**:

```markdown
---
layout: post
title: "YYYY-MM-DD トレンド"
date: YYYY-MM-DD
categories: trends
---

## {カテゴリ名 1}

- [ ] [日本語タイトル](URL)
記事の内容を1〜2文で要約。業務文脈との接続を含めると良い。

- [ ] [別の日本語タイトル](URL)
別記事の要約。

## {カテゴリ名 2}

...

## 詳細要約

### [日本語タイトル](URL)

- 論点・事実 1
- 論点・事実 2
- **業務への示唆**: 業務文脈との接続を1行で
```

## 中間ファイル

- 作業ディレクトリ: `./.trends-work/`（リポジトリルート相対）
- collect JSON: `./.trends-work/trends-collect-YYYY-MM-DD.json`
- detail request JSON: `./.trends-work/trends-detail-request-YYYY-MM-DD.json`
- detail 結果 JSON: `./.trends-work/trends-detail-YYYY-MM-DD.json`

`.trends-work/` は `.gitignore` 対象（コミットしない中間ファイル）。

## 収集プロファイルの場所

- `../daily-trends-collect/interests.md`（興味領域・収集ソース・カテゴリ粒度・業務文脈）

## 公開の仕組み

- このリポジトリは GitHub Pages（Jekyll, `minima` テーマ）で公開されている
- `_posts/` にファイルを追加・コミット・push すると、GitHub 側で自動ビルドされサイトに反映される（数十秒〜数分のタイムラグあり）
- Claude Code on the web からこのリポジトリに対して `/trends` 等のスキルを実行した場合も、変更をコミット・push するところまで行うこと（push しないとサイトに反映されない）

## vault 版との違い・運用上の注意

- `~/vault`（Obsidian）にも同名スキル一式がある。`interests.md`（収集プロファイル）はこのリポジトリと vault 側とで別ファイルとして存在する。`/trends-tune` を実行した場合、適用先は実行時のカレントディレクトリ（＝このリポジトリ内の `interests.md`）のみ。vault 側と定期的に見比べて手動で同期するか、どちらか一方に運用を一本化することを検討する
