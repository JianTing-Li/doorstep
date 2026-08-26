import { Fragment, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import ResultsList from "./ResultsList.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import ExampleChips from "./ExampleChips.jsx";
import BookingList from "./BookingList.jsx";
import RequestSummary from "./RequestSummary.jsx";
import ConfirmationMessage from "./ConfirmationMessage.jsx";

const NEAR_BOTTOM_THRESHOLD = 80;

export default function ChatThread({
  messages,
  isTyping,
  emptyState,
  openKey,
  bookingKey,
  bookings,
  reschedulingKey,
  onToggleCard,
  onStartBooking,
  onChooseSlot,
  onCancelBooking,
  onToggleReschedule,
  onChooseReschedule,
  onAction,
  onExampleSelect,
  completedRequestIds,
  filters,
  onRemoveFilter,
}) {
  const scrollRef = useRef(null);
  const stickToBottomRef = useRef(true);

  // Same root cause as the auto-scroll effect below: this used to listen via
  // onScroll on .chat-thread itself, which can't fire a scroll event once
  // the element no longer scrolls internally — so stickToBottomRef never
  // updated past its initial `true` and "don't yank the view down if the
  // reader scrolled up to read something earlier" silently stopped working.
  // The window is what actually scrolls now, so that's what this listens to.
  useEffect(() => {
    function handleScroll() {
      const distanceFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      stickToBottomRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Only new messages move the view. Expanding or booking a card changes layout
  // in place and must leave the reader where they are.
  //
  // el.scrollTop = el.scrollHeight was a no-op: .chat-thread hasn't been its
  // own scroll container since the whole page started scrolling together
  // (Phase 6, when this stopped being a standalone app) — its scrollHeight
  // and clientHeight are equal, so there's nothing to scroll on this element.
  // The window is the real scroll surface now, same fix as
  // revealExpandedCard in lib/viewTransition.js.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !stickToBottomRef.current) return;
    const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    el.scrollIntoView({ block: "end", behavior: reduced ? "auto" : "smooth" });
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="chat-thread chat-thread-empty" ref={scrollRef}>
        {emptyState}
      </div>
    );
  }

  const lastResultsId = messages.filter((m) => m.type === "results").at(-1)?.id;

  return (
    <div className="chat-thread" ref={scrollRef}>
      {messages.map((message) => {
        switch (message.type) {
          case "user_text":
            return <MessageBubble key={message.id} from="user" text={message.text} />;
          case "bot_text":
            return (
              <Fragment key={message.id}>
                <MessageBubble
                  from="bot"
                  text={message.text}
                  actions={message.actions?.filter(
                    (action) => !action.requestId || !completedRequestIds.has(action.requestId),
                  )}
                  onAction={onAction}
                />
                {message.showExamples && (
                  <div className="message-row from-bot message-enter">
                    <ExampleChips onSelect={onExampleSelect} />
                  </div>
                )}
              </Fragment>
            );
          case "results":
            return (
              <ResultsList
                key={message.id}
                messageId={message.id}
                listings={message.results}
                openKey={openKey}
                bookingKey={bookingKey}
                bookings={bookings}
                reschedulingKey={reschedulingKey}
                onToggle={onToggleCard}
                onStartBooking={onStartBooking}
                onChooseSlot={(key, listing, slot) => onChooseSlot(key, listing, slot, message.request)}
                onCancelBooking={onCancelBooking}
                onToggleReschedule={onToggleReschedule}
                onChooseReschedule={onChooseReschedule}
                skipLabel={message.skipLabel}
                requestCompleted={completedRequestIds.has(message.requestId)}
                onSkip={() => onAction("skip_remaining", message.requestId)}
                onReopen={() => onAction("reopen_request", message.requestId)}
                filters={message.id === lastResultsId ? filters : null}
                onRemoveFilter={onRemoveFilter}
              />
            );
          case "booking_list":
            return (
              <BookingList
                key={message.id}
                entries={message.bookings}
                currentBookings={bookings}
                onCancel={onCancelBooking}
                onReschedule={onChooseReschedule}
              />
            );
          case "request_summary":
            return <RequestSummary key={message.id} request={message.request} />;
          case "booking_confirmation": {
            // The booking this refers to lives in shared bookings state, keyed
            // by message.key — not a snapshot on the message itself, so a
            // reschedule (which updates that same state) shows up here for
            // free. If the booking was since cancelled, bookings[message.key]
            // is gone and the "Cancelled." bot_text right after it already
            // says so — nothing to render here in that case.
            const booking = bookings[message.key];
            if (!booking) return null;
            return (
              <div key={message.id} className="message-row from-bot message-enter">
                <ConfirmationMessage
                  booking={booking}
                  listing={message.listing}
                  transitionName={message.transitionName}
                  isRescheduling={reschedulingKey === message.key}
                  onCancel={() => onCancelBooking(message.key)}
                  onReschedule={() => onToggleReschedule(message.key)}
                  onChooseSlot={(_, slot) => onChooseReschedule(message.key, message.listing, slot)}
                />
              </div>
            );
          }
          default:
            return null;
        }
      })}
      {/* Stays mounted so it can fade and collapse out rather than vanishing. */}
      <div className={`collapse ${isTyping ? "is-open" : ""}`} aria-hidden={!isTyping}>
        <div className="collapse-inner">
          <TypingIndicator />
        </div>
      </div>
    </div>
  );
}
