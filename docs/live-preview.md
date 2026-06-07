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

## Visual editing

Click-to-edit overlays in the Studio's Visual Editor, layered on this SSR preview:
`apply()` opens the editor and `onSaved → location.reload()` shows the change (the
library never patches the DOM). Editable elements carry a `data-directus` string
from `setAttr` (see `src/lib/visualEditing.ts`).

Two env vars, set by the preview build scripts:

- `PUBLIC_DIRECTUS_STUDIO_URL` — the **browser-facing** Studio origin the preview
  (in the Studio iframe) postMessages to. NOT `PUBLIC_DIRECTUS_URL`, the
  server-side data URL the browser can't reach in prod. `build:preview` sets it to
  `https://admin.karolinanocon.com`; defaults to `http://localhost:8055`, which is
  right for `preview:local`.
- `PUBLIC_VISUAL_EDITING` — gates the `apply()` script in `Layout.astro`. Unset in
  the prod static build, so Rollup drops the dynamic import and the library never
  ships. `setAttr`'s attributes still render in prod, but inert.

**`visual_editor_urls` lives in `directus_settings`, NOT the schema snapshot** — so
it's per-instance and must be set on each Directus separately (Settings → Visual
Editor, or PATCH `/settings`): prod → `https://preview.karolinanocon.com`, local →
`http://localhost:4322`. Without it the module won't load the preview. This is
distinct from the per-collection `preview_url` above (which drives the side-panel
Live Preview and *is* in the snapshot).

Not editable, by design: deep-scroll diary clones (cloned from prerendered JSON
after `apply()` has scanned), dropdown photo-set-group labels (hidden popovers),
and relational fields (about `contact`, photography `selectedWorks`, photo-set
images).
