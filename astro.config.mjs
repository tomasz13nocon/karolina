import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import node from "@astrojs/node";

// The preview build is server-rendered so the Directus Live Preview iframe
// reflects the current DB on every request; production stays fully static.
// MODE is read here (Node, at config load) to pick the adapter; the matching
// `--mode preview` flag drives import.meta.env.MODE in app code (see directus.ts).
const isPreview = process.env.MODE === "preview";

// Where Directus serves assets from, server-side. Mirrors the default in
// src/lib/directus.ts so the dev-asset proxy below points at the same instance.
const directusUrl = process.env.PUBLIC_DIRECTUS_URL ?? "http://localhost:8055";

export default defineConfig({
  output: isPreview ? "server" : "static",
  ...(isPreview ? { adapter: node({ mode: "standalone" }) } : {}),
  integrations: [icon()],
  devToolbar: { enabled: false },
  server: {
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Same-origin asset proxy for `astro dev` only (Vite ignores this at
      // build time). Lets imgSrc() emit relative /dir-assets/... URLs so the
      // dev site works from any device — e.g. a phone on the LAN — without
      // hardcoding a host. Static and preview builds load assets straight from
      // the absolute Directus/CDN origin instead. See src/lib/directus.ts.
      proxy: {
        "/dir-assets": {
          target: directusUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dir-assets/, "/assets"),
        },
      },
    },
  },
  fonts: [
    {
      name: "Open Sans",
      cssVariable: "--font-open-sans",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 700],
    },
  ],
});
