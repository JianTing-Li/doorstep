// The palette is selected by a data-theme attribute rather than by a media
// query, so the tokens are declared once per theme instead of duplicated across
// a query and an attribute selector. JS resolves the system preference on first
// load; an explicit choice then overrides it for the session only.
const ATTR = "data-theme";

export function systemTheme() {
  return globalThis.matchMedia?.("(prefers-color-scheme: light)")?.matches ? "light" : "dark";
}

export function applyTheme(theme) {
  document.documentElement.setAttribute(ATTR, theme);
  // Keeps the mobile browser chrome in step with the page.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#cfe6fb" : "#0c1626");
}
