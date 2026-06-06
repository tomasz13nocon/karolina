import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import node from "@astrojs/node";

// The preview build is server-rendered so the Directus Live Preview iframe
// reflects the current DB on every request; production stays fully static.
// MODE is read here (Node, at config load) to pick the adapter; the matching
// `--mode preview` flag drives import.meta.env.MODE in app code (see directus.ts).
const isPreview = process.env.MODE === "preview";

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
