#!/bin/bash
# Copies the runtime files of license-tool into soukyaku-madoguchi/license/ (deployed by the madoguchi Vercel project on push to main).
# Source of truth stays in license-tool/. Run after every change, then commit both.
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DST="$SRC/../soukyaku-madoguchi/license"
mkdir -p "$DST/css" "$DST/js/vendor" "$DST/templates"
cp "$SRC"/index.html "$SRC"/check.html "$SRC"/form.html "$SRC"/done.html "$SRC"/terms.html "$DST"/
cp "$SRC"/css/style.css "$SRC"/css/lp.css "$SRC"/css/done.css "$DST"/css/
cp "$SRC"/js/*.js "$DST"/js/
cp "$SRC"/js/vendor/jszip.min.js "$DST"/js/vendor/
cp "$SRC"/templates/*.docx "$DST"/templates/
mkdir -p "$DST/img/docs" && cp "$SRC"/img/*.svg "$SRC"/img/*.webp "$DST"/img/ && cp "$SRC"/img/docs/*.webp "$DST"/img/docs/ && mkdir -p "$DST/img/todo" && cp "$SRC"/img/todo/*.webp "$DST"/img/todo/ && mkdir -p "$DST/img/bonus" "$DST/assets" && cp "$SRC"/img/bonus/*.webp "$DST"/img/bonus/ && cp "$SRC"/assets/*.pdf "$DST"/assets/
sed -i 's#<link rel="canonical" href="[^"]*">#<link rel="canonical" href="https://kyusyokusyasokyaku-no-madoguchi.com/license/">#' "$DST/index.html"
echo "synced to $DST"
