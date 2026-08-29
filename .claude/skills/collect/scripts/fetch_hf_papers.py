#!/usr/bin/env python3
"""
Hugging Face Papers から AI/ML 論文トレンドを取得するスクリプト
URL: https://huggingface.co/papers

Hugging Face が公式にキュレーションする daily trending papers。
（当初は arxiv-sanity-lite.com を使う予定だったが、証明書が壊れていて
 HTTPS 接続できなかったため、より信頼性の高い Hugging Face Papers に変更）

使用方法:
  python fetch_hf_papers.py [--limit 10]
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

HF_PAPERS_URL = "https://huggingface.co/papers"
USER_AGENT = "trend-collector/1.0 (huggingface papers scraper)"


def fetch_hf_papers(limit: int = 10) -> list[dict[str, Any]]:
    """
    Hugging Face Papers から本日のトレンド論文を取得する

    Args:
        limit: 取得する論文数

    Returns:
        論文情報（title, url, source）のリスト
    """
    headers = {"User-Agent": USER_AGENT}

    try:
        response = requests.get(HF_PAPERS_URL, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"Error: Hugging Face Papers への接続に失敗しました: {e}", file=sys.stderr)
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    papers: list[dict[str, Any]] = []
    seen_urls: set[str] = set()

    # 各論文は <h3><a href="/papers/XXXX.XXXXX">タイトル</a></h3> の構造
    for h3 in soup.find_all("h3"):
        link = h3.find("a", href=True)
        if not link:
            continue

        href = link["href"]
        if not href.startswith("/papers/"):
            continue

        paper_url = f"https://huggingface.co{href}"
        if paper_url in seen_urls:
            continue
        seen_urls.add(paper_url)

        title = link.get_text(strip=True)
        if not title:
            continue

        papers.append({
            "title": title,
            "url": paper_url,
            "source": "Hugging Face Papers",
        })

        if len(papers) >= limit:
            break

    return papers


def output_json(papers: list[dict[str, Any]]) -> None:
    print(json.dumps(papers, ensure_ascii=False, indent=2))


def output_markdown(papers: list[dict[str, Any]]) -> None:
    if not papers:
        print("取得した論文なし")
        return

    print("### AI/ML 論文トレンド（Hugging Face Papers）")
    print()
    for paper in papers:
        print(f"- [ ] [{paper['title']}]({paper['url']})")
        print("（要約は本文取得後に記載）")
        print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Hugging Face Papers から AI/ML 論文トレンドを取得"
    )
    parser.add_argument("--limit", type=int, default=10, help="取得する論文数")
    parser.add_argument("--format", choices=["json", "markdown"], default="markdown")

    args = parser.parse_args()

    result_papers = fetch_hf_papers(limit=args.limit)

    if args.format == "json":
        output_json(result_papers)
    else:
        output_markdown(result_papers)
