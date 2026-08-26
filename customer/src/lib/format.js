// Presentation helpers, extracted from Abheeshu's inline formatting so every
// screen formats the same way. Behavior matches his original exactly.

import { getMeta } from "../data/loadData.js";

export function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

// Escrow is consistently the quoted price plus the platform's commission —
// intentional math, but nothing at the point of display ever says so, which
// reads as an unexplained increase between the quote and what's actually
// held. Booking objects created via buildDisplayBooking (lib/bookings.js)
// already carry pricePaid/commissionAmount; the seeded demo bookings in
// usePersonaState.js predate that and only have the final total, so this
// derives the same split from it when the explicit fields aren't there,
// using the same commission_rate everything else reads from _meta.json.
export function escrowBreakdown(booking) {
  const rate = getMeta().commission_rate ?? 0.15;
  const hasExplicitSplit = typeof booking.pricePaid === "number" && typeof booking.commissionAmount === "number";
  const pricePaid = hasExplicitSplit ? booking.pricePaid : Number((booking.total / (1 + rate)).toFixed(2));
  const commissionAmount = hasExplicitSplit ? booking.commissionAmount : Number((booking.total - pricePaid).toFixed(2));
  return { pricePaid, commissionAmount, total: booking.total, ratePercent: Math.round(rate * 100) };
}

export function priceLabel(listing) {
  const unit = listing.price_unit === "hourly" ? "/hr" : " flat";
  return `$${listing.price}${unit}`;
}

export function ratingLabel(value) {
  return value == null ? "New" : value.toFixed(1);
}

export function referenceTimestamp(hour = "12", minute = "00") {
  return `${getMeta().reference_date}T${hour}:${minute}:00-07:00`;
}

export function referenceSlots() {
  const at = new Date(`${getMeta().reference_date}T12:00:00Z`);
  return [1, 2, 3].map((days) => {
    const slot = new Date(at);
    slot.setUTCDate(slot.getUTCDate() + days);
    return `${slot.toISOString().slice(0, 10)}T10:00:00-07:00`;
  });
}

// Slots carry their own UTC offset (e.g. "...T15:00:00-07:00"), so the
// underlying Date instant is always correct regardless of the viewer's
// machine — but every toLocale*() call below was missing timeZone, which
// falls back to the VIEWER's local zone rather than the marketplace's.
// That's invisible testing from Portland (viewer zone == data zone) and a
// consistent, real offset for anyone elsewhere: a 3pm Pacific slot renders
// as 6pm for a viewer set to Eastern. lib/booking.js's formatSlot already
// pins timeZone; these match it now so nothing here can drift from it again.

export function formatSlotShort(dateStr) {
  const d = new Date(dateStr);
  const timeZone = getMeta().timezone;
  return {
    dayName: d.toLocaleDateString("en-US", { timeZone, weekday: "short" }),
    dayNum: Number(d.toLocaleDateString("en-US", { timeZone, day: "numeric" })),
    time: d.toLocaleTimeString("en-US", { timeZone, hour: "numeric", minute: "2-digit" }),
  };
}

export function formatSlotLong(dateStr) {
  const d = new Date(dateStr);
  const timeZone = getMeta().timezone;
  return d.toLocaleDateString("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }) +
    ", " + d.toLocaleTimeString("en-US", { timeZone, hour: "numeric", minute: "2-digit" });
}

export function formatSlotFull(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    timeZone: getMeta().timezone,
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    timeZone: getMeta().timezone,
    weekday: "short", month: "short", day: "numeric",
  });
}

export function initial(name) {
  return name ? name.charAt(0).toUpperCase() : "P";
}
