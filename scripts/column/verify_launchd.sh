#!/bin/bash
# Diagnostic for soukyaku-column launchd auto-publish.
#
# Triggers the daily publisher once via launchd (kickstart) so we
# exercise the *exact* permission environment macOS uses on the real
# 09:40 firing — not the FDA-blessed environment we get inside Claude
# Code.  Reads back the logs and reports per-step whether each binary
# in the pipeline is allowed to access ~/Desktop.
#
# Expected pipeline binaries (each must be granted Full Disk Access
# in System Settings → Privacy & Security):
#   /bin/bash           — wrapper (publish_today.sh, deploy.sh)
#   /usr/bin/python3    — JSON parse + article build
#   /usr/bin/git        — version control
#   /opt/homebrew/bin/node + vercel CLI (or use GitHub auto-deploy)

set -e

PLIST="$HOME/Library/LaunchAgents/com.hado.soukyaku-column-daily.plist"
LABEL="com.hado.soukyaku-column-daily"
OUT_LOG="/tmp/column-publish.out.log"
ERR_LOG="/tmp/column-publish.err.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================"
echo "launchd verifier — $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "============================================"

# 1. Reload plist (in case it was edited)
echo ""
echo "[1/4] Reloading launchd job…"
launchctl unload "$PLIST" 2>/dev/null || true
launchctl load -w "$PLIST"
launchctl list | grep "$LABEL" || { echo "  (no entry)"; exit 1; }

# 2. Trigger one run via the real launchd path
echo ""
echo "[2/4] Triggering run via launchctl kickstart…"
: > "$OUT_LOG"
: > "$ERR_LOG"
launchctl kickstart -k "gui/$(id -u)/$LABEL"
sleep 8

# 3. Surface logs
echo ""
echo "============================================"
echo "[3/4] stderr (should be empty if FDA is complete):"
echo "============================================"
if [ -s "$ERR_LOG" ]; then
    cat "$ERR_LOG"
    HAS_ERR=1
else
    echo "(empty)  ✓"
    HAS_ERR=0
fi

echo ""
echo "============================================"
echo "[3/4] stdout:"
echo "============================================"
cat "$OUT_LOG" 2>/dev/null || echo "(empty)"

# 4. Per-binary diagnosis
echo ""
echo "============================================"
echo "[4/4] Per-binary FDA diagnosis"
echo "============================================"

LOG_CONTENT="$(cat "$ERR_LOG" "$OUT_LOG" 2>/dev/null)"

echo ""
check_binary() {
    local name="$1"; local pattern="$2"; local path_hint="$3"
    if echo "$LOG_CONTENT" | grep -qE "$pattern"; then
        echo "  ✗ $name  → Operation not permitted detected"
        echo "       Grant FDA to: $path_hint"
        return 1
    else
        echo "  ✓ $name"
        return 0
    fi
}

set +e
check_binary "/bin/bash"          "publish_today.sh.*Operation not permitted"             "/bin/bash"
check_binary "/usr/bin/python3"   "PermissionError.*Operation not permitted"              "/usr/bin/python3"
check_binary "/usr/bin/git"       "git.*[Pp]ermission [Dd]enied|git.*[Oo]peration not"    "/usr/bin/git"
check_binary "vercel/node"        "vercel.*[Pp]ermission|node.*[Pp]ermission|EACCES"      "/opt/homebrew/bin/node"
set -e

echo ""
if [ "$HAS_ERR" = "0" ] && grep -q "Successfully published\|No ready article" "$OUT_LOG" 2>/dev/null; then
    echo "✓ launchd job is functional. Auto-publish will fire tomorrow 09:40."
else
    echo "✗ Still failing somewhere. See per-binary list above for which FDA grant is missing."
    echo ""
    echo "How to grant FDA:"
    echo "  1. System Settings → Privacy & Security → Full Disk Access"
    echo "  2. Click + → press ⌘+Shift+G"
    echo "  3. Paste the path printed above (e.g. /usr/bin/python3)"
    echo "  4. Select → Open → toggle ON"
    echo "  5. Re-run this verifier"
fi
