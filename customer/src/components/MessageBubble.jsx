const WORD_STAGGER_MS = 22;
const MAX_STAGGER_WORDS = 14;

// Full text is in the DOM the instant this renders — nothing reading the
// reply (tests included) is waiting on the animation. It's a purely visual
// staggered fade-in per word, capped at MAX_STAGGER_WORDS so a long reply
// doesn't turn into a multi-second scroll of text arriving.
function RevealText({ text }) {
  const words = text.split(" ");
  // The space has to live between the spans, not inside one: display:inline-block
  // gives each span its own formatting context, and a trailing space at the end
  // of an inline-block's content gets trimmed the same way trailing whitespace
  // at the end of a line does — that's what was collapsing every gap to zero.
  const nodes = [];
  words.forEach((word, i) => {
    nodes.push(
      <span
        key={i}
        className="reveal-word"
        style={i < MAX_STAGGER_WORDS ? { animationDelay: `${i * WORD_STAGGER_MS}ms` } : undefined}
      >
        {word}
      </span>,
    );
    if (i < words.length - 1) nodes.push(" ");
  });
  return nodes;
}

export default function MessageBubble({ from, text, actions, onAction }) {
  const isBot = from === "bot";
  return (
    <div className={`message-row from-${from} message-enter`}>
      <div className="message-column">
        <div className={`message-bubble ${isBot ? "bot" : "user"}`}>
          {isBot ? <RevealText text={text} /> : text}
        </div>
        {actions?.length > 0 && (
          <div className="message-actions">
            {actions.map((action) => (
              <button
                type="button"
                key={action.action}
                className="skip-button"
                onClick={() => onAction(action.action, action.requestId)}
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
