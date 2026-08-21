import { bookableSlots, formatSlot } from "../lib/booking.js";

const SLOT_DISPLAY_CAP = 6;

export default function SlotPicker({ listing, onChoose }) {
  const slots = bookableSlots(listing).slice(0, SLOT_DISPLAY_CAP);

  if (slots.length === 0) return null;

  return (
    <div className="message-row from-bot message-enter">
      <div className="slot-picker">
        {slots.map((slot) => (
          <button
            type="button"
            key={slot}
            className="slot-button"
            onClick={() => onChoose(listing, slot)}
          >
            {formatSlot(slot)}
          </button>
        ))}
      </div>
    </div>
  );
}
