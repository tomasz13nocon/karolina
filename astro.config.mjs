import { defineConfig } from 'astro/config';
import NetlifyCMS from 'astro-netlify-cms';
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";

export default defineConfig({
  integrations: [
    tailwind(),
    image({
      serviceEntryPoint: "@astrojs/image/sharp"
    }),
    NetlifyCMS({
      config: {
        media_folder: "/src/img/photography",
        backend: {
          name: "github",
          repo: "tomasz13nocon/karolina",
          branch: "beta",
        },
        collections: [
          {
            name: "diary",
            label: "Diary",
            folder: "src/content/diary",
            create: true,
            fields: [
              { name: 'title', widget: 'string', label: 'Post Title' },
              { name: 'description', widget: 'string', label: 'Description', required: false },
              { name: 'body', widget: 'markdown', label: 'Post Body' },
            ],
          },
          {
            name: "photography",
            label: "Photography",
            folder: "src/content/photography_dummy",
            create: true,
            fields: [
              { name: "photo", widget: "image", media_folder: "/src/img/photography", label: "Photo" }
            ]
          },
        ],
      },
    }),
  ],
  server: { host: true },
});
