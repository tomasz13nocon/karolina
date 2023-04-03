import { atom } from "nanostores";

export const IMAGE_VIEWER_TRANSITION = 300;
export const BLUR_TRANSITION = 400;
export const IMAGE_TRANSITION = 400;

export const hidingImageViewer = atom(false);

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

export function hideImageViewer() {
  hidingImageViewer.set(true);
  let imageViewer = document.getElementById("image-viewer") as HTMLElement;
  let blurImgs = document.getElementsByClassName("blur-img") as HTMLCollectionOf<HTMLElement>;

  imageViewer.style.opacity = "0";
  for (let blurImg of blurImgs) {
    blurImg.style.opacity = "0";
  }

  setTimeout(() => {
    imageViewer.classList.add("hidden");
    for (let blurImg of blurImgs) {
      blurImg.classList.add("hidden");
    }
    hidingImageViewer.set(false);
  }, IMAGE_VIEWER_TRANSITION);
}
