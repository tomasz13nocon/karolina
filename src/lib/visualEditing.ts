// Visual editing for the Directus Studio "Visual Editor" (layered on the SSR
// preview — see docs/live-preview.md). This module exposes only the build-time
// half: `setAttr` builds the `data-directus` string that marks an element
// editable. It's a pure string builder with no DOM access, so it's safe to call
// in .astro frontmatter during the static prod build (which runs in Node).
//
// The client-side half — apply(), which opens the editor and reloads on save —
// lives in Layout.astro's <script>, gated on PUBLIC_VISUAL_EDITING so the prod
// static build never ships the library.
export { setAttr } from "@directus/visual-editing";

// Every Directus singleton (global, home, about, shows_page, photography) stores
// its single row under primary key 1 — the `item` to pass to setAttr for them.
export const SINGLETON = 1;
