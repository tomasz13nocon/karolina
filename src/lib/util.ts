export const IMAGE_VIEWER_TRANSITION = 300;
export const BLUR_TRANSITION = 300;
export const IMAGE_TRANSITION = 400;
export const CHUNK_SIZE = 10;
export const SWIPE_BOUNCE = 200;

// Dynamically import an image from /src/assets
// Path has to start with /src/assets
// Throws if `path` doesn't exist in /src/assets
export async function getAsset(path: string) {
  const images = import.meta.glob("/src/assets/**/*");
  if (!images[path]) path = "/src/assets/noimage.jpg"; // TODO temp
  return images[path]() as Promise<{ default: ImageMetadata }>;
}

export function toUrl(str: string) {
  return encodeURIComponent(str.toLowerCase().replaceAll(" ", "-"));
}

export function isCurrent(href: string, pathname: string) {
  return href === pathname || href + "/" === pathname;
}

export function getDateStr(date: string) {
  const d = new Date(date);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear() % 100}`;
}
