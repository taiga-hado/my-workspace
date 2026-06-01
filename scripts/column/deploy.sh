#!/bin/bash
# Daily column article deployment script
# Commits column changes, pushes to remote, and deploys to Vercel.
#
# NOTE: We deliberately do NOT use `set -e`. A transient git push failure
# (DNS hiccup, GitHub auth expiry) must not block vercel deploy, since
# vercel publishes from the local filesystem state — Vercel does not need
# the GitHub remote to be in sync. Each step reports its own failure.

WORKTREE_ROOT="/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732"
PROJECT_DIR="$WORKTREE_ROOT/soukyaku-madoguchi"

cd "$WORKTREE_ROOT" || exit 1

ARTICLE_SLUG="${1:-new-article}"
OVERALL_EXIT=0

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
  if ! git push origin HEAD; then
    echo "WARNING: git push failed (network? auth?) — continuing to vercel deploy"
    OVERALL_EXIT=1
  fi
fi

# Vercel deploy is independent of GitHub state — it uploads the local
# filesystem to Vercel directly. Always invoke the CLI so a git push
# failure does not block the production deployment.
cd "$PROJECT_DIR" || exit 1

# Self-heal: ensure .vercel is a directory (not an empty/corrupted file).
# Symptom seen in production: vercel CLI sometimes leaves .vercel as an
# empty regular file, then every subsequent `vercel deploy` errors with
# "ENOTDIR: not a directory, lstat '.../.vercel/repo.json'".
if [ -e ".vercel" ] && [ ! -d ".vercel" ]; then
  echo "WARNING: .vercel exists but is not a directory; removing and relinking"
  rm -f .vercel
fi
if [ ! -d ".vercel" ]; then
  echo "Re-linking vercel project..."
  if ! vercel link --yes --project soukyaku-madoguchi; then
    echo "ERROR: vercel link failed; cannot deploy"
    OVERALL_EXIT=4
  fi
fi

if command -v vercel >/dev/null 2>&1; then
  if vercel deploy --prod --yes; then
    echo "✓ vercel deploy succeeded"
  else
    echo "ERROR: vercel deploy failed"
    OVERALL_EXIT=2
  fi
else
  echo "WARNING: vercel CLI not found; skipping deploy"
  OVERALL_EXIT=3
fi

if [ "$OVERALL_EXIT" = "0" ]; then
  echo "✓ deploy complete: $ARTICLE_SLUG"
else
  echo "⚠ deploy partially complete: $ARTICLE_SLUG (exit=$OVERALL_EXIT)"
fi
exit $OVERALL_EXIT
