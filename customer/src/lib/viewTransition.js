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
    const composer = document.querySelector(".composer");
    if (!card || !composer) return;

    const cardBottom = card.getBoundingClientRect().bottom;
    const composerTop = composer.getBoundingClientRect().top;
    const overlap = cardBottom - composerTop;
    if (overlap <= 0) return;

    // This was `.chat-thread`'s own scrollBy, from when Product C was a
    // standalone app and .chat-thread was itself the scroll container. Since
    // it was folded into the Customer app as a tab (Phase 6), the WHOLE page
    // scrolls as one document and .chat-thread no longer overflows its own
    // box — its scrollBy became a silent no-op, so an expanded card's "Choose
    // a time" button (or a newly revealed slot list) could land directly
    // under the fixed composer with nothing correcting it until the person
    // scrolled the actual page themselves. window is the real scroll surface
    // now, so this nudges that instead.
    window.scrollBy({ top: overlap + 16, behavior: reduced ? "auto" : "smooth" });
  }, COLLAPSE_MS + 40);
}
