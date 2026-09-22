import { getNeighborhoods, getServiceTypes } from "../data/loadData.js";
import { parseJob } from "./parseJob.js";

// The server tries Claude, then Gemini, before giving up — worst case is
// two back-to-back timeouts (4000ms + 3500ms server-side, see chat/api/chat.js)
// plus network/parse overhead. 5000ms was sized for a single-tier call and
// would abort before Gemini ever got a chance to answer.
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
    reply: typeof payload.reply === "string" ? payload.reply.trim().slice(0, 160) : null,
    route: payload.route === "gemini" || payload.route === "claude" ? payload.route : "unknown",
  };
}

// How much the local keyword parse alone can be trusted, independent of
// whether the model is asked at all (it always is now — see the comment in
// getFilters below). This only matters for the *fallback* path, when the
// model call fails: a confident single-code read (measured at 17/18 correct
// against the 25 example-queries.json fixtures) should stand on its own and
// keep the active request going, not get demoted to a clarifying question
// over a network blip that has nothing to do with what the customer said.
// Two or more codes, or zero, is a different story (3/7 and unscoreable
// respectively) and stays "low", same as it always was.
function localConfidence(parsed, text) {
  if (parsed.service_types.length !== 1) return "low";

  // A lone category hit is usually reliable, but vague problem words can turn
  // one incidental noun into false confidence ("My sink is a mess" is the
  // canonical cleaning-vs-plumbing example in the server prompt).
  const vague = /\b(mess|messy|problem|issue|something|not sure|needs attention)\b/i.test(text);
  const decisive = /\b(leak|leaking|drip|clog|blocked|broken|install|replace|repair|clean|wash|mow|move|haul|assemble)\b/i.test(text);
  return vague && !decisive ? "low" : "high";
}

export async function getFilters(text, context = null) {
  const parsed = { ...parseJob(text), clear_filters: detectFilterClears(text) };

  // Some intents are unmistakable from wording alone (a bare "hey", "cancel
  // that", "show me my bookings") — settling those here isn't about request
  // budget, it's that a keyword match is already exactly as correct as a
  // model call would be, so there's nothing to gain by spending one.
  //
  // Everything else used to have a second gate here too: a confident,
  // single-service keyword read (needsExtraction) skipped the model
  // entirely, because the free Gemini tier capped the app at 20 requests a
  // day and a call on every message would have blown through that in
  // minutes. That constraint is gone now that Claude (a paid key) is
  // primary, and removing the gate is a strict improvement on both counts it
  // used to trade off against: measured accuracy against the 25
  // example-queries.json fixtures went from 80% (parseJob alone) to 88%
  // (Claude), and every one of these messages now gets a model-authored
  // `reply` instead of the four-template rotation, which is the entire
  // point of this change. The keyword parse below still always runs, as the
  // fallback if the model call fails.
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
      reply: null,
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
    confidence: localConfidence(parsed, text),
    referenced_listing_id: null,
    clarification_question: null,
    reply: null,
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
