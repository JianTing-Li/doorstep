import { GoogleGenAI, Type } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { getNeighborhoods, getServiceTypes } from "../src/data/loadData.js";

// The build spec named gemini-2.5-flash, but every 2.5-era model 404s for new
// API users ("no longer available to new users") — flash and flash-lite alike.
//
// Of the models this key can reach, the flash-lite line reports zero thinking
// tokens, while gemini-3.6-flash spent 129 of them on a two-token prompt.
// Thinking is billed on top of output and buys nothing here: the schema is
// enum-constrained and temperature is 0, so there is nothing to reason about.
//
// Pinned rather than using the `gemini-flash-lite-latest` alias, which would
// change models underneath us and make the test pass rate unreproducible.
const MODEL = "gemini-3.5-flash-lite";

// Fallback tier, tried only when Gemini errors, times out, or returns
// something that fails schema validation — never on a low-confidence but
// otherwise valid Gemini read (see isValidExtraction / extractFilters below).
// Haiku is the right size here: this is enum-constrained classification, not
// open-ended reasoning, and this tier only fires on Gemini outages, so its
// speed/cost profile matters more than raw capability.
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

// The client aborts the whole request at 8000ms (getFilters.js) to keep a
// hard ceiling on how long a customer waits. These two budgets are sized to
// fit inside that with room to spare even in the worst case (both tiers time
// out back to back: 3500 + 4000 = 7500ms), rather than each independently
// being "generous" and the pair together blowing past what the client will
// still be listening for.
const GEMINI_TIMEOUT_MS = 3500;
const CLAUDE_TIMEOUT_MS = 4000;

const URGENCY_VALUES = ["urgent", "today", "tomorrow", "this_week"];

// Ordered most-specific first. Where a message could plausibly be read as more
// than one of these, the earlier value wins.
const INTENTS = [
  "cancel_booking",
  "change_filters",
  "more_details",
  "compare",
  "list_bookings",
  "greeting",
  "help",
  "unsupported_service",
  "job",
  "unclear",
  "off_topic",
];

const SERVICE_CODES = getServiceTypes().map(({ code }) => code);
const NEIGHBORHOOD_NAMES = getNeighborhoods().map(({ name }) => name);

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    intent: { type: Type.STRING, enum: INTENTS },
    service_types: { type: Type.ARRAY, items: { type: Type.STRING, enum: SERVICE_CODES } },
    max_price: { type: Type.NUMBER, nullable: true },
    neighborhood: { type: Type.STRING, enum: NEIGHBORHOOD_NAMES, nullable: true },
    urgency: { type: Type.STRING, enum: URGENCY_VALUES, nullable: true },
  },
  required: ["intent", "service_types"],
};

function buildSystemInstruction() {
  const catalogue = getServiceTypes()
    .map(({ code, label, description }) => `- ${code} (${label}): ${description}`)
    .join("\n");

  // Five of the six examples are real fixtures from example-queries.json. The
  // budget-only case is written here because the fixture set has no query that
  // states a budget without also naming a job.
  return `You extract structured search filters from a Portland home-services customer's message.
You never answer the customer, never give advice, never chat. You only classify and extract.

The only service types that exist:
${catalogue}

The only neighborhoods that exist:
${NEIGHBORHOOD_NAMES.join(", ")}

Rules:
- intent "job": the message describes household work that maps to one or more service types above.
- intent "unsupported_service": the message asks for a household service outside the available list
  (painting, roofing, childcare, pet care, pest control). Return an empty service_types.
- intent "off_topic": the message is not about a household job. Return an empty service_types.
- intent "unclear": it is a household job but too vague to pick confidently between plausible types.
  Still return every plausible service type so the customer can be asked about them.
- intent "list_bookings": asking to see what THEY have already booked in this session.
- intent "cancel_booking": asking to undo or cancel a booking they already made.
- intent "change_filters": adjusting the CURRENT search rather than starting a new one —
  a new ceiling, a different area, or dropping one service type they no longer want.
- intent "more_details": a question about a listing or provider already under discussion.
- intent "compare": asking how the listings already on screen differ.
- intent "greeting": a bare hello with no request attached.
- intent "help": asking what this assistant can do or how it works.

Asking to see LISTINGS is a "job" with empty service_types, not "list_bookings".
"Show me all bookings" is list_bookings; "show me all listings" is job.

When a message fits more than one, prefer in this order:
${INTENTS.join(" > ")}
- Never invent a service code or a neighborhood name. Use only the exact strings above.
- max_price is the customer's stated ceiling in whole dollars, else null.
- urgency is one of ${URGENCY_VALUES.join(", ")}, else null.

Examples:

Input: "I have three IKEA wardrobes sitting in boxes that I am never going to build myself."
Output: {"intent":"job","service_types":["handyman_general"],"max_price":null,"neighborhood":null,"urgency":null}

Input: "I want a ceiling fan put in where the old light fixture is."
Output: {"intent":"job","service_types":["handyman_general","electrical"],"max_price":null,"neighborhood":null,"urgency":null}

Input: "Grass is knee high and the strip by the sidewalk looks feral."
Output: {"intent":"job","service_types":["yard_outdoor"],"max_price":null,"neighborhood":null,"urgency":null}

Input: "Whatever you have in Sellwood for under $150, I am not fussy."
Output: {"intent":"job","service_types":[],"max_price":150,"neighborhood":"Sellwood","urgency":null}

Input: "My sink is a mess."
Output: {"intent":"unclear","service_types":["cleaning_standard","plumbing"],"max_price":null,"neighborhood":null,"urgency":null}

Input: "Can someone paint the exterior of my house?"
Output: {"intent":"unsupported_service","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "show me all bookings"
Output: {"intent":"list_bookings","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "what have I booked so far"
Output: {"intent":"list_bookings","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "show me all listings"
Output: {"intent":"job","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "what's available"
Output: {"intent":"job","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "cancel the ceiling fan one"
Output: {"intent":"cancel_booking","service_types":["handyman_general","electrical"],"max_price":null,"neighborhood":null,"urgency":null}

Input: "never mind on that booking, undo it"
Output: {"intent":"cancel_booking","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "actually make it under $100"
Output: {"intent":"change_filters","service_types":[],"max_price":100,"neighborhood":null,"urgency":null}

Input: "just handyman, drop electrical"
Output: {"intent":"change_filters","service_types":["handyman_general"],"max_price":null,"neighborhood":null,"urgency":null}

Input: "somewhere in Sellwood instead"
Output: {"intent":"change_filters","service_types":[],"max_price":null,"neighborhood":"Sellwood","urgency":null}

Input: "does Dan do electrical too"
Output: {"intent":"more_details","service_types":["electrical"],"max_price":null,"neighborhood":null,"urgency":null}

Input: "what's included in that price"
Output: {"intent":"more_details","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "how long does that take"
Output: {"intent":"more_details","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "which one's cheaper"
Output: {"intent":"compare","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "what's the difference between these two"
Output: {"intent":"compare","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "hey"
Output: {"intent":"greeting","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "what can you do"
Output: {"intent":"help","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

Input: "how does this work"
Output: {"intent":"help","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}`;
}

function isRateLimit(error) {
  return error?.status === 429 || /"code":\s*429/.test(String(error?.message ?? ""));
}

function normalize(raw) {
  return {
    intent: raw?.intent ?? "unclear",
    service_types: Array.isArray(raw?.service_types) ? raw.service_types : [],
    max_price: typeof raw?.max_price === "number" ? raw.max_price : null,
    neighborhood: typeof raw?.neighborhood === "string" ? raw.neighborhood : null,
    urgency: typeof raw?.urgency === "string" ? raw.urgency : null,
  };
}

// A response that parses as JSON but doesn't actually carry the shape we
// asked for (missing intent, service_types not an array, an intent outside
// the enum) is a failure to escalate on, same as a thrown error — this is
// what "fails schema validation" means for the Gemini -> Claude trigger.
// Confidence is never part of this check: a low-confidence-but-well-formed
// read from either model is a legitimate result, not a failure.
function isValidExtraction(raw) {
  return (
    raw != null &&
    typeof raw === "object" &&
    INTENTS.includes(raw.intent) &&
    Array.isArray(raw.service_types)
  );
}

function withTimeout(promise, label, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Claude has no equivalent of Gemini's enforced responseSchema, so the "return
// ONLY JSON" instruction has to be explicit here — it does not carry over
// from the Gemini prompt automatically. A defensive fence-strip in case it
// wraps the JSON in ```json anyway despite the instruction.
function stripCodeFence(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

// Reads the key from the environment at call time and never returns, logs, or
// embeds it anywhere in the response.
async function extractFiltersGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini is not configured");

  const ai = new GoogleGenAI({ apiKey });
  const response = await withTimeout(
    ai.models.generateContent({
      model: MODEL,
      contents: text,
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        systemInstruction: buildSystemInstruction(),
      },
    }),
    "Gemini",
    GEMINI_TIMEOUT_MS,
  );

  const raw = JSON.parse(response.text);
  if (!isValidExtraction(raw)) throw new Error("Gemini response failed schema validation");
  return normalize(raw);
}

// Same prompt as Gemini, adapted to Claude's message format: the system
// instruction moves to the `system` param instead of `systemInstruction`,
// and — since there is no responseSchema to enforce shape — the prompt gets
// an explicit "JSON only" instruction Gemini doesn't need.
async function extractFiltersClaude(text) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Claude is not configured");

  const anthropic = new Anthropic({ apiKey });
  const system =
    buildSystemInstruction() +
    "\n\nRespond with ONLY the JSON object described above — no preamble, no markdown code fence, no explanation.";

  const message = await withTimeout(
    anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      temperature: 0,
      system,
      messages: [{ role: "user", content: text }],
    }),
    "Claude",
    CLAUDE_TIMEOUT_MS,
  );

  const block = message.content?.find((c) => c.type === "text");
  if (!block?.text) throw new Error("Claude response had no text content");

  const raw = JSON.parse(stripCodeFence(block.text));
  if (!isValidExtraction(raw)) throw new Error("Claude response failed schema validation");
  return normalize(raw);
}

// Gemini -> Claude -> (caller's existing non-200 path, which the client
// already turns into its own keyword parseJob fallback — see getFilters.js).
// Escalates only on a thrown error (API error, timeout, or the schema-
// validation throws above) — never on confidence, so a legitimate
// low-confidence-but-valid Gemini read is used as-is and never reaches
// Claude. The tier that actually served the request is logged (not the
// content of the response or either key) so fallback frequency is visible.
async function extractFilters(text) {
  try {
    const result = await extractFiltersGemini(text);
    console.log("chat/api/chat: served by gemini");
    return result;
  } catch (geminiError) {
    console.log("chat/api/chat: gemini unavailable, trying claude —", geminiError.message);
    try {
      const result = await extractFiltersClaude(text);
      console.log("chat/api/chat: served by claude");
      return result;
    } catch (claudeError) {
      console.log("chat/api/chat: claude also unavailable —", claudeError.message);
      throw claudeError;
    }
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const text = typeof request.body?.text === "string" ? request.body.text.trim() : "";
  if (!text) return response.status(400).json({ error: "Missing text" });

  // A missing Gemini key now routes through the same try/catch as any other
  // Gemini failure (extractFiltersGemini throws on it) and gets the same
  // shot at Claude, rather than short-circuiting straight to a 503. Either
  // way the response is a plain non-200 with no detail — the client falls
  // back to parseJob on its own; it is never told why.
  try {
    return response.status(200).json(await extractFilters(text));
  } catch (error) {
    // Pass rate limiting through as 429 so callers can back off. Nothing about
    // the key or the upstream response body is forwarded.
    if (isRateLimit(error)) return response.status(429).json({ error: "Rate limited" });
    return response.status(502).json({ error: "Extraction failed" });
  }
}
