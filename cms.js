export default {
  disableIdentityWidgetInjection: true,
  config: {
    media_folder: "/src/assets",
    backend: {
      name: "github",
      repo: "tomasz13nocon/karolina",
      branch: "master",
    },
    collections: [
      {
        name: "diary",
        label: "Diary",
        folder: "src/content/diary",
        create: true,
        media_folder: "/public",
        fields: [
          { name: "title", widget: "string", label: "Title" },
          { name: "date", widget: "date", label: "Publication Date" },
          { name: "body", widget: "markdown", label: "Post Body", media_folder: "/public" },
        ],
      },
      {
        name: "photography",
        label: "Photography",
        folder: "src/content/photography",
        create: true,
        media_folder: "/src/assets/photography/{{slug}}",
        sortable_fields: ["title", "index"],
        fields: [
          { name: "title", label: "Title", widget: "string" },
          { name: "index", label: "Index", widget: "number", value_type: "int" },
          {
            name: "thumb",
            label: "Thumbnail",
            widget: "object",
            fields: [
              { name: "src", label: "Photo", widget: "image" },
              { name: "alt", label: "Alt text", widget: "string", required: false, default: "" },
            ],
          },
          {
            name: `photos`,
            label: "Photos",
            widget: "list",
            fields: [
              { name: "src", label: "Photo", widget: "image" },
              { name: "alt", label: "Alt text", widget: "string", required: false, default: "" },
            ],
          },
        ],
      },
      {
        name: "shows",
        label: "Shows",
        folder: "src/content/shows",
        create: true,
        media_folder: "/src/assets/shows",
        fields: [
          { name: "title", label: "Title", widget: "string" },
          { name: "poster", label: "Poster", widget: "image" },
          { name: "alt", label: "Alt text", widget: "string", required: false, default: "" },
          { name: "upcoming", label: "Upcoming", widget: "boolean", default: false },
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
              { name: "image", label: "Image", widget: "image", media_folder: "/src/assets" },
              { name: "alt", label: "Alt text", widget: "string", required: false, default: "" },
            ],
          },
          {
            name: "about",
            label: "About",
            file: "src/data/about.json",
            fields: [
              { name: "image", label: "Image", widget: "image", media_folder: "/src/assets" },
              { name: "alt", label: "Alt text", widget: "string", required: false, default: "" },
              { name: "title", label: "Title", widget: "string" },
              { name: "content", label: "Content", widget: "markdown" },
              {
                name: "contact",
                label: "Contact",
                widget: "list",
                fields: [
                  { name: "text", label: "Contact Text", widget: "string" },
                  { name: "isEmail", label: "Is email", widget: "boolean", default: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
