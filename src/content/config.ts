import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const diary = defineCollection({
  loader: glob({ base: "src/content/diary", pattern: "*.md" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
  }),
});

const photography = defineCollection({
  loader: glob({ base: "src/content/photography", pattern: "*.md" }),
  schema: z.object({
    title: z.string(),
    section: z.number(),
    index: z.number(),
    thumb: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    photos: z.array(
      z.object({
        src: z.string(),
        alt: z.string(),
      }),
    ),
  }),
});

const shows = defineCollection({
  loader: glob({ base: "src/content/shows", pattern: "*.md" }),
  schema: z.object({
    title: z.string(),
    poster: z.string(),
    alt: z.string(),
    upcoming: z.boolean(),
  }),
});

export const collections = { diary, photography, shows };
