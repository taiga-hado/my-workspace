#!/bin/bash
# Daily column article publisher (called by macOS launchd)
#
# Looks for scripts/column/ready/{YYYY-MM-DD}.json (today's pre-written article),
# runs build_article.py against it, then moves the file to published/ and runs
# deploy.sh.
#
# If today's ready file does not exist, exits with a clear error so the user
# can be alerted via launchd error log.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TODAY=$(date +%Y-%m-%d)
READY_FILE="$SCRIPT_DIR/ready/${TODAY}.json"
LOG_FILE="/tmp/column-publish-${TODAY}.log"

# Pipe everything below to the log file as well as stdout
exec > >(tee -a "$LOG_FILE") 2>&1

echo "============================================"
echo "Column auto-publish run: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "============================================"

# Source user shell environment so OPENAI_API_KEY etc. are available
if [ -f "$HOME/.zshrc" ]; then
    # shellcheck disable=SC1091
    source "$HOME/.zshrc" 2>/dev/null || true
fi

# Ensure required commands are on PATH (launchd doesn't inherit full shell PATH)
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

if [ -z "${OPENAI_API_KEY:-}" ]; then
    echo "ERROR: OPENAI_API_KEY is not set; cannot generate hero image."
    exit 2
fi

if [ ! -f "$READY_FILE" ]; then
    echo "ERROR: No ready article for $TODAY at:"
    echo "  $READY_FILE"
    echo ""
    echo "Available ready files:"
    ls -1 "$SCRIPT_DIR/ready/" 2>/dev/null || echo "  (none)"
    echo ""
    echo "Action: write tomorrow's article to ready/<date>.json or restock the queue."
    exit 3
fi

# Extract slug for the commit message
SLUG=$(python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(d[0]['slug'])" "$READY_FILE")
echo "Ready article slug: $SLUG"

# Build the article (image gen + html + sitemap + listing + kw-index)
echo "[1/3] Building article..."
python3 "$SCRIPT_DIR/build_article.py" "$READY_FILE"

# Archive the consumed ready file
echo "[2/3] Archiving ready file..."
mkdir -p "$SCRIPT_DIR/published"
mv "$READY_FILE" "$SCRIPT_DIR/published/${TODAY}.json"

# Deploy (git add/commit/push + vercel deploy --prod)
echo "[3/3] Deploying..."
"$SCRIPT_DIR/deploy.sh" "$SLUG"

echo ""
echo "✓ Successfully published $SLUG for $TODAY"
echo "URL: https://kyusyokusyasokyaku-no-madoguchi.com/column/${SLUG}/"
