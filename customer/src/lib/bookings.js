import { getMeta } from "../data/loadData.js";
import {
  createCanonicalBooking,
  createCanonicalReview,
  getListings,
  patchCanonicalBooking,
  patchCanonicalListing,
  patchCanonicalProvider,
  getReviews,
} from "../data/loadData.js";

function referenceTimestamp(time = "12:00:00", offset = "-07:00") {
  return `${getMeta().reference_date}T${time}${offset}`;
}

function slotOffset(slot) {
  return slot?.match(/([+-]\d\d:\d\d|Z)$/)?.[1] ?? "-07:00";
}

// This app's own display shape for a booking, unchanged from Abheeshu's
// original — every screen that renders a booking (Checkout, Confirmation,
// Bookings, the persona-seeded demo data) reads this shape.
export function buildDisplayBooking({ listing, provider, timeSlot, address, quantity = 1 }) {
  const resolvedQuantity = listing.price_unit === "hourly"
    ? Math.max(quantity, listing.minimum_quantity ?? 1)
    : 1;
  const pricePaid = listing.price * resolvedQuantity;
  const commissionAmount = Number((pricePaid * (getMeta().commission_rate ?? 0.15)).toFixed(2));

  return {
    id: "BK-" + Math.floor(10000 + Math.random() * 90000),
    listing_id: listing.listing_id,
    provider_id: provider.provider_id,
    title: listing.title,
    provider_name: provider.name,
    timeSlot,
    address,
    total: Number((pricePaid + commissionAmount).toFixed(2)),
    quantity: resolvedQuantity,
    quantityUnit: listing.price_unit === "hourly" ? "hours" : "job",
    pricePaid,
    commissionAmount,
    status: "upcoming",
    escrowStatus: "held",
    rating: null,
    review: null,
    canonical: true,
  };
}

// Mirrors a display booking into the shared store's canonical shape, so
// Provider and Admin see it too (Phase 3). commission_rate comes from
// _meta.json rather than being re-hardcoded here.
export function recordCanonicalBooking(displayBooking, customerId) {
  return createCanonicalBooking({
    booking_id: displayBooking.id,
    listing_id: displayBooking.listing_id,
    customer_id: customerId,
    provider_id: displayBooking.provider_id,
    scheduled_slot: displayBooking.timeSlot,
    created_at: referenceTimestamp("12:00:00", slotOffset(displayBooking.timeSlot)),
    price_paid: displayBooking.pricePaid,
    quantity: displayBooking.quantity,
    quantity_unit: displayBooking.quantityUnit,
    commission_amount: displayBooking.commissionAmount,
    status: "confirmed",
    job_address: displayBooking.address,
    source: "customer_app",
  });
}

export function cancelCanonicalBooking(displayBooking) {
  if (!displayBooking?.canonical) return;
  patchCanonicalBooking(displayBooking.id, { status: "cancelled" });
}

export function rescheduleCanonicalBooking(displayBooking, scheduledSlot) {
  if (!displayBooking?.canonical) return;
  patchCanonicalBooking(displayBooking.id, { scheduled_slot: scheduledSlot });
}

export function completeCanonicalBooking(displayBooking) {
  if (!displayBooking?.canonical) return;
  patchCanonicalBooking(displayBooking.id, { status: "completed" });
}

let reviewCounter = 0;

export function recordCanonicalReview(displayBooking, customerId, rating, text) {
  if (!displayBooking?.canonical) return null;
  reviewCounter += 1;
  const scheduled = Date.parse(displayBooking.timeSlot);
  const createdAt = Number.isFinite(scheduled)
    ? new Date(scheduled + 60 * 60 * 1000).toISOString()
    : referenceTimestamp("18:00:00");
  const review = createCanonicalReview({
    review_id: `rev_local_${String(reviewCounter).padStart(3, "0")}`,
    booking_id: displayBooking.id,
    listing_id: displayBooking.listing_id,
    customer_id: customerId,
    rating,
    text,
    created_at: createdAt,
  });

  const reviews = getReviews();
  const listingReviews = reviews.filter((item) => item.listing_id === displayBooking.listing_id);
  const listingRating = Number(
    (listingReviews.reduce((sum, item) => sum + item.rating, 0) / listingReviews.length).toFixed(2),
  );
  patchCanonicalListing(displayBooking.listing_id, {
    review_count: listingReviews.length,
    rating: listingRating,
  });

  const providerListingIds = new Set(
    getListings()
      .filter((listing) => listing.provider_id === displayBooking.provider_id)
      .map((listing) => listing.listing_id),
  );
  const providerReviews = reviews.filter((item) => providerListingIds.has(item.listing_id));
  const providerRating = Number(
    (providerReviews.reduce((sum, item) => sum + item.rating, 0) / providerReviews.length).toFixed(2),
  );
  patchCanonicalProvider(displayBooking.provider_id, {
    review_count: providerReviews.length,
    rating: providerRating,
  });
  return review;
}
