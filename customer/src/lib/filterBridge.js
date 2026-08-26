import { CATEGORY_MAP, DEFAULT_FILTERS } from "./filters.js";

/**
 * The shared filter state shape (Phase 6).
 *
 * Browse and Ask describe a search differently, and neither shape is wrong for
 * its own screen:
 *
 *   Browse  { category, searchQuery, maxPrice, minRating, sortBy }
 *           — one human-facing category, a price ceiling, a sort order
 *
 *   Ask     { service_types[], max_price, neighborhood, urgency }
 *           — N canonical service codes parsed out of a sentence, plus
 *             constraints Browse has no control for
 *
 * Browse -> Ask is the direction this module actually converts:
 * seedPromptFromBrowse(browseFilters) turns a Browse search into an opening
 * sentence for Ask ("Can't find it? Describe it instead"). It keeps
 * everything meaningful — `sortBy` and `minRating` have no Ask equivalent,
 * but Ask ranks by relevance anyway, so dropping them loses nothing the
 * customer asked for.
 *
 * The reverse direction ("See more like this," Ask -> Browse) was removed:
 * collapsing N service codes to Browse's single category is inherently lossy
 * (no `neighborhood`/`urgency` control there either), and passing the raw
 * sentence into Browse's keyword search box matched nothing even when Ask
 * had just found real results for the same text.
 */

const DEFAULT_MAX_PRICE = DEFAULT_FILTERS.maxPrice;

/** Browse -> Ask. Used by "Can't find it? Describe it instead." */
export function toAskFilters(browseFilters) {
  const codes = browseFilters.category && browseFilters.category !== "All"
    ? [...(CATEGORY_MAP[browseFilters.category] ?? [])]
    : [];

  return {
    service_types: codes,
    // Only carry a ceiling the customer actually moved off the default —
    // otherwise Ask would open every conversation already constrained.
    max_price: browseFilters.maxPrice < DEFAULT_MAX_PRICE ? browseFilters.maxPrice : null,
    neighborhood: null,
    urgency: null,
  };
}

/**
 * The sentence Ask should open with when arriving from Browse, so the customer
 * lands mid-conversation rather than at a blank prompt.
 */
export function seedPromptFromBrowse(browseFilters) {
  const parts = [];
  if (browseFilters.searchQuery) parts.push(browseFilters.searchQuery);
  else if (browseFilters.category && browseFilters.category !== "All") {
    parts.push(`I need help with ${browseFilters.category.toLowerCase()}`);
  }
  if (browseFilters.maxPrice < DEFAULT_MAX_PRICE) parts.push(`under $${browseFilters.maxPrice}`);
  return parts.join(" ").trim();
}

/** True when Browse has enough set that offering the Ask hand-off makes sense. */
export function browseHasActiveFilters(browseFilters) {
  return Boolean(
    (browseFilters.category && browseFilters.category !== "All") ||
    browseFilters.searchQuery ||
    browseFilters.maxPrice < DEFAULT_MAX_PRICE ||
    browseFilters.minRating > 0,
  );
}
