import { GoogleGenAI, Type } from "@google/genai";
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
- intent "off_topic": the message is not about a household job, or names a service outside the list
  (painting, roofing, childcare, pet care, pest control). Return an empty service_types.
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
Output: {"intent":"off_topic","service_types":[],"max_price":null,"neighborhood":null,"urgency":null}

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

// Reads the key from the environment at call time and never returns, logs, or
// embeds it anywhere in the response.
async function extractFilters(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini is not configured");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: text,
    config: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      systemInstruction: buildSystemInstruction(),
    },
  });

  return normalize(JSON.parse(response.text));
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const text = typeof request.body?.text === "string" ? request.body.text.trim() : "";
  if (!text) return response.status(400).json({ error: "Missing text" });

  // A missing key is a plain non-200 with no detail. The client falls back to
  // parseJob on its own; it is never told why.
  if (!process.env.GEMINI_API_KEY) {
    return response.status(503).json({ error: "Unavailable" });
  }

  try {
    return response.status(200).json(await extractFilters(text));
  } catch (error) {
    // Pass rate limiting through as 429 so callers can back off. Nothing about
    // the key or the upstream response body is forwarded.
    if (isRateLimit(error)) return response.status(429).json({ error: "Rate limited" });
    return response.status(502).json({ error: "Extraction failed" });
  }
}
