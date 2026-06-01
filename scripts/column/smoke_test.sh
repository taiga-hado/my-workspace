#!/bin/bash
# Smoke test for soukyaku-madoguchi production site.
# Called from deploy.sh after vercel deploy; also runnable standalone.
#
# Verifies:
#   1. All critical pages return HTTP 200
#   2. Top page contains the 3 service cards (第二新卒 / 新卒 / 保育)
#   3. GTM tag is the current ID (GTM-T4VBNNNN)
#   4. sitemap.xml lists all important URLs
#
# Exit codes:
#   0 = all green
#   10 = critical page returned non-200
#   11 = service card text missing from top page
#   12 = GTM ID mismatch
#   13 = sitemap missing important URL

BASE="https://kyusyokusyasokyaku-no-madoguchi.com"
FAILED=0
REPORT=""

EXPECTED_GTM="GTM-T4VBNNNN"

# === 1. Critical pages return 200 ===
CRITICAL_PAGES=(
  "/"
  "/contact/"
  "/daini-shinsotsu/"
  "/shinsotsu/"
  "/hoiku/"
  "/column/"
  "/thanks/"
)

for path in "${CRITICAL_PAGES[@]}"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  if [ "$HTTP" != "200" ]; then
    REPORT="$REPORT\n✗ $path returned $HTTP (expected 200)"
    FAILED=10
  fi
done

# === 2. Top page contains all 3 service cards ===
TOP_HTML=$(curl -s "$BASE/")
EXPECTED_CARDS=(
  "第二新卒・未経験層特化パッケージ"
  "新卒特化パッケージ"
  "保育特化パッケージ"
)

for card in "${EXPECTED_CARDS[@]}"; do
  if ! echo "$TOP_HTML" | grep -q "$card"; then
    REPORT="$REPORT\n✗ Top page missing card: \"$card\""
    FAILED=11
  fi
done

# === 3. GTM ID is current ===
if ! echo "$TOP_HTML" | grep -q "$EXPECTED_GTM"; then
  REPORT="$REPORT\n✗ Top page missing $EXPECTED_GTM (got: $(echo "$TOP_HTML" | grep -o 'GTM-[A-Z0-9]*' | head -1))"
  FAILED=12
fi

# === 4. sitemap.xml lists important URLs ===
SITEMAP=$(curl -s "$BASE/sitemap.xml")
SITEMAP_REQUIRED=(
  "kyusyokusyasokyaku-no-madoguchi.com/"
  "kyusyokusyasokyaku-no-madoguchi.com/hoiku/"
  "kyusyokusyasokyaku-no-madoguchi.com/shinsotsu/"
  "kyusyokusyasokyaku-no-madoguchi.com/daini-shinsotsu/"
)

for url in "${SITEMAP_REQUIRED[@]}"; do
  if ! echo "$SITEMAP" | grep -q "$url"; then
    REPORT="$REPORT\n✗ sitemap.xml missing: $url"
    FAILED=13
  fi
done

# === Report ===
if [ "$FAILED" = "0" ]; then
  echo "✓ smoke test passed: ${#CRITICAL_PAGES[@]} pages, ${#EXPECTED_CARDS[@]} cards, $EXPECTED_GTM, sitemap OK"
  exit 0
else
  echo "============================================"
  echo "SMOKE TEST FAILED (exit=$FAILED)"
  echo "============================================"
  echo -e "$REPORT"
  echo ""
  echo "Investigate before next launchd run."
  exit "$FAILED"
fi
