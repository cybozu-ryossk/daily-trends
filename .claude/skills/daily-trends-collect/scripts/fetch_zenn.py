#!/usr/bin/env python3
"""
Zenn から テック記事を取得するスクリプト
URL: https://zenn.dev

トピックページの <link rel="alternate" type="application/rss+xml"> から判明した
正しいフィード URL は `/topics/{tag}/feed`（RSS 2.0 形式。Atom ではない）。

使用方法:
  python fetch_zenn.py [--tags ai,typescript] [--limit 10]
"""

import sys
import json
import argparse
from typing import Any

try:
    from bs4 import BeautifulSoup
    import requests
except ImportError:
    print("Error: requests と beautifulsoup4 が必要です", file=sys.stderr)
    print("  pip install requests beautifulsoup4", file=sys.stderr)
    sys.exit(1)

DEFAULT_TAGS = ["ai", "typescript", "dataengineering"]
USER_AGENT = "trend-collector/1.0 (zenn scraper)"


def fetch_zenn_articles(tags: list[str] | None = None, limit: int = 10) -> list[dict[str, Any]]:
    """
    Zenn の各トピックタグの RSS フィードから記事を取得する

    Args:
        tags: フィルター対象タグ（リスト）
        limit: 取得する記事数（全タグ合計での上限）

    Returns:
        記事情報（title, url, published, summary, tag, source）のリスト
    """
    if tags is None:
        tags = DEFAULT_TAGS

    headers = {"User-Agent": USER_AGENT}
    articles: list[dict[str, Any]] = []

    per_tag_limit = max(limit // len(tags), 1) + 1

    for tag in tags:
        url = f"https://zenn.dev/topics/{tag}/feed"

        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
        except Exception as e:
            print(f"Warning: Zenn/{tag} への接続に失敗しました: {e}", file=sys.stderr)
            continue

        try:
            # RSS 2.0 形式（<item> ベース。Atom の <entry> ではない）
            soup = BeautifulSoup(response.content, "xml")
            items = soup.find_all("item")

            for item in items[:per_tag_limit]:
                try:
                    title_elem = item.find("title")
                    link_elem = item.find("link")
                    pub_date_elem = item.find("pubDate")

                    if not title_elem or not link_elem:
                        continue

                    articles.append({
                        "title": title_elem.get_text(strip=True),
                        "url": link_elem.get_text(strip=True),
                        "published": pub_date_elem.get_text(strip=True) if pub_date_elem else "",
                        "tag": tag,
                        "source": "Zenn",
                    })
                except Exception:
                    continue
        except Exception as e:
            print(f"Warning: Zenn/{tag} のパースに失敗しました: {e}", file=sys.stderr)
            continue

    # 重複を削除（複数タグに同一記事が載ることがあるため URL ベースで排除）
    seen: set[str] = set()
    unique_articles: list[dict[str, Any]] = []
    for article in articles:
        if article["url"] not in seen:
            seen.add(article["url"])
            unique_articles.append(article)

    return unique_articles[:limit]


def output_json(articles: list[dict[str, Any]]) -> None:
    print(json.dumps(articles, ensure_ascii=False, indent=2))


def output_markdown(articles: list[dict[str, Any]]) -> None:
    if not articles:
        print("取得した記事なし")
        return

    print("### Zenn（日本発信）")
    print()
    for article in articles:
        print(f"- [ ] [{article['title']}]({article['url']})")
        published_date = article["published"][:16] if article["published"] else "不明"
        print(f"タグ: {article['tag']}, 公開: {published_date}")
        print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Zenn からテック記事を取得")
    parser.add_argument(
        "--tags",
        default=",".join(DEFAULT_TAGS),
        help="カンマ区切りのタグ",
    )
    parser.add_argument("--limit", type=int, default=10, help="取得する記事数")
    parser.add_argument("--format", choices=["json", "markdown"], default="markdown")

    args = parser.parse_args()
    tag_list = args.tags.split(",")

    result_articles = fetch_zenn_articles(tags=tag_list, limit=args.limit)

    if args.format == "json":
        output_json(result_articles)
    else:
        output_markdown(result_articles)
