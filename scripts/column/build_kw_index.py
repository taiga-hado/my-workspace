#!/usr/bin/env python3
"""Build _kw_index.json — unified registry of all column articles (published + queued)
with their target keywords, used by the internal keyword dashboard."""
import json
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path("/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732/soukyaku-madoguchi")
COLUMN_DIR = PROJECT_ROOT / "column"
SCRIPTS_DIR = Path("/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732/scripts/column")
QUEUE_PATH = SCRIPTS_DIR / "queue.json"
METADATA_PATH = COLUMN_DIR / "_metadata.json"
KW_INDEX_PATH = COLUMN_DIR / "_kw_index.json"
SITE_URL = "https://kyusyokusyasokyaku-no-madoguchi.com"


def parse_keywords_field(value):
    """Accepts comma-separated string or list, returns list of trimmed strings."""
    if isinstance(value, list):
        items = value
    else:
        items = re.split(r"[,、，]", str(value))
    return [s.strip() for s in items if s.strip()]


def load_published_articles():
    """Read column/_metadata.json + extract keywords from each article HTML."""
    if not METADATA_PATH.exists():
        return []
    metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    result = []
    for entry in metadata:
        slug = entry["slug"]
        article_html = COLUMN_DIR / slug / "index.html"
        keywords = []
        if article_html.exists():
            content = article_html.read_text(encoding="utf-8")
            match = re.search(r'<meta name="keywords" content="([^"]+)"', content)
            if match:
                keywords = parse_keywords_field(match.group(1))
        result.append({
            "slug": slug,
            "title": entry["title"],
            "description": entry.get("description", ""),
            "category": entry.get("category", ""),
            "keywords": keywords,
            "primary_keyword": keywords[0] if keywords else "",
            "status": "published",
            "published": entry.get("published", ""),
            "url": f"{SITE_URL}/column/{slug}/",
        })
    return result


def load_queued_articles():
    """Read scripts/column/queue.json."""
    if not QUEUE_PATH.exists():
        return []
    queue = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))
    result = []
    for idx, entry in enumerate(queue):
        keywords = parse_keywords_field(entry.get("keywords", ""))
        result.append({
            "slug": entry["slug"],
            "title": entry["title"],
            "description": entry.get("description", ""),
            "category": entry.get("category", ""),
            "keywords": keywords,
            "primary_keyword": keywords[0] if keywords else "",
            "key_points": entry.get("key_points", []),
            "status": "queued",
            "queue_position": idx + 1,
            "url": f"{SITE_URL}/column/{entry['slug']}/",
        })
    return result


def build_kw_index():
    """Build the unified _kw_index.json from metadata + queue."""
    published = load_published_articles()
    queued = load_queued_articles()
    published_sorted = sorted(published, key=lambda a: a.get("published", ""), reverse=True)
    queued_sorted = sorted(queued, key=lambda a: a.get("queue_position", 9999))
    all_articles = published_sorted + queued_sorted
    KW_INDEX_PATH.write_text(
        json.dumps(all_articles, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"  [kw-index OK] {KW_INDEX_PATH.relative_to(PROJECT_ROOT)} "
          f"(published: {len(published)}, queued: {len(queued)})")
    return all_articles


if __name__ == "__main__":
    build_kw_index()
