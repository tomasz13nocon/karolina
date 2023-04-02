import { defineConfig } from "astro/config";
import NetlifyCMS from "astro-netlify-cms";
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";

export default defineConfig({
  integrations: [
    tailwind(),
    image({
      serviceEntryPoint: "@astrojs/image/sharp",
    }),
    NetlifyCMS({
      config: {
        media_folder: "/src/assets/photography",
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
            media_folder: "/public",
            fields: [
              { name: "title", widget: "string", label: "Post Title" },
              { name: "date", widget: "datetime", label: "Publication Date" },
              { name: "description", widget: "string", label: "Description", required: false },
              { name: "body", widget: "markdown", label: "Post Body", media_folder: "/public" },
            ],
          },
          {
            name: "pages",
            label: "Pages",
            files: [
              {
                name: "icon",
                label: "Icon",
                file: "src/data/icon.json",
                fields: [
                  {
                    name: "image",
                    label: "Image",
                    widget: "image",
                    public_folder: "/",
                    media_folder: "/public",
                  },
                ],
              },
              {
                name: "home",
                label: "Home",
                file: "src/data/home.json",
                fields: [
                  {
                    name: "image",
                    label: "Image",
                    widget: "image",
                    media_folder: "/src/assets",
                  },
                ],
              },
              {
                name: "about",
                label: "About",
                file: "src/data/about.json",
                fields: [
                  {
                    name: "image",
                    label: "Image",
                    widget: "image",
                    media_folder: "/src/assets",
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
                        widget: "string",
                      },
                    ],
                  },
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
