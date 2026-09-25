#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""エージェント向けガイドを Artifact 形式のソースから窓口サイト用の静的HTMLに変換する。

  python3 build.py            # 両方ビルド
  python3 build.py daini      # 第二新卒だけ
  python3 build.py shinsotsu  # 新卒だけ

ソース（web/index.html・web-shinsotsu/index.html）は Artifact の規約どおり
<!DOCTYPE>/<html>/<head>/<body> を持たない。ここで head を付け直す。
OGP・favicon・noindex はこのスクリプトが唯一の定義元なので、
手でラップし直すとSlackのカード画像などが落ちる。必ずこれを通すこと。
"""
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(ROOT, "..", "..", "soukyaku-madoguchi"))
ORIGIN = "https://kyusyokusyasokyaku-no-madoguchi.com"

TARGETS = {
    "daini": dict(
        src=os.path.join(ROOT, "web", "index.html"),
        dst=os.path.join(SITE, "guide", "daini-shinsotsu", "index.html"),
        title="面談の設計図 第二新卒",
        desc="求職者送客の窓口 第二新卒 パートナーガイド",
        path="/guide/daini-shinsotsu/",
        og="/images/og-guide-daini.png",
    ),
    "shinsotsu": dict(
        src=os.path.join(ROOT, "web-shinsotsu", "index.html"),
        dst=os.path.join(SITE, "guide", "shinsotsu", "index.html"),
        title="新卒送客の手引き",
        desc="求職者送客の窓口 新卒 パートナーガイド",
        path="/guide/shinsotsu/",
        og="/images/og-guide-shinsotsu.png",
    ),
}

HEAD = """<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="description" content="{desc}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="求職者送客の窓口">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{origin}{path}">
<meta property="og:image" content="{origin}{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{title}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{origin}{og}">
<link rel="icon" type="image/png" href="/images/favicon.png">
<link rel="shortcut icon" href="/images/favicon.ico">
<link rel="apple-touch-icon" href="/images/favicon.png">
"""

RESET = """
<style>
  :root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>
</head>
<body>
"""


def build(key):
    t = TARGETS[key]
    with open(t["src"], encoding="utf-8") as f:
        s = f.read()
    i = s.index("</style>") + len("</style>")
    out = (
        HEAD.format(origin=ORIGIN, **t)
        + s[:i]
        + RESET
        + s[i:]
        + "\n</body>\n</html>\n"
    )
    with open(t["dst"], "w", encoding="utf-8") as f:
        f.write(out)
    print("%-10s -> %s (%d bytes)" % (key, os.path.relpath(t["dst"], SITE), len(out)))


if __name__ == "__main__":
    keys = sys.argv[1:] or list(TARGETS)
    for k in keys:
        if k not in TARGETS:
            sys.exit("unknown target: %s (%s)" % (k, ", ".join(TARGETS)))
        build(k)
