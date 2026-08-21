import ListingCard from "./ListingCard.jsx";
import { transitionNameFor } from "../lib/viewTransition.js";

export default function ResultsList({
  messageId,
  listings,
  openKey,
  bookingKey,
  bookings,
  onToggle,
  onStartBooking,
  onChooseSlot,
  skipLabel,
  onSkip,
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
              transitionName={transitionNameFor(key)}
              listing={listing}
              state={stateFor(key)}
              booking={bookings[key]}
              onToggle={() => onToggle(key)}
              onStartBooking={() => onStartBooking(key)}
              onChooseSlot={(_, slot) => onChooseSlot(key, listing, slot)}
            />
          );
        })}
        {skipLabel && (
          <button type="button" className="skip-button" onClick={onSkip}>
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}
