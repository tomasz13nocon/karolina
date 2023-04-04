import { thumbHashToRGBA } from "thumbhash";

export default function renderBlurhash(hash: string, canvas: HTMLCanvasElement) {
  let b64 = hash;
  let byteArr = Uint8Array.from(window.atob(b64), (c) => c.charCodeAt(0));
  const { rgba: pixels, w, h } = thumbHashToRGBA(byteArr);
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(w, h);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
}
