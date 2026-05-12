#!/usr/bin/env python3
"""Inject a "related articles" section into every published column article.

For each published article, computes the top 4 most-related other published
articles using category match + keyword overlap + title-keyword overlap, then
injects (or replaces) an HTML block between the SUMMARY and BRIDGE sections.

Run this:
  - On its own to refresh all article relationships after content changes
  - Automatically from build_article.py after each new publish (bidirectional
    link refresh — every existing article potentially gets the new one linked)
"""
import json
import re
from pathlib import Path

PROJECT_ROOT = Path(
    "/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732/soukyaku-madoguchi"
)
COLUMN_DIR = PROJECT_ROOT / "column"
METADATA_PATH = COLUMN_DIR / "_metadata.json"

# Markers that delimit the auto-managed related section so the script can
# safely replace it on every run.
START_MARKER = "<!-- art-related-start -->"
END_MARKER = "<!-- art-related-end -->"

# Tokens we care about for soft title-similarity scoring (Japanese — naive
# substring match is good enough for B2B SEO content)
TITLE_TOKENS = [
    "CPA", "ROAS", "SNS", "LP", "面談", "着座", "集客", "送客", "母集団",
    "歩留", "ファネル", "コラム", "TikTok", "Instagram", "X", "YouTube",
    "リスティング", "広告", "コンテンツ", "オウンドメディア",
    "第二新卒", "新卒", "未経験", "エンジニア", "カスタマーサクセス",
    "営業", "事務", "Z世代", "20代", "30代", "女性", "Uターン", "Iターン",
    "成果報酬", "ハイクラス", "ビジネスモデル", "KPI", "事業計画",
]


def parse_keywords_from_html(html: str) -> list:
    m = re.search(r'<meta name="keywords" content="([^"]+)"', html)
    if not m:
        return []
    return [s.strip() for s in re.split(r"[,、，]", m.group(1)) if s.strip()]


def score(a: dict, b: dict) -> int:
    """Score how related article a and b are. Higher is more related."""
    s = 0
    if a.get("category") and a["category"] == b.get("category"):
        s += 10
    a_kw = set(a.get("keywords", []))
    b_kw = set(b.get("keywords", []))
    s += len(a_kw & b_kw) * 3
    a_title = a.get("title", "")
    b_title = b.get("title", "")
    for token in TITLE_TOKENS:
        if token in a_title and token in b_title:
            s += 2
    return s


def pick_related(target: dict, candidates: list, n: int = 4) -> list:
    """Pick the top-N most related candidates."""
    scored = [(score(target, c), idx, c) for idx, c in enumerate(candidates)]
    # Sort by score desc, then by recency (later in list = newer in metadata)
    scored.sort(key=lambda x: (-x[0], -x[1]))
    picked = []
    seen = set()
    for s, _, c in scored:
        if c["slug"] in seen:
            continue
        if s == 0:
            # No similarity signal — only include as fallback if needed
            pass
        picked.append(c)
        seen.add(c["slug"])
        if len(picked) == n:
            break
    return picked


def build_related_block(related: list) -> str:
    """Build the HTML block for the related articles section."""
    cards = []
    for r in related:
        slug = r["slug"]
        title = r["title"]
        category = r.get("category", "")
        cards.append(
            f"""        <a href="../{slug}/" class="art-related-card">
          <div class="art-related-thumb">
            <img src="../../images/column/{slug}-hero.png" alt="{title}" loading="lazy">
          </div>
          <div class="art-related-body">
            <span class="art-related-tag">{category}</span>
            <h4>{title}</h4>
          </div>
        </a>"""
        )
    return f"""    {START_MARKER}
    <div class="art-related">
      <div class="art-related-eyebrow">RELATED ARTICLES</div>
      <h3>合わせて読みたい記事</h3>
      <div class="art-related-grid">
{chr(10).join(cards)}
      </div>
    </div>
    {END_MARKER}"""


def inject_into_html(html: str, related_block: str) -> str:
    """Insert or replace the related block. Idempotent."""
    # If markers already present, replace between them
    if START_MARKER in html and END_MARKER in html:
        pattern = re.compile(
            re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER),
            re.DOTALL,
        )
        return pattern.sub(related_block, html, count=1)

    # Otherwise insert between art-summary closing </div> and art-bridge opening
    # The art-summary block ends with </div>\n\n    <div class="art-bridge">
    pattern = re.compile(
        r'(<div class="art-summary">.*?</div>)\s*(<div class="art-bridge">)',
        re.DOTALL,
    )
    replacement = r"\1\n\n" + related_block + r"\n\n    \2"
    new_html, n = pattern.subn(replacement, html, count=1)
    if n == 0:
        # Fallback: insert before art-bridge if structure differs
        new_html = re.sub(
            r'(<div class="art-bridge">)',
            related_block + r"\n\n    \1",
            html,
            count=1,
        )
    return new_html


def load_published_articles() -> list:
    """Read every published article's metadata + extract keywords from its HTML."""
    if not METADATA_PATH.exists():
        return []
    metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    result = []
    for entry in metadata:
        slug = entry["slug"]
        html_path = COLUMN_DIR / slug / "index.html"
        if not html_path.exists():
            continue
        html = html_path.read_text(encoding="utf-8")
        keywords = parse_keywords_from_html(html)
        result.append({
            "slug": slug,
            "title": entry["title"],
            "description": entry.get("description", ""),
            "category": entry.get("category", ""),
            "published": entry.get("published", ""),
            "keywords": keywords,
            "html_path": html_path,
        })
    return result


def refresh_all_related(n: int = 4, verbose: bool = True) -> int:
    """Refresh the related-articles block in every published article.
    Returns the number of articles updated."""
    articles = load_published_articles()
    if not articles:
        return 0
    updated = 0
    for target in articles:
        others = [a for a in articles if a["slug"] != target["slug"]]
        related = pick_related(target, others, n=n)
        if not related:
            continue
        block = build_related_block(related)
        html = target["html_path"].read_text(encoding="utf-8")
        new_html = inject_into_html(html, block)
        if new_html != html:
            target["html_path"].write_text(new_html, encoding="utf-8")
            updated += 1
            if verbose:
                related_slugs = ", ".join(r["slug"] for r in related)
                print(f"  → {target['slug']}: linked → [{related_slugs}]")
    if verbose:
        print(f"\n  [related OK] refreshed {updated}/{len(articles)} articles")
    return updated


if __name__ == "__main__":
    refresh_all_related()
