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
      clearTimeout(contextTimeout);
      copyright.classList.remove("hidden");
      console.log(e);
      copyright.style.transform = `translate(${e.pageX}px, ${e.pageY}px)`;
      contextTimeout = setTimeout(() => {
        copyright.classList.add("hidden");
      }, 3000);
    };
  }
}
