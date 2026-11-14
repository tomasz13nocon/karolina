#!/usr/bin/env bash
# Deploy a frontend CODE change to prod. Run by the server's /srv/ops/bin/deploy
# after it checked out the `production` branch (deploy = push to `production`).
set -euo pipefail

cd "$(dirname "$0")/.."

docker compose --profile deploy up -d --build # rebuild image, recreate preview + build-hook
docker compose exec -T build-hook bash scripts/build-prod.sh # build + flip `current`, output inline

# Health check. preview builds the site when it starts, hence the long retry.
curl -fsS --retry 60 --retry-delay 2 --retry-all-errors -o /dev/null https://admin.karolinanocon.com/server/ping
curl -fsS --retry 60 --retry-delay 2 --retry-all-errors -o /dev/null https://preview.karolinanocon.com/
curl -fsS -o /dev/null https://karolinanocon.com/
echo "healthy"
