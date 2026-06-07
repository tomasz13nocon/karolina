#!/usr/bin/env bash
# Deploy a frontend CODE change to prod. Run on the prod server, in the repo
# checkout.
set -euo pipefail

cd "$(dirname "$0")/.."

git pull --ff-only
docker compose --profile deploy up -d --build # rebuild image, recreate preview + build-hook
docker compose exec -T build-hook bash scripts/build-prod.sh # build + flip `current`, output inline
