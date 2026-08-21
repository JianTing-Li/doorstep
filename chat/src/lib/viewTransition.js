import { flushSync } from "react-dom";

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
