import { createRecord, mergeCollection, patchRecord } from "../../../shared/demo-store.js";

import providersData from "../../../mock-data/providers.json";
import listingsData from "../../../mock-data/listings.json";
import bookingsData from "../../../mock-data/bookings.json";
import customersData from "../../../mock-data/customers.json";
import serviceTypesData from "../../../mock-data/service-types.json";
import reviewsData from "../../../mock-data/reviews.json";
import metaData from "../../../mock-data/_meta.json";

// Product A's single access point for mock-data (Phase 3). The JSON imports
// that used to live in useProviderData.js moved here unchanged; the mutable
// collections are now merged through shared/demo-store.js so a booking made
// in Customer or Chat, or a listing suspended in Admin, shows up on this
// dashboard without Product A knowing who wrote it.
//
// Static reference tables (service types, _meta) have no overlay.

export function getProviders() {
  return mergeCollection("providers", providersData);
}

// newestFirst mirrors Product A's own pre-Phase-3 behaviour, where a freshly
// created draft was prepended to the list rather than appended.
export function getListings() {
  return mergeCollection("listings", listingsData, { newestFirst: true });
}

export function getBookings() {
  return mergeCollection("bookings", bookingsData);
}

export function getCustomers() {
  return mergeCollection("customers", customersData);
}

export function getReviews() {
  return mergeCollection("reviews", reviewsData);
}

export function getServiceTypes() {
  return serviceTypesData;
}

export function getMeta() {
  return metaData;
}

/** Persist a new listing to the shared store. */
export function addListing(listing) {
  return createRecord("listings", listing);
}

/** Persist a booking status change to the shared store. */
export function setBookingStatus(bookingId, status) {
  patchRecord("bookings", bookingId, { status });
}
