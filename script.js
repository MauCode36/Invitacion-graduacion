const pages = [...document.querySelectorAll(".page")];
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
const status = document.querySelector("#page-status");
const book = document.querySelector("#book");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let currentPage = 0;
let pageTransition = null;

function setCurrentPage(index) {
  const scrollToPage = index !== currentPage && book.getBoundingClientRect().top < 0;
  pages[currentPage].hidden = true;
  currentPage = index;
  pages[currentPage].hidden = false;
  book.classList.toggle("is-interior", pages[currentPage].classList.contains("interior"));
  previousButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === pages.length - 1;
  status.textContent = `${pages[currentPage].getAttribute("aria-label")} · ${currentPage + 1} de ${pages.length}`;

  // Si el control enfocado queda deshabilitado, mantener el foco en la navegación.
  if (document.activeElement === nextButton && nextButton.disabled) previousButton.focus();
  else if (document.activeElement === previousButton && previousButton.disabled) nextButton.focus();

  // Tras un mosaico largo, empezar la siguiente página por arriba, no por el final.
  if (scrollToPage) {
    book.scrollIntoView({ block: "start", behavior: "instant" });
  }
}

function finishPageTransition() {
  if (!pageTransition) return;
  const { animations, cover, layer } = pageTransition;
  pageTransition = null;
  for (const animation of animations) animation.cancel();
  cover?.classList.remove("cover-turning");
  layer.remove();
  book.classList.remove("page-turning", "paper-turning");
}

function copyPage(page, height) {
  const copy = page.cloneNode(true);
  copy.hidden = false;
  copy.removeAttribute("id");
  for (const element of copy.querySelectorAll("[id]")) element.removeAttribute("id");
  copy.style.height = `${height}px`;
  copy.style.minHeight = "0";
  return copy;
}

function animatePaperTurn(layer, page, height, forward, animations) {
  layer.classList.add("paper-turn");
  book.classList.add("paper-turning");
  const shadow = document.createElement("div");
  shadow.className = "paper-turn-shadow";
  const leaf = document.createElement("div");
  leaf.className = "turning-leaf";
  leaf.style.height = `${height}px`;
  const width = layer.clientWidth;
  leaf.style.setProperty("--leaf-width", `${width}px`);
  const cuts = [0, 0.28, 0.45, 0.61, 0.76, 0.89, 1].map(fraction => Math.round(fraction * width));
  const panels = [];
  let parent = leaf;

  // Cada tramo sigue al anterior y muestra su parte del mismo contenido.
  for (let index = 0; index < cuts.length - 1; index++) {
    const panel = document.createElement("div");
    panel.className = "leaf-panel";
    panel.style.width = `${cuts[index + 1] - cuts[index]}px`;
    panel.style.setProperty("--leaf-offset", `${-cuts[index]}px`);
    const front = document.createElement("div");
    front.className = "leaf-front";
    front.append(copyPage(page, height));
    const back = document.createElement("div");
    back.className = "leaf-back";
    panel.append(front, back);
    parent.append(panel);
    parent = panel;
    panels.push(panel);
  }

  layer.append(shadow, leaf);
  const timing = {
    duration: 620,
    easing: "cubic-bezier(.45, .03, .32, 1)",
    direction: forward ? "normal" : "reverse",
    fill: "both",
  };
  animations.push(leaf.animate([
    { transform: "rotateY(0deg)" },
    { transform: "rotateY(-174deg)" },
  ], timing));
  for (const [index, panel] of panels.slice(1).entries()) {
    const bend = 8 + index * 3;
    animations.push(panel.animate([
      { transform: "rotateY(0deg)" },
      { transform: `rotateY(${-bend}deg)`, offset: 0.46 - index * 0.04 },
      { transform: `rotateY(${-bend / 3}deg)`, offset: 0.68 },
      { transform: "rotateY(0deg)" },
    ], timing));
  }
  animations.push(shadow.animate([
    { opacity: 0 },
    { opacity: 0.72, offset: 0.52 },
    { opacity: 0 },
  ], timing));
  for (const back of leaf.querySelectorAll(".leaf-back")) {
    animations.push(back.animate([
      { opacity: 1 },
      { opacity: 1, offset: 0.72 },
      { opacity: 0 },
    ], timing));
  }
}

function showPage(index) {
  if (pageTransition || index < 0 || index >= pages.length || index === currentPage) return;
  if (reducedMotion.matches || typeof book.animate !== "function") {
    setCurrentPage(index);
    return;
  }

  const outgoing = pages[currentPage];
  const incoming = pages[index];
  const outgoingHeight = outgoing.offsetHeight;
  const opening = currentPage === 0;
  const closing = index === 0;
  const forward = index > currentPage;
  const layer = document.createElement("div");
  layer.className = "page-transition";
  layer.setAttribute("aria-hidden", "true");
  layer.inert = true;

  // Al retroceder, la hoja nueva cae sobre la página que se estaba leyendo.
  const outgoingCopy = opening || !forward ? copyPage(outgoing, outgoingHeight) : null;
  if (outgoingCopy) layer.append(outgoingCopy);
  book.append(layer);

  const cover = opening ? outgoingCopy : closing ? incoming : null;
  const animations = [];
  const transition = { animations, cover, layer };
  pageTransition = transition;
  book.classList.add("page-turning");
  setCurrentPage(index);

  try {
    if (cover) {
      cover.classList.add("cover-turning");
      const timing = {
        duration: 560,
        easing: "cubic-bezier(.42, 0, .25, 1)",
        direction: opening ? "normal" : "reverse",
        fill: "both",
      };
      animations.push(cover.querySelector(".cover-flap").animate([
        { transform: "rotateY(0deg)" },
        { transform: "rotateY(-95deg)" },
      ], timing));
      animations.push(cover.querySelector(".cover-main").animate([
        { clipPath: "inset(0 0 0 0)" },
        { clipPath: "inset(0 0 0 0)", offset: 0.45 },
        { clipPath: "inset(0 100% 0 0)" },
      ], timing));
    } else {
      const leafPage = forward ? outgoing : incoming;
      const leafHeight = forward ? outgoingHeight : incoming.offsetHeight;
      animatePaperTurn(layer, leafPage, leafHeight, forward, animations);
    }
  } catch {
    for (const animation of animations) animation.finished.catch(() => {});
    finishPageTransition();
    return;
  }

  function finishIfCurrent() {
    if (pageTransition === transition) finishPageTransition();
  }
  Promise.all(animations.map(animation => animation.finished)).then(finishIfCurrent, finishIfCurrent);
}

window.addEventListener("resize", finishPageTransition);
reducedMotion.addEventListener?.("change", finishPageTransition);

previousButton.addEventListener("click", () => showPage(currentPage - 1));
nextButton.addEventListener("click", () => showPage(currentPage + 1));
document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]")) return;
  if (event.key === "ArrowRight") { event.preventDefault(); showPage(currentPage + 1); }
  if (event.key === "ArrowLeft") { event.preventDefault(); showPage(currentPage - 1); }
});

let touchStart = null;
book.addEventListener("touchstart", (event) => {
  if (event.touches.length !== 1) { touchStart = null; return; }
  touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
book.addEventListener("touchcancel", () => { touchStart = null; });
book.addEventListener("touchend", (event) => {
  if (!touchStart || event.touches.length) { touchStart = null; return; }
  const deltaX = event.changedTouches[0].clientX - touchStart.x;
  const deltaY = event.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
    showPage(currentPage + (deltaX < 0 ? 1 : -1));
  }
}, { passive: true });
setCurrentPage(0);
