#!/bin/bash
# Daily column article deployment (git-based, consolidated 2026-06).
#
# The Vercel project "soukyaku-madoguchi" is connected to GitHub and
# AUTO-DEPLOYS on push to `main` (root directory = soukyaku-madoguchi).
# This script commits the freshly-built column article and pushes it to main;
# Vercel builds and aliases the production domain automatically. There is NO
# `vercel` CLI step anymore: main is the single source of truth.
#
# This worktree's branch is kept aligned to origin/main, so we always push
# HEAD:main. Order matters: the build wrote files into the working tree, so we
# COMMIT first, then rebase onto the latest main, then push.
#
# Deliberately NO `set -e`: a transient git failure must not skip the smoke test.

WORKTREE_ROOT="/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732"
ARTICLE_SLUG="${1:-new-article}"
OVERALL_EXIT=0

cd "$WORKTREE_ROOT" || exit 1

# Stage the column build outputs (article HTML, hero image, dashboard, sitemap, queue state)
git add soukyaku-madoguchi/column \
        soukyaku-madoguchi/column-dashboard \
        soukyaku-madoguchi/sitemap.xml \
        soukyaku-madoguchi/images/column \
        scripts/column/queue.json \
        scripts/column/ready \
        scripts/column/published 2>/dev/null || true

if git diff --cached --quiet; then
  echo "No staged changes; nothing to commit/deploy"
else
  git commit -m "Add column article: $ARTICLE_SLUG

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
  # Incorporate any commits that landed on main since, keeping our new commit on top
  if git pull --rebase origin main; then
    if git push origin HEAD:main; then
      echo "✓ pushed to main — Vercel auto-deploy triggered"
    else
      echo "ERROR: git push to main failed; production will NOT update until pushed"
      OVERALL_EXIT=2
    fi
  else
    echo "ERROR: rebase onto origin/main failed (conflict?); aborting push"
    git rebase --abort 2>/dev/null
    OVERALL_EXIT=3
  fi
fi

# --- Post-deploy smoke test (Vercel auto-deploy + CDN propagation needs time) ---
SMOKE_TEST="$WORKTREE_ROOT/scripts/column/smoke_test.sh"
if [ -x "$SMOKE_TEST" ]; then
  echo "Waiting 60s for Vercel auto-deploy + CDN propagation before smoke test..."
  sleep 60
  if "$SMOKE_TEST"; then
    echo "✓ post-deploy smoke test passed"
  else
    SMOKE_EXIT=$?
    echo "✗ POST-DEPLOY SMOKE TEST FAILED (exit=$SMOKE_EXIT)"
    echo "  → Site may have regressed. Investigate before next launchd run."
    OVERALL_EXIT=$((100 + SMOKE_EXIT))
  fi
fi

if [ "$OVERALL_EXIT" = "0" ]; then
  echo "✓ deploy complete: $ARTICLE_SLUG"
else
  echo "⚠ deploy completed with issues: $ARTICLE_SLUG (exit=$OVERALL_EXIT)"
fi
exit $OVERALL_EXIT
