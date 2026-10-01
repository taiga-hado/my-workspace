#!/bin/bash
# Smoke test for soukyaku-madoguchi production site.
# Called from deploy.sh after vercel deploy; also runnable standalone.
#
# Verifies:
#   1. All critical pages return HTTP 200
#   2. Top page contains the 2 service cards (第二新卒 / 新卒)
#   3. GTM tag is the current ID (GTM-T4VBNNNN)
#   4. sitemap.xml lists all important URLs
#
# Exit codes:
#   0 = all green
#   10 = critical page returned non-200
#   11 = service card text missing from top page
#   12 = GTM ID mismatch
#   13 = sitemap missing important URL
#   14 = 資料ダウンロードフォーム/領域checkboxが欠けている
#   15 = フォームの送信先(GAS URL)が変わった
#   16 = 資料ページに面談予約URLがない

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
  "/column/"
  "/thanks/"
  "/document/"
  "/assets/inquiry.js"
  "/assets/inquiry.css"
  "/dl/madoguchi-chuto.pdf"
  "/dl/madoguchi-shinsotsu.pdf"
  "/images/doc/chuto/s01.webp"
  "/images/doc/shinsotsu/s01.webp"
)

for path in "${CRITICAL_PAGES[@]}"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  if [ "$HTTP" != "200" ]; then
    REPORT="$REPORT\n✗ $path returned $HTTP (expected 200)"
    FAILED=10
  fi
done

# === 2. Top page contains all 2 service cards ===
TOP_HTML=$(curl -s "$BASE/")
EXPECTED_CARDS=(
  "第二新卒・未経験層特化パッケージ"
  "新卒特化パッケージ"
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
  "kyusyokusyasokyaku-no-madoguchi.com/shinsotsu/"
  "kyusyokusyasokyaku-no-madoguchi.com/daini-shinsotsu/"
)

for url in "${SITEMAP_REQUIRED[@]}"; do
  if ! echo "$SITEMAP" | grep -q "$url"; then
    REPORT="$REPORT\n✗ sitemap.xml missing: $url"
    FAILED=13
  fi
done

# === 5. 資料ダウンロードフォーム（2026-10-01〜 クラウド型）が両ページにある ===
# トップ(#contact)と /contact/ の両方に form.iq-form があり、領域の checkbox
# （第二新卒・未経験領域 / 新卒領域）が揃っていること。
# 「相談して決めたい」は checkbox としては出さず、未選択時に inquiry.js が自動で送る。
# 過去の regression: GTM sweep が contact/index.html を古い dropdown 版で上書きした。
TOP_HTML_FORM=$(echo "$TOP_HTML" | grep -c 'class="iq-form"')
CONTACT_HTML=$(curl -s "$BASE/contact/")
CONTACT_FORM=$(echo "$CONTACT_HTML" | grep -c 'class="iq-form"')
if [ "$TOP_HTML_FORM" -lt 1 ] || [ "$CONTACT_FORM" -lt 1 ]; then
  REPORT="$REPORT\n✗ 資料ダウンロードフォーム(form.iq-form)が見つからない (top=$TOP_HTML_FORM contact=$CONTACT_FORM)"
  FAILED=14
fi
EXPECTED_SERVICE_VALUES=(
  "第二新卒・未経験領域"
  "新卒領域"
)
for opt in "${EXPECTED_SERVICE_VALUES[@]}"; do
  for page in "$TOP_HTML" "$CONTACT_HTML"; do
    if ! echo "$page" | grep -q "value=\"$opt\""; then
      REPORT="$REPORT\n✗ service option missing: \"$opt\""
      FAILED=14
    fi
  done
done
# ライトプランは 2026-10-01 にサイトから一時撤去（.vercelignore で /lite/ も非公開）。復活時はここに checkbox の検査を戻す

# === 6. フォームの送信先が現行の Apps Script Web App URL である ===
# 送信ロジックは assets/inquiry.js に集約（2026-10-01）。両ページがそれを読み込んでいること。
# 過去の regression: GAS endpoint が5日間サイレントに失敗（no-cors fetch は常に成功扱い）。
EXPECTED_GAS_URL='https://script.google.com/macros/s/AKfycbxKPd--F16UiULPqRmbz_jLjWGt-Xy9y_aipISPsgFhFiHcdZsOaSHNoc2AsCZXgQcR/exec'
INQUIRY_JS=$(curl -s "$BASE/assets/inquiry.js")
if ! echo "$INQUIRY_JS" | grep -q "$EXPECTED_GAS_URL"; then
  ACTUAL=$(echo "$INQUIRY_JS" | grep -oE "https://script\.google\.com/macros/s/[^']+/exec" | head -1)
  REPORT="$REPORT\n✗ inquiry.js WEB_APP_URL changed.\n    Expected: $EXPECTED_GAS_URL\n    Got:      $ACTUAL"
  FAILED=15
fi
for page in "$TOP_HTML" "$CONTACT_HTML"; do
  if ! echo "$page" | grep -q 'assets/inquiry.js'; then
    REPORT="$REPORT\n✗ a form page does not load assets/inquiry.js"
    FAILED=15
  fi
done

# === 7. 資料ページに面談予約URLがある ===
THANKS_HTML=$(curl -s "$BASE/thanks/")
if ! echo "$THANKS_HTML" | grep -q 'calendar.google.com/calendar/appointments/schedules/AcZssZ3I3OA0rCgTVGeRd0dgFnZX4-qzPcwhYerfWLX4yPs40cETVoq51xu1UGucxzUNu7TgWf9gfldD'; then
  REPORT="$REPORT\n✗ /thanks/ に面談予約URL（Googleカレンダー予約ページ）がない"
  FAILED=16
fi

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
