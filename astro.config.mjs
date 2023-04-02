import { defineConfig } from "astro/config";
import NetlifyCMS from "astro-netlify-cms";
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";
import cmsConfig from "./cms.js";
import yaml from "@rollup/plugin-yaml";

export default defineConfig({
  integrations: [
    tailwind(),
    image({
      serviceEntryPoint: "@astrojs/image/sharp",
    }),
    NetlifyCMS(cmsConfig),
  ],
  server: { host: true },
  vite: {
    // TODO remove if not used
    plugins: [yaml()],
  },
});
