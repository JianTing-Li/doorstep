/**
 * Shared constants for Product A. Centralizing them keeps components lean
 * and lets Products B, C, and D import the same contract.
 */

/** Booking status -> badge color (matches the spec's green/orange/red). */
export const BOOKING_STATUS_COLORS = {
  completed: "green",
  confirmed: "blue",
  pending: "orange",
  cancelled: "red",
};

/** Booking statuses a provider can act on from the dashboard. */
export const ACTIONABLE_BOOKING_STATUSES = ["pending", "confirmed"];

/** The 8 canonical service-type codes from mock-data/service-types.json. */
export const SERVICE_TYPE_CODES = [
  "cleaning_standard",
  "cleaning_deep",
  "handyman_general",
  "plumbing",
  "electrical",
  "moving_help",
  "junk_removal",
  "yard_outdoor",
];

/** Server-side generator for new stable IDs (draft listings live in app state). */
export function nextId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}