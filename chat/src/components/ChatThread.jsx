import { Fragment, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import ResultsList from "./ResultsList.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import ExampleChips from "./ExampleChips.jsx";
import BookingList from "./BookingList.jsx";
import RequestSummary from "./RequestSummary.jsx";

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
}) {
  const scrollRef = useRef(null);
  const stickToBottomRef = useRef(true);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;
  }

  // Only new messages move the view. Expanding or booking a card changes layout
  // in place and must leave the reader where they are.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="chat-thread chat-thread-empty" ref={scrollRef}>
        {emptyState}
      </div>
    );
  }

  return (
    <div className="chat-thread" ref={scrollRef} onScroll={handleScroll}>
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
