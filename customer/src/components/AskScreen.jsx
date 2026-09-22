import { useEffect, useRef, useState } from "react";
import ChatThread from "./ChatThread.jsx";
import ChatInput from "./ChatInput.jsx";
import ExampleChips from "./ExampleChips.jsx";
import { EXAMPLE_JOBS } from "../data/exampleJobs.js";
import FilterChips from "./FilterChips.jsx";
import Icon from "./Icon.jsx";
import { getFilters } from "../lib/getFilters.js";
import { parseJob } from "../lib/parseJob.js";
import { listingDistanceFromNeighborhood, listingRelevance, matchListings } from "../lib/matchListings.js";
import {
  applyBooking,
  cancelBookingByKey,
  formatSlot,
  remainingCodes,
  rescheduleBooking,
} from "../lib/booking.js";
import { revealExpandedCard, transitionNameFor, withGridTransition } from "../lib/viewTransition.js";
import { activeListings } from "../data/listings.js";
import { getMeta, getNeighborhoods, getProviders, getReviews, getServiceTypes } from "../data/loadData.js";
import {
  buildDisplayBooking,
  cancelCanonicalBooking,
  recordCanonicalBooking,
  rescheduleCanonicalBooking,
} from "../lib/bookings.js";
import { readJSON, writeJSON } from "../lib/persist.js";
import { useApp } from "../AppContext.jsx";
import {
  compareListings,
  describeFilterChange,
  detailsAnswer,
  findBookingMatch,
  mergeFilters,
  requestsAllBookings,
  summariseBookings,
} from "../lib/intents.js";

const RESULTS_DISPLAY_CAP = 5;
const MAX_INPUT_LENGTH = 500;
const MAX_UNCLEAR_TURNS = 2;

// Module scope, not a ref: AskScreen unmounts completely on tab switch (App.jsx
// only renders it while tab === "ask"), so a ref guarding against re-sending
// the Browse -> Ask seed prompt (see the effect near the bottom of the
// component) is recreated fresh — and defaults back to "not yet sent" — on
// every single remount. This is a second, defensive line behind
// onSeedConsumed actually clearing the seed at its source (App.jsx's askSeed
// state): even if a remount raced ahead of that clear propagating, this still
// remembers the exact value already sent for the life of the page.
let lastSentSeedPrompt = null;

// Checked only while a clarification is pending (see
// resolvePendingClarificationCancel) — "cancel" and "never mind" already mean
// something else in intents.js's LOCAL_INTENT_PATTERNS (cancel_booking), so
// this can't be folded into that shared list without hijacking a real
// cancel-a-booking message. Gating this on clarifyCodes.length > 0 and
// checking it before getFilters is ever called (same pattern as
// resolvePendingCancellation below) keeps the two from colliding: this only
// ever fires in the one narrow window where "cancel" so obviously means
// "drop the clarification" that there's nothing else it could mean.
const CLARIFICATION_CANCEL_PATTERN =
  /\b(nvm|never ?mind|cancel|forget it|no thanks?|no thank you|not (?:now|anymore)|don'?t (?:worry|bother))\b/i;

const EMPTY_FILTERS = { service_types: [], max_price: null, neighborhood: null, urgency: null };

const OFF_TOPIC_REPLIES = [
  "I can help with jobs around the home. What needs fixing, cleaning, moving, or clearing?",
  "That’s outside Doorstep’s home-service search. What job can I help you find someone for?",
];

const EMPTY_NUDGES = [
  "Tell me what needs doing and I'll find someone. A job, a room, or a mess all work.",
  "What's the job? A sentence is plenty — a room, a task, or what's broken.",
];

// Picks a phrasing at random rather than always the first one. Every one of
// these carries the exact same information as its siblings — this is purely
// about not answering with the identical sentence shape every single time,
// which is one of the clearest tells that a reply is templated rather than
// composed. Not deterministic rotation like OFF_TOPIC_REPLIES below (which
// specifically guarantees no immediate repeat for a small, fixed set shown
// to every stalled visitor) — there's no natural sequence counter for a
// per-search reply the way there is for repeated off-topic messages, and a
// little real randomness here is fine since nothing tests the exact string.
function pick(options) {
  return options[Math.floor(Math.random() * options.length)];
}

// The keyword-only path through getFilters (no network call at all) can
// resolve in single-digit milliseconds — faster than a person could read the
// message, let alone reply to it. isTyping used to turn off the instant the
// result arrived, so a fast reply flashed the three-dot indicator for less
// than a frame, and a slow one held it exactly as long as the network took —
// implausibly instant, or implausibly exact, never a natural "thinking"
// pause. This floors the wait rather than fixing it to one number: real
// latency past the floor still shows through untouched (Promise.all takes
// whichever finishes last), so a genuinely slow model call doesn't get an
// extra artificial delay stacked on top of it.
function minDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Upper bound matters more than it looks: customer/src/lib/__tests__/
// conversation.test.mjs and ui.test.mjs wait a fixed 700ms after sending
// before reading the reply back out — not a spec, just a "surely long
// enough" test convenience written against the old near-instant behavior.
// The floor needs real margin under that same number or it starts racing
// the test's own wait, which is exactly what happened at [550, 850]: intermittent
// "0 bot bubbles" failures from replies that were correct, just not
// finished landing yet.
const TYPING_FLOOR_MS = [300, 500];

function labelsFor(codes) {
  const labelByCode = Object.fromEntries(getServiceTypes().map(({ code, label }) => [code, label]));
  return codes.map((code) => labelByCode[code] ?? code);
}

function joinLabels(codes) {
  const labels = labelsFor(codes);
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

// Generic connectors that are fine to score on (matchListings.js's own
// stop-word list is deliberately narrow so a shared word like "and" can
// still break a ranking tie) but read as meaningless when surfaced verbatim
// as "the reason this matched" — "Matches details about for, every, and."
// Filtered here, at display time only, so this has zero effect on ranking.
const DISPLAY_FILLER_WORDS = new Set([
  "all", "and", "are", "but", "can", "come", "every", "for", "her", "here", "him",
  "his", "its", "may", "not", "one", "our", "she", "the", "too", "was", "were",
  "where", "will", "you",
]);

function enrichResults(rankedListings, filters, query = "") {
  const providersById = new Map(getProviders().map((provider) => [provider.provider_id, provider]));
  const labelByCode = Object.fromEntries(getServiceTypes().map(({ code, label }) => [code, label]));
  const reviewByListing = new Map(getReviews().map((review) => [review.listing_id, review]));

  return rankedListings.slice(0, RESULTS_DISPLAY_CAP).map((listing) => {
    const matchedLabels = (filters.service_types ?? [])
      .filter((code) => listing.service_type.includes(code))
      .map((code) => labelByCode[code]);

    const { matchedTerms } = listingRelevance(query, listing);
    const displayTerms = matchedTerms.filter((term) => !DISPLAY_FILLER_WORDS.has(term.toLowerCase()));
    const distance = listingDistanceFromNeighborhood(listing, filters.neighborhood, getNeighborhoods());
    const relevanceReason = displayTerms.length > 0
      ? `Matches details about ${displayTerms.slice(0, 3).join(", ")}`
      : matchedLabels.length > 0
        ? `Covers ${matchedLabels.join(" and ")}`
        : "Available in the Doorstep catalogue";
    const locationReason = filters.neighborhood && distance != null
      ? ` · serves ${filters.neighborhood} (${distance.toFixed(1)} mi from base)`
      : "";

    return {
      ...listing,
      provider: providersById.get(listing.provider_id) ?? null,
      matchedLabels,
      reason: `${relevanceReason}${locationReason}`,
      relevantReview: reviewByListing.get(listing.listing_id) ?? null,
    };
  });
}

function searchUnderstanding(filters) {
  const parts = [];
  if (filters.service_types?.length) parts.push(joinLabels(filters.service_types).toLowerCase());
  if (filters.max_price != null) parts.push(`under $${filters.max_price}`);
  if (filters.neighborhood) parts.push(`in ${filters.neighborhood}`);
  if (filters.urgency) {
    const timing = { urgent: "as soon as possible", today: "today", tomorrow: "tomorrow", this_week: "this week" };
    parts.push(timing[filters.urgency] ?? filters.urgency);
  }
  return parts.join(", ");
}

function botReplyFor({ totalCount, shownCount, source, filters, completeCount = totalCount, bundleName = null, modelReply = null }) {
  const understood = searchUnderstanding(filters);
  const subject = understood || "a home-service search";
  // A model-authored reply (only ever set when source is "llm" — see the
  // handleUserText call site) replaces the templated restatement below with
  // something actually written for this message, in the same voice already
  // calibrated for clarification_question. Everything after it (counts, the
  // bundle mention, the "adjust the filters" hedge) stays templated
  // regardless of this: those are facts about the real match results,
  // computed after this function is called from data the model never saw,
  // not something safe to let it improvise.
  const opening = modelReply || (source === "fallback"
    ? pick([`I may have read that as ${subject}.`, `Sounds like ${subject}, though I'm not fully sure.`, `I think that's ${subject}.`])
    : pick([`I read that as ${subject}.`, `Got it — ${subject}.`, `Looking for ${subject}.`]));

  if ((filters.service_types?.length ?? 0) > 1 && completeCount < totalCount) {
    const complete = `${completeCount} complete match${completeCount === 1 ? "" : "es"}`;
    const partialCount = totalCount - completeCount;
    const partial = `${partialCount} partial option${partialCount === 1 ? "" : "s"}`;
    const bundle = bundleName ? ` ${bundleName} can handle the whole job in one visit.` : "";
    const display = totalCount > shownCount ? ` Here are the closest ${shownCount}.` : "";
    return `${opening}${bundle} I found ${complete} and ${partial}.${display}`;
  }

  const found = totalCount > shownCount
    ? pick([
        `I found ${totalCount} options; here are the closest ${shownCount}.`,
        `${totalCount} came up — here are the closest ${shownCount}.`,
        `Found ${totalCount}; showing the closest ${shownCount}.`,
      ])
    : pick([
        `I found ${totalCount} option${totalCount === 1 ? "" : "s"}.`,
        `${totalCount} option${totalCount === 1 ? "" : "s"} came up.`,
      ]);
  const check = source === "fallback" ? pick([" You can adjust the filters if that isn’t what you meant.", " Let me know if that's not quite right."]) : "";
  return `${opening} ${found}${check}`;
}

// Answers "show me examples"/"what can you help with" once suggestion chips
// are no longer on screen to tap (see hasUserTypedFreeText). Plain text, not
// the chip row itself, so it never touches appendMessage's showExamples gate
// — this is a one-off answer to a specific question, not a return of the
// standing chip fixture, and asking again later should work identically
// every time rather than only once per session.
function exampleShowcaseText() {
  const quoted = EXAMPLE_JOBS.map(({ text }) => `“${text}”`);
  const list = quoted.length > 1
    ? `${quoted.slice(0, -1).join(", ")}, or ${quoted.at(-1)}`
    : quoted[0];
  return `Sure — a few examples: ${list}. Try wording your own request the same way.`;
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

// Not a module-level counter: Vite's Fast Refresh re-runs this module on every
// edit, which would reset the counter to 1 while the thread still holds ids
// 1, 2, 3 — React then sees duplicate keys and renders duplicated bubbles.
function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `m_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

const EMPTY_CONVERSATION = {
  requestedCodes: [],
  coveredCodes: [],
  bundleOffered: false,
  jobText: "",
  unclearTurns: 0,
  offTopicIndex: 0,
  visibleListings: [],
  lastListing: null,
  request: null,
  clarifyCodes: [],
  pendingCancellationKeys: [],
  // Chips are a discovery aid for someone who hasn't figured out they can
  // just type. Once they've done that once, they've demonstrated they don't
  // need the aid — sticks for the rest of the session (never reset back to
  // false) even if a later turn would otherwise have shown chips again.
  // Tapping a chip itself never sets this; see handleExampleChip.
  hasUserTypedFreeText: false,
};

// The Ask tab (Phase 6). Was Product C's whole App; now one tab inside the
// customer app. The shell it used to render (its own header, brand, and theme
// toggle) is gone — the customer app's Header and the shared switcher own
// those now — but every bit of the matching, booking, and conversation logic
// below is unchanged.
// AskScreen unmounts completely on tab switch (App.jsx renders it only
// while tab === "ask"), which tears down every useState here — a real
// conversation, its filters and any booking made in it, gone the moment you
// tap Bookings and back. Persisted per customer, same proven pattern
// usePersonaState.js already uses for bookings/messages/reports: a lazy
// useState initializer reads localStorage synchronously at mount (no
// hydration race — there's no window where state is briefly empty before
// the persisted value loads), and a useEffect writes back on every change
// (fires for every update that produced it, not just specific call sites,
// so nothing can go stale by only being saved on some of them).
//
// Deliberately NOT persisted: isTyping, bookingNotice, confirmingClear,
// openKey/bookingKey/reschedulingKey/authorizingKey/pendingBookings, and
// conversationRef's own bookkeeping
// (requestedCodes, coveredCodes, etc.). Those are either purely transient UI
// (a typing indicator, a card mid-expand) that should default closed on
// restore, or — for conversationRef, a ref rather than state — don't have a
// natural change-triggered hook the way state does. The visible thread,
// active filters, and any booking already made in it (what the report
// actually asks for) survive; the very next message after a restore may not
// carry forward mid-conversation follow-up context the way it would have
// without the tab switch.
function askStorageKey(customerId, name) {
  return `doorstep_ask_${name}_${customerId}`;
}

export default function AskScreen({ seedPrompt, onSeedConsumed }) {
  const { customerId, customer, bookings: customerBookings, setBookings: setCustomerBookings } = useApp();
  // usePersonaState.js falls back to a customer object literally named
  // "Guest" when a persona has no record — using that in a greeting would
  // read as a template placeholder ("Hi Guest—") rather than the near-miss
  // it's meant to sidestep, so it's excluded here specifically.
  const name = customer?.name && customer.name !== "Guest" ? customer.name.split(" ")[0] : null;
  const [messages, setMessages] = useState(() => readJSON(askStorageKey(customerId, "messages"), []));
  const [filters, setFilters] = useState(() => readJSON(askStorageKey(customerId, "filters"), EMPTY_FILTERS));
  const [isTyping, setIsTyping] = useState(false);
  const [bookingNotice, setBookingNotice] = useState(null);
  // Restores the confirm step Product C originally had for this
  // (chat/src/components/HeaderActions.jsx's "Clear chat?") — the icon alone
  // reads as refresh/reload, not "wipe the whole conversation," and that
  // confirm step didn't come across in the Phase 6 merge.
  const [confirmingClear, setConfirmingClear] = useState(false);

  // Booking lives on the card, not in the thread. openKey is the one expanded
  // card, bookingKey the one showing its slots, and bookings records the
  // cards that are done — a key in bookings can never leave that state.
  const [openKey, setOpenKey] = useState(null);
  const [bookingKey, setBookingKey] = useState(null);
  // A booked card reopening its slot picker to change the time, distinct from
  // bookingKey (an unbooked card choosing its first slot) — the card must
  // stay in booked state throughout, never revert to collapsed.
  const [reschedulingKey, setReschedulingKey] = useState(null);
  // A slot has been picked but not yet authorized — the escrow step between
  // "booking" and "booked". authorizingKey is the one card mid-authorize
  // (its spinner is showing); pendingBookings holds every card's picked
  // slot until authorize fires, same keying as bookings.
  const [authorizingKey, setAuthorizingKey] = useState(null);
  const [pendingBookings, setPendingBookings] = useState({});
  // Synchronous, stale-closure-proof read for handleAuthorize's setTimeout
  // callback — same reasoning as bookingsRef below.
  const pendingBookingsRef = useRef(pendingBookings);
  const [bookings, setBookings] = useState(() => readJSON(askStorageKey(customerId, "bookings"), {}));
  const [completedRequestIds, setCompletedRequestIds] = useState(
    () => new Set(readJSON(askStorageKey(customerId, "completed"), [])),
  );
  // Seeded from the same hydrated value as `bookings` state above (useRef's
  // argument is only read on the very first render) — without this, a
  // restored conversation would show its booked cards correctly from state
  // while every handler that reads bookingsRef.current for a synchronous,
  // stale-closure-proof check (double-booking guards, cancel/reschedule
  // lookups) saw an empty object until the next write.
  const bookingsRef = useRef(bookings);

  useEffect(() => {
    writeJSON(askStorageKey(customerId, "messages"), messages);
  }, [customerId, messages]);
  useEffect(() => {
    writeJSON(askStorageKey(customerId, "filters"), filters);
  }, [customerId, filters]);
  useEffect(() => {
    writeJSON(askStorageKey(customerId, "bookings"), bookings);
  }, [customerId, bookings]);
  useEffect(() => {
    writeJSON(askStorageKey(customerId, "completed"), [...completedRequestIds]);
  }, [customerId, completedRequestIds]);

  // Chip removal and booking taps run after the state that produced them was
  // captured, so these reads come from refs rather than stale closures. Same
  // hydration-seeding reasoning as bookingsRef above.
  const filtersRef = useRef(filters);
  const conversationRef = useRef(EMPTY_CONVERSATION);
  // Booking a request's last remaining code fires the "Request prepared...
  // Anything else?" wrap-up. Appending it the instant that happens is what
  // let it land BETWEEN two cards of the same batch: pick a listing that
  // already fully covers the request, the wrap-up appends immediately, then
  // a second listing booked afterward (same still-open results, no second
  // search needed) lands its own card AFTER that text — reading as
  // "finished, then restarted" rather than one batch. A debounce (wait a
  // moment before appending, in case another booking follows) was tried and
  // dropped: finding and booking a second listing routinely takes longer
  // than any debounce short enough not to make the *common* single-booking
  // case feel laggy, so it didn't hold up. Event-driven instead: track the
  // wrap-up already on screen for this request, and if another qualifying
  // booking comes in — any amount of time later — remove it and re-append a
  // fresh copy at the end, rather than leaving the old one where it was.
  const activeWrapupRef = useRef(null); // { id, requestId } | null
  const bookingNoticeTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(bookingNoticeTimerRef.current), []);

  function showBookingNotice(message) {
    clearTimeout(bookingNoticeTimerRef.current);
    const id = makeId();
    setBookingNotice({ id, message });
    bookingNoticeTimerRef.current = setTimeout(() => {
      setBookingNotice((current) => (current?.id === id ? null : current));
    }, 3200);
  }

  // Every call site below still passes showExamples: true exactly where it
  // always did — gating here instead of at each of those ~8 sites means
  // "no chips once the customer has typed real text" is one invariant
  // enforced in one place, not a rule that has to be remembered at every
  // future appendMessage call that wants a chip row.
  function appendMessage(message) {
    const withId = { id: makeId(), ...message };
    if (withId.showExamples) withId.showExamples = !conversationRef.current.hasUserTypedFreeText;
    setMessages((current) => [...current, withId]);
  }

  function applyFilters(next) {
    filtersRef.current = next;
    setFilters(next);
  }

  function updateConversation(patch) {
    conversationRef.current = { ...conversationRef.current, ...patch };
  }

  function matchingOptions(query = conversationRef.current.request?.description ?? conversationRef.current.jobText) {
    return {
      query,
      referenceDate: getMeta().reference_date,
      neighborhoods: getNeighborhoods(),
    };
  }

  function buildModelContext() {
    const focused = currentListing();
    return {
      active_request: conversationRef.current.request,
      active_filters: filtersRef.current,
      visible_listings: conversationRef.current.visibleListings.map((listing) => ({
        listing_id: listing.listing_id,
        title: listing.title,
        provider: listing.provider?.name ?? null,
        price: listing.price,
        price_unit: listing.price_unit,
        service_types: listing.service_type,
      })),
      focused_listing: focused
        ? { listing_id: focused.listing_id, title: focused.title, provider: focused.provider?.name ?? null }
        : null,
      bookings: bookedEntries().map(({ booking, listing }) => ({
        booking_id: booking.booking_id,
        listing_id: listing.listing_id,
        title: listing.title,
        provider: listing.provider?.name ?? null,
      })),
      pending_clarification: conversationRef.current.clarifyCodes.length
        ? labelsFor(conversationRef.current.clarifyCodes)
        : null,
      recent_messages: messages
        .filter((message) => message.type === "user_text" || message.type === "bot_text")
        .slice(-6)
        .map((message) => ({
          role: message.type === "user_text" ? "user" : "assistant",
          text: message.text,
        })),
    };
  }

  function buildRequest(description, nextFilters) {
    const current = conversationRef.current.request;
    return {
      id: current?.description === description ? current.id : makeId(),
      description,
      serviceTypes: [...(nextFilters.service_types ?? [])],
      serviceLabels: labelsFor(nextFilters.service_types ?? []),
      neighborhood: nextFilters.neighborhood,
      urgency: nextFilters.urgency,
      maxPrice: nextFilters.max_price,
    };
  }

  function appendResults(results, extra = {}) {
    appendMessage({
      type: "results",
      results,
      requestId: conversationRef.current.request?.id ?? null,
      request: conversationRef.current.request,
      ...extra,
    });
  }

  function reopenRequest(requestId) {
    if (!requestId) return;
    setCompletedRequestIds((current) => {
      const next = new Set(current);
      next.delete(requestId);
      return next;
    });
  }

  function rankFor(codes) {
    const scoped = { ...EMPTY_FILTERS, service_types: codes };
    const query = conversationRef.current.request?.description ?? conversationRef.current.jobText;
    return enrichResults(matchListings(scoped, activeListings(), matchingOptions(query)), scoped, query);
  }

  // ---- results ----

  function showResults(nextFilters, source, originalText, options = {}) {
    const previous = filtersRef.current;
    applyFilters(nextFilters);
    setIsTyping(false);

    const note = conflictNote(previous, nextFilters);
    const acknowledgement = [options.acknowledgement, note].filter(Boolean).join(" ");

    const requested = nextFilters.service_types ?? [];
    const hasConstraint = nextFilters.max_price != null || nextFilters.neighborhood != null || nextFilters.urgency != null;

    // Nothing to go on at all — nudge rather than error.
    if (requested.length === 0 && !hasConstraint) {
      appendMessage({
        type: "bot_text",
        text: acknowledgement ? `${acknowledgement} ${pick(EMPTY_NUDGES)}` : pick(EMPTY_NUDGES),
        showExamples: true,
      });
      return;
    }

    const requestText = originalText || conversationRef.current.request?.description || conversationRef.current.jobText;
    let ranked = matchListings(nextFilters, activeListings(), matchingOptions(requestText));

    // A confident-looking model answer that matches nothing is worth one retry
    // through the keyword reader before giving up.
    if (ranked.length === 0 && source === "llm" && originalText && options.allowKeywordRetry !== false) {
      const retry = { ...parseJob(originalText) };
      const retryRanked = matchListings(retry, activeListings(), matchingOptions(requestText));
      if (retryRanked.length > 0) {
        applyFilters(retry);
        ranked = retryRanked;
        nextFilters = retry;
        source = "fallback";
      }
    }

    const request = buildRequest(requestText, nextFilters);
    updateConversation({ request });

    // Relax one explicit constraint at a time and keep the requested service
    // intact. An unrelated highly rated listing is not a useful alternative.
    if (ranked.length === 0) {
      if (nextFilters.urgency) {
        const relaxed = { ...nextFilters, urgency: null };
        const alternatives = matchListings(relaxed, activeListings(), matchingOptions(requestText));
        if (alternatives.length > 0) {
          appendMessage({
            type: "bot_text",
            text: `${acknowledgement ? `${acknowledgement} ` : ""}${pick([
              `I kept ${searchUnderstanding(nextFilters)}. No matching provider has that timing, so here are the same services with later availability.`,
              `Nobody matching ${searchUnderstanding(nextFilters)} is free at that time, so here's the same search with a later opening instead.`,
              `I kept ${searchUnderstanding(nextFilters)}, just without that timing — nothing's open then, so here's what's available later.`,
            ])}`,
          });
          appendResults(enrichResults(alternatives, relaxed, requestText));
          return;
        }
      }
      if (nextFilters.max_price != null) {
        const relaxed = { ...nextFilters, max_price: null };
        const alternatives = matchListings(relaxed, activeListings(), matchingOptions(requestText));
        if (alternatives.length > 0) {
          appendMessage({
            type: "bot_text",
            text: `${acknowledgement ? `${acknowledgement} ` : ""}${pick([
              `I kept ${joinLabels(requested).toLowerCase()} in the search, but nothing is available under $${nextFilters.max_price}. These are the closest relevant options over budget.`,
              `Nothing in ${joinLabels(requested).toLowerCase()} is available under $${nextFilters.max_price}, so here are the closest options over budget.`,
              `I kept ${joinLabels(requested).toLowerCase()} in the search, but nothing comes in under $${nextFilters.max_price} — these are the closest options over budget.`,
            ])}`,
          });
          appendResults(enrichResults(alternatives, relaxed, requestText));
          return;
        }
      }
      appendMessage({
        type: "bot_text",
        text: `${acknowledgement ? `${acknowledgement} ` : ""}${nextFilters.neighborhood
          ? pick([
              `No matching provider currently serves ${nextFilters.neighborhood}. Try another job area or remove that filter.`,
              `Nobody covers ${nextFilters.neighborhood} for this yet. Try a different area, or drop that filter to see everyone.`,
              `${nextFilters.neighborhood} isn't covered for this right now. Try another neighborhood or clear that filter.`,
            ])
          : pick([
              "Doorstep doesn't currently have a provider for that request. Try adding a little more detail or changing a filter.",
              "Nothing matches that request right now. A bit more detail, or a different filter, might turn something up.",
              "I couldn't find a provider for that one. Try describing it a little differently or adjusting a filter.",
            ])}`,
      });
      return;
    }

    updateConversation({ requestedCodes: requested, coveredCodes: [], bundleOffered: false });

    // Bundle branch: one provider can cover the whole job.
    const bundle = requested.length > 1
      ? ranked.find((listing) => requested.every((code) => listing.service_type.includes(code))) ?? null
      : null;
    let bundleName = null;
    if (bundle && !conversationRef.current.bundleOffered) {
      const providersById = new Map(getProviders().map((p) => [p.provider_id, p]));
      bundleName = providersById.get(bundle.provider_id)?.name ?? "One provider";
      updateConversation({ bundleOffered: true });
    }

    const results = enrichResults(ranked, nextFilters, requestText);
    updateConversation({ visibleListings: results });
    const completeCount = requested.length > 1
      ? ranked.filter((listing) => requested.every((code) => listing.service_type.includes(code))).length
      : ranked.length;
    const reply = botReplyFor({
      totalCount: ranked.length,
      shownCount: results.length,
      source,
      filters: nextFilters,
      completeCount,
      bundleName,
      modelReply: options.modelReply ?? null,
    });
    appendMessage({
      type: "bot_text",
      text: acknowledgement ? `${acknowledgement} ${reply}` : reply,
    });
    appendResults(results);
  }

  // ---- input ----

  async function handleUserText(rawText) {
    const text = String(rawText ?? "").trim().slice(0, MAX_INPUT_LENGTH);
    if (!text) return;

    // Only the text input reaches this function — handleExampleChip (chip
    // taps) is a separate handler that never calls this, so this can't be
    // set by tapping a chip. Set before the first appendMessage below so
    // even the bot's reply to this very message stops offering chips.
    if (!conversationRef.current.hasUserTypedFreeText) {
      updateConversation({ hasUserTypedFreeText: true });
    }

    appendMessage({ type: "user_text", text });
    updateConversation({ jobText: text });

    if (resolvePendingClarificationCancel(text)) return;
    if (resolvePendingCancellation(text)) return;

    setIsTyping(true);

    const floor = TYPING_FLOOR_MS[0] + Math.random() * (TYPING_FLOOR_MS[1] - TYPING_FLOOR_MS[0]);
    let [result] = await Promise.all([getFilters(text, buildModelContext()), minDelay(floor)]);
    if (result.intent === "job" && result.confidence === "low") {
      result = { ...result, intent: "unclear" };
    }

    if (result.intent === "off_topic") {
      const { offTopicIndex } = conversationRef.current;
      updateConversation({ offTopicIndex: offTopicIndex + 1 });
      setIsTyping(false);
      // off_topic reaches the model (it's not one of the LOCAL_INTENT_PATTERNS
      // shortcuts in intents.js — there's no reliable keyword signature for
      // "not a job"), so it's worth a model-authored redirect the same way
      // job/change_filters get one. OFF_TOPIC_REPLIES stays as the fallback
      // for the keyword/parser paths, which never get a reply.
      appendMessage({
        type: "bot_text",
        text: result.reply || OFF_TOPIC_REPLIES[offTopicIndex % OFF_TOPIC_REPLIES.length],
        showExamples: true,
      });
      return;
    }

    if (result.intent === "greeting") {
      setIsTyping(false);
      appendMessage({
        type: "bot_text",
        text: name ? `Hi ${name}—what job do you need help with?` : "Hi—what job do you need help with?",
        showExamples: true,
      });
      return;
    }

    if (result.intent === "help") {
      setIsTyping(false);
      appendMessage({
        type: "bot_text",
        text: "Describe the job in your own words. I’ll find relevant providers and help you choose a time.",
        showExamples: true,
      });
      return;
    }

    if (result.intent === "show_examples") {
      setIsTyping(false);
      appendMessage({ type: "bot_text", text: exampleShowcaseText() });
      return;
    }

    if (result.intent === "unsupported_service") {
      // A distinct, unrelated request, same as a confident "job" below —
      // clears any stale clarification the customer never answered.
      updateConversation({ clarifyCodes: [] });
      setIsTyping(false);
      appendMessage({
        type: "bot_text",
        text: "Doorstep doesn’t have providers for that service yet. I can help with cleaning, handyman work, plumbing, electrical, moving, junk removal, or yard work.",
        showExamples: true,
      });
      return;
    }

    if (result.intent === "list_bookings") {
      setIsTyping(false);
      showBookings();
      return;
    }

    if (result.intent === "cancel_booking") {
      setIsTyping(false);
      cancelBooking(text);
      return;
    }

    if (result.intent === "change_filters") {
      const merged = mergeFilters(filtersRef.current, result);
      setIsTyping(false);
      const change = describeFilterChange(filtersRef.current, merged);
      const changeDetail = change.replace(/^I updated your search(?::| to) /, "").replace(/\.$/, "");
      const acknowledgement = result.source === "fallback"
        ? `I couldn’t verify the wording, but I kept your current service and applied this change: ${changeDetail}.`
        : change;
      showResults(merged, result.source, conversationRef.current.request?.description ?? text, {
        acknowledgement,
        allowKeywordRetry: false,
      });
      return;
    }

    if (result.intent === "more_details") {
      setIsTyping(false);
      const listing = listingById(result.referenced_listing_id) ?? currentListing();
      if (!listing) {
        appendMessage({ type: "bot_text", text: "Which listing do you mean? Open one and ask again." });
        return;
      }
      appendMessage({ type: "bot_text", text: detailsAnswer(listing, text) });
      return;
    }

    if (result.intent === "compare") {
      setIsTyping(false);
      const visible = conversationRef.current.visibleListings;
      if (visible.length < 2) {
        appendMessage({ type: "bot_text", text: "I need at least two options on screen to compare. Try a search first." });
        return;
      }
      appendMessage({ type: "bot_text", text: compareListings(visible, text) });
      return;
    }

    if (result.intent === "unclear") {
      const turns = conversationRef.current.unclearTurns + 1;
      updateConversation({ unclearTurns: turns });
      setIsTyping(false);

      if (turns > MAX_UNCLEAR_TURNS) {
        // Giving up on this clarification thread entirely — nothing left to
        // resurrect it with, so the stale codes shouldn't linger either.
        updateConversation({ unclearTurns: 0, clarifyCodes: [] });
        appendMessage({ type: "bot_text", text: pick(EMPTY_NUDGES), showExamples: true });
        return;
      }

      const maybe = result.service_types.length > 0 ? `Is this ${joinLabels(result.service_types).toLowerCase()}?` : "What needs doing?";
      updateConversation({ clarifyCodes: result.service_types, request: null });
      appendMessage({
        type: "bot_text",
        text: result.clarification_question || `I want to make sure I understood. ${maybe}`,
        actions: result.service_types.length > 0 ? [{ action: "skip_clarify", label: "Show these options" }] : [],
      });
      return;
    }

    // A confident "job" landing here always supersedes whatever came before
    // it, including a clarification the customer never answered — without
    // this, clarifyCodes from an earlier, unrelated ambiguous message stuck
    // around indefinitely: sent to the model as stale pending_clarification
    // context on every later turn, and available to resurrect via a
    // still-clickable "Show these options" button on that old message.
    updateConversation({ unclearTurns: 0, clarifyCodes: [] });
    updateConversation({ request: null });
    // change_filters (above) already has its own acknowledgement built from
    // the actual filter diff, so only the plain-search path forwards the
    // model's reply — stacking both here would restate the same thing twice.
    showResults(result, result.source, text, { modelReply: result.reply });
  }

  function handleExampleChip(example) {
    appendMessage({ type: "user_text", text: example.text });
    updateConversation({ jobText: example.text, request: null });
    setIsTyping(true);
    // Chips carry their own filters, so they skip both the model and parseJob
    // — nothing to await, so the same floor used elsewhere is applied
    // directly as a delay instead of racing it against a real call.
    const floor = TYPING_FLOOR_MS[0] + Math.random() * (TYPING_FLOOR_MS[1] - TYPING_FLOOR_MS[0]);
    setTimeout(() => showResults(example.filters, "chip", example.text), floor);
  }

  function handleRemoveFilter(key, value) {
    const current = filtersRef.current;
    const nextFilters =
      key === "service_types"
        ? { ...current, service_types: current.service_types.filter((code) => code !== value) }
        : { ...current, [key]: null };

    const query = conversationRef.current.request?.description ?? conversationRef.current.jobText;
    showResults(nextFilters, "keyword", query, {
      acknowledgement: describeFilterChange(current, nextFilters),
      allowKeywordRetry: false,
    });
  }

  // ---- booking ----

  function handleToggleCard(key) {
    // A booked card is a record, not a control.
    if (bookingsRef.current[key]) return;
    const opening = openKey !== key;
    if (opening) {
      const match = conversationRef.current.visibleListings.find((l) => key.endsWith(l.listing_id));
      if (match) updateConversation({ lastListing: match });
    }
    // Expanding makes the card span the whole grid row, so the siblings reflow.
    withGridTransition(() => {
      setBookingKey(null);
      setOpenKey((current) => (current === key ? null : key));
    });
    // A card near the bottom grows underneath the floating composer. Nudge the
    // thread just far enough that the newly revealed content clears it.
    if (opening) revealExpandedCard(key);
  }

  function handleStartBooking(key) {
    if (bookingsRef.current[key]) return;
    setBookingKey(key);
    // Revealing the slots grows the card again, so it may now run under the
    // composer even though expanding alone did not.
    revealExpandedCard(key);
  }

  function handleChooseSlot(key, listing, slot, request) {
    // Guard the state machine rather than trusting the UI: a second slot tap on
    // an already-booked or already-pending card must not create a second
    // pending pick.
    if (bookingsRef.current[key] || pendingBookingsRef.current[key]) return;
    const nextPending = { ...pendingBookingsRef.current, [key]: { listing, slot, request } };
    pendingBookingsRef.current = nextPending;
    setPendingBookings(nextPending);
    // Revealing the escrow step grows the card again, same as revealing the
    // slot picker did.
    setBookingKey(null);
    revealExpandedCard(key);
  }

  function handleAuthorize(key) {
    const pending = pendingBookingsRef.current[key];
    if (!pending || authorizingKey === key) return;
    setAuthorizingKey(key);

    // Same fake-escrow delay pattern as CheckoutScreen.authorize() — a
    // ~2s spinner ("Securing Escrow Funds...") before the booking lands.
    setTimeout(() => {
      const { listing, slot, request } = pending;

      // Guard the state machine rather than trusting the UI: a second slot tap on
      // an already-booked card must not create a second booking or re-run the
      // multi-service follow-up.
      const { bookings: nextBookings, booking } = applyBooking(
        bookingsRef.current,
        key,
        listing,
        slot,
        request,
      );
      if (!booking) {
        setAuthorizingKey(null);
        return;
      }

      // Phase 6: one bookings list. A booking made here goes through exactly the
      // same path as one made from Browse — the customer app's own list plus the
      // canonical record in shared/demo-store.js — so it shows up under Bookings,
      // in the provider's dashboard, and in the admin queue identically.
      const displayBooking = buildDisplayBooking({
        listing,
        provider: listing.provider ?? { provider_id: listing.provider_id, name: "Doorstep provider" },
        timeSlot: slot,
        address: "1420 NW Lovejoy St, Portland, OR",
        quantity: listing.price_unit === "hourly" ? (listing.minimum_quantity ?? 1) : 1,
      });
      const linkedBookings = {
        ...nextBookings,
        [key]: { ...nextBookings[key], displayBookingId: displayBooking.id },
      };
      bookingsRef.current = linkedBookings;

      // Only now, once the card is genuinely booked, does the bot speak. This
      // is computed before the view transition below, but every message-array
      // mutation for this booking happens INSIDE that one transition, in the
      // order written here — appendMessage/setMessages calls made after
      // withGridTransition returns are not guaranteed to land after the ones
      // inside it: the transition's callback is flushSync'd, but
      // startViewTransition itself does not run that callback fully
      // synchronously relative to the code that follows it, so anything
      // appended out here could jump ahead of the confirmation card it was
      // supposed to follow.
      const { requestedCodes, coveredCodes } = conversationRef.current;
      const nowCovered = [...new Set([...coveredCodes, ...listing.service_type])];
      updateConversation({ coveredCodes: nowCovered });
      const remaining = remainingCodes(requestedCodes, nowCovered);

      // The booked card leaves the results grid and its confirmation appears as
      // a new message at the bottom of the thread instead (see ChatThread.jsx
      // and ListingCard.jsx) — same transitionName on both, one view transition,
      // so the browser has a chance to morph the card into its new spot rather
      // than a hard cut.
      withGridTransition(() => {
        setBookings(linkedBookings);
        setBookingKey(null);
        setOpenKey(null);
        const confirmationId = makeId();
        setMessages((current) => [
          ...current.filter((message) => !(message.type === "booking_confirmation" && message.key === key)),
          { id: confirmationId, type: "booking_confirmation", key, listing, transitionName: transitionNameFor(key) },
        ]);

        if (remaining.length === 0) {
          const requestId = booking.request?.id ?? conversationRef.current.request?.id;
          const wrapupId = makeId();
          // Same request's wrap-up is already showing (an earlier booking in
          // this batch already fully covered it) — drop that one instead of
          // stacking a second, so a new booking always ends up followed by
          // exactly one "Anything else?", not one after every card.
          const staleId = activeWrapupRef.current?.requestId === requestId ? activeWrapupRef.current.id : null;
          activeWrapupRef.current = { id: wrapupId, requestId };
          setMessages((current) => [
            ...current.filter((m) => m.id !== staleId),
            {
              id: wrapupId,
              type: "bot_text",
              text: name ? `That covers it, ${name}. Anything else?` : "That covers this request. Do you need help with anything else?",
              actions: [{ action: "skip_remaining", label: "I'm done", requestId }],
            },
          ]);
        } else {
          appendMessage({
            type: "bot_text",
            text: `Still open: ${joinLabels(remaining)}. Here's who can cover it.`,
          });
          appendResults(rankFor(remaining), { skipLabel: "No thanks, I'm done" });
        }
      });

      setCustomerBookings((prev) => [displayBooking, ...prev]);
      recordCanonicalBooking(displayBooking, customerId);
      showBookingNotice("Booked — added to your Bookings");

      setAuthorizingKey(null);
      const nextPending = { ...pendingBookingsRef.current };
      delete nextPending[key];
      pendingBookingsRef.current = nextPending;
      setPendingBookings(nextPending);
    }, 2000);
  }

  function handleAction(action, requestId = null) {
    if (action === "skip_remaining") {
      const completedId = requestId ?? conversationRef.current.request?.id;
      if (completedId) setCompletedRequestIds((current) => new Set(current).add(completedId));
      if (activeWrapupRef.current?.requestId === completedId) activeWrapupRef.current = null;
      updateConversation({ requestedCodes: [], coveredCodes: [] });
      setOpenKey(null);
      setBookingKey(null);
      appendMessage({ type: "bot_text", text: "All set. Ask any time you need someone." });
      return;
    }
    if (action === "reopen_request") {
      reopenRequest(requestId);
      appendMessage({ type: "bot_text", text: "Options reopened for this request." });
      return;
    }
    if (action === "skip_clarify") {
      updateConversation({ unclearTurns: 0 });
      const codes = conversationRef.current.clarifyCodes;
      if (codes.length > 0) {
        showResults({ ...filtersRef.current, service_types: codes }, "fallback", conversationRef.current.jobText);
      } else {
        appendMessage({ type: "bot_text", text: pick(EMPTY_NUDGES), showExamples: true });
      }
    }
  }

  function bookedEntries() {
    // The same map the multi-service logic reads — one source of truth.
    return Object.entries(bookingsRef.current).map(([key, record]) => ({
      key,
      booking: record,
      listing: record.listing,
    }));
  }

  // Opting out of a pending clarification ("nvm", "cancel", "forget it")
  // rather than answering it. Without this, that state just sits in
  // clarifyCodes: the bot re-asks the same question on the next unrelated
  // reply (getFilters keeps sending it to the model as pending_clarification
  // context) and a stale skip_clarify tap can resurrect service types from a
  // job the customer already dropped.
  function resolvePendingClarificationCancel(text) {
    if (conversationRef.current.clarifyCodes.length === 0) return false;
    if (!CLARIFICATION_CANCEL_PATTERN.test(text)) return false;

    updateConversation({ clarifyCodes: [], unclearTurns: 0 });
    appendMessage({ type: "bot_text", text: "No problem — let me know if you need anything else." });
    return true;
  }

  function resolvePendingCancellation(text) {
    const pendingKeys = conversationRef.current.pendingCancellationKeys;
    if (pendingKeys.length === 0) return false;

    const pending = bookedEntries().filter(({ key }) => pendingKeys.includes(key));
    if (pending.length === 0) {
      updateConversation({ pendingCancellationKeys: [] });
      return false;
    }

    if (/\b(never mind|neither|keep (?:them|both|all)|don'?t cancel)\b/i.test(text)) {
      updateConversation({ pendingCancellationKeys: [] });
      appendMessage({ type: "bot_text", text: "Okay — I kept both requests." });
      return true;
    }

    let targets = [];
    if (requestsAllBookings(text)) {
      targets = pending;
    } else if (/^\s*(?:the\s+)?(?:first|1st)(?:\s+one)?\s*$/i.test(text)) {
      targets = [pending[0]];
    } else if (/^\s*(?:the\s+)?(?:second|2nd)(?:\s+one)?\s*$/i.test(text) && pending[1]) {
      targets = [pending[1]];
    } else {
      const { match } = findBookingMatch(text, pending);
      if (match) targets = [match];
    }

    if (targets.length === 0) {
      appendMessage({
        type: "bot_text",
        text: `I still need a choice — ${pending.map((entry) => entry.listing.title).join(", or ")}. You can also say “both.”`,
      });
      return true;
    }

    const cancelled = targets.map(({ key }) => performCancel(key)).filter(Boolean);
    updateConversation({ pendingCancellationKeys: [] });
    finishCancel(cancelled);
    return true;
  }

  function currentListing() {
    const entries = bookedEntries();
    if (openKey) {
      const visible = conversationRef.current.visibleListings;
      const match = visible.find((l) => openKey.endsWith(l.listing_id));
      if (match) return match;
    }
    return conversationRef.current.lastListing ?? entries.at(-1)?.listing ?? conversationRef.current.visibleListings[0] ?? null;
  }

  function listingById(listingId) {
    if (!listingId) return null;
    return conversationRef.current.visibleListings.find((listing) => listing.listing_id === listingId)
      ?? bookedEntries().find(({ listing }) => listing.listing_id === listingId)?.listing
      ?? null;
  }

  function showBookings() {
    const entries = bookedEntries();
    if (entries.length === 0) {
      appendMessage({
        type: "bot_text",
        text: "You haven't booked anything yet this session.",
        showExamples: true,
      });
      return;
    }
    appendMessage({
      type: "bot_text",
      text: `You have ${entries.length} booking${entries.length === 1 ? "" : "s"} this session.`,
    });
    appendMessage({ type: "booking_list", bookings: summariseBookings(entries) });
  }

  // The single writer for freeing a booked key — called from both the
  // cancel_booking chat intent and the card's own Cancel button, so tapping
  // and typing produce identical state.
  function performCancel(key) {
    const { bookings: next, cancelled } = cancelBookingByKey(bookingsRef.current, key);
    if (!cancelled) return null;

    bookingsRef.current = next;
    withGridTransition(() => setBookings(next));
    if (cancelled.displayBookingId) {
      const displayBooking = customerBookings.find((item) => item.id === cancelled.displayBookingId);
      cancelCanonicalBooking(displayBooking);
      setCustomerBookings((current) => current.map((item) => (
        item.id === cancelled.displayBookingId
          ? { ...item, status: "cancelled", escrowStatus: "released" }
          : item
      )));
    }

    // Free the codes it covered so the sequential offer recalculates.
    const stillCovered = Object.values(next).flatMap((r) => r.listing.service_type);
    updateConversation({ coveredCodes: [...new Set(stillCovered)] });
    reopenRequest(cancelled.request?.id);
    return cancelled;
  }

  // The messaging that follows any successful cancellation, regardless of how
  // it was triggered.
  function finishCancel(cancelled = []) {
    const lead = cancelled.length > 1 ? `Cancelled ${cancelled.length} requests.` : "Cancelled.";

    const remaining = remainingCodes(conversationRef.current.requestedCodes, conversationRef.current.coveredCodes);
    if (remaining.length > 0) {
      appendMessage({ type: "bot_text", text: `${lead} You still need ${joinLabels(remaining).toLowerCase()}, so here are the relevant options.` });
      appendResults(rankFor(remaining), { skipLabel: "No thanks, I'm done" });
      return;
    }
    appendMessage({ type: "bot_text", text: `${lead} Would you like me to find another option?` });
  }

  function cancelBooking(text) {
    const entries = bookedEntries();
    if (entries.length === 0) {
      appendMessage({ type: "bot_text", text: "There's nothing booked to cancel yet." });
      return;
    }

    if (requestsAllBookings(text) && entries.length > 1) {
      const cancelled = entries.map(({ key }) => performCancel(key)).filter(Boolean);
      updateConversation({ pendingCancellationKeys: [] });
      finishCancel(cancelled);
      return;
    }

    const { match, candidates } = findBookingMatch(text, entries);
    if (!match) {
      updateConversation({ pendingCancellationKeys: candidates.map(({ key }) => key) });
      appendMessage({
        type: "bot_text",
        text: `Which one — ${candidates.map((c) => c.listing.title).join(", or ")}? You can also say “both.”`,
      });
      return;
    }

    const cancelled = performCancel(match.key);
    if (!cancelled) return;
    updateConversation({ pendingCancellationKeys: [] });
    finishCancel([cancelled]);
  }

  function handleCancelCard(key) {
    const cancelled = performCancel(key);
    if (!cancelled) return;
    updateConversation({ pendingCancellationKeys: [] });
    finishCancel([cancelled]);
  }

  function handleToggleReschedule(key) {
    const opening = reschedulingKey !== key;
    setReschedulingKey((current) => (current === key ? null : key));
    if (opening) revealExpandedCard(key);
  }

  function handleChooseReschedule(key, listing, slot) {
    const current = bookingsRef.current[key];
    if (!current) return;

    // Picking the slot already booked is just backing out of the picker.
    if (slot === current.slot) {
      setReschedulingKey(null);
      return;
    }

    const { bookings: next, booking } = rescheduleBooking(bookingsRef.current, key, slot);
    if (!booking) return;

    bookingsRef.current = next;
    setBookings(next);
    if (booking.displayBookingId) {
      const displayBooking = customerBookings.find((item) => item.id === booking.displayBookingId);
      rescheduleCanonicalBooking(displayBooking, slot);
      setCustomerBookings((current) => current.map((item) => (
        item.id === booking.displayBookingId ? { ...item, timeSlot: slot } : item
      )));
    }
    setReschedulingKey(null);
    appendMessage({ type: "bot_text", text: `Rescheduled to ${formatSlot(slot)}.` });
  }

  function handleClearChat() {
    activeWrapupRef.current = null;
    // Every store resets together — thread, filters, card state, bookings and
    // the multi-service bookkeeping — so nothing is left half-cleared.
    setMessages([]);
    applyFilters(EMPTY_FILTERS);
    conversationRef.current = EMPTY_CONVERSATION;
    setOpenKey(null);
    setBookingKey(null);
    setReschedulingKey(null);
    setAuthorizingKey(null);
    pendingBookingsRef.current = {};
    setPendingBookings({});
    bookingsRef.current = {};
    setBookings({});
    setCompletedRequestIds(new Set());
    setIsTyping(false);
  }

  const hasStarted = messages.length > 0;

  // Arriving from Browse with filters set: open the conversation already
  // holding what the customer had narrowed to, rather than a blank prompt.
  //
  // Bug this guards against: seedPrompt is App.jsx's askSeed state, set once
  // by Browse's hand-off and previously never cleared. seededRef alone only
  // stopped a duplicate send while this exact component instance stayed
  // mounted — it says nothing about the next mount. Since AskScreen unmounts
  // completely on tab switch, leaving and re-entering Ask created a brand
  // new seededRef (starting at false again) while seedPrompt was still the
  // same leftover value, so it re-sent every time. onSeedConsumed clears
  // askSeed at the source the moment it's read here — before handleUserText
  // even resolves, not after — so a later remount sees seedPrompt as null
  // and skips the `!seedPrompt` check below on its own. lastSentSeedPrompt
  // (module scope, see above) is the second, defensive check for the narrow
  // window before that clear has propagated.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !seedPrompt || seedPrompt === lastSentSeedPrompt) return;
    seededRef.current = true;
    lastSentSeedPrompt = seedPrompt;
    onSeedConsumed?.();
    handleUserText(seedPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedPrompt]);

  return (
    <div className="ask-screen">
      <div className="ask-toolbar">
        {/* Always mounted, even while confirming: .ask-toolbar uses
            justify-content: space-between across these two children, so
            removing this one entirely (as a prior version did, to dodge a
            narrow-width collision with "Clear this conversation?" and its
            two buttons) leaves only one child — and space-between pins a
            lone child to the start of the row instead of the end, which
            reads as the whole toolbar going blank and the confirm jumping
            to the left. Shrinking with an ellipsis (index.css
            .ask-toolbar-title) instead of unmounting keeps the row stable
            in both states without reintroducing that collision. */}
        <span className="ask-toolbar-title">
          <Icon name="sparkles" size={14} />
          <span className="ask-toolbar-title-label">Describe the job</span>
        </span>
        <div className="ask-toolbar-actions">
          {hasStarted && !confirmingClear && (
            <button
              type="button"
              className="icon-button"
              onClick={() => setConfirmingClear(true)}
              title="Clear conversation"
            >
              <Icon name="trash" size={14} />
            </button>
          )}
          {hasStarted && confirmingClear && (
            <div className="ds-confirm-inline">
              <span className="ds-confirm-inline-label">Clear this conversation?</span>
              <button
                type="button"
                className="ds-confirm-inline-danger"
                onClick={() => {
                  setConfirmingClear(false);
                  handleClearChat();
                }}
              >
                Clear
              </button>
              <button type="button" className="ds-confirm-inline-cancel" onClick={() => setConfirmingClear(false)}>
                Keep it
              </button>
            </div>
          )}
        </div>
      </div>

      <ChatThread
        messages={messages}
        isTyping={isTyping}
        notice={bookingNotice}
        openKey={openKey}
        bookingKey={bookingKey}
        bookings={bookings}
        reschedulingKey={reschedulingKey}
        authorizingKey={authorizingKey}
        pendingBookings={pendingBookings}
        onToggleCard={handleToggleCard}
        onStartBooking={handleStartBooking}
        onChooseSlot={handleChooseSlot}
        onAuthorize={handleAuthorize}
        onCancelBooking={handleCancelCard}
        onToggleReschedule={handleToggleReschedule}
        onChooseReschedule={handleChooseReschedule}
        onAction={handleAction}
        onExampleSelect={handleExampleChip}
        completedRequestIds={completedRequestIds}
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        emptyState={
          <div className="empty-state">
            <p className="empty-prompt">Tell me what needs doing around the house.</p>
            <ExampleChips onSelect={handleExampleChip} />
          </div>
        }
      />

      <div className="composer">
        <ChatInput onSubmit={handleUserText} />
      </div>
    </div>
  );
}
