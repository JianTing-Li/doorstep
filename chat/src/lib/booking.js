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

export function createBooking(listing, slot, request = null) {
  bookingCounter += 1;
  return {
    booking_id: `bkg_local_${String(bookingCounter).padStart(3, "0")}`,
    listing_id: listing.listing_id,
    provider_id: listing.provider_id,
    customer_id: CUSTOMER_ID,
    slot,
    price: listing.price,
    request,
  };
}

// The single writer for booked state. A key already present is terminal: the
// card cannot be booked twice, and the caller gets booking === null so the
// multi-service follow-up cannot fire a second time either.
export function applyBooking(bookings, key, listing, slot, request = null) {
  if (bookings[key]) return { bookings, booking: null };
  const booking = createBooking(listing, slot, request);
  // The listing rides along so list_bookings and cancel_booking can read one
  // source of truth rather than re-deriving it.
  return { bookings: { ...bookings, [key]: { ...booking, listing } }, booking };
}

// Mirrors applyBooking: the single writer for freeing a booked key. A key not
// present is a no-op, so a stale tap or a second cancel cannot re-fire the
// caller's follow-up (re-offering the code a second time).
export function cancelBookingByKey(bookings, key) {
  if (!bookings[key]) return { bookings, cancelled: null };
  const next = { ...bookings };
  const cancelled = next[key];
  delete next[key];
  return { bookings: next, cancelled };
}

// Reschedule only ever replaces the slot on an existing booking — listing,
// provider and price ride along unchanged, and a missing key means there is
// nothing to reschedule.
export function rescheduleBooking(bookings, key, slot) {
  const existing = bookings[key];
  if (!existing) return { bookings, booking: null };
  const booking = { ...existing, slot };
  return { bookings: { ...bookings, [key]: booking }, booking };
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

// Three equal columns leave roughly 100px per slot on a phone, which the single
// line above overflows. Split it so each button holds a short date and a time.
export function formatSlotParts(slot) {
  const at = new Date(slot);
  const timeZone = getMeta().timezone;
  return {
    day: at.toLocaleString("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }),
    time: at.toLocaleString("en-US", { timeZone, hour: "numeric", minute: "2-digit" }),
  };
}

function dateAfter(date, days) {
  const at = new Date(`${date}T12:00:00Z`);
  at.setUTCDate(at.getUTCDate() + days);
  return at.toISOString().slice(0, 10);
}

export function availabilityLabel(listing) {
  const slots = [...bookableSlots(listing)].sort();
  if (slots.length === 0) return "No current openings";

  const first = slots[0];
  const date = first.slice(0, 10);
  const referenceDate = getMeta().reference_date;
  const { day, time } = formatSlotParts(first);
  if (date === referenceDate) return `Available today · ${time}`;
  if (date === dateAfter(referenceDate, 1)) return `Available tomorrow · ${time}`;
  return `Next available ${day} · ${time}`;
}

export function priceLabel(listing) {
  if (listing.price_unit !== "hourly") return `$${listing.price} flat`;
  const minimum = listing.minimum_quantity ?? 1;
  const commitment = minimum > 1 ? ` · ${minimum}-hr min · $${listing.price * minimum} minimum` : "";
  return `$${listing.price}/hr${commitment}`;
}
