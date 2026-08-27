import { getServiceTypes } from "../data/loadData.js";
import { formatSlot, priceLabel } from "./booking.js";

// Ordered most-specific first; where a message reads as several, the earliest
// wins. Mirrors INTENTS in api/chat.js — except "show_examples", which is
// client-only (see below) and never sent to or returned by the model.
export const INTENT_PRIORITY = [
  "cancel_booking",
  "change_filters",
  "more_details",
  "compare",
  "list_bookings",
  "greeting",
  "help",
  "show_examples",
  "unsupported_service",
  "job",
  "unclear",
  "off_topic",
];

// High-signal phrasings the keyword path can settle without spending a request.
// Deliberately narrow: "bookings" and "appointments" only, so "show me all
// listings" stays a browse query rather than becoming list_bookings.
const LOCAL_INTENT_PATTERNS = [
  ["cancel_booking", /\b(cancel|never ?mind|undo|don'?t want)\b/i],
  ["list_bookings", /\b(my|all|the)\s+(bookings?|appointments?)\b|\bwhat have i booked\b|\bwhat did i book\b/i],
  ["greeting", /^\s*(hi|hey|hello|yo|howdy|good (morning|afternoon|evening))\s*[!.?]*\s*$/i],
  ["help", /\bwhat can you do\b|\bhow does this (work|thing work)\b|\bnot sure how to use\b|\bhow do i use\b/i],
  // A meta-question about the assistant, same as "help" above, just asking
  // for concrete examples instead of an explanation — never a real job
  // description itself, so this is safe to settle without a request the same
  // way. "show_examples" only exists here: unlike every other value in
  // INTENT_PRIORITY, the model is never told about it and never returns it
  // (chat/api/chat.js's schema doesn't include it) — this is purely a
  // keyword shortcut for a message the customer sends when suggestion chips
  // (suppressed after they've typed once — see AskScreen's
  // hasUserTypedFreeText) are no longer on screen to tap instead.
  ["show_examples", /\b(show|give) me (?:some )?(?:example|sample)s?\b|\bsample (?:services|jobs?|requests?)\b|\bwhat (?:can you help (?:me )?with|kind(?:s)? of jobs?)\b|\bshow me options\b/i],
  ["unsupported_service", /\b(paint(?:ed|ing)?|roof(?:ing)?|roofer|pest control|exterminator|childcare|babysitt(?:er|ing)|pet care|dog walk(?:er|ing))\b/i],
];

const CONTEXTUAL_INTENT_PATTERNS = [
  ["change_filters", /\b(actually|instead|make it|switch to|change|different|remove|drop|clear|any neighborhood|any area|no budget|timing doesn'?t matter)\b/i],
  ["more_details", /\b(what(?:'s| is) included|how long does (?:that|it) take|does (?:that|this|the) (?:provider|listing)|tell me more about (?:that|this|it))\b/i],
  ["compare", /\b(compare|which (?:one )?(?:is )?(?:cheaper|better|faster|closer|higher rated)|what(?:'s| is) the difference)\b/i],
];

export function detectLocalIntent(text, context = null) {
  const patterns = [...LOCAL_INTENT_PATTERNS];
  if (context?.active_request) patterns.push(CONTEXTUAL_INTENT_PATTERNS[0]);
  if (context?.focused_listing || context?.visible_listings?.length > 0) patterns.push(CONTEXTUAL_INTENT_PATTERNS[1]);
  if (context?.visible_listings?.length > 1) patterns.push(CONTEXTUAL_INTENT_PATTERNS[2]);
  const found = patterns.filter(([, pattern]) => pattern.test(text)).map(([intent]) => intent);
  if (found.length === 0) return null;
  return INTENT_PRIORITY.find((intent) => found.includes(intent)) ?? found[0];
}

export function detectFilterClears(text) {
  const value = String(text ?? "");
  const cleared = [];
  if (/\b(remove|drop|clear|forget|no) (?:the )?(?:budget|price limit|price cap)\b|\bany (?:price|budget)\b/i.test(value)) {
    cleared.push("max_price");
  }
  if (/\b(remove|drop|clear|forget) (?:the )?(?:neighborhood|area|location)\b|\bany (?:neighborhood|area|location)\b/i.test(value)) {
    cleared.push("neighborhood");
  }
  if (/\b(remove|drop|clear|forget) (?:the )?(?:timing|urgency|date)\b|\b(?:timing|date) doesn'?t matter\b|\bany time\b/i.test(value)) {
    cleared.push("urgency");
  }
  if (/\b(remove|drop|clear) (?:the )?(?:service|job type|category)\b/i.test(value)) {
    cleared.push("service_types");
  }
  return cleared;
}

const STOP = new Set(["the", "one", "that", "this", "and", "for", "with", "booking", "cancel", "undo", "never", "mind", "want", "anymore", "my", "on", "it", "a", "an"]);

function terms(text) {
  return String(text ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
}

// Matches a cancellation against the cards that actually reached booked state.
// Returns a single match only when one candidate clearly leads; otherwise the
// caller asks rather than guessing.
export function findBookingMatch(message, entries) {
  if (entries.length === 0) return { match: null, candidates: [] };
  if (entries.length === 1) return { match: entries[0], candidates: entries };

  const words = terms(message);
  const labelByCode = Object.fromEntries(getServiceTypes().map(({ code, label }) => [code, label]));

  const scored = entries.map((entry) => {
    const haystack = [
      entry.listing.title,
      entry.listing.provider?.name ?? "",
      ...entry.listing.service_type.map((code) => labelByCode[code] ?? code),
    ]
      .join(" ")
      .toLowerCase();
    return { entry, score: words.filter((word) => haystack.includes(word)).length };
  });

  const best = Math.max(...scored.map((s) => s.score));
  const leaders = scored.filter((s) => s.score === best);
  if (best === 0 || leaders.length > 1) return { match: null, candidates: entries };
  return { match: leaders[0].entry, candidates: entries };
}

export function requestsAllBookings(message) {
  return /\b(both|all|every|each|them|these|those)\b/i.test(String(message ?? ""));
}

// change_filters modifies the active search rather than replacing it: only the
// stated parts are merged in.
export function mergeFilters(current, change) {
  const merged = { ...current };
  for (const key of change.clear_filters ?? []) {
    if (key === "service_types") merged.service_types = [];
    else if (["max_price", "neighborhood", "urgency"].includes(key)) merged[key] = null;
  }
  if (change.max_price != null) merged.max_price = change.max_price;
  if (change.neighborhood) merged.neighborhood = change.neighborhood;
  if (change.urgency) merged.urgency = change.urgency;
  if (change.service_types?.length > 0) merged.service_types = change.service_types;
  return merged;
}

export function describeFilterChange(previous, next) {
  const parts = [];
  if (previous.max_price !== next.max_price && next.max_price != null) parts.push(`under $${next.max_price}`);
  if (previous.neighborhood !== next.neighborhood && next.neighborhood) parts.push(`in ${next.neighborhood}`);
  const before = (previous.service_types ?? []).join(",");
  const after = (next.service_types ?? []).join(",");
  if (before !== after && next.service_types?.length) {
    const labelByCode = Object.fromEntries(getServiceTypes().map(({ code, label }) => [code, label]));
    parts.push(next.service_types.map((code) => labelByCode[code] ?? code).join(" and "));
  }
  if (before !== after && !next.service_types?.length) parts.push("without a service category");
  if (previous.max_price != null && next.max_price == null) parts.push("without a budget limit");
  if (previous.neighborhood && !next.neighborhood) parts.push("in any neighborhood");
  if (previous.urgency && !next.urgency) parts.push("with any timing");
  return parts.length ? `I updated your search: ${parts.join(", ")}.` : "I kept the rest of your search the same.";
}

// Answers only from fields present on the record. Anything not in the data is
// said to be unknown rather than invented.
export function detailsAnswer(listing, message) {
  const ask = String(message ?? "").toLowerCase();
  const labelByCode = Object.fromEntries(getServiceTypes().map(({ code, label }) => [code, label]));

  if (/\b(how long|duration|take|hours?)\b/.test(ask)) {
    const minutes = listing.duration_estimate_minutes;
    return minutes
      ? `${listing.title} is estimated at about ${minutes} minutes.`
      : `The data doesn't give a duration for ${listing.title}.`;
  }
  if (/\b(price|cost|included|charge|rate)\b/.test(ask)) {
    const unit = listing.price_unit === "hourly" ? "an hourly rate" : "a flat price for the job";
    return `${priceLabel(listing)} — ${unit}. ${listing.listing_description}`;
  }
  if (/\b(also|too|other|else|cover|do)\b/.test(ask)) {
    return `${listing.provider?.name ?? "This provider"} covers ${listing.service_type.map((c) => labelByCode[c] ?? c).join(" and ")} on this listing.`;
  }
  return `${listing.title}: ${listing.listing_description}`;
}

// States factual differences across the listings already on screen. Does not
// rank or recommend.
export function compareListings(listings, message) {
  const ask = String(message ?? "").toLowerCase();
  const named = listings.slice(0, 3);

  if (/\b(cheap(?:er|est)?|price|cost|expensive)\b/.test(ask)) {
    const byMinimum = [...named].sort((a, b) => minimumSpend(a) - minimumSpend(b));
    const [cheapest, ...others] = byMinimum;
    const rest = others.map((l) => `${l.title} is ${priceLabel(l)}`).join("; ");
    return `${cheapest.title} is the lowest-priced option at ${priceLabel(cheapest)}${rest ? `. ${rest}.` : "."}`;
  }
  if (/\b(rating|rated|better|review)\b/.test(ask)) {
    return (
      named
        .map((l) => `${l.title} is ${l.rating != null ? `${l.rating.toFixed(1)} from ${l.review_count}` : "unrated"}`)
        .join("; ") + " on this listing."
    );
  }
  if (/\b(long|duration|time|quick)\b/.test(ask)) {
    return named.map((l) => `${l.title} is about ${l.duration_estimate_minutes} minutes`).join("; ") + ".";
  }
  return named.map((l) => `${l.title}: ${priceLabel(l)}, about ${l.duration_estimate_minutes} minutes`).join("; ") + ".";
}

function minimumSpend(listing) {
  return listing.price * (listing.minimum_quantity ?? 1);
}

export function summariseBookings(entries) {
  return entries.map(({ key, booking, listing }) => ({
    key,
    booking,
    listing,
    id: booking.booking_id,
    title: listing.title,
    provider: listing.provider?.name ?? "Doorstep provider",
    when: formatSlot(booking.slot),
    price: priceLabel(listing),
    description: booking.request?.description ?? null,
  }));
}
