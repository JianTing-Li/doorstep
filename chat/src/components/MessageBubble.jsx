export default function MessageBubble({ from, text, actions, onAction }) {
  return (
    <div className={`message-row from-${from} message-enter`}>
      <div className="message-column">
        <div className={`message-bubble ${from === "user" ? "user" : "bot"}`}>{text}</div>
        {actions?.length > 0 && (
          <div className="message-actions">
            {actions.map((action) => (
              <button
                type="button"
                key={action.action}
                className="skip-button"
                onClick={() => onAction(action.action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
