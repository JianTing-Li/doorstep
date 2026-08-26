// Browse filter/sort logic, extracted from Abheeshu's inline getFeedHTML().
// Same categories, same fields, same sort keys — this is a straight
// extraction, not a redesign.

export const CATEGORY_MAP = {
  Cleaning: ["cleaning_standard", "cleaning_deep"],
  Handyman: ["handyman_general", "plumbing", "electrical"],
  Moving: ["moving_help", "junk_removal"],
  "Yard & Outdoor": ["yard_outdoor"],
};

export const CATEGORIES = ["All", "Cleaning", "Handyman", "Moving", "Yard & Outdoor"];

export const CATEGORY_ICON = {
  Cleaning: "broom",
  Handyman: "hammer",
  Moving: "box",
  "Yard & Outdoor": "seedling",
};

export const DEFAULT_FILTERS = {
  category: "All",
  searchQuery: "",
  // The slider's top label is "$250+": at the top, price is unconstrained.
  maxPrice: 250,
  minRating: 0,
  sortBy: "recommended",
};

export function activeListings(listings) {
  return listings.filter((l) => l.listing_status === "active");
}

export function countInCategory(listings, category) {
  const codes = CATEGORY_MAP[category] || [];
  return listings.filter((l) => l.service_type.some((c) => codes.includes(c))).length;
}

export function applyFilters(listings, filters, providersById) {
  let result = listings;

  if (filters.category && filters.category !== "All") {
    const allowed = CATEGORY_MAP[filters.category] || [];
    result = result.filter((l) => l.service_type.some((t) => allowed.includes(t)));
  }

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter((l) => {
      const provider = providersById.get(l.provider_id) || {};
      return (l.title || "").toLowerCase().includes(q) ||
        (l.listing_description || "").toLowerCase().includes(q) ||
        (provider.name || "").toLowerCase().includes(q) ||
        (provider.bio || "").toLowerCase().includes(q) ||
        (l.provider_location || "").toLowerCase().includes(q);
    });
  }

  if (filters.maxPrice < DEFAULT_FILTERS.maxPrice) {
    result = result.filter((l) => (l.price || 0) <= filters.maxPrice);
  }

  if (filters.minRating > 0) {
    result = result.filter((l) => l.rating != null && l.rating >= filters.minRating);
  }

  result = [...result];
  if (filters.sortBy === "rating-desc") {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (filters.sortBy === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === "reviews-desc") {
    result.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
  }

  return result;
}

// Dashboard search branching, restored now that Ask has real matching logic
// (Phase 6) — the destination his original branch needed didn't exist until
// then. One search bar handles both a short keyword ("plumbing") and a full
// job description ("my kitchen faucet won't stop dripping"): short input
// filters the catalogue by category, the same way it always has; anything
// long enough to actually describe a job routes into Ask, where parseJob can
// do something with it. Word count is a coarse proxy for "sentence-shaped,"
// but a reliable one here — every example prompt in the catalogue runs 8+
// words, and every category/keyword search in practice is 1-3.
const SENTENCE_WORD_THRESHOLD = 4;

export function dashboardSearchDestination(query) {
  const wordCount = String(query ?? "").trim().split(/\s+/).filter(Boolean).length;
  return wordCount >= SENTENCE_WORD_THRESHOLD ? "ask" : "browse";
}
