import { CHUNK_SIZE } from "@lib/util";
import type { APIRoute, InferGetStaticParamsType } from "astro";
import { getCollection } from "astro:content";
import { marked } from "marked";

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

// get the posts for the current chunk and year
export const GET: APIRoute = async function (context) {
  const params = context.params as Params;
  const chunk = +params.chunk;
  const year = +params.year;

  let posts = await getCollection("diary");
  posts = posts
    .filter((post) => new Date(post.data.date).getFullYear() === year)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  let chunksMd = posts.slice(chunk * CHUNK_SIZE, chunk * CHUNK_SIZE + CHUNK_SIZE);
  let chunks = chunksMd.map((chunk) => ({ ...chunk, body: marked(chunk.body) }));

  return new Response(
    JSON.stringify({
      posts: chunks,
      last: chunks[chunks.length - 1].id === posts[posts.length - 1].id,
    }),
  );
};

interface Chunk {
  params: {
    year: string;
    chunk: string;
  };
}

// generate chunks of diary for each year for infinite scrolling
export async function getStaticPaths() {
  const allPosts = await getCollection("diary");
  const yearPosts: Record<string, number> = {};

  for (let post of allPosts) {
    const year = new Date(post.data.date).getFullYear();
    yearPosts[year] = (yearPosts[year] || 0) + 1;
  }

  return Object.entries(yearPosts).reduce((acc: Chunk[], [year, postCount]) => {
    let chunks = new Array(Math.ceil(postCount / CHUNK_SIZE)).fill(null);
    let chunkParams = chunks.map((_, index) => ({
      params: { year, chunk: index.toString() },
    }));
    acc.push(...chunkParams);
    return acc;
  }, []);
}
