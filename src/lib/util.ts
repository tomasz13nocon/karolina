import { atom } from 'nanostores';

export const IMAGE_VIEWER_TRANSITION = 400;
export const BLUR_TRANSITION = 400;

export const hidingImageViewer = atom(false);

export function hideImageViewer() {
  hidingImageViewer.set(true);
  let imageViewer = document.getElementById("image-viewer") as HTMLElement;
  let blurImgs = document.getElementsByClassName("blur-img") as HTMLCollectionOf<HTMLElement>;

  imageViewer.style.opacity = "0";
  for (let blurImg of blurImgs) {
    blurImg.style.opacity = "0";
  }

  setTimeout(() => {
    imageViewer.classList.add("hidden")
    for (let blurImg of blurImgs) {
      blurImg.classList.add("hidden");
    }
    hidingImageViewer.set(false);
  }, IMAGE_VIEWER_TRANSITION);
}
