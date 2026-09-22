import Icon from "./Icon.jsx";

const TABS = [
  { key: "browse", label: "Browse", icon: "search" },
  { key: "ask", label: "Ask", icon: "sparkles" },
  { key: "bookings", label: "Bookings", icon: "receipt" },
  { key: "profile", label: "Profile", icon: "users" },
];

// Two renderings of the same four destinations, CSS-toggled at the same
// 1080px breakpoint the rest of the app already widens at. Bottom tab bars
// read as native mobile-app chrome once the page is desktop-wide (nothing
// else in Doorstep uses that pattern — Provider's own nav is a pill row at
// the top); rather than stretching the phone-shaped bottom bar across a full
// desktop viewport, TopNav takes over above the breakpoint and TabBar is the
// one hidden. Both mount unconditionally (in App.jsx) — display:none is what
// decides which one is actually on screen — so there is exactly one active
// tab everywhere, never a moment with both or neither present.

export function TabBar({ active, onSelect }) {
  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`tab-bar-item ${active === tab.key ? "is-active" : ""}`}
          onClick={() => onSelect(tab.key)}
          aria-current={active === tab.key ? "page" : undefined}
        >
          <Icon name={tab.icon} size={20} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function TopNav({ active, onSelect }) {
  return (
    <nav className="top-nav" aria-label="Primary">
      <div className="top-nav-pill">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`top-nav-item ${active === tab.key ? "is-active" : ""}`}
            onClick={() => onSelect(tab.key)}
            aria-current={active === tab.key ? "page" : undefined}
          >
            <Icon name={tab.icon} size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default TabBar;
