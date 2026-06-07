# ⚠️ TEMPORARY — Prod bring-up (current master + docker-compose deploy)

**Delete this file once done.** One-time checklist, not lasting docs — the durable
descriptions live in `docs/deploy.md` (stack + publishing) and `docs/live-preview.md`
(preview + visual editing).

## Starting state / goal

- Prod is on an old commit; `preview.karolinanocon.com` still serves static files
  from `/var/www/karolina/preview`.
- Goal: prod on current `master`, served by the docker-compose stack — Directus, the
  SSR `preview` container, and the `build-hook` — with nginx on the new paths.

Run on the prod server, in the repo checkout.

## 1. Code

```bash
git fetch && git checkout master && git pull
```

## 2. Root .env

Compose interpolates these (see `.env.example`):

```
DIRECTUS_SECRET=…        # changing it from the current value logs sessions out
DIRECTUS_ADMIN_EMAIL=…
DIRECTUS_ADMIN_PASSWORD=…
WEBHOOK_TOKEN=…          # shared secret: Publish flow ↔ build-hook
DIRECTUS_TOKEN=…         # Directus static token allowed to create notifications
```

## 3. Apply the current Directus schema

The snapshot adds fields (e.g. `photo_sections.label`, `displayMode`) and the
per-collection `preview_url`s.

```bash
cp directus/database/data.db directus/database/data.db.bak.$(date +%F)   # back up first
docker compose exec -T directus npx directus schema apply --dry-run /directus/schema/snapshot.yaml
docker compose exec -T directus npx directus schema apply --yes      /directus/schema/snapshot.yaml
docker compose exec -T directus npx directus database migrate:latest
```

## 4. Grant public read on the new fields ⚠️

**Schema snapshots do NOT carry permissions.** After step 3 the new fields exist but
the public (tokenless) role may not read them — the exact error the build hits
(`You don't have permission to access field "label" …`). Studio → **Settings →
Access Policies → Public → `photo_sections` → Read**: ensure `label` and
`displayMode` are readable (a `*` field rule is easiest); same for any field added
since the old prod commit. Or just watch for `permission to access field X` in step
9 and grant read on whatever X appears.

## 5. Bring up the stack

```bash
docker compose --profile deploy up -d --build
```

Recreates Directus with the committed env (incl. `…FRAME_SRC`, which lets the Studio
iframe the preview) and starts `preview` (:4322) and `build-hook`. `build-hook` has
no published port — the Publish flow reaches it at `http://build-hook:5123` on the
compose network.

## 6. First prod build

```bash
docker compose exec build-hook bash scripts/build-prod.sh
```

Creates `/srv/karolina/site/current` — the symlink nginx serves; it must exist
before nginx can serve prod.

## 7. nginx

- `karolinanocon.com`: `root /srv/karolina/site/current;` (was `/var/www/karolina/dist`)
- `preview.karolinanocon.com`: proxy `/` → `localhost:4322`; keep `/assets/` → `localhost:8055`
- `admin.karolinanocon.com`: proxy → `localhost:8055`; **remove** any `/my-hooks` location

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 8. Publish flow (prod Directus)

Flows live in the DB, not the schema snapshot — set up on prod. A manual-trigger
flow on `global` with one Request URL op: `POST http://build-hook:5123/build-prod`,
body `{"token":"{{ $env.WEBHOOK_TOKEN }}","user":"{{ $accountability.user }}"}`
(`FLOWS_ENV_ALLOW_LIST=WEBHOOK_TOKEN` is already in the compose env). Delete any old
`/my-hooks`-based Publish / Publish-Preview flows.

Also per-instance (not in the snapshot): set `visual_editor_urls` →
`https://preview.karolinanocon.com` (Studio → Settings → Visual Editor). See
`docs/live-preview.md`.

## 9. Verify

- `preview.karolinanocon.com` + `/photography`, `/photography/1`, `/exhibitions`,
  `/diary` — pages + images load (fix field-permission errors via step 4).
- Studio: edit an item → the Live Preview pane updates on save.
- Click **Publish** → build runs → ✅ notification in the Studio bell → prod updates.

## 10. Decommission + delete this file ✅

- Remove `/var/www/karolina/preview` and the old `/var/www/karolina/dist`.
- Remove the old preview-rebuild webhook + its `karolina-preview` systemd unit, if present.
