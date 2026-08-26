import { getNeighborhoods, getServiceTypes } from "../data/loadData.js";
import { parseJob } from "./parseJob.js";

// The server now tries Gemini, then Claude, before giving up — worst case is
// two back-to-back timeouts (3500ms + 4000ms server-side, see chat/api/chat.js)
// plus network/parse overhead. 5000ms was sized for a single-tier call and
// would abort before Claude ever got a chance to answer.
const TIMEOUT_MS = 8000;
import { INTENT_PRIORITY, detectFilterClears, detectLocalIntent } from "./intents.js";

const VALID_INTENTS = new Set(INTENT_PRIORITY);
const VALID_CLEAR_FILTERS = new Set(["service_types", "max_price", "neighborhood", "urgency"]);
const VALID_CONFIDENCE = new Set(["high", "medium", "low"]);
const VALID_URGENCY = new Set(["urgent", "today", "tomorrow", "this_week"]);

// Whatever the model returns is untrusted until it matches the real vocabulary.
function sanitize(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (!Array.isArray(payload.service_types)) return null;

  const validCodes = new Set(getServiceTypes().map(({ code }) => code));
  const validNames = new Set(getNeighborhoods().map(({ name }) => name));

  return {
    intent: VALID_INTENTS.has(payload.intent) ? payload.intent : "job",
    service_types: payload.service_types.filter((code) => validCodes.has(code)),
    max_price: typeof payload.max_price === "number" ? payload.max_price : null,
    neighborhood: validNames.has(payload.neighborhood) ? payload.neighborhood : null,
    urgency: VALID_URGENCY.has(payload.urgency) ? payload.urgency : null,
    clear_filters: Array.isArray(payload.clear_filters)
      ? payload.clear_filters.filter((key) => VALID_CLEAR_FILTERS.has(key))
      : [],
    confidence: VALID_CONFIDENCE.has(payload.confidence) ? payload.confidence : "medium",
    referenced_listing_id: typeof payload.referenced_listing_id === "string" ? payload.referenced_listing_id : null,
    clarification_question: typeof payload.clarification_question === "string"
      ? payload.clarification_question.trim().slice(0, 180)
      : null,
    route: payload.route === "gemini" || payload.route === "claude" ? payload.route : "unknown",
  };
}

// Measured against the 25 fixtures in example-queries.json: when parseJob lands
// on exactly one service type it is right 17 times out of 18, but when it lands
// on two or more it is right only 3 times out of 7, and an empty read tells us
// nothing (it cannot tell "off topic" from "words I don't know").
//
// So only those two shapes are worth spending a request on. That keeps roughly
// 72% of messages off the API, which is what makes the free tier's 20 requests
// per day usable — a call on every message would cap the app at 20 messages.
function needsExtraction(parsed, text) {
  const count = parsed.service_types.length;
  if (count === 0 || count >= 2) return true;

  // A lone category hit is usually reliable, but vague problem words can turn
  // one incidental noun into false confidence ("My sink is a mess" is the
  // canonical cleaning-vs-plumbing example in the server prompt).
  const vague = /\b(mess|messy|problem|issue|something|not sure|needs attention)\b/i.test(text);
  const decisive = /\b(leak|leaking|drip|clog|blocked|broken|install|replace|repair|clean|wash|mow|move|haul|assemble)\b/i.test(text);
  return vague && !decisive;
}

export async function getFilters(text, context = null) {
  const parsed = { ...parseJob(text), clear_filters: detectFilterClears(text) };

  // Some intents are unmistakable from wording alone. Settling them here keeps
  // them working without a key and spends none of the daily request budget.
  const local = detectLocalIntent(text, context);
  if (local) {
    return {
      ...parsed,
      intent: local,
      source: "keyword",
      route: "keyword",
      confidence: "high",
      referenced_listing_id: null,
      clarification_question: null,
    };
  }

  // A confident single-code keyword read; no request needed.
  if (!needsExtraction(parsed, text)) {
    return {
      ...parsed,
      intent: "job",
      source: "keyword",
      route: "keyword",
      confidence: "high",
      referenced_listing_id: null,
      clarification_question: null,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // "fallback" means the model was worth asking but could not be reached, so
  // the reply hedges. "keyword" above means we chose not to ask, and stands on
  // its own.
  const changesActiveRequest = Boolean(
    context?.active_request &&
    (parsed.clear_filters.length > 0 || parsed.max_price != null || parsed.neighborhood || parsed.urgency),
  );
  const fallback = {
    ...parsed,
    intent: changesActiveRequest ? "change_filters" : "job",
    source: "fallback",
    route: "parser",
    confidence: "low",
    referenced_listing_id: null,
    clarification_question: null,
  };

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, context }),
      signal: controller.signal,
    });

    if (!response.ok) return fallback;

    const sanitized = sanitize(await response.json());
    return sanitized ? { ...sanitized, source: "llm" } : fallback;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}
