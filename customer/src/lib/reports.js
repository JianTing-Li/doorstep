import { createCanonicalReport, getMeta } from "../data/loadData.js";

// Abheeshu's 6 safety-flag categories — copy preserved verbatim (see the
// Report modal). Each maps to one of the canonical schema's 6 `reason`
// values (mock-data/README.md) so a customer-filed report actually reaches
// Admin's moderation queue instead of only living in this app's own storage.
export const SAFETY_FLAGS = [
  {
    value: "payment_request_off_platform",
    reason: "conduct",
    label: "Off-Platform Payment Request",
    detail: "Asked to pay cash, Venmo, or outside Doorstep escrow",
  },
  {
    value: "no_show",
    reason: "no_show",
    label: "No-Show / Unresponsive",
    detail: "Provider failed to arrive at scheduled time without notice",
  },
  {
    value: "identity_concern",
    reason: "safety",
    label: "Identity Mismatch",
    detail: "Person who arrived did not match provider profile",
  },
  {
    value: "unsafe_behavior",
    reason: "safety",
    label: "Unsafe or Threatening Behavior",
    detail: "Felt unsafe, harassment, or verbal aggression",
  },
  {
    value: "property_damage",
    reason: "quality",
    label: "Property Damage / Negligent Work",
    detail: "Physical damage caused to home during service",
  },
  {
    value: "inaccurate_listing",
    reason: "misleading_listing",
    label: "Misleading Listing or Hidden Fees",
    detail: "Price baiting or inaccurate service scope description",
  },
];

let counter = 0;

export function buildDisplayReport({ target, flagValue, details, evidenceUrl, customerId }) {
  counter += 1;
  return {
    report_id: "report_" + Date.now().toString(36) + counter,
    reporter_customer_id: customerId,
    listing_id: target.listing_id,
    provider_id: target.provider_id,
    booking_id: target.booking_id || null,
    safety_flag_type: flagValue,
    report_details: details,
    evidence_url: evidenceUrl,
    created_at: `${getMeta().reference_date}T18:00:00-07:00`,
    status: "in_review",
  };
}

// Reports are given a medium risk_level by default — his intake form has no
// way to establish urgency, and medium avoids both under- and over-stating a
// customer-filed concern before a human reviews it.
export function recordCanonicalReport(displayReport, customerId) {
  const flag = SAFETY_FLAGS.find((f) => f.value === displayReport.safety_flag_type);
  return createCanonicalReport({
    report_id: displayReport.report_id,
    listing_id: displayReport.listing_id,
    booking_id: displayReport.booking_id,
    reporter_id: customerId,
    reason: flag?.reason ?? "conduct",
    description: displayReport.report_details,
    evidence_url: displayReport.evidence_url || null,
    created_at: displayReport.created_at,
    risk_level: "medium",
    status: "open",
  });
}
