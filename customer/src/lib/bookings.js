import { getMeta } from "../data/loadData.js";
import { createCanonicalBooking } from "../data/loadData.js";

// This app's own display shape for a booking, unchanged from Abheeshu's
// original — every screen that renders a booking (Checkout, Confirmation,
// Bookings, the persona-seeded demo data) reads this shape.
export function buildDisplayBooking({ listing, provider, timeSlot, address, total }) {
  return {
    id: "BK-" + Math.floor(10000 + Math.random() * 90000),
    listing_id: listing.listing_id,
    provider_id: provider.provider_id,
    title: listing.title,
    provider_name: provider.name,
    timeSlot,
    address,
    total,
    status: "upcoming",
    escrowStatus: "held",
    rating: null,
    review: null,
  };
}

// Mirrors a display booking into the shared store's canonical shape, so
// Provider and Admin see it too (Phase 3). commission_rate comes from
// _meta.json rather than being re-hardcoded here.
export function recordCanonicalBooking(displayBooking, customerId) {
  const rate = getMeta().commission_rate ?? 0.15;
  const total = Number(displayBooking.total) || 0;
  const base = Number((total / (1 + rate)).toFixed(2));

  return createCanonicalBooking({
    booking_id: displayBooking.id,
    listing_id: displayBooking.listing_id,
    customer_id: customerId,
    provider_id: displayBooking.provider_id,
    scheduled_slot: displayBooking.timeSlot,
    created_at: new Date().toISOString(),
    price_paid: base,
    quantity: 1,
    quantity_unit: "job",
    commission_amount: Number((total - base).toFixed(2)),
    status: "confirmed",
    job_address: displayBooking.address,
    source: "customer_app",
  });
}
