function coverageCount(requestedTypes, listing) {
  return requestedTypes.filter((code) => listing.service_type.includes(code)).length;
}

// A price needs its unit. An hourly listing's real floor is its rate times the
// minimum billable hours, so a budget filter compares against that, not the
// bare rate. Flat listings and hourly listings without a minimum use 1.
function minimumSpend(listing) {
  return listing.price * (listing.minimum_quantity ?? 1);
}

export function matchListings(parsed, listings) {
  const requestedTypes = parsed.service_types ?? [];

  const candidates = listings
    .filter((listing) => listing.listing_status === "active")
    .filter((listing) => parsed.max_price == null || minimumSpend(listing) <= parsed.max_price)
    .filter((listing) => parsed.neighborhood == null || listing.provider_location === parsed.neighborhood)
    // When service types were requested, a listing has to cover at least one of
    // them to be a match at all. With none requested, a price or neighborhood
    // constraint stands on its own and every active listing stays eligible.
    .filter((listing) => requestedTypes.length === 0 || coverageCount(requestedTypes, listing) > 0);

  // Ranking rule: listings covering more of the requested service types rank
  // first; ties fall back to the listing's rating, highest first.
  return [...candidates].sort((a, b) => {
    const coverageDiff = coverageCount(requestedTypes, b) - coverageCount(requestedTypes, a);
    if (coverageDiff !== 0) return coverageDiff;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });
}
