#!/bin/bash
# Daily column article deployment script
# Commits column changes, pushes to remote, and deploys to Vercel

set -e

WORKTREE_ROOT="/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732"
PROJECT_DIR="$WORKTREE_ROOT/soukyaku-madoguchi"

cd "$WORKTREE_ROOT"

ARTICLE_SLUG="${1:-new-article}"

# Stage column-related files
git add soukyaku-madoguchi/column \
        soukyaku-madoguchi/column-dashboard \
        soukyaku-madoguchi/sitemap.xml \
        soukyaku-madoguchi/images/column \
        scripts/column/queue.json 2>/dev/null || true

# Skip commit if nothing staged
if git diff --cached --quiet; then
  echo "No staged changes; skipping commit"
else
  git commit -m "Add column article: $ARTICLE_SLUG

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
  git push origin HEAD
fi

# Deploy to Vercel (production)
cd "$PROJECT_DIR"
if command -v vercel >/dev/null 2>&1; then
  vercel deploy --prod --yes
else
  echo "WARNING: vercel CLI not found; skipping deploy"
fi

echo "✓ deploy complete: $ARTICLE_SLUG"
