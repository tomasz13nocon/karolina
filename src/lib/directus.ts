import { createDirectus, readItems, rest, type Query } from "@directus/sdk";

type Global = {
  icon: string;
  description: string;
  copyrightText: string;
  homeLinkName: string;
  aboutLinkName: string;
  photographyLinkName: string;
  showsLinkName: string;
  diaryLinkName: string;
};

type Home = {
  heading: string;
  image: string;
};

type About = {
  heading: string;
  image: string;
  content: string;
  contact: { text: string; isEmail: boolean }[];
};

type ShowsPage = {
  upcomingShowsText: string;
  noUpcomingShowsText: string;
  pastShowsText: string;
  noPastShowsText: string;
};

type Show = {
  id: number;
  poster: string;
  upcoming: boolean;
  description: string | null;
};

export type PhotoSection = {
  id: number;
  sort: number | null;
  label: string | null;
  displayMode: "links" | "dropdown";
  photoSets: PhotoSet[] | null;
};

type Image = {
  id: string;
  width: number;
  height: number;
};

// directus_files_id is the junction's FK to directus_files. Every file relation
// in this schema is on_delete: SET NULL, so a junction row can outlive its file
// and arrive here as null — callers must filter/guard before dereferencing.
export type Photo = {
  directus_files_id: Image | null;
};

type Photography = {
  selectedWorks: Photo[];
};

export type PhotoSet = {
  id: number;
  sort: number | null;
  title: string;
  description: string | null;
  thumbnail: string;
  magicGrid: boolean;
  dynamicPosition: boolean;
  maxColumns?: number;
  photos: Photo[] | null;
  section: number;
};

export type DiaryEntry = {
  id: number;
  title: string;
  date: Date;
  body: string;
};

type Schema = {
  global: Global;
  home: Home;
  about: About;
  shows_page: ShowsPage;
  shows: Show[];
  photography: Photography;
  photo_sections: PhotoSection[];
  photo_sets: PhotoSet[];
  diary_entries: DiaryEntry[];
  // Declared so the SDK can type nested relational field selection (the M2M
  // junction + the files collection it points at).
  photography_files: Photo[];
  directus_files: Image[];
};

// Which Directus instance the frontend reads from — decoupled from the render
// mode and set per machine/deploy in .env, so a local build never hits prod.
// Defaults to the local instance; the prod/preview server sets this to the live
// instance (https://admin.karolinanocon.com) in .env.production.
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL ?? "http://localhost:8055";

// Assets are served straight from the Directus instance by default. The public
// static build overrides this with the cached front (PUBLIC_ASSETS_URL) for
// performance; the preview build leaves it direct so image edits show live.
const ASSETS_URL = import.meta.env.PUBLIC_ASSETS_URL ?? DIRECTUS_URL;

const directus = createDirectus<Schema>(DIRECTUS_URL).with(rest());

export default directus;

// Absolute assets base. Used by server-side fetches of an asset (e.g. blurhash
// generation in Blurhash.astro), where a relative URL has no origin to resolve
// against, and as the browser base for static/preview builds.
const serverAssetsURL = ASSETS_URL.replace(/\/+$/, "") + "/assets/";

// Browser-facing assets base (what ends up in <img>/<link>). In `astro dev` we
// route through the same-origin dev proxy (see astro.config.mjs) so the site
// works from any device — e.g. a phone on the LAN — without hardcoding a host.
// Builds keep the absolute origin so the proxy is never relied on at runtime.
const browserAssetsURL = import.meta.env.DEV ? "/dir-assets/" : serverAssetsURL;

console.log(`Directus data: ${DIRECTUS_URL} | assets: ${browserAssetsURL}`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSrc(base: string, name: string, options?: Record<string, any>) {
  const params = new URLSearchParams(options).toString();
  return base + name + (params ? "?" + params : "");
}

// URL for an asset as loaded by the browser (goes into <img>/<link>).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function imgSrc(name: string, options?: Record<string, any>) {
  return buildSrc(browserAssetsURL, name, options);
}

// URL for an asset fetched on the server (SSR/build), e.g. blurhash generation.
// Always absolute since there's no page origin to resolve a relative path.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function imgSrcServer(name: string, options?: Record<string, any>) {
  return buildSrc(serverAssetsURL, name, options);
}

export async function getDiaryEntries(query?: Query<Schema, DiaryEntry>) {
  let blogs = await directus.request(readItems("diary_entries", query));
  return blogs.map((blog) => ({
    ...blog,
    date: new Date(blog.date),
  }));
}

// Shared by photography/[photoSet].astro for both getStaticPaths (static build)
// and the request-time fallback (SSR preview). Kept here, not in the page body,
// because getStaticPaths runs in an isolated context where only imports — not
// the component's local declarations — are in scope.
export async function getPhotoSetsAndSections() {
  const [photoSets, sections] = await Promise.all([
    directus.request(
      readItems("photo_sets", {
        fields: [
          "*",
          { photos: ["directus_files_id", { directus_files_id: ["id", "width", "height"] }] },
        ],
      }),
    ),
    directus.request(
      readItems("photo_sections", {
        fields: ["id", "label", "displayMode", { photoSets: ["*"] }],
        sort: ["sort"],
        deep: { photoSets: { _sort: ["sort"] } },
      }),
    ),
  ]);
  return { photoSets, sections };
}
