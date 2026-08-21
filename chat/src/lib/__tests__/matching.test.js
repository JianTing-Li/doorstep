import { getExampleQueries, getListings } from "../../data/loadData.js";
import { activeListings } from "../../data/listings.js";
import { parseJob } from "../parseJob.js";
import { matchListings } from "../matchListings.js";
import { applyBooking, findBundle, remainingCodes } from "../booking.js";

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
