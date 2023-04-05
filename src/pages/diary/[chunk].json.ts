import { CHUNK_SIZE } from "@lib/util";
import type { APIRoute, InferGetStaticParamsType } from "astro";
import { getCollection } from "astro:content";
import { marked } from "marked";

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

export const get: APIRoute = async function (context) {
  const params = context.params as Params;
  const chunk = +params.chunk;

  const posts = await getCollection("diary");
  posts.sort((a, b) => b.data.date - a.data.date);

  let chunksMd = posts.slice(chunk * CHUNK_SIZE, chunk * CHUNK_SIZE + CHUNK_SIZE);
  let chunks = chunksMd.map((chunk) => ({ ...chunk, body: marked(chunk.body) }));

  return {
    body: JSON.stringify({
      posts: chunks,
      last: chunks[chunks.length - 1].id === posts[posts.length - 1].id,
    }),
  };
};

export async function getStaticPaths() {
  const posts = await getCollection("diary");
  const chunks = new Array(Math.ceil(posts.length / CHUNK_SIZE)).fill(null);

  return chunks.map((_, index) => ({
    params: { chunk: index.toString() },
  }));
}
