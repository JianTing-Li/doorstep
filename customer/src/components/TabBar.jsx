import Icon from "./Icon.jsx";

const TABS = [
  { key: "browse", label: "Browse", icon: "search" },
  { key: "ask", label: "Ask", icon: "sparkles" },
  { key: "bookings", label: "Bookings", icon: "receipt" },
  { key: "profile", label: "Profile", icon: "users" },
];

export default function TabBar({ active, onSelect }) {
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
