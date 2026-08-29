-- Seed data migrated from the former collect/interests.md

INSERT INTO interest_flags (label, tier, notes) VALUES
  ('生成AI（AIエージェント）', 'core', '開発（エージェント設計・スキル設計・開発プロセス）／セキュリティ（権限設計・サンドボックス・プロンプトインジェクション）／ビジネス職の利用'),
  ('ローカルLLM', 'core', ''),
  ('Webセキュリティ/ハッキング', 'core', 'OWASP、脆弱性、サプライチェーン攻撃'),
  ('エンタープライズ企業、セキュリティ、ガバナンス', 'core', ''),
  ('モダンデータスタック', 'core', ''),
  ('生成AI時代の経営・人事領域', 'core', ''),
  ('生成AI時代のプロジェクトマネジメント', 'core', ''),
  ('JavaScript/TypeScript技術スタック', 'core', ''),
  ('AI業界動向・モデルリリース速報', 'suppressed', '新モデル発表・ベンチマーク比較・業界ニュース全般。技術詳細記事とは区別する');

INSERT INTO sources (group_name, source_type, url, label, enabled, notes) VALUES
  ('はてブIT', 'hatena', 'https://b.hatena.ne.jp/hotentry/it', '総合', 1, ''),
  ('はてブIT', 'hatena', 'https://b.hatena.ne.jp/hotentry/it/%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0', 'プログラミング', 1, ''),
  ('はてブIT', 'hatena', 'https://b.hatena.ne.jp/hotentry/it/AI%E3%83%BB%E6%A9%9F%E6%A2%B0%E5%AD%A6%E7%BF%92', 'AI・機械学習', 1, ''),
  ('はてブIT', 'hatena', 'https://b.hatena.ne.jp/hotentry/it/%E3%81%AF%E3%81%A6%E3%81%AA%E3%83%96%E3%83%AD%E3%82%B0%EF%BC%88%E3%83%86%E3%82%AF%E3%83%8E%E3%83%AD%E3%82%B8%E3%83%BC%EF%BC%89', 'はてなブログ（テクノロジー）', 1, ''),
  ('はてブIT', 'hatena', 'https://b.hatena.ne.jp/hotentry/it/%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E6%8A%80%E8%A1%93', 'セキュリティ技術', 1, ''),
  ('はてブIT', 'hatena', 'https://b.hatena.ne.jp/hotentry/it/%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%8B%E3%82%A2', 'エンジニア', 1, ''),

  ('Hacker News', 'hn', 'https://news.ycombinator.com/', 'フロントページ', 1, ''),

  ('生成AI・研究', 'blog', 'https://huggingface.co/blog', 'Hugging Face（ローカルLLM・モデル情報）', 1, ''),
  ('生成AI・研究', 'blog', 'https://www.anthropic.com/research', 'Anthropic（Claudeのセキュリティ・能力研究）', 1, ''),
  ('生成AI・研究', 'blog', 'https://openai.com/research/', 'OpenAI Research', 1, ''),
  ('生成AI・研究', 'blog', 'https://blog.deepmind.google/', 'Google DeepMind Blog', 1, ''),
  ('生成AI・研究', 'hf-papers', 'https://huggingface.co/papers', 'Hugging Face Papers（AI/ML論文の日次トレンド、スクリプト取得）', 1, ''),

  ('セキュリティブログ・研究', 'blog', 'https://www.aikido.dev/blog', 'セキュリティ研究開発者向けのセキュリティ情報', 1, ''),
  ('セキュリティブログ・研究', 'blog', 'https://www.wiz.io/blog', 'クラウドセキュリティ', 1, ''),
  ('セキュリティブログ・研究', 'blog', 'https://blog.cloudflare.com/security/', 'Cloudflare（DDoS・ボット対策・ゼロトラスト）', 1, ''),
  ('セキュリティブログ・研究', 'blog', 'https://www.nccgroup.com/blog/', 'NCC Group（脆弱性研究・ペネトレーション）', 1, ''),
  ('セキュリティブログ・研究', 'blog', 'https://blog.trailofbits.com/', 'Trail of Bits（セキュリティ監査・研究）', 1, ''),

  ('エンタープライズIT', 'blog', 'https://www.itmedia.co.jp/enterprise/', 'ビジネス課題をITでどう解決するかに焦点を当てたサイト', 1, ''),
  ('エンタープライズIT', 'blog', 'https://xtech.nikkei.com/top/it/', '日本最大級の技術系総合メディア', 1, ''),
  ('エンタープライズIT', 'blog', 'https://japan.zdnet.com/', 'エンタープライズITの分析や、セキュリティ、ガバナンス', 1, ''),
  ('エンタープライズIT', 'blog', 'https://www.sbbit.jp/', 'DXや働き方改革などのトレンド', 1, ''),
  ('エンタープライズIT', 'blog', 'https://codezine.jp/', '開発者向けの実装系メディア', 1, ''),
  ('エンタープライズIT', 'blog', 'https://thinkit.co.jp/', 'オープンソース技術を中心に、エンタープライズでの活用方法を提案するメディア', 1, ''),
  ('エンタープライズIT', 'blog', 'https://www.publickey1.jp/', 'クラウド・インフラ・開発者向け技術動向に強いメディア', 1, ''),

  ('モダンデータスタック', 'blog', 'https://www.getdbt.com/blog', 'dbt Blog（データ変換・分析エンジニアリング）', 1, ''),
  ('モダンデータスタック', 'blog', 'https://blog.databricks.com/', 'Databricks（Lakehouseプラットフォーム）', 1, ''),

  ('JavaScript/TypeScriptエコシステム', 'blog', 'https://www.typescriptlang.org/news/', 'TypeScript Official Blog', 1, ''),
  ('JavaScript/TypeScriptエコシステム', 'blog', 'https://nodejs.org/en/blog/', 'Node.js Blog', 1, ''),
  ('JavaScript/TypeScriptエコシステム', 'blog', 'https://deno.com/blog', 'Deno（JS/TSモダンランタイム）', 1, ''),
  ('JavaScript/TypeScriptエコシステム', 'blog', 'https://astro.build/blog/', 'Astro（フロントエンドメタフレームワーク）', 1, ''),

  ('インフラ・DevOps', 'blog', 'https://kubernetes.io/blog/', 'Kubernetes（コンテナオーケストレーション）', 1, ''),
  ('インフラ・DevOps', 'blog', 'https://www.cncf.io/blog/', 'Cloud Native Computing Foundation', 1, ''),
  ('インフラ・DevOps', 'blog', 'https://www.docker.com/blog/', 'Docker', 1, ''),

  ('Redditサブレッド', 'reddit', 'r/cybersecurity', 'セキュリティ系', 1, ''),
  ('Redditサブレッド', 'reddit', 'r/OpenAI', 'AI系', 1, ''),
  ('Redditサブレッド', 'reddit', 'r/LocalLLaMA', 'AI系', 1, ''),
  ('Redditサブレッド', 'reddit', 'r/ClaudeCode', 'AI系', 1, ''),
  ('Redditサブレッド', 'reddit', 'r/programming', 'コア技術系', 1, ''),
  ('Redditサブレッド', 'reddit', 'r/technology', 'コア技術系', 1, ''),
  ('Redditサブレッド', 'reddit', 'r/opensource', 'OSS/個人開発系', 1, ''),
  ('Redditサブレッド', 'reddit', 'r/indiehackers', 'OSS/個人開発系', 1, ''),
  ('Redditサブレッド', 'reddit', 'r/webdev', 'OSS/個人開発系', 1, ''),
  ('Redditサブレッド', 'reddit', 'r/javascript', 'OSS/個人開発系', 1, ''),
  ('Redditサブレッド', 'reddit', 'r/productivity', 'キャリア/実践系', 1, ''),

  ('日本発信', 'script-zenn', 'https://zenn.dev', 'テック記事・スクリプト取得で「ai」「typescript」「dataengineering」タグ', 1, ''),
  ('日本発信', 'script-qiita', 'https://qiita.com', 'スクリプト取得で「テクノロジー」「トレンド」', 1, ''),

  ('除外・停止中', 'blog', 'https://piyolog.hatenadiary.jp/', 'セキュリティインシデントまとめブログ', 0, '過去30日で10件掲載0件チェック。他セキュリティソースと内容重複気味'),
  ('除外・停止中', 'reddit', 'r/netsec', '', 0, '過去30日で9件掲載0件チェック。r/cybersecurityで代替カバー'),
  ('除外・停止中', 'reddit', 'r/cscareerquestions', '', 0, '過去30日で5件掲載0件チェック');
