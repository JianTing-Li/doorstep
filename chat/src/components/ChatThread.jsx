import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import ResultsList from "./ResultsList.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

const NEAR_BOTTOM_THRESHOLD = 80;

export default function ChatThread({ messages, isTyping, emptyState }) {
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
        if (message.type === "user_text") {
          return <MessageBubble key={message.id} from="user" text={message.text} />;
        }
        if (message.type === "bot_text") {
          return <MessageBubble key={message.id} from="bot" text={message.text} />;
        }
        if (message.type === "results") {
          return <ResultsList key={message.id} listings={message.results} />;
        }
        return null;
      })}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
