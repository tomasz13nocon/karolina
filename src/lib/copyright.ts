// relies on `#copyright` in DOM
export function setupCopyright(imgElement?: HTMLImageElement) {
  let copyright = document.getElementById("copyright") as HTMLElement;
  document.addEventListener("click", () => copyright.classList.add("hidden"));

  let imgs = imgElement ? [imgElement] : document.getElementsByTagName("img");

  let contextTimeout: NodeJS.Timeout;
  for (let img of imgs) {
    img.draggable = false;
    img.oncontextmenu = (e) => {
      e.preventDefault();
      // Exhibition list posters opt out of the overlay via data-no-copyright —
      // they already reveal a description scrim on hover/press. We still block
      // the native menu (above) and dragging, just skip showing the box.
      if (img.dataset.noCopyright !== undefined) return;
      clearTimeout(contextTimeout);
      copyright.classList.remove("hidden");

      const margin = 8;
      const { offsetWidth: w, offsetHeight: h } = copyright;
      // Grow toward whichever side has more room: when the pointer is past the
      // horizontal midpoint, anchor the box's right edge to it and grow left.
      let x = e.clientX > window.innerWidth / 2 ? e.clientX - w : e.clientX;
      let y = e.clientY;
      // Clamp fully inside the viewport so the box can never push the page wider.
      x = Math.max(margin, Math.min(x, window.innerWidth - w - margin));
      y = Math.max(margin, Math.min(y, window.innerHeight - h - margin));
      copyright.style.transform = `translate(${x}px, ${y}px)`;

      contextTimeout = setTimeout(() => {
        copyright.classList.add("hidden");
      }, 3000);
    };
  }
}
