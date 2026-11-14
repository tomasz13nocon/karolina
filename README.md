## Production

Runs on the VPS from `/srv/karolina` (`docker compose --profile deploy`); nginx serves the built site
from `/var/www/karolina/current`. Deploy code changes by pushing to the `production` branch (runs `scripts/deploy.sh`). Details: `docs/deploy.md`.

## Layout

`public/` contains images from blogposts

`src/assets` contains images from the page
