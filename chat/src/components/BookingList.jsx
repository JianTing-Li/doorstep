import { useState } from "react";
import ConfirmationMessage from "./ConfirmationMessage.jsx";

// A live read of session requests in booking order. It uses the current
// booking store rather than the message snapshot so cancel and reschedule
// changes are reflected wherever the history appears in the thread.
export default function BookingList({ entries, currentBookings, onCancel, onReschedule }) {
  const [reschedulingKey, setReschedulingKey] = useState(null);
  const active = entries.filter(({ key }) => currentBookings[key]);

  if (active.length === 0) {
    return (
      <div className="message-row from-bot message-enter">
        <p className="booking-list-empty">No active requests remain in this list.</p>
      </div>
    );
  }

  return (
    <div className="message-row from-bot message-enter">
      <div className="results-list booking-list">
        {active.map(({ key, listing }) => {
          const booking = currentBookings[key];
          return (
            <ConfirmationMessage
              key={key}
              booking={booking}
              listing={booking.listing ?? listing}
              isRescheduling={reschedulingKey === key}
              onCancel={() => onCancel(key)}
              onReschedule={() => setReschedulingKey((current) => (current === key ? null : key))}
              onChooseSlot={(_, slot) => {
                onReschedule(key, booking.listing ?? listing, slot);
                setReschedulingKey(null);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
