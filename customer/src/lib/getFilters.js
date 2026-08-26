import { getNeighborhoods, getServiceTypes } from "../data/loadData.js";
import { parseJob } from "./parseJob.js";

// The server now tries Gemini, then Claude, before giving up — worst case is
// two back-to-back timeouts (3500ms + 4000ms server-side, see chat/api/chat.js)
// plus network/parse overhead. 5000ms was sized for a single-tier call and
// would abort before Claude ever got a chance to answer.
const TIMEOUT_MS = 8000;
import { INTENT_PRIORITY, detectLocalIntent } from "./intents.js";

const VALID_INTENTS = new Set(INTENT_PRIORITY);

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
    urgency: typeof payload.urgency === "string" ? payload.urgency : null,
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
function needsExtraction(parsed) {
  const count = parsed.service_types.length;
  return count === 0 || count >= 2;
}

export async function getFilters(text) {
  const parsed = parseJob(text);

  // Some intents are unmistakable from wording alone. Settling them here keeps
  // them working without a key and spends none of the daily request budget.
  const local = detectLocalIntent(text);
  if (local) return { ...parsed, intent: local, source: "keyword" };

  // A confident single-code keyword read; no request needed.
  if (!needsExtraction(parsed)) return { ...parsed, intent: "job", source: "keyword" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // "fallback" means the model was worth asking but could not be reached, so
  // the reply hedges. "keyword" above means we chose not to ask, and stands on
  // its own.
  const fallback = { ...parsed, intent: "job", source: "fallback" };

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
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
