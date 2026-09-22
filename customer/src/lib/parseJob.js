import { getNeighborhoods, getServiceTypes } from "../data/loadData.js";

// Colloquial phrasings that don't already appear in a service type's own
// label or description text.
const SYNONYMS_BY_CODE = {
  cleaning_standard: ["clean", "tidy", "vacuum", "mop", "weekly", "biweekly", "recurring"],
  cleaning_deep: ["deep clean", "moving out", "move out", "deposit", "landlord", "inspection", "oven", "fridge"],
  handyman_general: [
    "handyman",
    "ikea",
    "flat-pack",
    "flat pack",
    "assemble",
    "mount",
    "mounted",
    "hang a tv",
    "shelf",
    "hinge",
    "repair",
    "fix",
    "install",
    "put in",
  ],
  plumbing: ["faucet", "tap", "drip", "dripping", "leak", "leaking", "plunger", "valve", "pipe", "toilet"],
  electrical: ["outlet", "switch", "wiring", "circuit", "breaker", "ceiling fan", "fixture"],
  moving_help: ["movers", "mover", "u-haul", "uhaul", "load", "unload", "truck", "storage"],
  junk_removal: ["junk", "haul away", "haul-away", "clear out", "curb", "curbside", "mattress", "couch"],
  yard_outdoor: ["yard", "lawn", "mow", "mowing", "grass", "gutter", "leaves", "moss", "pressure wash", "edge", "sidewalk"],
};

// Words pulled from service-type labels/descriptions that are too generic to
// be useful signals on their own (they show up across many unrelated jobs).
const STOP_WORDS = new Set(["and", "the", "or", "for", "with", "under", "apartment", "house", "help", "home", "regular"]);

function wordsFrom(text) {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word));
}

function includesKeyword(text, keyword) {
  if (keyword.includes(" ") || keyword.includes("-")) return text.includes(keyword);
  return new RegExp(`\\b${keyword}\\b`).test(text);
}

function keywordsByCode() {
  const map = {};
  for (const { code, label, description } of getServiceTypes()) {
    const keywords = new Set(wordsFrom(`${label} ${description}`));
    for (const synonym of SYNONYMS_BY_CODE[code] ?? []) keywords.add(synonym.toLowerCase());
    map[code] = keywords;
  }
  return map;
}

function parseServiceTypes(text) {
  const byCode = keywordsByCode();
  return Object.entries(byCode)
    .filter(([, keywords]) => [...keywords].some((keyword) => includesKeyword(text, keyword)))
    .map(([code]) => code);
}

function parseMaxPrice(text) {
  const explicit = text.match(
    /(?:under|below|less than|max(?:imum)?|budget(?: is| of)?|up to|no more than)\s*\$?\s*(\d{1,4})/,
  );
  const dollar = text.match(/\$\s*(\d{1,4})/);
  const match = explicit ?? dollar;
  return match ? Number(match[1]) : null;
}

function parseNeighborhood(text) {
  const match = getNeighborhoods().find((neighborhood) => text.includes(neighborhood.name.toLowerCase()));
  return match ? match.name : null;
}

const URGENCY_BUCKETS = [
  ["urgent", /\b(asap|urgent|right away|emergency)\b/],
  ["today", /\btoday\b/],
  ["tomorrow", /\btomorrow\b/],
  ["this_week", /\b(this week|this weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/],
];

function parseUrgency(text) {
  const bucket = URGENCY_BUCKETS.find(([, pattern]) => pattern.test(text));
  return bucket ? bucket[0] : null;
}

export function parseJob(text) {
  const normalized = String(text ?? "").toLowerCase().trim();

  return {
    service_types: parseServiceTypes(normalized),
    max_price: parseMaxPrice(normalized),
    neighborhood: parseNeighborhood(normalized),
    urgency: parseUrgency(normalized),
  };
}
