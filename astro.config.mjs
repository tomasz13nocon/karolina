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
            name: "pages",
            label: "Pages",
            files: [
              {
                name: "home",
                label: "Home",
                file: "src/content/home.json",
                fields: [
                  {
                    name: "image",
                    label: "Image",
                    widget: "image",
                    media_folder: "/src/img",
                  },
                ],
              },
              {
                name: "about",
                label: "About",
                file: "src/content/about.json",
                fields: [
                  {
                    name: "image",
                    label: "Image",
                    widget: "image",
                    media_folder: "/src/img",
                  },
                  {
                    name: "title",
                    label: "Title",
                    widget: "string",
                  },
                  {
                    name: "content",
                    label: "Content",
                    widget: "markdown",
                  },
                  {
                    name: "contact",
                    label: "Contact",
                    widget: "list",
                    fields: [
                      {
                        name: "text",
                        label: "Contact Text",
                        widget: "string"
                      }
                    ],
                  }
                ],
              },
            ],
          },
        ],
      },
    }),
  ],
  server: { host: true },
});
