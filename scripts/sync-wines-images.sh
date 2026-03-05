#!/usr/bin/env bash
set -euo pipefail

# Pull wine images from a remote server into the local repository path.
# Default paths are based on the current wine-app setup.
#
# Usage examples:
#   scripts/sync-wines-images.sh
#   DRY_RUN=1 scripts/sync-wines-images.sh
#   REMOTE_HOST=example.com scripts/sync-wines-images.sh
#
# Optional environment variables:
#   REMOTE_HOST         default: 212.227.20.31
#   REMOTE_USER         default: root
#   REMOTE_PATH         default: /root/apps/wine-app/shared/public/images/wines/
#   LOCAL_PATH          default: /home/adria/dev/wine-app/shared/public/images/wines/
#   SSH_PORT            default: 22
#   DRY_RUN             default: 0 (set 1 for preview)

REMOTE_HOST="${REMOTE_HOST:-212.227.20.31}"
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_PATH="${REMOTE_PATH:-/root/apps/wine-app/shared/public/images/wines/}"
LOCAL_PATH="${LOCAL_PATH:-/home/adria/dev/wine-app/shared/public/images/wines/}"
SSH_PORT="${SSH_PORT:-22}"
DRY_RUN="${DRY_RUN:-0}"

mkdir -p "$LOCAL_PATH"

RSYNC_FLAGS=(-az --delete --partial --human-readable)
if [[ "$DRY_RUN" == "1" ]]; then
  RSYNC_FLAGS+=(--dry-run --itemize-changes)
fi

echo "Syncing wines images..."
echo "  from: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
echo "  to:   ${LOCAL_PATH}"

rsync "${RSYNC_FLAGS[@]}" \
  -e "ssh -p ${SSH_PORT}" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}" \
  "${LOCAL_PATH}"

echo "Done."
