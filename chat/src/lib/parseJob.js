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
  const matches = Object.entries(byCode)
    .filter(([, keywords]) => [...keywords].some((keyword) => includesKeyword(text, keyword)))
    .map(([code]) => code);

  return refineServiceTypes(text, matches);
}

function refineServiceTypes(text, matches) {
  const result = new Set(matches);

  // A bare room name is intentionally ambiguous. Present the relevant
  // categories instead of pretending we know whether "kitchen help" means
  // cleaning, a fixture repair, plumbing, or electrical work.
  if (/\bkitchen\b/.test(text) && /\b(help|work|problem|issue)\b/.test(text)) {
    const hasSpecificSignal = /\b(clean|deep|oven|fridge|faucet|tap|leak|drain|outlet|switch|wiring|install|repair|fix)\b/.test(
      text,
    );
    if (!hasSpecificSignal) {
      return ["cleaning_standard", "cleaning_deep", "handyman_general", "plumbing", "electrical"];
    }
  }

  // "A mess" describes appearance, not a plumbing symptom. Keep plumbing as
  // a possibility for an ambiguous sink request, while also offering cleaning.
  if (/\bsink\b/.test(text) && /\b(mess|dirty|gross|filthy)\b/.test(text)) {
    result.add("cleaning_standard");
    result.add("plumbing");
  }

  // "Moving out" is often context for an end-of-tenancy clean. Only retain
  // moving_help when the request also contains an actual transport signal.
  const isMoveOutCleaning = /\b(move|moving) out\b/.test(text) && /\b(clean|cleaned|cleaning|deposit|landlord)\b/.test(text);
  const hasTransportSignal = /\b(load|unload|truck|u-?haul|storage|movers?|carry|transport)\b/.test(text);
  if (isMoveOutCleaning && !hasTransportSignal) result.delete("moving_help");

  // Flat-pack items are frequently described as being "in boxes"; that alone
  // is not evidence that the customer wants junk removed.
  const isAssemblyRequest = /\b(ikea|flat[- ]?pack|assemble|build)\b/.test(text);
  const hasDiscardSignal = /\b(junk|discard|dispose|donate|throw|curb|remove)\b|\b(take|taken|haul) away\b/.test(text);
  if (isAssemblyRequest && !hasDiscardSignal) result.delete("junk_removal");

  // Furniture being taken away is junk removal unless the customer also asks
  // for transport/loading to another destination.
  const isTakeAwayRequest = /\b(furniture|couch|sofa|mattress|items?)\b.*\b(take|taken|haul) away\b/.test(text);
  if (isTakeAwayRequest && !hasTransportSignal) result.delete("moving_help");

  return [...result];
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
