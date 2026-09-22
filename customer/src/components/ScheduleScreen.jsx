import Icon from "./Icon.jsx";
import { formatSlotLong, initial, referenceSlots } from "../lib/format.js";

const FALLBACK_SLOTS = referenceSlots();

// A second, plainer slot picker — reached only from the provider-chat
// "Book Pro" shortcut, not from Profile. A real, distinct second path to
// checkout in his original, not a duplicate screen.
export default function ScheduleScreen({ listing, provider, onBack, onContinue, onSelectSlot, selectedSlot }) {
  const slots = listing.availability?.length ? listing.availability : FALLBACK_SLOTS;

  return (
    <div className="sub-screen">
      <div className="sub-header">
        <button type="button" className="icon-button" onClick={onBack}><Icon name="arrowLeft" size={16} /></button>
        <h2>Schedule Service</h2>
        <span className="sub-header-spacer" />
      </div>

      <div className="sub-body">
        <div className="schedule-provider-card">
          <span className="avatar avatar-accent">{initial(provider.name)}</span>
          <div>
            <h4>{provider.name}</h4>
            <p>{listing.title}</p>
          </div>
        </div>

        <h3 className="section-label">Available Appointment Slots</h3>
        <div className="schedule-slot-list">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              className={`schedule-slot-row ${selectedSlot === slot ? "is-selected" : ""}`}
              onClick={() => onSelectSlot(slot)}
            >
              <span className="schedule-slot-icon"><Icon name="calendar" size={14} /></span>
              <span className="schedule-slot-text">
                <strong>{formatSlotLong(slot).split(",")[0]}</strong>
                <small>{formatSlotLong(slot).split(",").slice(1).join(",").trim()}</small>
              </span>
              <Icon name="chevronRight" size={13} />
            </button>
          ))}
        </div>

        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onContinue} disabled={!selectedSlot} style={{ marginTop: "auto" }}>
          Proceed to Escrow Checkout
        </button>
      </div>
    </div>
  );
}
