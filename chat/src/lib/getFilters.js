import { getNeighborhoods, getServiceTypes } from "../data/loadData.js";
import { parseJob } from "./parseJob.js";

const TIMEOUT_MS = 5000;
const VALID_INTENTS = new Set(["job", "off_topic", "unclear"]);

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

function fallback(text) {
  return { ...parseJob(text), intent: "job", source: "fallback" };
}

export async function getFilters(text) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    if (!response.ok) return fallback(text);

    const sanitized = sanitize(await response.json());
    return sanitized ? { ...sanitized, source: "llm" } : fallback(text);
  } catch {
    return fallback(text);
  } finally {
    clearTimeout(timeout);
  }
}
