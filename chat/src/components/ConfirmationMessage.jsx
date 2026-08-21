import { formatSlot, priceLabel } from "../lib/booking.js";

export default function ConfirmationMessage({ booking, listing, jobText }) {
  return (
    <div className="message-row from-bot message-enter">
      <article className="confirmation-card">
        <p className="confirmation-heading">Booked</p>

        <dl className="confirmation-rows">
          <div>
            <dt>Job</dt>
            <dd>{listing.title}</dd>
          </div>
          <div>
            <dt>Provider</dt>
            <dd>{listing.provider?.name ?? "Doorstep provider"}</dd>
          </div>
          <div>
            <dt>When</dt>
            <dd>{formatSlot(booking.slot)}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{priceLabel(listing)}</dd>
          </div>
          {jobText && (
            <div>
              <dt>You asked for</dt>
              <dd className="confirmation-job-text">“{jobText}”</dd>
            </div>
          )}
        </dl>

        <p className="confirmation-reference">{booking.booking_id}</p>
      </article>
    </div>
  );
}
