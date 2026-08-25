import { flushSync } from "react-dom";

// Mirrors --duration-collapse in styles.css.
const COLLAPSE_MS = 220;

// Grid reflow cannot be animated with CSS — when a card expands to span the row,
// its siblings jump to new cells. The View Transitions API is the only way to
// tween that, so state changes that reshape the grid run inside one.
//
// flushSync is required: startViewTransition snapshots the DOM before and after
// its callback, so React has to commit synchronously inside it.
export function withGridTransition(update) {
  const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  if (reduced || typeof document === "undefined" || !document.startViewTransition) {
    update();
    return;
  }

  document.startViewTransition(() => flushSync(update));
}

// Cards need a stable, CSS-ident-safe name so the browser can match the same
// card across the two snapshots and morph it rather than cross-fading.
export function transitionNameFor(key) {
  return `card-${key.replace(/[^a-zA-Z0-9]/g, "-")}`;
}

// An expanding card at the bottom of the thread grows underneath the floating
// composer. Scroll only as far as needed to clear it — never more, so the
// reader is not thrown somewhere else.
export function revealExpandedCard(key) {
  if (typeof document === "undefined") return;
  const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // The card keeps growing for the length of the collapse transition, so its
  // final height is only knowable once that has finished.
  setTimeout(() => {
    const card = document.querySelector(`[style*="${transitionNameFor(key)}"]`);
    const thread = document.querySelector(".chat-thread");
    const composer = document.querySelector(".composer");
    if (!card || !thread || !composer) return;

    const cardBottom = card.getBoundingClientRect().bottom;
    const composerTop = composer.getBoundingClientRect().top;
    const overlap = cardBottom - composerTop;
    if (overlap <= 0) return;

    thread.scrollBy({ top: overlap + 16, behavior: reduced ? "auto" : "smooth" });
  }, COLLAPSE_MS + 40);
}
