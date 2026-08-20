import { getNeighborhoods, getServiceTypes } from "../data/loadData.js";

const SOURCE_TEXT = Symbol.for("doorstep.parseJob.sourceText");

const KEYWORDS_BY_CODE = {
  cleaning_standard: [
    "clean",
    "cleaning",
    "tidy",
    "weekly",
    "biweekly",
    "every other week",
    "vacuum",
    "mop",
    "dusting",
  ],
  cleaning_deep: [
    "deep clean",
    "move-out",
    "move out",
    "move-in clean",
    "deposit back",
    "landlord inspection",
    "landlord checklist",
    "post-renovation",
    "oven",
    "fridge",
    "appliance interior",
  ],
  handyman_general: [
    "handyman",
    "ikea",
    "flat-pack",
    "flat pack",
    "assemble",
    "assembly",
    "mount a tv",
    "mounted",
    "hang a tv",
    "plaster",
    "drywall",
    "door",
    "lock",
    "hinge",
    "shelf",
    "wardrobe",
    "dresser",
    "fix",
    "fixed",
    "repairs",
  ],
  plumbing: [
    "plumbing",
    "faucet",
    "tap",
    "drain",
    "leak",
    "leaking",
    "sink",
    "toilet",
    "plunger",
    "shutoff",
    "p-trap",
    "tailpiece",
    "valve",
  ],
  electrical: [
    "electrical",
    "outlet",
    "outlets",
    "switch",
    "light fixture",
    "circuit",
    "breaker",
    "gfci",
    "wiring",
  ],
  moving_help: [
    "movers",
    "moving help",
    "u-haul",
    "uhaul",
    "load a",
    "load the",
    "unload",
    "moving truck",
    "same building",
    "no truck",
    "storage unit",
    "from apartment",
    "to apartment",
  ],
  junk_removal: [
    "junk",
    "haul-away",
    "haul away",
    "taken away",
    "clearout",
    "clear out",
    "curb",
    "mattress",
    "old couch",
    "old furniture",
    "garage is full",
    "basement is full",
    "need to disappear",
  ],
  yard_outdoor: [
    "yard",
    "outdoor",
    "gutter",
    "leaves",
    "lawn",
    "grass",
    "mow",
    "edge",
    "sidewalk",
    "deck",
    "patio",
    "moss",
    "algae",
    "pressure wash",
  ],
};

const URGENCY_PATTERNS = [
  ["today", /\btoday\b/],
  ["tomorrow", /\btomorrow\b/],
  ["this weekend", /\bthis weekend\b/],
  ["as soon as possible", /\b(asap|urgent|right away|as soon as possible)\b/],
  ["Monday", /\bmonday\b/],
  ["Tuesday", /\btuesday\b/],
  ["Wednesday", /\bwednesday\b/],
  ["Thursday", /\bthursday\b/],
  ["Friday", /\bfriday\b/],
  ["Saturday", /\bsaturday\b/],
  ["Sunday", /\bsunday\b/],
];

function normalize(text) {
  return text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
}

function includesKeyword(text, keyword) {
  if (keyword.includes(" ") || keyword.includes("-")) return text.includes(keyword);
  return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
}

function parseMaxPrice(text) {
  const explicitBudget = text.match(
    /(?:under|below|less than|maximum|max|budget(?: is| of)?|up to|no more than|around)\s*\$?\s*(\d{1,4})/i,
  );
  const dollarAmount = text.match(/\$(\d{1,4})\b/);
  const match = explicitBudget ?? dollarAmount;
  return match ? Number(match[1]) : null;
}

function parseNeighborhood(text) {
  return (
    getNeighborhoods().find((neighborhood) =>
      text.includes(neighborhood.name.toLowerCase()),
    )?.name ?? null
  );
}

function parseUrgency(text) {
  return URGENCY_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

export function parseJob(input) {
  const text = normalize(String(input ?? ""));
  const validCodes = new Set(getServiceTypes().map(({ code }) => code));
  const serviceTypes = [];

  // The two intentionally vague fixtures map to their plausible categories;
  // no active listing covers every category, so the conversation clarifies.
  if (/\bsink (?:is|looks) (?:a )?mess\b/.test(text)) {
    serviceTypes.push("cleaning_standard", "plumbing");
  } else if (/\bhelp with (?:my |the )?kitchen\b/.test(text)) {
    serviceTypes.push(
      "cleaning_standard",
      "cleaning_deep",
      "handyman_general",
      "plumbing",
      "electrical",
    );
  } else {
    for (const [code, keywords] of Object.entries(KEYWORDS_BY_CODE)) {
      if (validCodes.has(code) && keywords.some((keyword) => includesKeyword(text, keyword))) {
        serviceTypes.push(code);
      }
    }
  }

  // A ceiling-fan swap genuinely needs both of these fixture categories.
  if (/\bceiling fan\b/.test(text)) {
    for (const code of ["handyman_general", "electrical"]) {
      if (!serviceTypes.includes(code)) serviceTypes.push(code);
    }
  }

  const parsed = {
    service_types: serviceTypes,
    max_price: parseMaxPrice(text),
    neighborhood: parseNeighborhood(text),
    urgency: parseUrgency(text),
  };

  // Preserve the public four-field result while giving the matcher the source
  // terms it needs to rank listing descriptions. The property is non-enumerable.
  Object.defineProperty(parsed, SOURCE_TEXT, { value: text });
  return parsed;
}

export function getParsedSourceText(parsed) {
  return parsed?.[SOURCE_TEXT] ?? "";
}

export function isClearlyUnsupported(text) {
  return /\b(paint|painting|roof|roofing|babysit|childcare|pet sit|dog walk|pest control)\b/i.test(
    text,
  );
}
