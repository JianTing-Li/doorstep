import Icon from "./Icon.jsx";

// Stubbed this phase, per the brief: Ask becomes a real search modality —
// Product C fused in, with the filter handoff both directions — in Phase 6.
// This placeholder replaces his floating chatbot FAB, which is not carried
// forward (see INTEGRATION-NOTES.md): the architecture forbids a floating
// bubble, and his own chatbot-engine.js is a separate, working feature that
// doesn't fit that constraint either.
export default function AskScreen() {
  return (
    <div className="screen-pad ask-stub">
      <span className="ask-stub-icon"><Icon name="sparkles" size={26} /></span>
      <h1>Ask is on its way</h1>
      <p>
        Soon you&rsquo;ll be able to describe a job in plain English right here — the same matching Doorstep&rsquo;s
        chatbot already does, brought into this tab.
      </p>
    </div>
  );
}
