import { createRecord, mergeCollection } from "../../../shared/demo-store.js";

import listings from "../../../mock-data/listings.json" with { type: "json" };
import providers from "../../../mock-data/providers.json" with { type: "json" };
import customers from "../../../mock-data/customers.json" with { type: "json" };
import reviews from "../../../mock-data/reviews.json" with { type: "json" };
import reports from "../../../mock-data/reports.json" with { type: "json" };
import serviceTypes from "../../../mock-data/service-types.json" with { type: "json" };
import meta from "../../../mock-data/_meta.json" with { type: "json" };

// Product B's single access point for mock-data (Phase 5 port). Everything
// mutable is merged through shared/demo-store.js — nothing here, or anywhere
// else in this app, reads mock-data directly.

export function getListings() {
  return mergeCollection("listings", listings);
}

export function getProviders() {
  return mergeCollection("providers", providers);
}

export function getCustomers() {
  return mergeCollection("customers", customers);
}

export function getReviews() {
  return mergeCollection("reviews", reviews);
}

export function getReports() {
  return mergeCollection("reports", reports);
}

export function getServiceTypes() {
  return serviceTypes;
}

export function getMeta() {
  return meta;
}

/**
 * Persist a booking in the canonical shared shape, so Provider and Admin see
 * it immediately. `booking` is this app's own display shape (see
 * src/lib/bookings.js); this maps it once, at the write boundary.
 */
export function createCanonicalBooking(record) {
  return createRecord("bookings", record);
}

/**
 * Persist a customer-filed safety report in the canonical shared shape, so
 * it actually reaches Admin's moderation queue — his own UI already promises
 * "Assigned to Product D Moderation."
 */
export function createCanonicalReport(record) {
  return createRecord("reports", record);
}
