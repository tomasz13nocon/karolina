# Start the full local dev stack: Directus (docker), frontend dev server (:4321), and local preview (:4322).
dev:
    #!/usr/bin/env bash
    set -euo pipefail
    # Directus is the only dev service (preview/build-hook are in the `deploy` profile).
    echo "→ Starting Directus (docker)…"
    docker compose up -d directus
    # Clean up the dev/preview node processes on Ctrl-C; Directus stays up in the background.
    trap 'kill 0' EXIT
    echo "→ Starting frontend dev (:4321) and local preview (:4322)…"
    npm run dev &
    npm run preview:local &
    wait
