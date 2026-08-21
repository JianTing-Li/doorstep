import { useRef, useState } from "react";
import ChatThread from "./components/ChatThread.jsx";
import ChatInput from "./components/ChatInput.jsx";
import ExampleChips from "./components/ExampleChips.jsx";
import FilterChips from "./components/FilterChips.jsx";
import { getFilters } from "./lib/getFilters.js";
import { matchListings } from "./lib/matchListings.js";
import { activeListings } from "./data/listings.js";
import { getProviders, getServiceTypes } from "./data/loadData.js";

const RESULTS_DISPLAY_CAP = 5;
const THINKING_DELAY_MS = 450;

const EMPTY_FILTERS = { service_types: [], max_price: null, neighborhood: null, urgency: null };

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
  if (totalCount === 0) return "No matches yet — try adjusting the filters below.";

  // The keyword fallback reads intent less reliably, so the copy says less and
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

let nextId = 1;
function makeId() {
  return nextId++;
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [isTyping, setIsTyping] = useState(false);
  // Chip removal is deferred by the exit animation, so reads of the current
  // filters must not come from a closure captured before that delay.
  const filtersRef = useRef(EMPTY_FILTERS);

  function appendMessage(message) {
    const withId = { id: makeId(), ...message };
    setMessages((current) => [...current, withId]);
  }

  function applyFilters(next) {
    filtersRef.current = next;
    setFilters(next);
  }

  function showResults(parsedFilters, source) {
    applyFilters(parsedFilters);
    const ranked = matchListings(parsedFilters, activeListings());
    const results = enrichResults(ranked, parsedFilters);
    setIsTyping(false);
    appendMessage({ type: "bot_text", text: botReplyFor(ranked.length, results.length, source) });
    appendMessage({ type: "results", results });
  }

  async function handleUserText(text) {
    appendMessage({ type: "user_text", text });
    setIsTyping(true);
    const filtersWithSource = await getFilters(text);
    showResults(filtersWithSource, filtersWithSource.source);
  }

  function handleExampleChip(example) {
    appendMessage({ type: "user_text", text: example.text });
    setIsTyping(true);
    // Chips carry their own filters, so they skip both the LLM and parseJob.
    setTimeout(() => showResults(example.filters, "chip"), THINKING_DELAY_MS);
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

  const hasStarted = messages.length > 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="brand">Doorstep</p>
      </header>

      <ChatThread
        messages={messages}
        isTyping={isTyping}
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
