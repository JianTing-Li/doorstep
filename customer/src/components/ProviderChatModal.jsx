import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { initial, referenceTimestamp } from "../lib/format.js";
import { useApp } from "../AppContext.jsx";

const QUICK_QUESTIONS = [
  { text: "Hi! Are you available this coming Saturday?", label: "🗓️ Weekend availability?" },
  { text: "Can you give a quick estimate for a 2-bedroom home?", label: "💬 Custom estimate?" },
  { text: "Do you bring all required equipment and supplies?", label: "🧰 Tools & supplies?" },
];

// Provider direct-messaging simulator — his design ported: quick-question
// chips, a keyword-matched auto-reply, a simulated typing indicator.
export default function ProviderChatModal({ providerId, listingId, provider, listing, onClose, onBookPro }) {
  const { messages, setMessages } = useApp();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const feedRef = useRef(null);

  const thread = messages[providerId] || [
    { id: "init", sender: "provider", text: `Hi there! I'm ${provider.name}. Feel free to message me with any questions about my services!`, timestamp: referenceTimestamp("09") },
  ];

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [thread.length, typing]);

  function send(text) {
    const msg = text.trim();
    if (!msg) return;
    const userMsg = { id: "m_" + Date.now(), sender: "customer", text: msg, timestamp: referenceTimestamp("10") };
    setMessages((prev) => ({ ...prev, [providerId]: [...(prev[providerId] || thread), userMsg] }));
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const lower = msg.toLowerCase();
      let reply = "Thanks for your message! Yes, I have open slots available this week. Feel free to book directly through my schedule!";
      if (/saturday|weekend|availab/.test(lower)) {
        reply = "Yes, I am available this weekend! You can pick any of the green time slots on my booking page.";
      } else if (/estimate|quote|cost|price/.test(lower)) {
        reply = `My standard rate is $${listing.price || 50} ${listing.price_unit === "hourly" ? "per hour" : "flat"}. Everything is protected through Doorstep Escrow!`;
      } else if (/tool|suppl|equipment/.test(lower)) {
        reply = "I bring all necessary tools, supplies, and protective equipment for the job unless you have special preferences.";
      } else if (/clean/.test(lower)) {
        reply = "I bring non-toxic, eco-friendly supplies and microfiber mops for thorough cleaning. Looking forward to helping!";
      }
      const replyMsg = { id: "m_reply_" + Date.now(), sender: "provider", text: reply, timestamp: referenceTimestamp("10", "01") };
      setMessages((prev) => ({ ...prev, [providerId]: [...(prev[providerId] || thread), replyMsg] }));
    }, 950);
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header drawer-header-dark">
          <div className="drawer-header-identity">
            <span className="avatar avatar-accent">{initial(provider.name)}</span>
            <div>
              <span className="drawer-header-name">{provider.name} <Icon name="checkCircle" size={11} /></span>
              <span className="drawer-header-status"><span className="live-dot" /> Active &bull; {listing.title || "Verified Provider"}</span>
            </div>
          </div>
          <div className="drawer-header-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={onBookPro}>Book Pro</button>
            <button type="button" className="icon-button icon-button-invert" onClick={onClose}><Icon name="close" size={18} /></button>
          </div>
        </div>

        <div className="chip-row chip-row-scroll drawer-chip-row">
          {QUICK_QUESTIONS.map((q) => (
            <button key={q.label} type="button" className="suggestion-chip" onClick={() => send(q.text)}>{q.label}</button>
          ))}
        </div>

        <div className="drawer-feed" ref={feedRef}>
          {thread.map((m) => (
            <div key={m.id} className={`bubble ${m.sender === "customer" ? "bubble-mine" : "bubble-theirs"}`}>
              <p>{m.text}</p>
              <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))}
          {typing && (
            <div className="typing-indicator">
              <span /><span /><span />
              <em>{provider.name} is typing...</em>
            </div>
          )}
        </div>

        <div className="drawer-input">
          <input
            type="text"
            placeholder="Message the provider..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <button type="button" onClick={() => send(input)}><Icon name="paperPlane" size={14} /></button>
        </div>
      </div>
    </div>
  );
}
