import { getDiaryEntries } from "@lib/directus";
import { CHUNK_SIZE } from "@lib/util";
import type { APIRoute, InferGetStaticParamsType } from "astro";

// Prerendered (static) even in the server-rendered preview build: these are
// infinite-scroll pagination chunks, and as on-demand routes the `[chunk]` and
// `[year]-[chunk]` shapes collide (e.g. /diary/2026-0.json would match [chunk]
// with chunk="2026-0"). Prerendering keeps them as exact files, as in prod.
export const prerender = true;

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

// get the posts for the current chunk
export const GET: APIRoute = async function (context) {
  const params = context.params as Params;
  const chunk = +params.chunk;

  let blogs = await getDiaryEntries({ sort: "-date" });

  let chunks = blogs.slice(chunk * CHUNK_SIZE, chunk * CHUNK_SIZE + CHUNK_SIZE);

  return new Response(
    JSON.stringify({
      posts: chunks,
      last: chunks[chunks.length - 1].id === blogs[blogs.length - 1].id,
    }),
  );
};

// generate chunks of diary for infinite scrolling
export async function getStaticPaths() {
  let blogs = await getDiaryEntries();
  const chunks = new Array(Math.ceil(blogs.length / CHUNK_SIZE)).fill(null);

  return chunks.map((_, index) => ({
    params: { chunk: index.toString() },
  }));
}
