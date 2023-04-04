const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default {
  config: {
    media_folder: "/src/assets",
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
        name: "photography",
        label: "Photography",
        files: months.map((month, i) => ({
          name: month.toLowerCase(),
          label: month,
          file: `src/data/photography/${month.toLowerCase()}.json`,
          media_folder: `/src/assets/photography/${month.toLowerCase()}`,
          fields: [
            {
              name: "index",
              label: "Index",
              widget: "number",
              value_type: "int",
            },
            {
              name: "name",
              label: "Name",
              widget: "string",
            },
            {
              name: "thumb",
              label: "Thumbnail",
              widget: "list",
              fields: [
                {
                  name: "src",
                  label: "Photo",
                  widget: "image",
                },
                {
                  name: "alt",
                  label: "Alt text",
                  widget: "string",
                  required: false,
                  default: "",
                },
              ],
            },
            {
              name: `photos`,
              label: "Photos",
              widget: "list",
              fields: [
                {
                  name: "src",
                  label: "Photo",
                  widget: "image",
                },
                {
                  name: "alt",
                  label: "Alt text",
                  widget: "string",
                  required: false,
                  default: "",
                },
              ],
            },
          ],
        })),
      },
      {
        name: "shows",
        label: "Shows",
        folder: "src/content/shows",
        create: true,
        media_folder: "/src/assets/shows",
        fields: [
          {
            name: "title",
            label: "Title",
            widget: "string",
          },
          {
            name: "poster",
            label: "Poster",
            widget: "image",
          },
          {
            name: "alt",
            label: "Alt text",
            widget: "string",
            required: false,
            default: "",
          },
          {
            name: "upcoming",
            label: "Upcoming",
            widget: "boolean",
            default: false,
          },
        ],
      },
      {
        name: "pages",
        label: "Pages",
        files: [
          // TODO: decide between json approach vs frontmatter approach
          // {
          //   name: "shows",
          //   label: "Shows",
          //   media_folder: "/src/assets/shows",
          //   file: "src/data/shows.json",
          //   fields: [
          //     {
          //       name: "shows",
          //       label: "Shows",
          //       widget: "list",
          //       fields: [
          //         {
          //           name: "poster",
          //           label: "Poster",
          //           widget: "image",
          //         },
          //         {
          //           name: "alt",
          //           label: "Alt text",
          //           widget: "string",
          //         },
          //         {
          //           name: "upcoming",
          //           label: "Upcoming",
          //           widget: "boolean",
          //           default: false,
          //         },
          //       ],
          //     },
          //   ],
          // },
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
};
