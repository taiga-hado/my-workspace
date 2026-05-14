#!/bin/bash
# Verifier for the soukyaku-column launchd job. Run this AFTER you grant
# Full Disk Access to /bin/bash in System Settings → Privacy & Security.
#
# It triggers the daily publisher once manually via launchd (not bash directly),
# so if FDA is missing you will see the same TCC error. If FDA is in place,
# you will see the actual publish output (or a clean "no ready file" error
# if today is already published).

set -e

PLIST="$HOME/Library/LaunchAgents/com.hado.soukyaku-column-daily.plist"
LABEL="com.hado.soukyaku-column-daily"
OUT_LOG="/tmp/column-publish.out.log"
ERR_LOG="/tmp/column-publish.err.log"

echo "============================================"
echo "launchd verifier — $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "============================================"

# 1. Confirm plist is loaded
if ! launchctl list | grep -q "$LABEL"; then
    echo "→ Plist not loaded; loading now…"
    launchctl unload "$PLIST" 2>/dev/null || true
    launchctl load -w "$PLIST"
fi

echo ""
echo "[1/3] launchctl list status:"
launchctl list | grep "$LABEL" || { echo "  (no entry)"; exit 1; }

# 2. Clear old logs and trigger manually via launchd (not bash)
echo ""
echo "[2/3] Clearing old logs and triggering job via launchd…"
: > "$OUT_LOG"
: > "$ERR_LOG"
launchctl kickstart -k "gui/$(id -u)/$LABEL"

# 3. Wait briefly for logs to populate
echo ""
echo "[3/3] Waiting 6 seconds for logs…"
sleep 6

echo ""
echo "============================================"
echo "stderr (should be empty if FDA is granted):"
echo "============================================"
if [ -s "$ERR_LOG" ]; then
    cat "$ERR_LOG"
    echo ""
    echo "→ Still blocked. Double-check that /bin/bash appears in"
    echo "  System Settings → Privacy & Security → Full Disk Access"
    echo "  and that the toggle is ON, then run this script again."
    exit 2
else
    echo "(empty)  ✓"
fi

echo ""
echo "============================================"
echo "stdout:"
echo "============================================"
if [ -s "$OUT_LOG" ]; then
    cat "$OUT_LOG"
else
    echo "(empty — the script may have exited before writing logs)"
fi

echo ""
echo "✓ launchd job ran successfully without TCC blocking."
