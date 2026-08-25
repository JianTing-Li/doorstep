import ListingCard from "./ListingCard.jsx";
import { transitionNameFor } from "../lib/viewTransition.js";

export default function ResultsList({
  messageId,
  listings,
  openKey,
  bookingKey,
  bookings,
  reschedulingKey,
  onToggle,
  onStartBooking,
  onChooseSlot,
  onCancelBooking,
  onToggleReschedule,
  onChooseReschedule,
  skipLabel,
  onSkip,
  requestCompleted,
  onReopen,
}) {
  if (listings.length === 0) return null;

  function stateFor(key) {
    if (bookings[key]) return "booked";
    if (bookingKey === key) return "booking";
    if (openKey === key) return "expanded";
    return "collapsed";
  }

  return (
    <div className="message-row from-bot message-enter">
      <div className="results-list">
        {listings.map((listing) => {
          const key = `${messageId}:${listing.listing_id}`;
          return (
            <ListingCard
              key={listing.listing_id}
              variant="ask"
              transitionName={transitionNameFor(key)}
              listing={listing}
              state={stateFor(key)}
              booking={bookings[key]}
              isRescheduling={reschedulingKey === key}
              onToggle={() => onToggle(key)}
              onStartBooking={() => onStartBooking(key)}
              onChooseSlot={(_, slot) => onChooseSlot(key, listing, slot)}
              onCancelBooking={() => onCancelBooking(key)}
              onToggleReschedule={() => onToggleReschedule(key)}
              onChooseReschedule={(_, slot) => onChooseReschedule(key, listing, slot)}
              disabled={requestCompleted && !bookings[key]}
            />
          );
        })}
        {skipLabel && !requestCompleted && (
          <button type="button" className="skip-button" onClick={onSkip}>
            {skipLabel}
          </button>
        )}
        {skipLabel && requestCompleted && (
          <div className="request-complete-state">
            <span>Request complete</span>
            <button type="button" onClick={onReopen}>Reopen options</button>
          </div>
        )}
      </div>
    </div>
  );
}
