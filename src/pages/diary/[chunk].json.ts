import { getDiaryEntries } from "@lib/directus";
import { CHUNK_SIZE } from "@lib/util";
import type { APIRoute, InferGetStaticParamsType } from "astro";
import { marked } from "marked";

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

// get the posts for the current chunk
export const GET: APIRoute = async function (context) {
  const params = context.params as Params;
  const chunk = +params.chunk;

  let blogs = await getDiaryEntries({ sort: "-date" });

  let chunksMd = blogs.slice(chunk * CHUNK_SIZE, chunk * CHUNK_SIZE + CHUNK_SIZE);
  let chunks = chunksMd.map((chunk) => ({ ...chunk, body: marked(chunk.body) }));

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
