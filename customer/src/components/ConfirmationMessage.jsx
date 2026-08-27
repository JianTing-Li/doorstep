import { useState } from "react";
import { formatSlot, priceLabel } from "../lib/booking.js";
import SlotPicker from "./SlotPicker.jsx";

// The booked state of a listing card: a compact record with two secondary
// actions. Neither carries the weight of the original Book button — the card
// is already in a settled state. Cancel confirms inline before it fires;
// Reschedule reopens the slot picker without ever leaving booked state.
export default function ConfirmationMessage({
  booking,
  listing,
  transitionName,
  isRescheduling,
  onCancel,
  onReschedule,
  onChooseSlot,
}) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const showActions = !isRescheduling && !confirmingCancel;

  return (
    <article
      className="listing-card is-booked"
      style={transitionName ? { viewTransitionName: transitionName } : undefined}
    >
      <p className="booked-marker">Time selected</p>
      <p className="booked-title">
        {listing.title} <span className="booked-provider">· {listing.provider?.name ?? "Doorstep provider"}</span>
      </p>
      <p className="booked-line">{formatSlot(booking.slot)}</p>
      <p className="booked-line">{priceLabel(listing)}</p>
      {booking.request?.description && <p className="booked-request">“{booking.request.description}”</p>}
      <p className="booked-next-step">Demo preview · {listing.provider?.name ?? "the provider"} would confirm this request next.</p>

      {/* Kept mounted so each panel can animate open and closed, same as the
          card body and slot picker elsewhere. */}
      <div className={`collapse ${showActions ? "is-open" : ""}`} aria-hidden={!showActions}>
        <div className="collapse-inner">
          <div className="booked-actions">
            <button type="button" className="booked-action" onClick={() => setConfirmingCancel(true)}>
              Cancel
            </button>
            <button type="button" className="booked-action" onClick={onReschedule}>
              Reschedule
            </button>
          </div>
        </div>
      </div>

      <div className={`collapse ${confirmingCancel ? "is-open" : ""}`} aria-hidden={!confirmingCancel}>
        <div className="collapse-inner">
          <div className="booked-confirm ds-confirm-inline">
            <span className="booked-confirm-label ds-confirm-inline-label">Cancel this request?</span>
            <div className="booked-confirm-actions">
              <button type="button" className="booked-confirm-yes ds-confirm-inline-danger" onClick={onCancel}>
                Cancel request
              </button>
              <button type="button" className="booked-confirm-no ds-confirm-inline-cancel" onClick={() => setConfirmingCancel(false)}>
                Keep it
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`collapse ${isRescheduling ? "is-open" : ""}`} aria-hidden={!isRescheduling}>
        <div className="collapse-inner">
          <div className="booked-reschedule">
            <p className="booked-reschedule-label">Choose a new time</p>
            <SlotPicker listing={listing} currentSlot={booking.slot} onChoose={onChooseSlot} />
            <button type="button" className="booked-reschedule-back" onClick={onReschedule}>
              Keep current time
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
