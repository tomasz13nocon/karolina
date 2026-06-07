# Live Preview

Production (`karolinanocon.com`) is a static build; `preview.karolinanocon.com`
is server-rendered (`@astrojs/node`, gated on `process.env.MODE==='preview'` in
`astro.config.mjs`) so the Directus Live Preview iframe reflects the live DB
without a rebuild.

## Prod server topology

Not visible from the repo — you'd have to read the server's nginx config:

- **Directus runs on the prod server at `localhost:8055`.** Both vhosts proxy
  `/assets/` to it; that's how images load from the site's own origin.
- `karolinanocon.com` → static files in `/var/www/karolina/dist` (`build:prod`
  deploys there).
- `preview.karolinanocon.com` → nginx proxies `/` to the SSR Node process and
  keeps the `/assets/` proxy. The process runs the `build:preview` bundle
  (`dist/server/entry.mjs`) via systemd **from the repo checkout** (so
  `node_modules` resolves) — `build:preview` does not copy anywhere. Deploying
  preview = `build:preview` + restart, on code changes only.

Because Directus is co-located, **data** is read from `PUBLIC_DIRECTUS_URL`
(default `localhost:8055`) everywhere; **assets** come from `PUBLIC_ASSETS_URL`,
set per build (`build:prod` → `karolinanocon.com`, `build:preview` →
`preview.karolinanocon.com`), which the browser hits and nginx proxies to
Directus.

## Dev

`npm run preview:local` builds the SSR bundle and serves it on `:4322` against
local Directus — nothing touches prod. For the Studio iframe locally, point
preview URLs at it: `python3 scripts/set-preview-urls.py http://localhost:4322`.

## Editing preview URLs (easy to get wrong)

`preview_url` is per-instance but lives in the schema snapshot, so the committed
snapshot holds the **prod** URLs. `scripts/set-preview-urls.py <base>` swaps only
the origin (paths stay in Directus). **Before re-exporting the schema, retarget
to prod**, or localhost test URLs get committed and pushed to prod by
`schema apply`:

```bash
python3 scripts/set-preview-urls.py https://preview.karolinanocon.com
```
