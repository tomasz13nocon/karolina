import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

export default defineConfig({
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
