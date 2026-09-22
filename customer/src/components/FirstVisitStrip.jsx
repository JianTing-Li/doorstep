import { useState } from "react";
import Icon from "./Icon.jsx";

// Dismissible first-visit orientation strip (Phase 6). One per product; this
// is the customer app's. Dismissal persists so it only ever appears once.
const KEY = "doorstep:seen-intro:customer";

export default function FirstVisitStrip() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // A blocked storage backend just means the strip returns next visit.
    }
    setDismissed(true);
  }

  return (
    <div className="intro-strip" role="status">
      <Icon name="sparkles" size={14} />
      <p>
        You&rsquo;re the customer. Try the <strong>Ask</strong> tab — describe a job in plain language.
      </p>
      <button type="button" onClick={dismiss} aria-label="Dismiss">
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
