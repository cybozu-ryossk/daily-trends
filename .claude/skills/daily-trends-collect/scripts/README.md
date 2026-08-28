# トレンドデータ収集スクリプト群

WebFetch や Bash curl では対応できないデータソース（フィード形式が特殊・API 直叩き）用の再利用可能な Python スクリプト集です。

## セットアップ

Homebrew 管理下の Python は外部パッケージの直接 pip install を禁止しているため、このディレクトリ専用の venv を使う。

```bash
# このディレクトリ（daily-trends-collect/scripts/）で実行

# venv 作成 + 依存ライブラリインストール（初回のみ）
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

以降は毎回 `source .venv/bin/activate` してから各スクリプトを実行する。

## スクリプト一覧

### 1. `fetch_hf_papers.py` - Hugging Face Papers（AI/ML 論文トレンド）

Hugging Face が公式キュレーションする daily trending papers を取得します。

> 当初 arXiv Sanity（arxiv-sanity-lite.com）を使う想定だったが、このサイトの SSL 証明書が壊れている（発行日 1923 年・失効日 2122 年という実体のない自己署名証明書）ため HTTPS 接続できず、断念して Hugging Face Papers に切り替えた。

```bash
# Markdown リスト形式で出力（デフォルト）
python fetch_hf_papers.py --limit 10

# JSON 形式で出力
python fetch_hf_papers.py --limit 10 --format json
```

**出力例**:
```markdown
### AI/ML 論文トレンド（Hugging Face Papers）

- [ ] [From RLVR to RLSVR: Task Transformation Induces Self-Verifiable Rewards](https://huggingface.co/papers/2607.23802)
（要約は本文取得後に記載）
```

---

### 2. `fetch_zenn.py` - Zenn（日本発信テック記事）

Zenn の各トピックページが公開している RSS フィード（`/topics/{tag}/feed`）から記事を取得します。

> 当初 Atom 形式 (`/feed.atom`) だと想定していたが、実際は RSS 2.0 形式で URL も `/feed`（`.atom` サフィックスなし）だった。ページの `<link rel="alternate" type="application/rss+xml">` から判明。

```bash
# デフォルトタグ（ai, typescript, dataengineering）で取得
python fetch_zenn.py --limit 10

# カスタムタグで取得（ハイフンなしのスラッグに注意。例: data-engineering ではなく dataengineering）
python fetch_zenn.py --tags "ai,python,database" --limit 10

# JSON 形式で出力
python fetch_zenn.py --format json
```

**出力例**:
```markdown
### Zenn（日本発信）

- [ ] [LLM ルーティングはどう動くのか](https://zenn.dev/exapolicy/articles/0a8f74542f6beb)
タグ: ai, 公開: Sun, 02 Aug 2026
```

---

### 3. `fetch_qiita.py` - Qiita（日本発信テック記事）

Qiita API v2 から直近の人気記事を取得します（認証不要）。

> Qiita API の `/items` は `sort` パラメータをサポートしておらず、常に投稿日時の降順で返る。そのため「人気記事」を得るには、直近 N 日分の記事を複数ページ取得し、**いいね数でスクリプト側でソート**している。

```bash
# 直近3日分・3ページ分から、いいね数トップ10を抽出（デフォルト）
python fetch_qiita.py --limit 10

# 遡る日数・ページ数を調整
python fetch_qiita.py --limit 10 --pages 5 --days 5

# JSON 形式で出力
python fetch_qiita.py --format json
```

**出力例**:
```markdown
### Qiita（日本発信）

- [ ] [CLAUDE.md を厚くしても意味がなかった話](https://qiita.com/jqit_suwa/items/2dee3e3d53080c3676a0)
投稿者: jqit_suwa, いいね: 15, 公開: 2026-08-03
```

---

## Bash / スキル内での使い方

### trends-collect スキル内で呼び出す場合

このディレクトリ（`daily-trends-collect/scripts/`）を cwd として venv を有効化し、`--format json` で実行して標準出力を LLM 側で読み取る。Markdown 形式（デフォルト）は `###` 見出し・チェックボックス付きの独自フォーマットで、trends-collect の JSON 出力仕様とは異なるため、ファイルへの直接追記には使わない。

```bash
source .venv/bin/activate
python fetch_hf_papers.py --limit 5 --format json
```

### JSON 出力を処理する場合

```bash
# JSON を取得して jq で処理
python fetch_zenn.py --limit 10 --format json | jq '.[] | "\(.title) - \(.url)"'
```

---

## トラブルシューティング

### `ModuleNotFoundError: No module named 'requests'`

→ venv を有効化し忘れている可能性。`source .venv/bin/activate` してから実行する

### `error: externally-managed-environment`

→ Homebrew Python の保護機能。venv 経由（上記セットアップ）でインストールすれば発生しない

### スクレイピング・API 取得が失敗する場合

- **接続タイムアウト / Connection refused**: サイト側が応答していない、または特定 IP レンジ（データセンター等）からのアクセスを拒否している可能性。時間をおいて再試行し、繰り返し失敗するなら該当ソースを `interests.md` の「除外・停止中ソース」に一時的に移す
- **403 Forbidden**: User-Agent が拒否されている可能性。スクリプト内で設定済みだが、サイト側の対策強化で再発することがある
- **404 / フィード URL 変更**: サイトのフィード仕様変更でパスが変わることがある。対象ページの HTML を `curl` で取得し `<link rel="alternate" type="application/rss+xml">` を探すと正しいフィード URL が見つかる場合が多い
- **HTML 構造の変更**: サイトのレイアウト更新でセレクタが合わなくなった場合は、スクリプトを修正してください

---

## 注意事項

- これらのスクリプトは **オンデマンド実行** 想定（毎日実行される trends-collect スキル内で呼び出し）
- **Rate Limit**: Zenn/Qiita は API レート制限があります。1 回の実行では問題ないレベルですが、連続実行は避けてください
- **Robots.txt 遵守**: スクレイピング対象サイトの robots.txt を確認し、クロール許可範囲内でのみ使用してください
- **既知の問題**: DBEngines（dbengines.com）は接続が一貫して拒否されるため、モダンデータスタックのソースからは除外し dbt Blog に置き換えた
