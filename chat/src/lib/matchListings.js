function coverageCount(requestedTypes, listing) {
  return requestedTypes.filter((code) => listing.service_type.includes(code)).length;
}

const SEARCH_STOP_WORDS = new Set([
  "about", "after", "again", "also", "around", "because", "been", "before", "could", "does", "doing",
  "from", "have", "help", "house", "into", "just", "like", "need", "needs", "someone", "that", "their",
  "there", "they", "this", "those", "want", "with", "would", "your",
]);

function normalizeWord(word) {
  let normalized = word.toLowerCase();
  if (normalized.length > 5 && normalized.endsWith("ing")) normalized = normalized.slice(0, -3);
  else if (normalized.length > 4 && normalized.endsWith("ed")) normalized = normalized.slice(0, -2);
  else if (normalized.length > 4 && normalized.endsWith("s")) normalized = normalized.slice(0, -1);
  return normalized;
}

function searchableWords(text) {
  return String(text ?? "")
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((word) => word.length >= 3 && !SEARCH_STOP_WORDS.has(word))
    .map((word) => ({ original: word, normalized: normalizeWord(word) })) ?? [];
}

export function listingRelevance(query, listing) {
  const queryWords = searchableWords(query);
  if (queryWords.length === 0) return { score: 0, matchedTerms: [] };

  const titleWords = searchableWords(listing.title).map(({ normalized }) => normalized);
  const descriptionWords = searchableWords(listing.listing_description).map(({ normalized }) => normalized);
  const titleSet = new Set(titleWords);
  const descriptionSet = new Set(descriptionWords);
  const matchedTerms = [];
  let score = 0;

  for (const [index, { original, normalized }] of queryWords.entries()) {
    const earlyDetailBonus = Math.max(0, 3 - index);
    if (titleSet.has(normalized)) {
      score += 5 + earlyDetailBonus;
      matchedTerms.push(original);
    } else if (descriptionSet.has(normalized)) {
      score += 2 + earlyDetailBonus;
      matchedTerms.push(original);
    }
  }

  const normalizedQuery = queryWords.map(({ normalized }) => normalized);
  const normalizedTitle = titleWords.join(" ");
  const normalizedDescription = descriptionWords.join(" ");
  if (normalizedQuery[0] && titleSet.has(normalizedQuery[0])) score += 3;
  for (let index = 0; index < normalizedQuery.length - 1; index += 1) {
    const phrase = `${normalizedQuery[index]} ${normalizedQuery[index + 1]}`;
    if (normalizedTitle.includes(phrase)) score += 8;
    else if (normalizedDescription.includes(phrase)) score += 4;
  }

  const plainQuery = String(query).toLowerCase();
  const listingText = `${listing.title} ${listing.listing_description}`.toLowerCase();
  if (/\b(stopped working|dead|lost power|not working)\b/.test(plainQuery) && /\b(dead circuit|trace|tracing|breaker)\b/.test(listingText)) {
    score += 12;
    matchedTerms.push("circuit problem");
  }

  return { score, matchedTerms: [...new Set(matchedTerms)] };
}

function addDays(date, days) {
  const at = new Date(`${date}T12:00:00Z`);
  at.setUTCDate(at.getUTCDate() + days);
  return at.toISOString().slice(0, 10);
}

function slotMatchesUrgency(slot, urgency, referenceDate) {
  if (!urgency || !referenceDate) return true;
  const date = slot.slice(0, 10);
  if (urgency === "today") return date === referenceDate;
  if (urgency === "tomorrow") return date === addDays(referenceDate, 1);
  if (urgency === "urgent") return date >= referenceDate && date <= addDays(referenceDate, 1);
  if (urgency === "this_week") return date >= referenceDate && date <= addDays(referenceDate, 7);
  return true;
}

function hasCompatibleSlot(listing, urgency, referenceDate) {
  return (listing.availability ?? []).some((slot) => slotMatchesUrgency(slot, urgency, referenceDate));
}

function distanceMiles(from, to) {
  const radius = 3958.8;
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const lat = radians(to.latitude - from.latitude);
  const lon = radians(to.longitude - from.longitude);
  const a = Math.sin(lat / 2) ** 2 +
    Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(lon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function listingDistanceFromNeighborhood(listing, neighborhoodName, neighborhoods = []) {
  if (!neighborhoodName) return null;
  const neighborhood = neighborhoods.find(({ name }) => name === neighborhoodName);
  if (!neighborhood || listing.latitude == null || listing.longitude == null) return null;
  return distanceMiles(neighborhood, listing);
}

function servesNeighborhood(listing, neighborhoodName, neighborhoods) {
  if (!neighborhoodName) return true;
  const distance = listingDistanceFromNeighborhood(listing, neighborhoodName, neighborhoods);
  if (distance == null) return listing.provider_location === neighborhoodName;
  return distance <= listing.service_radius_miles;
}

// A price needs its unit. An hourly listing's real floor is its rate times the
// minimum billable hours, so a budget filter compares against that, not the
// bare rate. Flat listings and hourly listings without a minimum use 1.
function minimumSpend(listing) {
  return listing.price * (listing.minimum_quantity ?? 1);
}

export function matchListings(parsed, listings, options = {}) {
  const requestedTypes = parsed.service_types ?? [];
  const { query = "", referenceDate = null, neighborhoods = [] } = options;

  const candidates = listings
    .filter((listing) => listing.listing_status === "active")
    .filter((listing) => parsed.max_price == null || minimumSpend(listing) <= parsed.max_price)
    .filter((listing) => servesNeighborhood(listing, parsed.neighborhood, neighborhoods))
    .filter((listing) => hasCompatibleSlot(listing, parsed.urgency, referenceDate))
    // When service types were requested, a listing has to cover at least one of
    // them to be a match at all. With none requested, a price or neighborhood
    // constraint stands on its own and every active listing stays eligible.
    .filter((listing) => requestedTypes.length === 0 || coverageCount(requestedTypes, listing) > 0);

  // Category coverage keeps multi-service bundles first. Within that scope,
  // the customer's actual wording distinguishes a drain from a faucet or a
  // lawn mow from a gutter clean before rating breaks the remaining tie.
  return [...candidates].sort((a, b) => {
    const coverageDiff = coverageCount(requestedTypes, b) - coverageCount(requestedTypes, a);
    if (coverageDiff !== 0) return coverageDiff;
    const relevanceDiff = listingRelevance(query, b).score - listingRelevance(query, a).score;
    if (relevanceDiff !== 0) return relevanceDiff;
    if (parsed.neighborhood) {
      const aDistance = listingDistanceFromNeighborhood(a, parsed.neighborhood, neighborhoods) ?? Number.POSITIVE_INFINITY;
      const bDistance = listingDistanceFromNeighborhood(b, parsed.neighborhood, neighborhoods) ?? Number.POSITIVE_INFINITY;
      if (aDistance !== bDistance) return aDistance - bDistance;
    }
    return (b.rating ?? 0) - (a.rating ?? 0);
  });
}
