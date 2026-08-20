/**
 * Read-only helpers over the shared mock-data JSON files.
 *
 * These files are the canonical TaskLocal source of truth (see mock-data/README.md).
 * Products B, C, and D read the same arrays, so Product A must NOT mutate them.
 *
 * Field names here follow the shared snake_case contract exactly.
 */

/** Provider + listing summary shape passed to other products via props. */
export function toProviderSummary(listing, provider) {
  return {
    provider_id: provider.provider_id,
    name: provider.name,
    service_type: listing.service_type, // array of codes (canonical)
    price_per_day: listing.price, // canonical listing price
    listing_title: listing.title,
    review_count: listing.review_count ?? 0,
  };
}

/** Build a display object from a listing joined against providers + lookups. */
export function toListingView(listing, provider, serviceTypeLabelByCode) {
  return {
    listing_id: listing.listing_id,
    provider_id: listing.provider_id,
    listing_title: listing.title,
    listing_description: listing.listing_description,
    included_tasks: listing.included_tasks ?? [],
    need_key: listing.need_key ?? null,
    service_type: listing.service_type,
    service_type_labels: listing.service_type.map(
      (code) => serviceTypeLabelByCode[code] ?? code
    ),
    price_per_day: listing.price,
    price_unit: listing.price_unit,
    minimum_quantity: listing.minimum_quantity ?? 1,
    review_count: listing.review_count ?? 0,
    provider_name: provider?.name ?? "Unknown provider",
    provider_rating: provider?.rating ?? null,
    listing_status: listing.listing_status,
  };
}

/** Booking enriched with the details Product A displays on a card. */
export function toBookingView(booking, listing, customer) {
  return {
    booking_id: booking.booking_id,
    listing_id: booking.listing_id,
    customer_id: booking.customer_id,
    provider_id: booking.provider_id,
    start_date: booking.scheduled_slot.slice(0, 10), // YYYY-MM-DD (canonical format)
    end_date: booking.scheduled_slot.slice(0, 10), // snapshot has no separate end date
    owner_name: customer?.name ?? "Unknown customer",
    total_price: booking.price_paid,
    status: booking.status,
    listing_title: listing?.title ?? "Unknown listing",
    service_type: listing?.service_type ?? [],
    quantity: booking.quantity,
    quantity_unit: booking.quantity_unit,
    job_address: booking.job_address,
  };
}

/** A DATETIME is an ISO slot; a DATE is YYYY-MM-DD. Always compare via Date.parse
 *  using the slot's own offset rather than naive string order (offsets vary DST). */
export function isBeforeOrOn(dateALike, dateBLike) {
  return Date.parse(dateALike) <= Date.parse(dateBLike);
}