/**
 * Listing creation validation. Returns an object of per-field error messages.
 * The app never writes to mock-data/ — new listings live in the product's
 * own local state and get a provisional `draft` listing_status until a
 * (future) publish endpoint exists.
 */

/**
 * Validate a raw form payload using the canonical shared schema rules:
 *  - listing_title + listing_description are required text
 *  - service_type must be one of the 8 canonical codes
 *  - price must be an integer number >= 1 (whole dollars, shared contract)
 *  - price_unit must be "flat" | "hourly"
 */
export function validateListingForm(form) {
  const errors = {};

  if (!form.listing_title || form.listing_title.trim().length < 3) {
    errors.listing_title = "Listing title must be at least 3 characters.";
  }

  if (!form.service_type || form.service_type.length === 0) {
    errors.service_type = "Choose at least one service type.";
  }

  const price = Number(form.price_per_day);
  if (!Number.isFinite(price) || price < 1) {
    errors.price_per_day = "Price per day must be a whole dollar amount of 1 or more.";
  }

  return errors;
}