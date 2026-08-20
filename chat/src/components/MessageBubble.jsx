export default function MessageBubble({ from, text }) {
  return (
    <div className={`message-row from-${from} message-enter`}>
      <div className={`message-bubble ${from === "user" ? "user" : "bot"}`}>{text}</div>
    </div>
  );
}
