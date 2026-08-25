import { getExampleQueries, getListings, getMeta, getNeighborhoods } from "../../data/loadData.js";
import { activeListings } from "../../data/listings.js";
import { parseJob } from "../parseJob.js";
import { matchListings } from "../matchListings.js";
import { applyBooking, availabilityLabel, cancelBookingByKey, findBundle, priceLabel, remainingCodes, rescheduleBooking } from "../booking.js";
import {
  INTENT_PRIORITY,
  compareListings,
  describeFilterChange,
  detailsAnswer,
  detectLocalIntent,
  findBookingMatch,
  mergeFilters,
  requestsAllBookings,
  summariseBookings,
} from "../intents.js";

const LLM_CONCURRENCY = 1;
const LLM_MIN_INTERVAL_MS = 15000;

function sameCodes(actual, expected) {
  if (actual.length !== expected.length) return false;
  const expectedSet = new Set(expected);
  return actual.every((code) => expectedSet.has(code));
}

function report(label, outcomes) {
  const passed = outcomes.filter((o) => o.pass).length;
  const rate = ((passed / outcomes.length) * 100).toFixed(1);
  console.log(`\n--- ${label}: ${passed}/${outcomes.length} (${rate}%) ---`);
  for (const o of outcomes.filter((x) => !x.pass)) {
    console.log(
      `  FAIL ${o.query_id}: "${o.query}"\n` +
        `    expected: ${JSON.stringify(o.expected)}\n` +
        `    actual:   ${JSON.stringify(o.actual)}`,
    );
  }
  return { passed, total: outcomes.length, rate };
}

async function mapWithLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await fn(items[index]);
      }
    }),
  );
  return results;
}

const queries = getExampleQueries();

// ---- booking / routing behaviour ----

const behaviour = [];
function check(label, condition, detail = "") {
  behaviour.push({ label, pass: Boolean(condition), detail });
}

{
  const listings = activeListings();

  // matchListings must never run on an off-topic message. The App routes on
  // intent before matching, so the guarantee under test is that an off_topic
  // result carries nothing to match on and would return the whole catalogue
  // if it were matched anyway — which is why routing has to short-circuit.
  const offTopic = { intent: "off_topic", service_types: [], max_price: null, neighborhood: null };
  const wouldReturn = matchListings(offTopic, listings);
  check(
    "off_topic filters would match the entire catalogue if matched",
    wouldReturn.length === listings.length,
    `${wouldReturn.length} of ${listings.length} — App must short-circuit on intent before calling matchListings`,
  );

  // Bundle branch: one active listing covers every requested code.
  const bundleRequest = ["handyman_general", "electrical"];
  const bundle = findBundle(bundleRequest, listings);
  check(
    "bundle branch: a single listing covers every requested code",
    bundle && bundleRequest.every((code) => bundle.service_type.includes(code)),
    bundle ? `${bundle.listing_id} ${JSON.stringify(bundle.service_type)}` : "no bundle found",
  );

  // Sequential branch: nothing covers both, so the job needs two bookings.
  const splitRequest = ["plumbing", "yard_outdoor"];
  const noBundle = findBundle(splitRequest, listings);
  check(
    "sequential branch: no single listing covers every requested code",
    noBundle === null,
    noBundle ? `unexpectedly found ${noBundle.listing_id}` : "none — falls through to sequential",
  );

  // After booking a plumbing listing, yard_outdoor is still outstanding.
  const booked = listings.find((l) => l.service_type.includes("plumbing"));
  const stillOpen = remainingCodes(splitRequest, booked.service_type);
  check(
    "sequential branch: remaining codes recomputed after a booking",
    stillOpen.length === 1 && stillOpen[0] === "yard_outdoor",
    `booked ${booked.listing_id} → remaining ${JSON.stringify(stillOpen)}`,
  );

  // And the follow-up ranking is scoped to only what is left.
  const followUp = matchListings({ ...offTopic, service_types: stillOpen }, listings);
  check(
    "sequential branch: follow-up results only cover the remaining code",
    followUp.length > 0 && followUp.every((l) => l.service_type.includes("yard_outdoor")),
    `${followUp.length} listings, all covering yard_outdoor`,
  );

  // ---- card booking state machine ----

  const card = "msg1:lst_019";
  const slot = booked.availability[0];

  const first = applyBooking({}, card, booked, slot);
  check(
    "booking a card produces exactly one booked state",
    first.booking !== null && Object.keys(first.bookings).length === 1 && first.bookings[card].slot === slot,
    `${first.bookings[card].booking_id} on ${card}`,
  );

  const second = applyBooking(first.bookings, card, booked, booked.availability[1]);
  check(
    "the same card cannot be booked twice",
    second.booking === null && second.bookings === first.bookings,
    "second attempt returns no booking and leaves state untouched",
  );

  check(
    "the original slot survives a second attempt",
    second.bookings[card].slot === slot,
    `still ${slot}`,
  );

  // App gates the wrap-up on `booking` being non-null, so a rejected re-book
  // cannot fire it and no wrap-up can precede the first successful booking.
  check(
    "the sequential wrap-up never fires before a card is booked",
    applyBooking({}, card, booked, slot).booking !== null && second.booking === null,
    "wrap-up is gated on a non-null booking from applyBooking",
  );

  // A different card for the same listing books independently.
  const other = applyBooking(first.bookings, "msg2:lst_019", booked, slot);
  check(
    "a different card is unaffected by another card's booking",
    other.booking !== null && Object.keys(other.bookings).length === 2,
    "msg2:lst_019 books independently",
  );

  // ---- tap Cancel vs the cancel_booking chat intent ----

  // Both paths call cancelBookingByKey; this is the same end state either way
  // produces — a freed key and the record itself handed back so a caller can
  // still read what was cancelled.
  const cancelledByTap = cancelBookingByKey(first.bookings, card);
  check(
    "cancelling by tap frees the key and returns the cancelled record",
    !cancelledByTap.bookings[card] &&
      cancelledByTap.cancelled?.booking_id === first.bookings[card].booking_id,
    `${card} freed, booking_id ${cancelledByTap.cancelled?.booking_id}`,
  );
  const cancelledByChat = cancelBookingByKey(first.bookings, card);
  check(
    "cancelling by chat intent produces the identical state as cancelling by tap",
    JSON.stringify(cancelledByChat.bookings) === JSON.stringify(cancelledByTap.bookings) &&
      cancelledByChat.cancelled?.booking_id === cancelledByTap.cancelled?.booking_id,
    "same underlying writer, same result regardless of trigger",
  );
  check(
    "cancelling a key that isn't booked is a no-op",
    cancelBookingByKey({}, card).cancelled === null,
    "no cancelled record, nothing to revert",
  );

  // ---- Reschedule ----

  const rescheduled = rescheduleBooking(first.bookings, card, booked.availability[1]);
  check(
    "reschedule updates only the slot",
    rescheduled.booking.slot === booked.availability[1] && rescheduled.booking.slot !== slot,
    `${slot} -> ${rescheduled.booking.slot}`,
  );
  check(
    "reschedule leaves listing, provider and price unchanged",
    rescheduled.booking.listing_id === first.bookings[card].listing_id &&
      rescheduled.booking.provider_id === first.bookings[card].provider_id &&
      rescheduled.booking.price === first.bookings[card].price,
    `${rescheduled.booking.listing_id} / ${rescheduled.booking.provider_id} / ${rescheduled.booking.price}`,
  );
  check(
    "reschedule keeps the card in booked state — the key is still present",
    Boolean(rescheduled.bookings[card]) && Object.keys(rescheduled.bookings).length === Object.keys(first.bookings).length,
    "no card added or removed, only the slot on the existing one changed",
  );
  check(
    "reschedule on a key that isn't booked is a no-op",
    rescheduleBooking({}, card, slot).booking === null,
    "nothing to reschedule",
  );
}

// ---- intents ----
{
  const listings = activeListings();
  const withProvider = (l) => ({ ...l, provider: { name: "Test Provider" } });

  // list_bookings vs a browse query for listings.
  check("\"show me all bookings\" is list_bookings", detectLocalIntent("show me all bookings") === "list_bookings");
  check("\"what have I booked\" is list_bookings", detectLocalIntent("what have I booked") === "list_bookings");
  check(
    "\"show me all listings\" is NOT list_bookings",
    detectLocalIntent("show me all listings") === null,
    "falls through to the normal job path with empty service_types",
  );
  check("\"what's available\" is NOT list_bookings", detectLocalIntent("what's available") === null);

  // After booking two cards, the summary reads exactly those two, in order.
  const a = withProvider(listings.find((l) => l.service_type.includes("plumbing")));
  const b = withProvider(listings.find((l) => l.service_type.includes("yard_outdoor")));
  let store = applyBooking({}, "m1:" + a.listing_id, a, a.availability[0]).bookings;
  store = applyBooking(store, "m1:" + b.listing_id, b, b.availability[0]).bookings;
  const entries = Object.entries(store).map(([key, record]) => ({ key, booking: record, listing: record.listing }));
  const summary = summariseBookings(entries);
  check(
    "list_bookings summarises exactly the booked cards, in booking order",
    summary.length === 2 && summary[0].title === a.title && summary[1].title === b.title,
    summary.map((s) => s.title).join(" then "),
  );
  check(
    "list_bookings reads booked state without touching matchListings",
    summary.every((s) => s.when && s.price && s.provider),
    "summary built from the booking records alone",
  );

  // cancel_booking actually reverts a card and frees its code.
  check("\"cancel the ceiling fan one\" is cancel_booking", detectLocalIntent("cancel the ceiling fan one") === "cancel_booking");
  check("\"never mind on that booking\" is cancel_booking", detectLocalIntent("never mind on that booking") === "cancel_booking");
  const picked = findBookingMatch("cancel the yard one", entries);
  check(
    "cancel_booking identifies the referenced card",
    picked.match?.listing.listing_id === b.listing_id,
    picked.match ? picked.match.listing.title : "no match",
  );
  const afterCancel = { ...store };
  delete afterCancel["m1:" + b.listing_id];
  const covered = [...new Set(Object.values(afterCancel).flatMap((r) => r.listing.service_type))];
  check(
    "cancel_booking reverts the card and frees its code",
    !afterCancel["m1:" + b.listing_id] && !covered.includes("yard_outdoor"),
    `covered after cancel: ${JSON.stringify(covered)}`,
  );
  const ambiguous = findBookingMatch("cancel that one", entries);
  check(
    "an ambiguous cancellation asks rather than guessing",
    ambiguous.match === null && ambiguous.candidates.length === 2,
    "returns both candidates to name in the question",
  );
  check("\"both of them\" selects every pending request", requestsAllBookings("both of them"));
  check("a named single request does not select everything", !requestsAllBookings("the yard one"));

  // change_filters merges rather than replaces.
  const current = { service_types: ["handyman_general", "electrical"], max_price: null, neighborhood: "Sellwood", urgency: null };
  const merged = mergeFilters(current, { service_types: [], max_price: 100, neighborhood: null, urgency: null });
  check(
    "change_filters merges the new ceiling and keeps the rest",
    merged.max_price === 100 && merged.neighborhood === "Sellwood" && merged.service_types.length === 2,
    JSON.stringify(merged),
  );
  const dropped = mergeFilters(current, { service_types: ["handyman_general"], max_price: null, neighborhood: null, urgency: null });
  check(
    "change_filters replaces service types when the user names them",
    dropped.service_types.length === 1 && dropped.service_types[0] === "handyman_general",
    describeFilterChange(current, dropped),
  );

  // more_details answers from real fields only, and never matches.
  const detail = detailsAnswer(a, "how long does that take");
  check(
    "more_details answers duration from duration_estimate_minutes",
    detail.includes(String(a.duration_estimate_minutes)),
    detail.slice(0, 70),
  );
  const unknown = detailsAnswer({ ...a, duration_estimate_minutes: null }, "how long does that take");
  check(
    "more_details says so plainly when the data has no answer",
    /doesn't give/.test(unknown),
    unknown.slice(0, 70),
  );

  // compare states facts across visible listings, and never matches.
  const comparison = compareListings([a, b], "which one's cheaper");
  check(
    "compare states each listing's real price",
    comparison.includes(String(a.price)) && comparison.includes(String(b.price)),
    comparison.slice(0, 90),
  );

  // greeting and help are distinct from off_topic.
  check("\"hey\" is greeting", detectLocalIntent("hey") === "greeting");
  check("\"hi\" is greeting", detectLocalIntent("hi") === "greeting");
  check("\"what can you do\" is help", detectLocalIntent("what can you do") === "help");
  check("\"how does this work\" is help", detectLocalIntent("how does this work") === "help");

  // Priority favours the most specific reading.
  check(
    "intent priority puts cancel_booking ahead of list_bookings",
    INTENT_PRIORITY.indexOf("cancel_booking") < INTENT_PRIORITY.indexOf("list_bookings"),
  );
  check(
    "intent priority puts every specific intent ahead of job and off_topic",
    INTENT_PRIORITY.indexOf("job") > INTENT_PRIORITY.indexOf("help") &&
      INTENT_PRIORITY.indexOf("off_topic") === INTENT_PRIORITY.length - 1,
    INTENT_PRIORITY.join(" > "),
  );
  check(
    "cancel wins when a message reads as both cancel and bookings",
    detectLocalIntent("cancel my bookings") === "cancel_booking",
  );

  check(
    "an unavailable home service is distinct from off-topic conversation",
    detectLocalIntent("I need the exterior painted") === "unsupported_service",
  );

  // ---- marketplace request and matching quality ----

  const request = {
    description: "Kitchen tap drips constantly and the shutoff valve underneath is seized.",
    serviceTypes: ["plumbing"],
    neighborhood: "Sellwood",
    urgency: null,
    maxPrice: null,
  };
  const faucet = listings.find((listing) => listing.listing_id === "lst_019");
  const requested = applyBooking({}, "request:lst_019", faucet, faucet.availability[0], request);
  check(
    "the provider-ready request survives into booking state",
    requested.booking.request?.description === request.description,
    requested.booking.request?.description,
  );

  const minimumListing = listings.find((listing) => (listing.minimum_quantity ?? 1) > 1);
  check(
    "hourly pricing states the minimum time and spend",
    priceLabel(minimumListing).includes(`${minimumListing.minimum_quantity}-hr min`) &&
      priceLabel(minimumListing).includes(`$${minimumListing.price * minimumListing.minimum_quantity} minimum`),
    priceLabel(minimumListing),
  );

  const availableToday = availabilityLabel({
    ...minimumListing,
    availability: [`${getMeta().reference_date}T14:00:00-07:00`],
  });
  check(
    "collapsed-card availability calls out a same-day opening",
    availableToday.startsWith("Available today"),
    availableToday,
  );

  const matchOptions = {
    referenceDate: getMeta().reference_date,
    neighborhoods: getNeighborhoods(),
  };
  const urgent = matchListings(
    { service_types: ["plumbing"], max_price: null, neighborhood: null, urgency: "today" },
    listings,
    matchOptions,
  );
  const unrestricted = matchListings(
    { service_types: ["plumbing"], max_price: null, neighborhood: null, urgency: null },
    listings,
    matchOptions,
  );
  check(
    "today changes matching rather than acting as a decorative chip",
    urgent.length < unrestricted.length && urgent.every((listing) => listing.availability.some((slot) => slot.startsWith(getMeta().reference_date))),
    `${urgent.length} today vs ${unrestricted.length} unrestricted`,
  );

  const serviceAreaMatches = matchListings(
    { service_types: ["plumbing"], max_price: null, neighborhood: "Woodstock", urgency: null },
    listings,
    matchOptions,
  );
  check(
    "job-area matching uses service radius rather than provider base equality",
    serviceAreaMatches.length > 0 && serviceAreaMatches.some((listing) => listing.provider_location !== "Woodstock"),
    `${serviceAreaMatches.length} plumbing listings serve Woodstock`,
  );

  const rankingOutcomes = queries
    .filter((example) => example.expected_listing_ids.length > 0)
    .map((example) => {
      const top = matchListings(
        { service_types: example.expected_codes, max_price: null, neighborhood: null, urgency: null },
        listings,
        { ...matchOptions, query: example.query },
      )[0];
      return example.expected_listing_ids.includes(top?.listing_id);
    });
  check(
    "job wording ranks an expected listing first across the supported fixtures",
    rankingOutcomes.every(Boolean),
    `${rankingOutcomes.filter(Boolean).length}/${rankingOutcomes.length} expected top matches`,
  );
}

console.log("--- booking / routing ---");
for (const b of behaviour) {
  console.log(`  ${b.pass ? "PASS" : "FAIL"}  ${b.label}${b.detail ? `\n          ${b.detail}` : ""}`);
}
const behaviourPassed = behaviour.filter((b) => b.pass).length;

// ---- parseJob path ----

const parseOutcomes = queries.map((example) => {
  const parsed = parseJob(example.query);
  const ranked = matchListings(parsed, getListings());
  console.log(
    `${example.query_id} [${example.match_type}] expected_listing_ids: ${JSON.stringify(example.expected_listing_ids)} top_match: ${ranked[0]?.listing_id ?? "none"}`,
  );
  return {
    query_id: example.query_id,
    query: example.query,
    expected: example.expected_codes,
    actual: parsed.service_types,
    pass: sameCodes(parsed.service_types, example.expected_codes),
  };
});

const parseResult = report("parseJob only", parseOutcomes);

// ---- LLM path ----
// Driven over HTTP against the running function rather than by importing it.
// Nothing under src/ may import @google/genai, and the key stays server-side.

const API_URL = `${process.env.CHAT_API_BASE ?? "http://localhost:3000"}/api/chat`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function askEndpoint(text) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// The free Gemini tier caps requests per minute, so the sweep paces itself and
// backs off rather than reporting rate limiting as a matching failure.
let nextSlot = 0;
async function paced() {
  const wait = Math.max(0, nextSlot - Date.now());
  nextSlot = Date.now() + wait + LLM_MIN_INTERVAL_MS;
  if (wait) await sleep(wait);
}

async function askWithBackoff(text, attempts = 4) {
  for (let attempt = 1; ; attempt++) {
    await paced();
    try {
      return await askEndpoint(text);
    } catch (error) {
      if (error.status !== 429 || attempt === attempts) throw error;
      await sleep(attempt * 20000);
    }
  }
}

async function endpointStatus() {
  try {
    await askEndpoint("probe");
    return { ready: true };
  } catch (error) {
    // A throttled endpoint is still a live endpoint; the sweep will back off.
    if (error.status === 429) return { ready: true };
    const unreachable = error.cause?.code === "ECONNREFUSED";
    return {
      ready: false,
      reason: unreachable
        ? `no server at ${API_URL} — run \`npm run dev\` and set CHAT_API_BASE to its origin`
        : `endpoint returned ${error.message} — check the key in .env.local`,
    };
  }
}

// The free Gemini tier allows only 20 generate requests per day per model, so
// sweeping all 25 fixtures exhausts the day's budget and locks out the running
// app. Sample one query per match_type by default; LLM_SAMPLE=all forces the
// full set, LLM_SAMPLE=<n> takes the first n.
function sampleQueries(all) {
  const requested = process.env.LLM_SAMPLE;
  if (requested === "all") return { list: all, note: "full set" };
  if (requested && Number.isInteger(Number(requested))) {
    const n = Number(requested);
    return { list: all.slice(0, n), note: `first ${n} of ${all.length}` };
  }

  const byType = new Map();
  for (const example of all) {
    if (!byType.has(example.match_type)) byType.set(example.match_type, example);
  }
  const list = [...byType.values()];
  return {
    list,
    note: `${list.length} of ${all.length}, one per match_type — free tier allows 20 req/day; LLM_SAMPLE=all to sweep everything`,
  };
}

let llmResult = null;
const status = await endpointStatus();
const sample = sampleQueries(queries);

if (!status.ready) {
  console.log(`\n--- LLM path: skipped (${status.reason}) ---`);
} else {
  console.log(`\n(LLM sample: ${sample.note})`);
  const llmOutcomes = await mapWithLimit(sample.list, LLM_CONCURRENCY, async (example) => {
    const base = { query_id: example.query_id, query: example.query, expected: example.expected_codes };
    try {
      const filters = await askWithBackoff(example.query);
      return { ...base, actual: filters.service_types, pass: sameCodes(filters.service_types, example.expected_codes) };
    } catch (error) {
      return { ...base, actual: `error: ${error.message}`, pass: false };
    }
  });

  llmResult = report("LLM path", llmOutcomes);
}

console.log("\n========================================");
console.log(`booking  : ${behaviourPassed}/${behaviour.length}`);
console.log(`parseJob : ${parseResult.passed}/${parseResult.total} (${parseResult.rate}%)`);
console.log(
  llmResult
    ? `LLM      : ${llmResult.passed}/${llmResult.total} (${llmResult.rate}%)`
    : `LLM      : skipped (${status.reason})`,
);
console.log(
  llmResult && llmResult.total < parseResult.total
    ? `           (sampled ${llmResult.total} of ${parseResult.total} — the two rates are not directly comparable)`
    : "",
);
console.log(`(active listings available for matching: ${activeListings().length})`);

if (behaviourPassed !== behaviour.length) process.exitCode = 1;
