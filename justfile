# Start the full local dev stack: Directus (docker), frontend dev server (:4321), and local preview (:4322).
dev:
    #!/usr/bin/env bash
    set -euo pipefail
    # On Ctrl-C: stop Directus, then kill the dev/preview node processes.
    trap 'echo; echo "→ Stopping Directus…"; docker compose stop directus; kill 0' EXIT
    # All three run in the foreground so their logs stream together.
    # Directus is the only dev service (preview/build-hook are in the `deploy` profile).
    echo "→ Starting Directus (docker), frontend dev (:4321), and local preview (:4322)…"
    docker compose up directus &
    npm run dev &
    npm run preview:local &
    wait
