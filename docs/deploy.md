# Deploy

The site runs as a docker-compose stack on the VPS, with nginx **on the host**
terminating TLS and either serving the built static files or proxying a container.

Services:

- **`directus`** — the CMS. Always runs.
- **`preview`** — the server-rendered build powering the Studio Live Preview pane.
- **`build-hook`** — rebuilds the static prod site on demand.

`preview` and `build-hook` share one image (the root `Dockerfile` — the project +
its deps); they differ only in `command` / `environment`. Both sit behind the
`deploy` profile so local dev doesn't start them.

## Running it

```bash
# Local dev — Directus only
docker compose up directus

# VPS — the whole stack
docker compose --profile deploy up -d --build
```

Secrets come from a root `.env` (see `.env.example`): `DIRECTUS_SECRET`,
`DIRECTUS_ADMIN_*`, `WEBHOOK_TOKEN`, `DIRECTUS_TOKEN`.

## Publishing

Clicking **Publish** in the Studio runs a flow that POSTs to the `build-hook` over
the internal compose network. The hook builds the static site into the
`/srv/karolina/site` volume and atomically flips the `current` symlink to the new
release, then notifies the editor's Studio bell.

### Manual deploy

Run the build script in the container:

```bash
docker compose exec build-hook bash scripts/build-prod.sh
```

It does the same build + atomic publish.

## nginx (host)

```nginx
root /srv/karolina/site/current;             # karolinanocon.com (static)
# admin.karolinanocon.com    -> proxy_pass http://localhost:8055   (Directus)
# preview.karolinanocon.com  -> proxy_pass http://localhost:4322   (SSR preview)
#   except /assets/          -> proxy_pass http://localhost:8055   (so images load same-origin)
```

The first publish must run before `current` exists for nginx to serve.
