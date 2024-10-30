import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

export default defineConfig({
  integrations: [tailwind(), icon()],
  devToolbar: { enabled: false },
  server: {
    host: true,
  },
  vite: {
    plugins: [],
  },
});
