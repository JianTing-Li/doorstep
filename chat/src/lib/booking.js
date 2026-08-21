import { getMeta } from "../data/loadData.js";

// There is no auth in this dataset (see mock-data/README.md), so the customer
// is a fixture. Bookings live in conversation state and are never persisted.
const CUSTOMER_ID = "cst_001";

export function remainingCodes(requested, covered) {
  const done = new Set(covered);
  return requested.filter((code) => !done.has(code));
}

// A bundle is one active listing that covers every code still outstanding, so
// the customer can settle the whole job in a single booking.
export function findBundle(remaining, listings) {
  if (remaining.length < 2) return null;
  return listings.find((listing) => remaining.every((code) => listing.service_type.includes(code))) ?? null;
}

// Slots are already filtered to on-or-after the reference date by
// activeListings(); repeated here so a listing from any source is safe to book.
export function bookableSlots(listing) {
  const referenceDate = getMeta().reference_date;
  return (listing.availability ?? []).filter((slot) => slot.slice(0, 10) >= referenceDate);
}

let bookingCounter = 0;

export function createBooking(listing, slot) {
  bookingCounter += 1;
  return {
    booking_id: `bkg_local_${String(bookingCounter).padStart(3, "0")}`,
    listing_id: listing.listing_id,
    provider_id: listing.provider_id,
    customer_id: CUSTOMER_ID,
    slot,
    price: listing.price,
  };
}

// Slots carry their own UTC offset, so parsing them is safe — unlike the
// date-only reference_date, which must stay a string.
export function formatSlot(slot) {
  return new Date(slot).toLocaleString("en-US", {
    timeZone: getMeta().timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function priceLabel(listing) {
  return listing.price_unit === "hourly" ? `$${listing.price}/hr` : `$${listing.price} flat`;
}
