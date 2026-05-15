#!/bin/bash
# Actively exercise every binary in the publish pipeline through launchd
# to surface whether each one has Full Disk Access.
#
# Unlike verify_launchd.sh (which exits early when no ready file exists),
# this script forces each binary to touch a file in ~/Desktop and reports
# success or "Operation not permitted" per binary.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LABEL="com.hado.soukyaku-column-binary-probe"
OUT="/tmp/column-probe.out.log"
ERR="/tmp/column-probe.err.log"
TEST_FILE="$SCRIPT_DIR/ready/2026-05-16.json"  # known to exist

# Inline test program (run via launchd, not via the current FDA-blessed shell)
TEST_SCRIPT="$(mktemp -t column-probe.XXXXXX.sh)"
cat > "$TEST_SCRIPT" <<EOS
#!/bin/bash
echo "[probe] start: \$(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "[probe] euid: \$(id -u)  PATH: \$PATH"

probe() {
    local name="\$1"; shift
    echo ""
    echo "[probe] ▶ \$name"
    if "\$@" >/tmp/column-probe-stdout.tmp 2>/tmp/column-probe-stderr.tmp; then
        echo "[probe] ✓ \$name OK"
    else
        local rc=\$?
        echo "[probe] ✗ \$name FAILED (rc=\$rc)"
        echo "[probe]   stderr: \$(cat /tmp/column-probe-stderr.tmp | head -3)"
    fi
}

probe "bash read \$HOME/Desktop"      bash -c 'head -1 "$TEST_FILE" >/dev/null'
probe "/usr/bin/python3 read"          /usr/bin/python3 -c "open('$TEST_FILE').read(1)"
probe "/usr/bin/git status"            /usr/bin/git -C "$SCRIPT_DIR/.." status --short
probe "/opt/homebrew/bin/node read"    /opt/homebrew/bin/node -e "require('fs').readFileSync('$TEST_FILE')"
probe "/opt/homebrew/bin/vercel ver"   /opt/homebrew/bin/vercel --version

echo ""
echo "[probe] done"
EOS
chmod +x "$TEST_SCRIPT"

# Build a one-shot plist that launchd will fire immediately
PROBE_PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"
cat > "$PROBE_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$TEST_SCRIPT</string>
  </array>
  <key>RunAtLoad</key><false/>
  <key>StandardOutPath</key><string>$OUT</string>
  <key>StandardErrorPath</key><string>$ERR</string>
</dict>
</plist>
EOF

: > "$OUT"
: > "$ERR"

launchctl unload "$PROBE_PLIST" 2>/dev/null || true
launchctl load -w "$PROBE_PLIST"
launchctl kickstart -k "gui/$(id -u)/$LABEL"
sleep 8

echo "============================================"
echo "Binary FDA probe — $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "============================================"
echo ""
echo "stdout:"
echo "------"
cat "$OUT" 2>/dev/null || true
echo ""
echo "stderr:"
echo "------"
cat "$ERR" 2>/dev/null || true

# Cleanup the temporary probe agent
launchctl unload "$PROBE_PLIST" 2>/dev/null || true
rm -f "$PROBE_PLIST" "$TEST_SCRIPT"

echo ""
echo "============================================"
echo "Summary"
echo "============================================"
FAILED="$(grep '^\[probe\] ✗' "$OUT" 2>/dev/null || true)"
if [ -z "$FAILED" ]; then
    echo "✓ All binaries can access ~/Desktop via launchd."
    echo "  Auto-publish will work tomorrow 09:40."
else
    echo "Failing binaries:"
    echo "$FAILED"
    echo ""
    echo "→ Grant Full Disk Access to the binary path shown in each failure."
fi
