/**
 * useProviderData — the single integration point between Product A's UI and
 * the shared mock-data folder.
 *
 * Reads (read-only) the canonical JSON files:
 *   providers, listings, bookings, customers, service-types, _meta
 *
 * Exposes:
 *   - the current provider profile
 *   - that provider's listings (ALL statuses per Product A's README section)
 *   - listings summary (toProviderSummary) for Products B/C/D via props
 *   - bookings filtered by provider_id, split into upcoming / past views
 *   - createListing + updateBookingStatus actions for Product A state
 *
 * Everything returned sticks to the shared snake_case field contract.
 */

import { useMemo, useState } from "react";

import providersData from "../../mock-data/providers.json";
import listingsData from "../../mock-data/listings.json";
import bookingsData from "../../mock-data/bookings.json";
import customersData from "../../mock-data/customers.json";
import serviceTypesData from "../../mock-data/service-types.json";
import reviewsData from "../../mock-data/reviews.json";
import metaData from "../../mock-data/_meta.json";

import { nextId } from "../constants";
import {
  toBookingView,
  toListingView,
  toProviderSummary,
} from "../data/selectors";

/** Product A has no auth; this constant stands in for the logged-in provider. */
const ACTIVE_PROVIDER_ID = "prv_001";

export default function useProviderData() {
  const [listings, setListings] = useState(() => listingsData);
  const [bookings, setBookings] = useState(() => bookingsData);

  const provider = useMemo(
    () => providersData.find((p) => p.provider_id === ACTIVE_PROVIDER_ID) ?? null,
    []
  );

  const serviceTypeLabelByCode = useMemo(
    () => Object.fromEntries(serviceTypesData.map((s) => [s.code, s.label])),
    []
  );

  const providerListings = useMemo(
    () => listings.filter((l) => l.provider_id === ACTIVE_PROVIDER_ID),
    [listings]
  );

  const listingViews = useMemo(
    () =>
      providerListings.map((listing) =>
        toListingView(listing, provider, serviceTypeLabelByCode)
      ),
    [providerListings, provider, serviceTypeLabelByCode]
  );

  const listingsSummary = useMemo(
    () =>
      providerListings.map((listing) =>
        toProviderSummary(listing, provider)
      ),
    [providerListings, provider]
  );

  const providerBookings = useMemo(
    () => bookings.filter((b) => b.provider_id === ACTIVE_PROVIDER_ID),
    [bookings]
  );

  const bookingViews = useMemo(
    () =>
      providerBookings.map((booking) => {
        const listing = listings.find((l) => l.listing_id === booking.listing_id);
        const customer = customersData.find(
          (c) => c.customer_id === booking.customer_id
        );
        return toBookingView(booking, listing, customer);
      }),
    [providerBookings, listings]
  );

  const upcomingBookingViews = useMemo(
    () =>
      bookingViews
        .filter((b) => b.status === "pending" || b.status === "confirmed")
        .sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [bookingViews]
  );

  const pastBookingViews = useMemo(
    () =>
      bookingViews.filter(
        (b) => b.status === "completed" || b.status === "cancelled"
      ),
    [bookingViews]
  );

  const counts = useMemo(() => {
    const byStatus = (status) =>
      providerBookings.filter((b) => b.status === status).length;
    return {
      pending: byStatus("pending"),
      confirmed: byStatus("confirmed"),
      completed: byStatus("completed"),
      cancelled: byStatus("cancelled"),
      total: providerBookings.length,
    };
  }, [providerBookings]);

  /** Create a draft listing. mock-data is read-only, so the draft lives in app state. */
  function createListing(formListing) {
    const newListing = {
      listing_id: nextId("lst"),
      provider_id: ACTIVE_PROVIDER_ID,
      title: formListing.listing_title.trim(),
      listing_description: formListing.listing_description.trim(),
      service_type: [formListing.service_type],
      need_key: formListing.need_key,
      included_tasks: [...formListing.included_tasks],
      price: Number(formListing.price_per_day),
      price_unit: "flat",
      duration_estimate_minutes: null,
      provider_location: provider?.location ?? "Unknown",
      latitude: provider?.latitude ?? null,
      longitude: provider?.longitude ?? null,
      service_radius_miles: null,
      rating: null,
      review_count: 0,
      availability: [],
      listing_status: "draft",
    };
    setListings((prev) => [newListing, ...prev]);
    return newListing;
  }

  /** Update a booking status (accept pending -> confirmed, cancel, complete). */
  function updateBookingStatus(bookingId, nextStatus) {
    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(nextStatus)) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.booking_id === bookingId ? { ...b, status: nextStatus } : b
      )
    );
  }

  return {
    provider,
    reference_date: metaData.reference_date,
    provider_listings: listingViews,
    provider_listings_summary: listingsSummary,
    upcoming_bookings: upcomingBookingViews,
    past_bookings: pastBookingViews,
    bookings_counts: counts,
    createListing,
    updateBookingStatus,
    reviews_count: reviewsData.length,
  };
}