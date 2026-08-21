import { Fragment, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import ExampleChips from "./ExampleChips.jsx";
import ResultsList from "./ResultsList.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import DetailMessage from "./DetailMessage.jsx";
import SlotPicker from "./SlotPicker.jsx";
import ConfirmationMessage from "./ConfirmationMessage.jsx";

const NEAR_BOTTOM_THRESHOLD = 80;

export default function ChatThread({
  messages,
  isTyping,
  emptyState,
  onSelectListing,
  onBook,
  onChooseSlot,
  onAction,
  onExampleSelect,
}) {
  const scrollRef = useRef(null);
  const stickToBottomRef = useRef(true);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;
  }

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
                  actions={message.actions}
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
                listings={message.results}
                onSelect={onSelectListing}
                skipLabel={message.skipLabel}
                onSkip={() => onAction("skip_remaining")}
              />
            );
          case "detail":
            return <DetailMessage key={message.id} listing={message.listing} onBook={onBook} />;
          case "slot_picker":
            return <SlotPicker key={message.id} listing={message.listing} onChoose={onChooseSlot} />;
          case "confirmation":
            return (
              <ConfirmationMessage
                key={message.id}
                booking={message.booking}
                listing={message.listing}
                jobText={message.jobText}
              />
            );
          default:
            return null;
        }
      })}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
