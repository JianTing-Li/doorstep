import { getExampleQueries, getListings } from "../../data/loadData.js";
import { activeListings } from "../../data/listings.js";
import { parseJob } from "../parseJob.js";
import { matchListings } from "../matchListings.js";

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
        ? `no server at ${API_URL} — start \`vercel dev\` for the LLM path`
        : `endpoint returned ${error.message} — check the key in .env.local`,
    };
  }
}

let llmResult = null;
const status = await endpointStatus();

if (!status.ready) {
  console.log(`\n--- LLM path: skipped (${status.reason}) ---`);
} else {
  const llmOutcomes = await mapWithLimit(queries, LLM_CONCURRENCY, async (example) => {
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
console.log(`parseJob : ${parseResult.passed}/${parseResult.total} (${parseResult.rate}%)`);
console.log(
  llmResult
    ? `LLM      : ${llmResult.passed}/${llmResult.total} (${llmResult.rate}%)`
    : `LLM      : skipped (${status.reason})`,
);
console.log(`(active listings available for matching: ${activeListings().length})`);
