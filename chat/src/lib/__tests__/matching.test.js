import { getExampleQueries, getListings } from "../../data/loadData.js";
import { activeListings } from "../../data/listings.js";
import { parseJob } from "../parseJob.js";
import { matchListings } from "../matchListings.js";

function sameCodes(actual, expected) {
  if (actual.length !== expected.length) return false;
  const expectedSet = new Set(expected);
  return actual.every((code) => expectedSet.has(code));
}

const queries = getExampleQueries();
const listings = activeListings();
let passCount = 0;

for (const example of queries) {
  const parsed = parseJob(example.query);
  const ranked = matchListings(parsed, getListings());
  const pass = sameCodes(parsed.service_types, example.expected_codes);
  if (pass) passCount += 1;

  console.log(`${example.query_id} [${example.match_type}] expected_listing_ids: ${JSON.stringify(example.expected_listing_ids)} top_match: ${ranked[0]?.listing_id ?? "none"}`);

  if (!pass) {
    console.log(
      `  FAIL ${example.query_id}: "${example.query}"\n` +
        `    expected: ${JSON.stringify(example.expected_codes)}\n` +
        `    actual:   ${JSON.stringify(parsed.service_types)}`,
    );
  }
}

const passRate = ((passCount / queries.length) * 100).toFixed(1);
console.log(`\nparseJob pass rate: ${passCount}/${queries.length} (${passRate}%)`);
console.log(`(active listings available for matching: ${listings.length})`);
