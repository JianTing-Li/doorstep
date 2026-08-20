function coverageCount(requestedTypes, listing) {
  return requestedTypes.filter((code) => listing.service_type.includes(code)).length;
}

export function matchListings(parsed, listings) {
  const requestedTypes = parsed.service_types ?? [];

  const candidates = listings
    .filter((listing) => listing.listing_status === "active")
    .filter((listing) => parsed.max_price == null || listing.price <= parsed.max_price)
    .filter((listing) => parsed.neighborhood == null || listing.provider_location === parsed.neighborhood);

  // Ranking rule: listings covering more of the requested service types rank
  // first; ties fall back to the listing's rating, highest first.
  return [...candidates].sort((a, b) => {
    const coverageDiff = coverageCount(requestedTypes, b) - coverageCount(requestedTypes, a);
    if (coverageDiff !== 0) return coverageDiff;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });
}
