export const IMAGE_VIEWER_TRANSITION = 300;
export const BLUR_TRANSITION = 300;
export const IMAGE_TRANSITION = 400;
export const CHUNK_SIZE = 10;
export const SWIPE_BOUNCE = 200;

export function toUrl(str: string) {
  return encodeURIComponent(str.toLowerCase().replaceAll(" ", "-"));
}

export function isCurrent(href: string, pathname: string) {
  return href === pathname || href + "/" === pathname;
}

export function getDateStr(date: Date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear() % 100}`;
}
