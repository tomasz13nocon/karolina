Photographer's portfolio website with artistically minimalistic grayscale styling.

## Project Structure

This is an Astro site backed by Directus content. Page routes live in `src/pages/`, reusable UI lives in `src/components/`, shared layouts are in `src/layouts/`, and typed helpers/stores are in `src/lib/`. Static public assets, including bundled fonts, are under `public/`. Local Directus state is kept in `directus/database/` and `directus/uploads/`; treat these as content data, not application source.

Directus schema workflow is described in `docs/directus.md`.

DO NOT edit the directus schema snapshot in `directus/schema/snapshot.yaml` directly!
You can edit the model via directus MCP, then export the schema.

## Build, Test, and Development Commands

- `npm run check`: runs Astro validation, TypeScript (`tsc --noEmit`), ESLint, and prettier.

For routine changes, run `npm run check` before submitting.

For user-facing UI changes, also inspect the affected page in a browser before reporting completion.

Commit to current branch, after user approves changes.

## TypeScript

Never use `as unknown as X` to silence a type error.

## Browser Inspection

Chrome DevTools MCP is configured globally to launch Brave. Use it to inspect `http://localhost:4321`, including desktop and mobile viewport checks. For visual or interaction changes, check the affected route, browser console, and changed interaction before reporting completion. If browser verification cannot be completed, state the blocker clearly.

