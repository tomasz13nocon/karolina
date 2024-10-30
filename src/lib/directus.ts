import { createDirectus, readItems, rest, type Query } from "@directus/sdk";

type Pages = {};

type Global = {
  icon: string;
  description: string;
  copyrightText: string;
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
  title: string;
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

export type PhotoSet = {
  title: string;
  thumbnail: string;
  photos: { directus_files_id: Image }[];
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
  photo_sections: PhotoSection[];
  photo_sets: PhotoSet[];
  diary_entries: DiaryEntry[];
};

const directus = createDirectus<Schema>("http://localhost:8055").with(rest());

export default directus;

const directusURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8055/"
    : "https://karolinanocon.com/directus/";

const assetsURL = directusURL + "assets/";

export function imgSrc(name: string, options?: Record<string, any>) {
  const params = new URLSearchParams(options).toString();
  return assetsURL + name + (params ? "?" + params : "");
}

export async function getDiaryEntries(query?: Query<Schema, DiaryEntry>) {
  let blogs = await directus.request(readItems("diary_entries", query));
  return blogs.map((blog) => ({
    ...blog,
    date: new Date(blog.date),
  }));
}
