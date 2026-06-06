# Phase 2 plan — Visual editing (TEMPORARY, delete when implemented)

This is a planning artifact, not lasting docs. Phase 1 (the SSR preview) is done
and committed (`2fa0d5a`); read `docs/live-preview.md` first for the topology.
Goal: click-to-edit overlays in the Directus Studio's Visual Editor, layered on
the existing SSR preview.

## Why this is now easy
Visual editing only adds (a) a client script and (b) `data-directus` attributes.
The hard part — making the page reflect edits — is already solved: the preview
is SSR, so `onSaved → location.reload()` shows the saved change. The library does
**not** patch the DOM itself; it only opens the editor and hands you the payload.

## Library API (from research — verify against the README at build time)

Package: `@directus/visual-editing` (v2.x). `npm i @directus/visual-editing`.

- `apply({ directusUrl, elements?, customClass?, onSaved? })` — client-side.
  Those are the only options. Without `elements`, it scans the whole DOM for
  `[data-directus]`. **`apply()` no-ops outside the Directus Studio iframe** (the
  connect→confirm handshake fails), so it's safe to call unconditionally.
  `onSaved(data)` receives `{ collection, item, payload }`.
- `setAttr({ collection, item, fields?, mode? })` → returns a **plain string** for
  the `data-directus` attribute (no client framework needed — use directly in
  `.astro` markup). `fields`: string | string[]. `mode`: `'drawer' | 'modal' |
  'popover'` (popover for inline single text fields; modal/drawer for rich text,
  images, relations).
- Directus 11.16+ validates field-level permissions: an element only activates if
  the current user can edit that field. Editors need edit perms on those fields.

Sources: https://github.com/directus/directus/tree/main/packages/visual-editing/src
and the directus-labs Astro starter (`cms/astro`, `useVisualEditing` hook +
`setAttr` usage in `components/blocks/*`).

## Env wiring (the one non-obvious bit)

`apply()`'s `directusUrl` is the **browser-facing** Studio origin it postMessages
to — NOT `PUBLIC_DIRECTUS_URL` (that's the server-side data URL, `localhost:8055`,
which the browser can't reach in prod). Add a separate var:

- `PUBLIC_DIRECTUS_STUDIO_URL` — dev `http://localhost:8055`, prod
  `https://admin.karolinanocon.com`.
- `PUBLIC_VISUAL_EDITING` — set in `build:preview` to gate the script so the prod
  static build doesn't ship it. (`setAttr` attributes can render
  unconditionally — they're inert strings without `apply()`; only gate the
  script. Slight prod HTML bloat is acceptable; gate the attrs too only if it
  matters.)

Wire both into the `build:preview` script and document in `.env.example`. Dev
defaults can fall back to `localhost:8055` / off.

## Directus side
Configure the **Visual Editor** in the Studio (Settings) with the preview
URL(s) — `https://preview.karolinanocon.com` and `http://localhost:4322` for dev.
Confirm whether this config lives in the schema snapshot (likely a settings/
module config, possibly per-instance like `preview_url`). The CSP `frame-src` is
already set (Phase 1).

## Implementation steps
1. `npm i @directus/visual-editing`.
2. Add `PUBLIC_DIRECTUS_STUDIO_URL` + `PUBLIC_VISUAL_EDITING` to `build:preview`
   and `.env.example`.
3. Client script (e.g. `src/lib/visualEditing.ts` or inline in `Layout.astro`),
   gated on `import.meta.env.PUBLIC_VISUAL_EDITING`:
   ```ts
   import { apply } from "@directus/visual-editing";
   apply({ directusUrl: import.meta.env.PUBLIC_DIRECTUS_STUDIO_URL, onSaved: () => location.reload() });
   ```
   Include it in `Layout.astro` so it runs on every page.
4. Add `data-directus={setAttr({ collection, item, fields, mode })}` to editable
   elements. Each element needs its collection + item id + field(s):
   - `Layout.astro` / `Nav` / copyright — `global` singleton (link names,
     `copyrightText`). For singletons, `item` is the record PK (confirm how the
     singleton id surfaces — `readSingleton` result, or a fixed id).
   - `index.astro` — `home` (`heading`, `image`).
   - `about.astro` — `about` (`heading` popover, `content` drawer, `image` modal,
     `contact` modal).
   - `exhibitions.astro` / `ShowList` — `shows_page` text; each show → `shows`,
     `item: show.id`, fields `title`/`description`/`poster`.
   - `photography.astro` / `[photoSet].astro` — `photo_sets` (`item: photoSet.id`,
     `description`/`title`); `photo_sections` labels.
   - `BlogList.astro` — first-chunk entries → `diary_entries`, `item: blog.id`,
     fields `title`/`body`/`date`. Deep-scroll cloned entries are NOT tagged
     (they come from prerendered JSON — accepted Phase 1 limitation).
5. `onSaved → location.reload()` (SSR re-renders with the change).

## Verify
Local: `npm run preview:local` (:4322), set local preview URLs to localhost
(`python3 scripts/set-preview-urls.py http://localhost:4322`), open the Studio's
Visual Editor → confirm overlays on tagged elements, click → editor opens, save →
preview reloads with the change, console clean. Confirm the prod static build
(`npm run build`) does NOT include the visual-editing script.

## Open decisions before/while implementing
- Scope: start with text fields (headings, body, show/diary text); defer
  images/relations (modal) if it gets fiddly.
- How `setAttr` `item` works for **singletons** (home/about/photography/
  shows_page/global) — confirm the PK to pass.
- Whether the Visual Editor module config is in the schema snapshot or per-instance.
- Final names for the two `PUBLIC_*` env vars.
