import { getProviders, getRawListings } from "./loadData.js";

export function getActiveListings() {
  const providersById = new Map(
    getProviders().map((provider) => [provider.provider_id, provider]),
  );

  return getRawListings()
    .filter((listing) => listing.listing_status === "active")
    .map((listing) => ({
      ...listing,
      provider: providersById.get(listing.provider_id) ?? null,
    }));
}

export function getActiveListingsByServiceType(serviceType) {
  return getActiveListings().filter((listing) =>
    listing.service_type.includes(serviceType),
  );
}
