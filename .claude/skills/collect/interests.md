# trends 収集プロファイル

`collect` が収集対象と興味度判定に使う正本。vault 側の `/trends-tune` がチェック履歴の分析に基づいて更新する（このリポジトリ単体ではチューニングしない）。手動で編集してもよい。

## 興味領域

### コア（★★★ 判定の基準）

- 生成 AI（AI エージェント）
    - 開発（エージェント設計・スキル設計・開発プロセス）
    - セキュリティ（権限設計・サンドボックス・プロンプトインジェクション）
    - ビジネス職の利用
- ローカル LLM
- Web セキュリティ/ハッキング（OWASP、脆弱性、サプライチェーン攻撃）
- エンタープライズ企業、セキュリティ、ガバナンス
- モダンデータスタック
- 生成 AI 時代の経営・人事領域
- 生成 AI 時代のプロジェクトマネジメント
- JavaScript/TypeScript 技術スタック

### 上昇中（チェック率の高い新テーマ。コア昇格候補）

- なし（/trends-tune が追記する）

### 監視中（シグナル不足。観察して昇格または削除）

- なし

### 収集抑制（チェックが付かないテーマ。★ 相当としてリストに載せない）

- AI 業界動向・モデルリリース速報（新モデル発表・ベンチマーク比較・業界ニュース全般。技術詳細記事とは区別する）

## 収集ソース

収集対象のリスト。ソース種別ごとの取得方法（URL 形式・curl・スクリプト）は SKILL.md 側に記載。

### はてブ IT

- https://b.hatena.ne.jp/hotentry/it
- https://b.hatena.ne.jp/hotentry/it/%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0
- https://b.hatena.ne.jp/hotentry/it/AI%E3%83%BB%E6%A9%9F%E6%A2%B0%E5%AD%A6%E7%BF%92
- https://b.hatena.ne.jp/hotentry/it/%E3%81%AF%E3%81%A6%E3%81%AA%E3%83%96%E3%83%AD%E3%82%B0%EF%BC%88%E3%83%86%E3%82%AF%E3%83%8E%E3%83%AD%E3%82%B8%E3%83%BC%EF%BC%89
- https://b.hatena.ne.jp/hotentry/it/%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E6%8A%80%E8%A1%93
- https://b.hatena.ne.jp/hotentry/it/%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%8B%E3%82%A2

### Hacker News

- https://news.ycombinator.com/

### 生成 AI・研究

- https://huggingface.co/blog - Hugging Face（ローカル LLM・モデル情報）
- https://www.anthropic.com/research - Anthropic（Claude のセキュリティ・能力研究）
- https://openai.com/research/ - OpenAI Research
- https://blog.deepmind.google/ - Google DeepMind Blog
- https://huggingface.co/papers - Hugging Face Papers（AI/ML 論文の日次トレンド、スクリプト取得）

### セキュリティブログ・研究

- https://www.aikido.dev/blog - セキュリティ研究開発者向けのセキュリティ情報
- https://www.wiz.io/blog - クラウドセキュリティ
- https://blog.cloudflare.com/security/ - Cloudflare（DDoS・ボット対策・ゼロトラスト）
- https://www.nccgroup.com/blog/ - NCC Group（脆弱性研究・ペネトレーション）
- https://blog.trailofbits.com/ - Trail of Bits（セキュリティ監査・研究）

### エンタープライズ IT

- https://www.itmedia.co.jp/enterprise/ - ビジネス課題を IT でどう解決するかに焦点を当てたサイト
- https://xtech.nikkei.com/top/it/ - 日本最大級の技術系総合メディア
- https://japan.zdnet.com/ - エンタープライズ IT の分析や、セキュリティ、ガバナンス
- https://www.sbbit.jp/ - DX や働き方改革などのトレンド
- https://codezine.jp/ - 開発者向けの実装系メディア
- https://thinkit.co.jp/ - オープンソース技術を中心に、エンタープライズでの活用方法を提案するメディア
- https://www.publickey1.jp/ - クラウド・インフラ・開発者向け技術動向に強いメディア

### モダンデータスタック

- https://www.getdbt.com/blog - dbt Blog（データ変換・分析エンジニアリング）
- https://blog.databricks.com/ - Databricks（Lakehouse プラットフォーム）

### JavaScript/TypeScript エコシステム

- https://www.typescriptlang.org/news/ - TypeScript Official Blog
- https://nodejs.org/en/blog/ - Node.js Blog
- https://deno.com/blog - Deno（JS/TS モダンランタイム）
- https://astro.build/blog/ - Astro（フロントエンドメタフレームワーク）

### インフラ・DevOps

- https://kubernetes.io/blog/ - Kubernetes（コンテナオーケストレーション）
- https://www.cncf.io/blog/ - Cloud Native Computing Foundation
- https://www.docker.com/blog/ - Docker

### Reddit サブレッド

セキュリティ系:

- r/cybersecurity

AI 系:

- r/OpenAI
- r/LocalLLaMA
- r/ClaudeCode

コア技術系:

- r/programming
- r/technology

OSS/個人開発系:

- r/opensource
- r/indiehackers
- r/webdev
- r/javascript

キャリア/実践系:

- r/productivity

### 日本発信（スクレイピング取得）

- https://zenn.dev - Zenn（テック記事・スクリプト取得で「ai」「typescript」「dataengineering」タグ）
- https://qiita.com - Qiita（スクリプト取得で「テクノロジー」「トレンド」）

### 除外・停止中ソース（収集しない）

- https://piyolog.hatenadiary.jp/ - セキュリティインシデントまとめブログ（過去30日で10件掲載0件チェック。他セキュリティソースと内容重複気味）
- r/netsec（過去30日で9件掲載0件チェック。r/cybersecurity で代替カバー）
- r/cscareerquestions（過去30日で5件掲載0件チェック）

## 業務文脈

要約・詳細要約・重複統合の代表記事選定で「業務で参照しやすいか」を判断する際の前提。ユーザーはサイボウズのソリューションエンジニア（SE）で、kintone を中心に顧客支援・技術検証・プロジェクトマネジメントを行う。

- プリセールス・顧客提案（技術検証、デモ、提案資料作成）
- kintone（ノーコードツール）の活用・拡張・連携
- エンタープライズ企業のセキュリティ・ガバナンス
- 生成 AI 時代の経営・人事・プロジェクトマネジメント

「業務への示唆」を書く際はこの文脈との接続を意識する（例: 権限設計の事例 → kintone 開発研修や社内展開時の権限設計の参考、セキュリティインシデント → 顧客への提案時のチェックリスト）。

## 収集上限

1 日の掲載数が多すぎて確認しきれないとのフィードバックに基づき、合計 15 件程度を目安にカテゴリごとの上限を設ける。掲載時はチェック率・興味度の高い記事を優先し、上限を超える分は下位カテゴリ・低興味度の記事から削る。

- AI/エージェント開発・実装: 4 件
- AI/エンプラ・経営・ガバナンス: 3 件
- Sec/脆弱性・インシデント（分析記事優先、単発 CVE 速報は簡潔に）: 3 件
- AI/ローカル LLM: 2 件
- 開発/JS・TS・データスタック: 2 件
- キャリア・組織: 1 件
- その他（専門外含む）: 1〜2 件

上記はあくまで目安。当日話題が薄いカテゴリは無理に埋めず、合計 15 件を優先する。

## カテゴリ粒度メモ

- 中粒度の例: `AI/エンプラ`, `AI/開発`, `AI/ローカルLLM`, `AI業界`, `AI論文`, `Sec/サプライチェーン`, `Sec/CVE・脆弱性`, `Sec/インシデント`, `Sec/インフラ`, `開発/JS/TS`, `開発/アーキ`, `開発/ツール`, `データ`, `インフラ/K8s`, `OSS/個人開発`, `キャリア`, `その他`
- 固定リストではない。当日の記事に合わせて 5〜10 個程度に切る
- /trends-tune による細分化・統合の指示:
    - `Sec/CVE・脆弱性` 系は「単発 CVE 速報」と「大規模インシデント・サプライチェーン攻撃の分析」が混在しがち。過去 30 日で 88 件掲載中チェック率 12% と低調なため、単発 CVE 速報は簡潔に留め、分析記事（背景・影響範囲・対応指針が書かれているもの）を優先して拾う

## 更新履歴

- 2026-08-04: 「収集上限」セクション新設。直近13日516件・1日平均39.7件と掲載過多（チェック率: Sec/脆弱性系19%・キャリア18%・AI業界動向7%と低調な一方、開発/JS・TS 38%・AI/エージェント開発38%・エンプラガバナンス31%は高め）。カテゴリ別上限を設定し合計15件程度を目安化
- 2026-08-04: チェック履歴分析（直近30日・448件）に基づき調整。ソース追加: publickey1.jp（はてブ経由9件中5件チェックと高関与）。ソース除外: piyolog.hatenadiary.jp・r/netsec・r/cscareerquestions（いずれも掲載数5件以上でチェック0件）。収集抑制に追加: AI業界動向・モデルリリース速報（40件中4件で最低チェック率、HN分析でも技術詳細記事より一般ニュースが素通りされる傾向を確認）。カテゴリ粒度メモに Sec/CVE・脆弱性 の細分化指示を追記
- 2026-08-03: ソース大幅追加（モダンデータスタック・AI 研究・セキュリティ強化・JS/TS・インフラ・日本発信）
- 2026-07-24: 初版作成（SKILL.md から興味領域・収集ソースを外部化）
