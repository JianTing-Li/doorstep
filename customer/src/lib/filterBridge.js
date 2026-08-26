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
 * Rather than force one onto the other, the canonical hand-off shape is
 * Ask's — it is strictly more expressive (N codes, not one category; carries
 * neighborhood and urgency) — and this module converts in both directions.
 *
 *   toAskFilters(browseFilters)   Browse -> Ask   ("describe it instead")
 *   toBrowseFilters(askFilters)   Ask -> Browse   ("see more like this")
 *
 * Lossiness is real and deliberate, in one direction only:
 *
 *   - Browse -> Ask keeps everything meaningful. `sortBy` and `minRating`
 *     have no Ask equivalent, but Ask ranks by relevance anyway, so dropping
 *     them loses nothing the customer asked for.
 *   - Ask -> Browse cannot keep `neighborhood` or `urgency` (Browse has no
 *     control for either) and collapses N service codes to the single category
 *     containing the first one. `searchQuery` carries the original sentence so
 *     the text is not silently lost, and Browse's own text search runs over
 *     title/description/provider/bio/location.
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

/** Ask -> Browse. Used by "See more like this."
 *
 * Deliberately does not carry the raw sentence into Browse's search box:
 * that field does keyword/title matching, not natural-language parsing, so
 * "Looking for someone to come every other week and clean my one bedroom"
 * matches nothing there even though Ask just found 6 providers for it
 * seconds earlier — a full sentence in a keyword box reads as broken, not
 * as "0 results, try different words." The category filter alone (already
 * derived from the same service_types Ask matched on) finds the same
 * providers without that trap. Keyword extraction from the sentence was
 * considered and skipped — not worth the complexity for what it buys here.
 */
export function toBrowseFilters(askFilters) {
  const firstCode = (askFilters.service_types ?? [])[0];
  let category = "All";
  if (firstCode) {
    for (const [name, codes] of Object.entries(CATEGORY_MAP)) {
      if (codes.includes(firstCode)) { category = name; break; }
    }
  }

  return {
    ...DEFAULT_FILTERS,
    category,
    searchQuery: "",
    maxPrice: askFilters.max_price ?? DEFAULT_MAX_PRICE,
  };
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
