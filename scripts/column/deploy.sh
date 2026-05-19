#!/bin/bash
# Daily column article deployment script
# Commits column changes, pushes to remote, and deploys to Vercel

set -e

WORKTREE_ROOT="/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732"
PROJECT_DIR="$WORKTREE_ROOT/soukyaku-madoguchi"

cd "$WORKTREE_ROOT"

ARTICLE_SLUG="${1:-new-article}"

# Stage column-related files (including ready/published transitions)
git add soukyaku-madoguchi/column \
        soukyaku-madoguchi/column-dashboard \
        soukyaku-madoguchi/sitemap.xml \
        soukyaku-madoguchi/images/column \
        scripts/column/queue.json \
        scripts/column/ready \
        scripts/column/published 2>/dev/null || true

# Skip commit if nothing staged
if git diff --cached --quiet; then
  echo "No staged changes; skipping commit"
else
  git commit -m "Add column article: $ARTICLE_SLUG

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
  git push origin HEAD
fi

# Vercel auto-deploys on git push (project linked to GitHub).
# If the link is not yet set up, fall back to invoking vercel CLI.
#
# To enable git-push auto-deploy:
#   1. https://vercel.com/taiga-hados-projects/soukyaku-madoguchi/settings/git
#   2. Click "Connect Git Repository" → choose taiga-hado/my-workspace
#   3. Set Production Branch to "claude/amazing-clarke-640732"
#   4. Set Root Directory to "soukyaku-madoguchi"
# After that, this block can be removed entirely.
USE_VERCEL_CLI="${USE_VERCEL_CLI:-auto}"
if [ "$USE_VERCEL_CLI" = "yes" ] || { [ "$USE_VERCEL_CLI" = "auto" ] && ! git config --get remote.origin.url | grep -q "github.com"; }; then
  cd "$PROJECT_DIR"
  if command -v vercel >/dev/null 2>&1; then
    vercel deploy --prod --yes
  else
    echo "WARNING: vercel CLI not found; skipping deploy"
  fi
else
  echo "Vercel deploys via GitHub integration on git push (no CLI invocation needed)."
fi

echo "✓ deploy complete: $ARTICLE_SLUG"
