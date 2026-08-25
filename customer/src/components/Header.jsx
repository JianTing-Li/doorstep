import Icon from "./Icon.jsx";
import { initial } from "../lib/format.js";
import { useApp } from "../AppContext.jsx";

// Top header: logo (-> Browse/Dashboard), persona chip, bookings shortcut.
// His original design exactly — the bottom tab bar (Phase 5's own addition)
// is new chrome alongside this, not a replacement for it.
export default function Header({ onLogoClick, onBookingsClick }) {
  const { customer, bookings, openPersonaModal } = useApp();
  const hasUpcoming = bookings.some((b) => b.status === "upcoming");

  // The Doorstep wordmark is NOT rendered here — shared/header.js owns it for
  // every product. This bar carries only what is specific to the customer
  // app: which persona is active, and a shortcut to Bookings.
  return (
    <header className="app-header">
      <button type="button" className="app-header-home" onClick={onLogoClick}>
        <Icon name="home" size={15} />
        <span>Home</span>
      </button>

      <div className="app-header-actions">
        <button type="button" className="persona-chip" onClick={openPersonaModal} title="Switch demo customer persona">
          <span className="persona-chip-avatar">{initial(customer.name)}</span>
          <span className="persona-chip-name">{customer.name.split(" ")[0]}</span>
          <Icon name="chevronDown" size={10} />
        </button>
        <button type="button" className="header-icon-button" onClick={onBookingsClick} title="My Bookings">
          <Icon name="receipt" size={19} />
          {hasUpcoming && <span className="header-icon-badge" />}
        </button>
      </div>
    </header>
  );
}
