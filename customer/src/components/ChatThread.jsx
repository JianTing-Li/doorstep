import { Fragment, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import ResultsList from "./ResultsList.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import ExampleChips from "./ExampleChips.jsx";
import BookingList from "./BookingList.jsx";
import RequestSummary from "./RequestSummary.jsx";
import ConfirmationMessage from "./ConfirmationMessage.jsx";
import Icon from "./Icon.jsx";

const NEAR_BOTTOM_THRESHOLD = 80;

export default function ChatThread({
  messages,
  isTyping,
  notice,
  emptyState,
  openKey,
  bookingKey,
  bookings,
  reschedulingKey,
  authorizingKey,
  pendingBookings,
  onToggleCard,
  onStartBooking,
  onChooseSlot,
  onAuthorize,
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
  const lastMessageCountRef = useRef(messages.length);

  // Reading old messages should not get yanked back to the bottom by
  // something arriving unprompted — that's what stickToBottomRef is for. But
  // nothing in this thread arrives unprompted: every message here (a sent
  // text, a booking confirmation, a cancel, a reschedule, an action-button
  // reply) is the direct result of something the reader just did, so a new
  // message showing up is itself the signal to resume following the
  // conversation, scrolled up or not — this used to only check for
  // type === "user_text", which covered sending a message but missed
  // booking a slot (a "booking_confirmation" message appended from
  // handleChooseSlot) and every other action-triggered reply. Done as a
  // plain during-render comparison (not an effect) so it lands before the
  // ResizeObserver below ever gets a chance to observe this message's resize
  // and check the flag.
  if (messages.length > lastMessageCountRef.current) {
    stickToBottomRef.current = true;
    lastMessageCountRef.current = messages.length;
  }

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
  //
  // This used to be a discrete effect keyed on [messages, isTyping, notice],
  // computing document.documentElement.scrollHeight once per state change and
  // scrolling to it. That target is stale the instant it's read: the typing
  // indicator's wrapper is a .collapse element whose height is an animated
  // grid-template-rows (var(--duration-collapse), 220ms), not an instant
  // resize, so the effect fired before that transition had grown the page to
  // its real height — every time, not occasionally. The scroll landed short,
  // the listener above measured that shortfall against NEAR_BOTTOM_THRESHOLD
  // and latched stickToBottomRef to false, and autoscroll silently stopped
  // following the conversation for the rest of the session (the composer
  // flowing after .chat-thread rather than inside it, on the >=1080px
  // desktop layout, made the very first shortfall large enough to guarantee
  // this on every session).
  //
  // A ResizeObserver on the page body sidesteps the timing problem instead of
  // trying to out-guess it: it fires on every real layout change, including
  // the ones mid-CSS-transition, so it keeps re-issuing the scroll on each
  // frame the page's actual height changes rather than computing a target
  // once and hoping nothing grows after.
  useEffect(() => {
    function chase() {
      if (!stickToBottomRef.current) return;
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "auto" });
    }
    const observer = new ResizeObserver(chase);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="chat-thread chat-thread-empty" ref={scrollRef}>
        {emptyState}
      </div>
    );
  }

  const lastResultsId = messages.filter((m) => m.type === "results").at(-1)?.id;

  // Consecutive booking_confirmation messages — booking two providers back
  // to back from the same still-open results, no search in between — used
  // to render as separate full-width rows, each only half filled, with
  // nothing of substance in the other half: not "two cards side by side,"
  // just two narrow boxes stacked with a gap. Grouped here into runs so
  // they share one real grid instead, 2-up with a normal gap, reading as
  // one batch rather than two unrelated bookings.
  const renderItems = [];
  for (const message of messages) {
    if (message.type === "booking_confirmation") {
      const last = renderItems.at(-1);
      if (last?.type === "booking_confirmation_group") {
        last.messages.push(message);
        continue;
      }
      renderItems.push({ type: "booking_confirmation_group", key: message.id, messages: [message] });
      continue;
    }
    renderItems.push(message);
  }

  return (
    <div className="chat-thread" ref={scrollRef}>
      {renderItems.map((message) => {
        switch (message.type) {
          case "booking_confirmation_group":
            return (
              <div key={message.key} className="message-row from-bot message-enter">
                <div className="booking-confirmation-group">
                  {message.messages.map((m) => {
                    const booking = bookings[m.key];
                    if (!booking) return null;
                    return (
                      <ConfirmationMessage
                        key={m.id}
                        booking={booking}
                        listing={m.listing}
                        transitionName={m.transitionName}
                        isRescheduling={reschedulingKey === m.key}
                        onCancel={() => onCancelBooking(m.key)}
                        onReschedule={() => onToggleReschedule(m.key)}
                        onChooseSlot={(_, slot) => onChooseReschedule(m.key, m.listing, slot)}
                      />
                    );
                  })}
                </div>
              </div>
            );
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
                authorizingKey={authorizingKey}
                pendingBookings={pendingBookings}
                onToggle={onToggleCard}
                onStartBooking={onStartBooking}
                onChooseSlot={(key, listing, slot) => onChooseSlot(key, listing, slot, message.request)}
                onAuthorize={onAuthorize}
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
          default:
            return null;
        }
      })}
      {notice && (
        <div key={notice.id} className="message-row from-bot chat-notice-row" role="status">
          <div className="chat-booking-notice">
            <Icon name="checkCircle" size={16} />
            <span>{notice.message}</span>
          </div>
        </div>
      )}
      {/* Stays mounted so it can fade and collapse out rather than vanishing. */}
      <div className={`collapse ${isTyping ? "is-open" : ""}`} aria-hidden={!isTyping}>
        <div className="collapse-inner">
          <TypingIndicator />
        </div>
      </div>
    </div>
  );
}
