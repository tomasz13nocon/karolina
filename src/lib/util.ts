export const IMAGE_VIEWER_TRANSITION = 300;
export const BLUR_TRANSITION = 300;
export const IMAGE_TRANSITION = 400;
export const CHUNK_SIZE = 10;
export const SWIPE_BOUNCE = 200;

export function toUrl(str: string) {
  return str.toLowerCase().replaceAll(" ", "-");
}

export function isCurrent(href: string, pathname: string) {
  // Astro.url.pathname percent-encodes non-ASCII path segments (URL semantics),
  // whereas hrefs built via toUrl() carry the raw decoded slug. Compare on a
  // decoded basis so non-ASCII titles (e.g. CJK) match their own page instead
  // of failing the exact-string check and never registering as current.
  const decode = (s: string) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  const a = decode(href);
  const b = decode(pathname);
  return a === b || a + "/" === b;
}

export function getDateStr(date: Date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear() % 100}`;
}
