#!/usr/bin/env python3
"""
Qiita から テック記事を取得するスクリプト
URL: https://qiita.com

Qiita API v2（認証不要）を使用。

注意: Qiita API v2 の /items エンドポイントは "sort" パラメータを
サポートしていない（ドキュメントに記載がなく、実際に指定しても無視され、
常に created_at 降順で返る）。そのため「人気記事」を得るには、直近の
記事を複数ページまとめて取得し、こちらで likes_count 降順にソートする
必要がある。

使用方法:
  python fetch_qiita.py [--limit 10] [--pages 3] [--days 3]
"""

import sys
import json
import argparse
from datetime import datetime, timedelta, timezone
from typing import Any

try:
    import requests
except ImportError:
    print("Error: requests が必要です", file=sys.stderr)
    print("  pip install requests", file=sys.stderr)
    sys.exit(1)

QIITA_API_URL = "https://qiita.com/api/v2/items"
USER_AGENT = "trend-collector/1.0 (qiita scraper)"


def fetch_qiita_articles(limit: int = 10, pages: int = 3, days: int = 3) -> list[dict[str, Any]]:
    """
    Qiita API から直近の人気記事を取得する

    API 自体はいいね数でソートできないため、直近 `days` 日以内に投稿された
    記事を `pages` ページ分（1 ページ 100 件）取得し、いいね数で降順ソートする。

    Args:
        limit: 最終的に返す記事数
        pages: 取得するページ数（1 ページ = 100 件）
        days: 「直近」とみなす日数

    Returns:
        記事情報（title, url, user, likes, created_at, source）のリスト
    """
    headers = {"User-Agent": USER_AGENT}
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    candidates: list[dict[str, Any]] = []

    for page in range(1, pages + 1):
        params = {"per_page": 100, "page": page}

        try:
            response = requests.get(QIITA_API_URL, params=params, headers=headers, timeout=10)
            response.raise_for_status()
        except Exception as e:
            print(f"Warning: Qiita page {page} への接続に失敗しました: {e}", file=sys.stderr)
            break

        try:
            items = response.json()
        except Exception as e:
            print(f"Warning: Qiita page {page} のパースに失敗しました: {e}", file=sys.stderr)
            break

        if not items:
            break

        reached_cutoff = False
        for item in items:
            created_at_str = item.get("created_at", "")
            try:
                created_at = datetime.fromisoformat(created_at_str)
            except ValueError:
                continue

            if created_at < cutoff:
                # created_at 降順で返るため、cutoff を超えたら以降のページも古いだけ
                reached_cutoff = True
                break

            candidates.append({
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "user": item.get("user", {}).get("name") or item.get("user", {}).get("id", "Unknown"),
                "likes": item.get("likes_count", 0),
                "created_at": created_at_str,
                "source": "Qiita",
            })

        if reached_cutoff:
            break

    # いいね数で降順ソートしてから上位 limit 件を返す
    candidates.sort(key=lambda a: a["likes"], reverse=True)
    return candidates[:limit]


def output_json(articles: list[dict[str, Any]]) -> None:
    print(json.dumps(articles, ensure_ascii=False, indent=2))


def output_markdown(articles: list[dict[str, Any]]) -> None:
    if not articles:
        print("取得した記事なし")
        return

    print("### Qiita（日本発信）")
    print()
    for article in articles:
        print(f"- [ ] [{article['title']}]({article['url']})")
        print(f"投稿者: {article['user']}, いいね: {article['likes']}, 公開: {article['created_at'][:10]}")
        print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Qiita から直近の人気記事を取得")
    parser.add_argument("--limit", type=int, default=10, help="取得する記事数")
    parser.add_argument("--pages", type=int, default=3, help="遡って調べるページ数（1ページ=100件）")
    parser.add_argument("--days", type=int, default=3, help="直近何日分を対象にするか")
    parser.add_argument("--format", choices=["json", "markdown"], default="markdown")

    args = parser.parse_args()

    result_articles = fetch_qiita_articles(limit=args.limit, pages=args.pages, days=args.days)

    if args.format == "json":
        output_json(result_articles)
    else:
        output_markdown(result_articles)
