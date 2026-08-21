import { useRef, useState } from "react";
import ChatThread from "./components/ChatThread.jsx";
import ChatInput from "./components/ChatInput.jsx";
import ExampleChips from "./components/ExampleChips.jsx";
import FilterChips from "./components/FilterChips.jsx";
import { getFilters } from "./lib/getFilters.js";
import { parseJob } from "./lib/parseJob.js";
import { matchListings } from "./lib/matchListings.js";
import { createBooking, findBundle, remainingCodes } from "./lib/booking.js";
import { activeListings } from "./data/listings.js";
import { getProviders, getServiceTypes } from "./data/loadData.js";

const RESULTS_DISPLAY_CAP = 5;
const THINKING_DELAY_MS = 450;
const MAX_INPUT_LENGTH = 500;
const MAX_UNCLEAR_TURNS = 2;

const EMPTY_FILTERS = { service_types: [], max_price: null, neighborhood: null, urgency: null };

const OFF_TOPIC_REPLIES = [
  "I can only help you find home services. Try describing a job you need done.",
  "That one's outside what I do. What needs fixing, cleaning, or moving?",
];

const EMPTY_NUDGE = "Tell me what needs doing and I'll find someone. A job, a room, or a mess all work.";

function labelsFor(codes) {
  const labelByCode = Object.fromEntries(getServiceTypes().map(({ code, label }) => [code, label]));
  return codes.map((code) => labelByCode[code] ?? code);
}

function joinLabels(codes) {
  const labels = labelsFor(codes);
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

function enrichResults(rankedListings, filters) {
  const providersById = new Map(getProviders().map((provider) => [provider.provider_id, provider]));
  const labelByCode = Object.fromEntries(getServiceTypes().map(({ code, label }) => [code, label]));

  return rankedListings.slice(0, RESULTS_DISPLAY_CAP).map((listing) => {
    const matchedLabels = (filters.service_types ?? [])
      .filter((code) => listing.service_type.includes(code))
      .map((code) => labelByCode[code]);

    return {
      ...listing,
      provider: providersById.get(listing.provider_id) ?? null,
      matchedLabels,
      reason: matchedLabels.length > 0 ? `Covers ${matchedLabels.join(" and ")}` : "Highly rated on Doorstep",
    };
  });
}

function botReplyFor(totalCount, shownCount, source) {
  // The keyword path reads intent less reliably, so the copy says less and
  // points at the chips the customer can correct.
  if (source === "fallback") {
    const lead =
      totalCount > shownCount
        ? `Here are ${shownCount} that look close.`
        : `Here ${totalCount === 1 ? "is one that looks" : `are ${totalCount} that look`} close.`;
    return `${lead} Adjust the filters below if I read that wrong.`;
  }

  if (totalCount > shownCount) return `Found ${totalCount} matches — here are the closest ${shownCount}.`;
  return `Found ${totalCount} match${totalCount === 1 ? "" : "es"} for that.`;
}

// Typed text wins over an active chip; this explains the change in one line.
function conflictNote(previous, next) {
  const changes = [];
  if (previous.max_price != null && next.max_price != null && previous.max_price !== next.max_price) {
    changes.push(`budget to $${next.max_price}`);
  }
  if (previous.neighborhood && next.neighborhood && previous.neighborhood !== next.neighborhood) {
    changes.push(`neighborhood to ${next.neighborhood}`);
  }
  if (changes.length === 0) return null;
  return `Updated your ${changes.join(" and ")}.`;
}

let nextId = 1;
function makeId() {
  return nextId++;
}

const EMPTY_CONVERSATION = {
  requestedCodes: [],
  coveredCodes: [],
  bundleOffered: false,
  jobText: "",
  unclearTurns: 0,
  offTopicIndex: 0,
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [isTyping, setIsTyping] = useState(false);

  // Chip removal and booking taps run after the state that produced them was
  // captured, so these reads come from refs rather than stale closures.
  const filtersRef = useRef(EMPTY_FILTERS);
  const conversationRef = useRef(EMPTY_CONVERSATION);

  function appendMessage(message) {
    const withId = { id: makeId(), ...message };
    setMessages((current) => [...current, withId]);
  }

  function applyFilters(next) {
    filtersRef.current = next;
    setFilters(next);
  }

  function updateConversation(patch) {
    conversationRef.current = { ...conversationRef.current, ...patch };
  }

  function rankFor(codes) {
    const scoped = { ...EMPTY_FILTERS, service_types: codes };
    return enrichResults(matchListings(scoped, activeListings()), scoped);
  }

  // ---- results ----

  function showResults(nextFilters, source, originalText) {
    const previous = filtersRef.current;
    applyFilters(nextFilters);
    setIsTyping(false);

    const note = conflictNote(previous, nextFilters);
    if (note) appendMessage({ type: "bot_text", text: note });

    const requested = nextFilters.service_types ?? [];
    const hasConstraint = nextFilters.max_price != null || nextFilters.neighborhood != null;

    // Nothing to go on at all — nudge rather than error.
    if (requested.length === 0 && !hasConstraint) {
      appendMessage({ type: "bot_text", text: EMPTY_NUDGE, showExamples: true });
      return;
    }

    let ranked = matchListings(nextFilters, activeListings());

    // A confident-looking model answer that matches nothing is worth one retry
    // through the keyword reader before giving up.
    if (ranked.length === 0 && source === "llm" && originalText) {
      const retry = { ...parseJob(originalText) };
      const retryRanked = matchListings(retry, activeListings());
      if (retryRanked.length > 0) {
        applyFilters(retry);
        ranked = retryRanked;
        nextFilters = retry;
      }
    }

    // Still nothing: say so plainly and show the closest active listings.
    if (ranked.length === 0) {
      const closest = enrichResults(matchListings(EMPTY_FILTERS, activeListings()), EMPTY_FILTERS);
      appendMessage({
        type: "bot_text",
        text: "Nothing matches that exactly. Here are the closest I have.",
      });
      appendMessage({ type: "results", results: closest });
      return;
    }

    updateConversation({ requestedCodes: requested, coveredCodes: [], bundleOffered: false });

    // Bundle branch: one provider can cover the whole job.
    const bundle = findBundle(requested, activeListings());
    if (bundle && !conversationRef.current.bundleOffered) {
      const providersById = new Map(getProviders().map((p) => [p.provider_id, p]));
      const name = providersById.get(bundle.provider_id)?.name ?? "One provider";
      updateConversation({ bundleOffered: true });
      appendMessage({
        type: "bot_text",
        text: `${name} can cover ${joinLabels(requested)} in one visit.`,
      });
    }

    const results = enrichResults(ranked, nextFilters);
    appendMessage({ type: "bot_text", text: botReplyFor(ranked.length, results.length, source) });
    appendMessage({ type: "results", results });
  }

  // ---- input ----

  async function handleUserText(rawText) {
    const text = String(rawText ?? "").trim().slice(0, MAX_INPUT_LENGTH);
    if (!text) return;

    appendMessage({ type: "user_text", text });
    updateConversation({ jobText: text });
    setIsTyping(true);

    const result = await getFilters(text);

    if (result.intent === "off_topic") {
      const { offTopicIndex } = conversationRef.current;
      updateConversation({ offTopicIndex: offTopicIndex + 1 });
      setIsTyping(false);
      appendMessage({
        type: "bot_text",
        text: OFF_TOPIC_REPLIES[offTopicIndex % OFF_TOPIC_REPLIES.length],
        showExamples: true,
      });
      return;
    }

    if (result.intent === "unclear") {
      const turns = conversationRef.current.unclearTurns + 1;
      updateConversation({ unclearTurns: turns });
      setIsTyping(false);

      if (turns > MAX_UNCLEAR_TURNS) {
        updateConversation({ unclearTurns: 0 });
        appendMessage({ type: "bot_text", text: EMPTY_NUDGE, showExamples: true });
        return;
      }

      const maybe = result.service_types.length > 0 ? ` Is it ${joinLabels(result.service_types)}?` : "";
      appendMessage({
        type: "bot_text",
        text: `I want to get this right.${maybe || " What needs doing?"}`,
        actions: [{ action: "skip_clarify", label: "Just show me options" }],
      });
      return;
    }

    updateConversation({ unclearTurns: 0 });
    showResults(result, result.source, text);
  }

  function handleExampleChip(example) {
    appendMessage({ type: "user_text", text: example.text });
    updateConversation({ jobText: example.text });
    setIsTyping(true);
    // Chips carry their own filters, so they skip both the model and parseJob.
    setTimeout(() => showResults(example.filters, "chip", example.text), THINKING_DELAY_MS);
  }

  function handleRemoveFilter(key, value) {
    const current = filtersRef.current;
    const nextFilters =
      key === "service_types"
        ? { ...current, service_types: current.service_types.filter((code) => code !== value) }
        : { ...current, [key]: null };

    applyFilters(nextFilters);
    const ranked = matchListings(nextFilters, activeListings());
    appendMessage({ type: "results", results: enrichResults(ranked, nextFilters) });
  }

  // ---- booking ----

  function handleSelectListing(listing) {
    appendMessage({ type: "detail", listing });
  }

  function handleBook(listing) {
    appendMessage({
      type: "bot_text",
      text: `Pick a time that suits you.`,
    });
    appendMessage({ type: "slot_picker", listing });
  }

  function handleChooseSlot(listing, slot) {
    const { requestedCodes, coveredCodes, jobText } = conversationRef.current;
    const booking = createBooking(listing, slot);
    appendMessage({ type: "confirmation", booking, listing, jobText });

    const nowCovered = [...new Set([...coveredCodes, ...listing.service_type])];
    updateConversation({ coveredCodes: nowCovered });

    const remaining = remainingCodes(requestedCodes, nowCovered);
    if (remaining.length === 0) {
      appendMessage({ type: "bot_text", text: "That's the whole job covered. Anything else?" });
      return;
    }

    // Sequential branch: name what is still uncovered and rank only for it.
    appendMessage({
      type: "bot_text",
      text: `Still open: ${joinLabels(remaining)}. Here's who can cover it.`,
    });
    appendMessage({
      type: "results",
      results: rankFor(remaining),
      skipLabel: "No thanks, I'm done",
    });
  }

  function handleAction(action) {
    if (action === "skip_remaining") {
      updateConversation({ requestedCodes: [], coveredCodes: [] });
      appendMessage({ type: "bot_text", text: "All set. Ask any time you need someone." });
      return;
    }
    if (action === "skip_clarify") {
      updateConversation({ unclearTurns: 0 });
      appendMessage({ type: "bot_text", text: EMPTY_NUDGE, showExamples: true });
    }
  }

  const hasStarted = messages.length > 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="brand">Doorstep</p>
      </header>

      <ChatThread
        messages={messages}
        isTyping={isTyping}
        onSelectListing={handleSelectListing}
        onBook={handleBook}
        onChooseSlot={handleChooseSlot}
        onAction={handleAction}
        onExampleSelect={handleExampleChip}
        emptyState={
          <div className="empty-state">
            <p className="empty-prompt">Tell me what needs doing around the house.</p>
            <ExampleChips onSelect={handleExampleChip} />
          </div>
        }
      />

      {hasStarted && <FilterChips filters={filters} onRemove={handleRemoveFilter} />}
      <ChatInput onSubmit={handleUserText} />
    </div>
  );
}
