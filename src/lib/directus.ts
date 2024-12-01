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
  title: string; // TODO remove
  poster: string;
  upcoming: boolean;
};

type PhotoSection = {
  photoSets: PhotoSet[];
};

type Image = {
  id: string;
  width: number;
  height: number;
};

export type PhotoSubset = {
  photos: { directus_files_id: Image }[];
  description: string;
  magicGrid: boolean;
};

export type PhotoSet = {
  title: string;
  thumbnail: string;
  dynamicPosition: boolean;
  photos: { directus_files_id: Image }[];
  section: number;
  subsets: PhotoSubset[];
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
  photo_sections: PhotoSection[];
  photo_sets: PhotoSet[];
  diary_entries: DiaryEntry[];
};

// const directus = createDirectus<Schema>("http://localhost:8055").with(rest());
const directus = createDirectus<Schema>("https://admin.karolinanocon.com").with(rest());

export default directus;

let directusURL: string;
// if (import.meta.env.MODE === "development") directusURL = "http://localhost:8055/";
if (import.meta.env.MODE === "development") directusURL = "https://karolinanocon.com/";
else if (import.meta.env.MODE === "preview") directusURL = "https://preview.karolinanocon.com/";
else directusURL = "https://karolinanocon.com/";

const assetsURL = directusURL + "assets/";

export function imgSrc(name: string, options?: Record<string, any>) {
  const params = new URLSearchParams(options).toString();
  return assetsURL + name + (params ? "?" + params : "");
}

export async function getDiaryEntries(query?: Query<Schema, DiaryEntry>) {
  let blogs = await directus.request(readItems("diary_entries", query));
  console.log(blogs.length);
  return blogs.map((blog) => ({
    ...blog,
    date: new Date(blog.date),
  }));
}
