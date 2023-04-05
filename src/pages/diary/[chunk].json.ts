import { CHUNK_SIZE } from "@lib/util";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const get: APIRoute = async function ({ params, request }) {
  const chunk = +params.chunk!;
  const posts = (await getCollection("diary")).sort((a, b) => b.data.date - a.data.date);

  let chunks = posts.slice(chunk * CHUNK_SIZE, chunk * CHUNK_SIZE + CHUNK_SIZE);

  return {
    body: JSON.stringify({
      posts: chunks,
      last: chunks[chunks.length - 1] === posts[posts.length - 1],
    }),
  };
};

export async function getStaticPaths() {
  const posts = await getCollection("diary");
  let chunks = new Array(Math.ceil(posts.length / CHUNK_SIZE)).fill(null);
  return chunks.map((_, index) => ({
    params: { chunk: index.toString() },
  }));
}
