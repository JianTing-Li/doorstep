// Doorstep shared top bar — one component, every product.
//
// Before this existed each product drew its own "Doorstep" wordmark: three
// different marks, three type sizes, three colours, because all three were
// built independently. This owns the whole top bar instead — wordmark AND
// persona switcher together — so there is exactly one implementation to
// change.
//
// Plain DOM, framework-agnostic: it renders identically inside React 18
// (provider/), React 19 (customer/), and vanilla ES modules (admin/).
//
// Typeface, weight and colour come from shared/tokens.css (--font-display,
// --color-accent, --color-ink), never hardcoded here — so a change to the
// display face in tokens propagates to all four products automatically
// rather than needing four edits.

import { mountSwitcher } from "./switcher.js";

// The house mark: a door with a keyhole. Same 24x24 stroke convention as
// every other icon in the system.
const MARK = `
<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
     stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 21V4.2a1 1 0 0 1 .8-1L17 1.4a1 1 0 0 1 1.2 1V21" />
  <path d="M4 21h16" />
  <circle cx="14.6" cy="12" r="1.05" fill="currentColor" stroke="none" />
</svg>`;

/**
 * @param {HTMLElement} mountEl  container, normally <div id="doorstep-header">
 * @param {object}   options
 * @param {string}   options.label    the product's own subtitle, e.g. "Provider workspace"
 * @param {string}  [options.href]    where the wordmark links. Defaults to
 *   "/" — the root landing page — and should stay that way: these are four
 *   separate builds with full page loads between them, so the wordmark is
 *   the way back out to the doors. Pointing it at a product's own root makes
 *   it reload the current page, which reads as "the logo does nothing".
 */
export function mountHeader(mountEl, { label = "", href = "/" } = {}) {
  if (!mountEl) return;

  mountEl.innerHTML =
    '<header class="ds-header">' +
    `<a class="ds-header-brand" href="${href}">` +
    `<span class="ds-header-mark">${MARK}</span>` +
    '<span class="ds-header-lockup">' +
    '<span class="ds-header-wordmark">Doorstep</span>' +
    (label ? `<span class="ds-header-label">${label}</span>` : "") +
    "</span>" +
    "</a>" +
    '<div class="ds-header-actions"></div>' +
    "</header>";

  mountSwitcher(mountEl.querySelector(".ds-header-actions"), { bare: true });
}

const auto = document.getElementById("doorstep-header");
if (auto) {
  mountHeader(auto, {
    label: auto.dataset.label ?? "",
    href: auto.dataset.href ?? "/",
  });
}
