import { defineConfig } from 'astro/config';
import NetlifyCMS from 'astro-netlify-cms';

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp'
    }),
    NetlifyCMS({
      config: {
        backend: {
          name: 'git-gateway',
          branch: 'beta',
        },
        collections: [
          {
            name: "diary",
            label: "Diary",
            folder: "src/content/diary",
            create: true,
            fields: [
              { name: 'title', widget: 'string', label: 'Post Title' },
              { name: 'body', widget: 'markdown', label: 'Post Body' },
            ],
          }
        ],
      },
    }),
  ],
  server: { host: true },
});
