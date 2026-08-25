import { useState } from "react";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13.5A8 8 0 1 1 10.5 4a6.4 6.4 0 0 0 9.5 9.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 6.5h15M9.5 6.5V4.8h5v1.7M6.5 6.5 7.4 20h9.2l.9-13.5M10.3 10v6.4M13.7 10v6.4" />
    </svg>
  );
}

export default function HeaderActions({ theme, onToggleTheme, onClearChat, canClear }) {
  // Clearing is destructive and there is no undo, so it asks first — inline,
  // not a native confirm dialog.
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="header-actions">
        <span className="clear-confirm-label">Clear chat?</span>
        <button
          type="button"
          className="clear-confirm"
          onClick={() => {
            setConfirming(false);
            onClearChat();
          }}
        >
          Clear
        </button>
        <button type="button" className="clear-cancel" onClick={() => setConfirming(false)}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="header-actions">
      <button
        type="button"
        className="header-button"
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        title={theme === "dark" ? "Light theme" : "Dark theme"}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
      {canClear && (
        <button
          type="button"
          className="header-button"
          onClick={() => setConfirming(true)}
          aria-label="Clear chat"
          title="Clear chat"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}
