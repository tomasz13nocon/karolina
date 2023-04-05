export const IMAGE_VIEWER_TRANSITION = 300;
export const BLUR_TRANSITION = 300;
export const IMAGE_TRANSITION = 400;
export const CHUNK_SIZE = 2;

// Dybamically import an image from /src/assets
// Path has to start with /src/assets
// Throws if `path` doesn't exist in /src/assets
export async function getAsset(path: string) {
  const images = import.meta.glob("/src/assets/**/*");
  return images[path]() as Promise<{ default: ImageMetadata }>;
}

export function toUrl(str: string) {
  return encodeURIComponent(str.toLowerCase().replaceAll(" ", "-"));
}

export function isCurrent(href: string, pathname: string) {
  return href === pathname || href + "/" === pathname;
}
