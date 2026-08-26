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

// Matches the CSS fallback's own transition length (index.css .page-fade-*).
const PAGE_FADE_MS = 160;

// Top-level page swap (Browse/Ask/Bookings/Profile) — previously an instant
// DOM replacement with no transition at all, which reads as the page
// flashing rather than navigating. View Transitions API gives a crossfade
// for free (its default root animation, no per-element setup needed); where
// it isn't supported, .page-fade-out/-in step through the same shape by
// hand: fade the outgoing content down, swap during the gap, fade the new
// content up. Either path is skipped for prefers-reduced-motion.
export function withPageTransition(update) {
  const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduced || typeof document === "undefined") {
    update();
    return;
  }

  if (document.startViewTransition) {
    document.startViewTransition(() => flushSync(update));
    return;
  }

  const root = document.querySelector(".app-main");
  if (!root) {
    update();
    return;
  }
  // One class, toggled twice: adding it transitions the outgoing page out;
  // swapping content while still hidden; removing it (still on the far side
  // of the swap) transitions the new page in over the same duration.
  root.classList.add("page-fade-hidden");
  setTimeout(() => {
    flushSync(update);
    root.classList.remove("page-fade-hidden");
  }, PAGE_FADE_MS);
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
