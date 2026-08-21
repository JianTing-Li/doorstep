import { formatSlot, priceLabel } from "../lib/booking.js";

// The booked state of a listing card: a compact three-line record that stays
// in the thread. Not a thread message and not re-bookable.
export default function ConfirmationMessage({ booking, listing, transitionName }) {
  return (
    <article
      className="listing-card is-booked"
      style={transitionName ? { viewTransitionName: transitionName } : undefined}
    >
      <p className="booked-marker">Booked</p>
      <p className="booked-title">
        {listing.title} <span className="booked-provider">· {listing.provider?.name ?? "Doorstep provider"}</span>
      </p>
      <p className="booked-line">{formatSlot(booking.slot)}</p>
      <p className="booked-line">{priceLabel(listing)}</p>
    </article>
  );
}
