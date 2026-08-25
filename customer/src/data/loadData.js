import { createRecord, mergeCollection } from "../../../shared/demo-store.js";

// Product B's single access point for mock-data (Phase 3).
//
// B is still the original vanilla build until Phase 5 ports it to React, so
// its data arrives as DB_* globals from the generated data.js (a build-time
// snapshot of mock-data, verified byte-identical to it at Gate 0). This
// module is a bridge rather than a rewrite: it re-reads those globals through
// shared/demo-store.js so B sees the same merged data as the other three
// products, and it mirrors B's bookings into the shared store so a booking
// made here appears in the Provider dashboard and the Admin queue.
//
// Phase 5 replaces this bridge with real imports when B becomes React.
//
// Load order matters and is deliberate: data.js and app.js are classic
// scripts that run during parsing; this is a module, so it runs after both
// but before DOMContentLoaded — which is when app.js first reads any DB_*
// global. Rewriting them here is therefore safe.

const MERGED = {
  DB_LISTINGS: "listings",
  DB_PROVIDERS: "providers",
  DB_CUSTOMERS: "customers",
  DB_BOOKINGS: "bookings",
  DB_REVIEWS: "reviews",
  DB_REPORTS: "reports",
  DB_MODERATION_ACTIONS: "moderation-actions",
};

for (const [globalName, collection] of Object.entries(MERGED)) {
  const pristine = window[globalName];
  if (Array.isArray(pristine)) {
    window[globalName] = mergeCollection(collection, pristine);
  }
}

// B's own booking objects use its display shape (BK-#####, status "upcoming",
// escrowStatus) rather than the mock-data schema the other products read.
// Rather than restructure B's state for a build that Phase 5 replaces, each
// new booking is also written to the shared store in canonical form. B's
// extra fields ride along untouched — unknown fields are ignored by the
// products that read this record.
function toCanonicalBooking(booking) {
  const customers = Array.isArray(window.DB_CUSTOMERS) ? window.DB_CUSTOMERS : [];
  // Read B's own persona key directly rather than requiring another edit to
  // app.js — one fewer touch to a file Phase 5 replaces anyway.
  let active = null;
  try {
    active = localStorage.getItem("doorstep_active_persona");
  } catch {
    active = null;
  }
  // B defaults its persona to "cust_00001", which matches no record in
  // mock-data (real ids are cst_0NN) — see INTEGRATION-NOTES. Fall back to
  // the switcher's Customer persona so the booking attaches to a real record.
  const customerId = customers.some((c) => c.customer_id === active) ? active : "cst_001";

  const meta = window.DB_META ?? {};
  const commissionRate = meta.commission_rate ?? 0.15;
  const total = Number(booking.total) || 0;
  const base = Number((total / (1 + commissionRate)).toFixed(2));

  return {
    booking_id: booking.id,
    listing_id: booking.listing_id,
    customer_id: customerId,
    provider_id: booking.provider_id,
    scheduled_slot: booking.timeSlot,
    created_at: new Date().toISOString(),
    price_paid: base,
    quantity: 1,
    quantity_unit: "job",
    commission_amount: Number((total - base).toFixed(2)),
    status: "confirmed",
    job_address: booking.address,
    source: "customer_app",
    // B's own display fields, preserved so nothing in B depends on a lossy
    // round-trip through the canonical shape.
    escrow_status: booking.escrowStatus,
    title: booking.title,
    provider_name: booking.provider_name,
  };
}

window.Doorstep = window.Doorstep ?? {};
window.Doorstep.recordBooking = function recordBooking(booking) {
  try {
    createRecord("bookings", toCanonicalBooking(booking));
  } catch {
    // A failed mirror must never block B's own booking flow.
  }
};
