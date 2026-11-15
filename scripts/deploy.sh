#!/usr/bin/env bash
# Production deploy of a frontend CODE change: rebuild the image, recreate
# preview + build-hook, publish the static site, check that everything answers.
# Run it in a checkout of the commit to deploy.
set -euo pipefail

cd "$(dirname "$0")/.."

docker compose --profile deploy build --pull # rebuild the image, on the newest patch of its node base image
docker compose --profile deploy up -d        # recreate preview + build-hook
docker compose exec -T build-hook bash scripts/build-prod.sh # build + flip `current`, output inline

# Health check. preview builds the site when it starts, hence the long retry.
curl -fsS --retry 60 --retry-delay 2 --retry-all-errors -o /dev/null https://admin.karolinanocon.com/server/ping
curl -fsS --retry 60 --retry-delay 2 --retry-all-errors -o /dev/null https://preview.karolinanocon.com/
curl -fsS -o /dev/null https://karolinanocon.com/
echo "healthy"
