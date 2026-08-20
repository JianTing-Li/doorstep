/**
 * Listing creation validation. Returns an object of per-field error messages.
 * The app never writes to mock-data/ — new listings live in the product's
 * own local state and get a provisional `draft` listing_status until a
 * (future) publish endpoint exists.
 */

/**
 * Validate a guided service-builder payload:
 *  - a customer need must resolve to one canonical service code
 *  - at least one included task is required so customers know what they get
 *  - price must be a whole-dollar amount >= 1
 */
export function validateListingForm(form) {
  const errors = {};

  if (!form.need_key || !form.service_type) {
    errors.need_key = "Choose the customer need you can solve.";
  }

  if (!Array.isArray(form.included_tasks) || form.included_tasks.length === 0) {
    errors.included_tasks = "Choose at least one task that is included.";
  }

  const price = Number(form.price_per_day);
  if (!Number.isInteger(price) || price < 1) {
    errors.price_per_day = "Enter a whole-dollar price of 1 or more.";
  }

  return errors;
}
