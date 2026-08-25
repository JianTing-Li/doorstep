import { bookableSlots, formatSlotParts } from "../lib/booking.js";

const SLOT_DISPLAY_CAP = 6;

export default function SlotPicker({ listing, onChoose, currentSlot }) {
  const slots = bookableSlots(listing).slice(0, SLOT_DISPLAY_CAP);

  if (slots.length === 0) return null;

  return (
    <div className="slot-picker">
      {slots.map((slot) => {
        const { day, time } = formatSlotParts(slot);
        const isCurrent = slot === currentSlot;
        return (
          <button
            type="button"
            key={slot}
            className={`slot-button ${isCurrent ? "is-current" : ""}`}
            // Tapping a slot books it; it must not also collapse the card.
            onClick={(event) => {
              event.stopPropagation();
              onChoose(listing, slot);
            }}
          >
            <span className="slot-day">{day}</span>
            <span className="slot-time">{time}</span>
            {isCurrent && <span className="slot-current-label">Current</span>}
          </button>
        );
      })}
    </div>
  );
}
