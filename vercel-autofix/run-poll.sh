#!/bin/zsh
# launchd entry point: load the local secrets, then look for failed deployments.
cd "$(dirname "$0")" || exit 1
set -a; [ -f .env ] && source .env; set +a
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
exec /usr/bin/python3 autofix.py poll "$@"
