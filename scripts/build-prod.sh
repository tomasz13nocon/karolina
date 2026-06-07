#!/usr/bin/env bash
# Triggered by webhook-server.js inside the build-hook container. Builds the
# static prod site and atomically publishes it into the shared /out volume that
# nginx serves (root .../current). No sudo — the container owns the mount.
set -euo pipefail

cd "$(dirname "$0")/.." # project root (/app in the container)

OUT=/out
REL="releases/$(date +%Y%m%d-%H%M%S)"

# PUBLIC_DIRECTUS_URL (server-side data fetch) is injected by compose and points
# at http://directus:8055. PUBLIC_ASSETS_URL is browser-facing, so it points at
# the public domain (nginx serves /assets from Directus).
PUBLIC_ASSETS_URL="https://karolinanocon.com" npm run build # -> ./dist

mkdir -p "$OUT/releases"
cp -r dist "$OUT/$REL"        # copy across the bind-mount filesystem
ln -sfn "$REL" "$OUT/current" # atomic publish: flip the symlink nginx serves

# Keep the three most recent releases, prune the rest.
ls -1dt "$OUT"/releases/*/ 2>/dev/null | tail -n +4 | xargs -r rm -rf

echo "Published $REL"
