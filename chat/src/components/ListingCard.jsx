import DetailMessage from "./DetailMessage.jsx";
import SlotPicker from "./SlotPicker.jsx";
import ConfirmationMessage from "./ConfirmationMessage.jsx";
import { priceLabel } from "../lib/booking.js";

// A card owns its own progression: collapsed -> expanded -> booking -> booked.
// None of these are thread messages; expanding happens in place so the reader
// never loses their position.
export default function ListingCard({
  listing,
  state = "collapsed",
  booking,
  transitionName,
  isRescheduling,
  onToggle,
  onStartBooking,
  onChooseSlot,
  onCancelBooking,
  onToggleReschedule,
  onChooseReschedule,
}) {
  if (state === "booked") {
    return (
      <ConfirmationMessage
        booking={booking}
        listing={listing}
        transitionName={transitionName}
        isRescheduling={isRescheduling}
        onCancel={onCancelBooking}
        onReschedule={onToggleReschedule}
        onChooseSlot={onChooseReschedule}
      />
    );
  }

  const isOpen = state === "expanded" || state === "booking";

  return (
    // The whole card is the toggle — title, description, ratings, whitespace.
    // The Book button and the slot picker stop propagation so they only ever
    // perform their own action.
    <article
      className={`listing-card listing-card-tappable ${isOpen ? "is-open" : ""}`}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      style={transitionName ? { viewTransitionName: transitionName } : undefined}
      onClick={() => onToggle(listing)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle(listing);
        }
      }}
    >
      <div className="listing-card-head">
        <div className="listing-card-top">
          <h3 className="listing-card-title">{listing.title}</h3>
          <span className="listing-card-price">{priceLabel(listing)}</span>
        </div>
        <p className="listing-card-provider">{listing.provider?.name ?? "Doorstep provider"}</p>
        <div className="listing-card-meta">
          {/* listing.rating — this listing only. The provider's overall rating
              is a different number and is labelled as such when expanded. */}
          {listing.rating != null ? (
            <span className="listing-card-rating">
              ★ {listing.rating.toFixed(1)} ({listing.review_count}){" "}
              <span className="rating-scope">this listing</span>
            </span>
          ) : (
            <span className="listing-card-rating">No reviews on this listing yet</span>
          )}
          {listing.matchedLabels?.map((label) => (
            <span className="service-label" key={label}>
              {label}
            </span>
          ))}
        </div>
        <p className="listing-card-reason">{listing.reason}</p>
      </div>

      {/* Kept mounted so height can animate in both directions — unmounting on
          collapse would cut straight to zero. The grid-rows 0fr/1fr pair is what
          makes an auto height animatable. */}
      <div className={`collapse ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
        <div className="collapse-inner">
          <div className="listing-card-body">
            <DetailMessage
              listing={listing}
              onBook={onStartBooking}
              showBookButton={state === "expanded"}
            />
            <div className={`collapse ${state === "booking" ? "is-open" : ""}`}>
              <div className="collapse-inner">
                <SlotPicker listing={listing} onChoose={onChooseSlot} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
