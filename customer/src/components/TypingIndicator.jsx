export default function TypingIndicator() {
  return (
    <div className="message-row from-bot">
      <div className="typing-indicator" role="status" aria-label="Doorstep is finding matches">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
