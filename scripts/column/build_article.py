#!/usr/bin/env python3
"""
Build column article HTML from JSON data + generate hero image.

Usage:
  python3 build_article.py <articles.json>          # build all articles in JSON
  python3 build_article.py --queue                  # build next article from queue.json

Each article entry requires:
  slug, title, description, keywords, category, read_time,
  image_prompt, summary (list), bridge (list of paragraphs), body_html
"""
import argparse
import base64
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path("/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732/soukyaku-madoguchi")
COLUMN_DIR = PROJECT_ROOT / "column"
IMAGES_DIR = PROJECT_ROOT / "images" / "column"
SITEMAP = PROJECT_ROOT / "sitemap.xml"
SITE_URL = "https://kyusyokusyasokyaku-no-madoguchi.com"

ARTICLE_TEMPLATE = """<!DOCTYPE html>
<html lang="ja">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
}})(window,document,'script','dataLayer','GTM-PSZ9PPQ9');</script>
<!-- End Google Tag Manager -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}｜求職者送客の窓口</title>
  <meta name="description" content="{description}">
  <meta name="keywords" content="{keywords}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{site_url}/column/{slug}/">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{og_description}">
  <meta property="og:url" content="{site_url}/column/{slug}/">
  <meta property="og:image" content="{site_url}/images/column/{slug}-hero.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="../../images/favicon.png">
  <link rel="shortcut icon" href="../../images/favicon.ico">
  <link rel="apple-touch-icon" href="../../images/favicon.png">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{title}",
    "description": "{description}",
    "image": "{site_url}/images/column/{slug}-hero.png",
    "author": {{
      "@type": "Organization",
      "name": "株式会社HADO"
    }},
    "publisher": {{
      "@type": "Organization",
      "name": "求職者送客の窓口",
      "logo": {{
        "@type": "ImageObject",
        "url": "{site_url}/images/logo.png"
      }}
    }},
    "datePublished": "{published}",
    "dateModified": "{published}",
    "mainEntityOfPage": "{site_url}/column/{slug}/"
  }}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../assets/site.css">
  <link rel="stylesheet" href="../../assets/column.css">
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PSZ9PPQ9"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

  <header class="site-header">
    <div class="site-header-inner">
      <a href="../../index.html" class="site-logo">
        <img src="../../images/logo.png" alt="求職者送客の窓口">
      </a>
      <nav class="site-nav">
        <div class="site-nav-links">
          <a href="../../index.html">トップ</a>
          <a href="../../index.html#services">サービス</a>
          <a href="../../index.html#cases">導入事例</a>
          <a href="../" aria-current="page">コラム</a>
        </div>
        <a href="../../contact/" class="btn btn-dark btn-sm">お問い合わせ</a>
      </nav>
      <button class="burger" aria-label="menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="art-hero">
    <div class="art-hero-inner">
      <div class="art-breadcrumb">
        <a href="../../index.html">トップ</a><span class="sep"></span>
        <a href="../">コラム</a><span class="sep"></span>
        <span>{title}</span>
      </div>
      <span class="art-tag">{category}</span>
      <h1 class="art-title">{title}</h1>
      <div class="art-meta">
        <div class="art-meta-item">公開日：<strong>{published_display}</strong></div>
        <div class="art-meta-item">読了時間：<strong>約{read_time}</strong></div>
        <div class="art-meta-item">カテゴリ：<strong>{category}</strong></div>
      </div>
      <div class="art-hero-img">
        <img src="../../images/column/{slug}-hero.png" alt="{title}">
      </div>
    </div>
  </section>

  <article class="art-body">
{body_html}

    <div class="art-summary">
      <h3>SUMMARY</h3>
      <ul>
{summary_html}
      </ul>
    </div>

    <div class="art-bridge">
      <h3>{bridge_title}</h3>
{bridge_html}
    </div>

    <div class="art-cta">
      <div class="art-cta-inner">
        <h3>面談だけに集中できる、<br><span class="gold">新しい求職者獲得モデル</span>へ。</h3>
        <p>御社の獲得したい求職者像・月間希望面談数に合わせた送客プランを、無料でご提案いたします。</p>
        <a href="{site_url}/?ref=column-{slug}" class="btn btn-lg btn-arrow">サービス詳細を見る</a>
      </div>
    </div>

  </article>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="../../images/logo.png" alt="求職者送客の窓口">
          <p class="footer-tagline">人材紹介エージェント様のための、着座成果報酬型 求職者送客サービス。面談までの工数を一括代行し、事業成長を支援します。</p>
        </div>
        <div class="footer-col">
          <h4>Services</h4>
          <ul>
            <li><a href="../../daini-shinsotsu/">第二新卒・未経験層向け</a></li>
            <li><a href="../../shinsotsu/">新卒向け</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Links</h4>
          <ul>
            <li><a href="../../index.html">トップ</a></li>
            <li><a href="../../index.html#cases">導入事例</a></li>
            <li><a href="../">コラム</a></li>
            <li><a href="../../contact/">お問い合わせ</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <dl class="footer-company-list">
            <dt>会社名</dt><dd>株式会社HADO</dd>
            <dt>所在地</dt><dd>東京都渋谷区桜丘町21-4<br>渋谷桜丘町ビル3F</dd>
            <dt>設立</dt><dd>2020年11月6日</dd>
            <dt>Web</dt><dd><a href="https://hado.co.jp/" target="_blank" rel="noopener">hado.co.jp</a></dd>
          </dl>
        </div>
      </div>
      <div class="footer-bottom">© 株式会社HADO. All Rights Reserved.</div>
    </div>
  </footer>

  <script src="../../assets/site.js"></script>
</body>
</html>
"""


def generate_image(prompt: str, output_path: Path) -> bool:
    """Generate hero image via OpenAI gpt-image-2. Returns True on success."""
    if output_path.exists():
        print(f"  [skip image] already exists: {output_path.name}")
        return True

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("  [error] OPENAI_API_KEY not set")
        return False

    payload = json.dumps({
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": "1536x1024",
        "n": 1,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    # Catch a wide net of network/IO errors so a single transient blip
    # (DNS, TCP reset, SSL timeout) does not bubble up and kill the entire
    # publish flow via `set -e`. Every error here is recoverable and a
    # missing image can be regenerated later without re-publishing.
    import socket
    import time
    network_errors = (
        urllib.error.HTTPError,
        urllib.error.URLError,
        ConnectionResetError,
        ConnectionError,
        TimeoutError,
        socket.timeout,
        socket.gaierror,
        OSError,
        KeyError,
        ValueError,  # json decode
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = json.loads(resp.read())
            b64 = data["data"][0]["b64_json"]
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(base64.b64decode(b64))
            print(f"  [image OK] {output_path.name}")
            return True
        except network_errors as e:
            print(f"  [image attempt {attempt+1} failed] {type(e).__name__}: {e}")
            if attempt < 2:
                time.sleep(2 * (attempt + 1))  # backoff: 2s, 4s
        except Exception as e:  # noqa: BLE001 — final safety net
            print(f"  [image attempt {attempt+1} unexpected error] {type(e).__name__}: {e}")
            if attempt < 2:
                time.sleep(2 * (attempt + 1))
    print(f"  [image FAILED after 3 attempts] continuing with broken img src; regenerate later")
    return False


def build_article(article: dict, published: str = None) -> Path:
    """Build article HTML and write to column/[slug]/index.html."""
    slug = article["slug"]
    if published is None:
        published = datetime.now().strftime("%Y-%m-%d")
    published_display = published.replace("-", ".")

    summary_html = "\n".join(
        f"        <li>{item}</li>" for item in article["summary"]
    )
    bridge_html = "\n".join(
        f"      <p>{p}</p>" for p in article["bridge"]
    )

    og_description = article.get("og_description", article["description"])
    if len(og_description) > 130:
        og_description = og_description[:128] + "…"

    rendered = ARTICLE_TEMPLATE.format(
        site_url=SITE_URL,
        slug=slug,
        title=article["title"],
        description=article["description"],
        og_description=og_description,
        keywords=article["keywords"],
        category=article["category"],
        read_time=article["read_time"],
        published=published,
        published_display=published_display,
        body_html=article["body_html"],
        summary_html=summary_html,
        bridge_title=article["bridge_title"],
        bridge_html=bridge_html,
    )

    out_dir = COLUMN_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "index.html"
    out_path.write_text(rendered, encoding="utf-8")
    print(f"  [html OK] {out_path.relative_to(PROJECT_ROOT)}")
    return out_path


def update_listing(articles: list, all_articles_meta: list = None):
    """Regenerate column/index.html with all current cards."""
    listing_path = COLUMN_DIR / "index.html"
    content = listing_path.read_text(encoding="utf-8")

    if all_articles_meta is None:
        all_articles_meta = articles

    cards_html = []
    for art in sorted(all_articles_meta, key=lambda a: a.get("published", "9999"), reverse=True):
        slug = art["slug"]
        title = art["title"]
        excerpt = art.get("excerpt", art["description"])[:120]
        category = art["category"]
        published = art.get("published", datetime.now().strftime("%Y-%m-%d"))
        published_display = published.replace("-", ".")
        cards_html.append(f"""
      <a href="{slug}/" class="col-card">
        <div class="col-card-thumb">
          <img src="../images/column/{slug}-hero.png" alt="{title}" loading="lazy">
        </div>
        <div class="col-card-body">
          <span class="col-card-tag">{category}</span>
          <h2 class="col-card-title">{title}</h2>
          <p class="col-card-excerpt">{excerpt}</p>
          <div class="col-card-meta">
            <time datetime="{published}">{published_display}</time>
          </div>
        </div>
      </a>
""")

    grid_html = "<div class=\"col-grid\">" + "".join(cards_html) + "\n    </div>"

    import re
    new_content = re.sub(
        r'<div class="col-grid">.*?</div>\s*</section>',
        grid_html + '\n  </section>',
        content,
        count=1,
        flags=re.DOTALL,
    )
    listing_path.write_text(new_content, encoding="utf-8")
    print(f"  [listing OK] {listing_path.relative_to(PROJECT_ROOT)} ({len(all_articles_meta)} cards)")


def update_sitemap(slug: str):
    """Add new article URL to sitemap.xml if not already present."""
    content = SITEMAP.read_text(encoding="utf-8")
    new_loc = f"{SITE_URL}/column/{slug}/"
    if new_loc in content:
        print(f"  [sitemap skip] {slug} already present")
        return
    insertion = f"""  <url>
    <loc>{new_loc}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>"""
    new_content = content.replace("</urlset>", insertion)
    SITEMAP.write_text(new_content, encoding="utf-8")
    print(f"  [sitemap OK] +{slug}")


def load_existing_articles() -> list:
    """Scan column/ for existing articles and return their meta (slug, title, etc)."""
    metadata_file = COLUMN_DIR / "_metadata.json"
    if metadata_file.exists():
        return json.loads(metadata_file.read_text())
    return []


def save_metadata(articles: list):
    """Save article metadata to _metadata.json for listing reconstruction."""
    metadata_file = COLUMN_DIR / "_metadata.json"
    metadata_file.write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding="utf-8")


def process_articles(articles: list, published: str = None):
    """Build all articles, generate images, update listing and sitemap."""
    if published is None:
        published = datetime.now().strftime("%Y-%m-%d")

    print(f"=== Processing {len(articles)} article(s) (date: {published}) ===")
    for art in articles:
        slug = art["slug"]
        print(f"\n→ {slug}: {art['title']}")
        image_path = IMAGES_DIR / f"{slug}-hero.png"
        if not generate_image(art["image_prompt"], image_path):
            print(f"  [WARN] image generation failed, continuing")
        build_article(art, published=published)
        art["published"] = published
        if "excerpt" not in art:
            art["excerpt"] = art["description"]
        update_sitemap(slug)

    existing = load_existing_articles()
    by_slug = {a["slug"]: a for a in existing}
    for art in articles:
        meta = {
            "slug": art["slug"],
            "title": art["title"],
            "description": art["description"],
            "category": art["category"],
            "published": art["published"],
            "excerpt": art["excerpt"],
        }
        by_slug[art["slug"]] = meta

    all_meta = list(by_slug.values())
    save_metadata(all_meta)
    update_listing(articles, all_articles_meta=all_meta)
    auto_pop_queue([a["slug"] for a in articles])
    refresh_kw_index()
    refresh_related_articles()
    print("\n=== Done ===")


def refresh_related_articles():
    """Regenerate the related-articles section in every published article.
    Bidirectional: when a new article is published, every existing article
    may pick up a link to it (if it scores in the top N for that target)."""
    try:
        from inject_related_articles import refresh_all_related
        n = refresh_all_related(verbose=False)
        print(f"  [related OK] refreshed related sections in {n} article(s)")
    except Exception as e:
        print(f"  [WARN] related-articles refresh failed: {e}")


def auto_pop_queue(processed_slugs: list):
    """Remove processed slugs from queue.json so the next run picks the next item."""
    queue_path = Path(__file__).parent / "queue.json"
    if not queue_path.exists():
        return
    queue = json.loads(queue_path.read_text(encoding="utf-8"))
    if not queue:
        return
    before = len(queue)
    queue = [item for item in queue if item.get("slug") not in processed_slugs]
    if len(queue) != before:
        queue_path.write_text(json.dumps(queue, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  [queue OK] removed {before - len(queue)} item(s); {len(queue)} remaining")


def refresh_kw_index():
    """Regenerate _kw_index.json (used by /column-dashboard/)."""
    try:
        from build_kw_index import build_kw_index
        build_kw_index()
    except Exception as e:
        print(f"  [WARN] failed to refresh _kw_index.json: {e}")


def process_queue():
    """Pick the next entry from queue.json and publish it. Used by daily cron."""
    queue_path = Path(__file__).parent / "queue.json"
    if not queue_path.exists():
        print("queue.json not found")
        return False
    queue = json.loads(queue_path.read_text(encoding="utf-8"))
    if not queue:
        print("queue is empty")
        return False
    article = queue.pop(0)
    queue_path.write_text(json.dumps(queue, ensure_ascii=False, indent=2), encoding="utf-8")
    process_articles([article])
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="?", help="Path to articles JSON file")
    parser.add_argument("--queue", action="store_true", help="Pick next article from queue.json")
    parser.add_argument("--date", help="Override published date (YYYY-MM-DD)")
    args = parser.parse_args()

    if args.queue:
        process_queue()
        return

    if not args.input:
        parser.print_help()
        sys.exit(1)

    articles = json.loads(Path(args.input).read_text(encoding="utf-8"))
    process_articles(articles, published=args.date)


if __name__ == "__main__":
    main()
