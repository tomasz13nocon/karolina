# ⚠️ TEMPORARY — Server migration to the SSR preview

**Delete this file once the migration is complete.** It is a one-time checklist,
not lasting documentation. The durable description of the setup lives in
`docs/live-preview.md`.

## Starting state

- Prod is on commit **`e2625ef`** (older code + older Directus schema).
- `preview.karolinanocon.com` currently serves **static files** from
  `/var/www/karolina/preview` (nginx `root`).
- Goal: prod up to current `master`, and `preview.karolinanocon.com` switched to
  the **Node SSR** server that reads the live DB.

Run everything below **on the prod server**, in the repo checkout. Directus runs
there at `localhost:8055`.

## 1. Update the code

```bash
git fetch && git checkout master && git pull
npm ci
```

## 2. Apply the current Directus schema to prod

The snapshot now includes new fields (e.g. `photo_sections.label`,
`displayMode`) and the per-collection `preview_url`s.

```bash
# Back up the prod DB first (sqlite file, per docker-compose):
cp directus/database/data.db directus/database/data.db.bak.$(date +%F)

docker compose exec -T directus npx directus schema apply --dry-run /directus/schema/snapshot.yaml
docker compose exec -T directus npx directus schema apply --yes      /directus/schema/snapshot.yaml
docker compose exec -T directus npx directus database migrate:latest
```

## 3. Grant public read on the new fields ⚠️

**Schema snapshots do NOT carry permissions.** After step 2 the new fields exist
on prod but the public (tokenless) role may not be able to read them — which is
exactly the error the SSR preview/static build hit (`You don't have permission
to access field "label" …`).

In the Directus Studio → **Settings → Access Policies / Roles → Public →
`photo_sections` → Read**, ensure `label` and `displayMode` are readable (easiest
is a `*` field rule). Do the same for any other field added since `e2625ef`. If
unsure, just watch for `permission to access field X` errors in step 7 and grant
read on whatever X comes up.

## 3b. Allow the Studio to frame the preview (Directus CSP) ⚠️

Directus's default CSP blocks framing another origin, so the Live Preview pane
errors with `Framing '…' violates … child-src`. The committed
`docker-compose.yml` already sets `CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC`
to allow the local and prod preview origins. If prod runs Directus from this
compose file, just recreate the container; otherwise add the same env to prod's
Directus config:

```yaml
CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: "'self' blob: http://localhost:4322 https://preview.karolinanocon.com"
```

```bash
docker compose up -d directus    # recreate Directus with the new env
```

## 4. Build the SSR preview bundle

```bash
npm run build:preview      # builds dist/server + dist/client in place (no copy)
```

The Node service runs this from the checkout (so `node_modules` resolves) — there
is no `/var/www/karolina/preview` copy anymore.

## 5. Run the preview as a service

Create a systemd unit (adjust `WorkingDirectory` to this checkout's path):

```ini
# /etc/systemd/system/karolina-preview.service
[Unit]
Description=Karolina SSR preview
After=network.target

[Service]
WorkingDirectory=/path/to/karolina
Environment=HOST=127.0.0.1
Environment=PORT=4322
ExecStart=/usr/bin/node ./dist/server/entry.mjs
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now karolina-preview
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4322/   # expect 200
```

Re-run `npm run build:preview && sudo systemctl restart karolina-preview` on
future frontend code changes.

## 6. Point nginx at the Node server

Edit the `preview.karolinanocon.com` server block: **remove** `root
/var/www/karolina/preview/;` and **add** a `location /` proxy to the Node server.
Keep the existing `/assets/` proxy.

```nginx
server {
    server_name preview.karolinanocon.com;
    client_max_body_size 50m;
    location /assets/ {                 # keep — Directus assets
        proxy_pass http://localhost:8055;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
    location /robots.txt { return 404; }
    location / {                        # new
        proxy_pass http://localhost:4322;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

The `karolinanocon.com` (prod, static) block stays as-is.

## 7. Refresh prod + verify

```bash
npm run build:prod         # rebuild the static prod site against the updated schema
```

- Open `https://preview.karolinanocon.com/` and a few routes
  (`/photography`, `/photography/1`, `/exhibitions`, `/diary`) — confirm pages and
  images load. Fix any `permission to access field …` errors via step 3.
- In the Directus Studio, edit an item and confirm the **Live Preview** pane shows
  the page and refreshes on save. `photo_sets` previews open at
  `/photography/{{id}}`.

## 8. Decommission the old flow

- Remove/disable the old webhook that rebuilt the static preview on content edits
  — the SSR preview no longer needs it.
- Optionally add a Directus "Publish" flow (manual-trigger button) that runs the
  prod build, so editors publish from the Studio.
- Remove the now-unused `/var/www/karolina/preview` directory.

## 9. Delete this file. ✅
