import { getListings, getMeta } from "./loadData.js";

// Selectors over the loaded mock data.
export function activeListings() {
  const referenceDate = getMeta().reference_date;

  return getListings()
    .filter((listing) => listing.listing_status === "active")
    .map((listing) => ({
      ...listing,
      availability: listing.availability.filter((slot) => slot.slice(0, 10) >= referenceDate),
    }));
}
