import Icon from "./Icon.jsx";
import { escrowBreakdown, formatDateShort, formatMoney } from "../lib/format.js";

export default function ConfirmationScreen({ booking, onViewBookings, onHome }) {
  return (
    <div className="confirmation-screen">
      <span className="confirmation-badge"><Icon name="check" size={26} /></span>
      <span className="confirmation-eyebrow">Escrow Authorized</span>
      <h1>Booking Confirmed!</h1>
      <p className="confirmation-copy">
        We notified <strong>{booking.provider_name}</strong>. Funds will remain safely in escrow until the
        job is completed.
      </p>

      <div className="confirmation-summary">
        <div className="confirmation-row">
          <span>Booking Reference</span>
          <strong className="mono">{booking.id}</strong>
        </div>
        <div className="confirmation-row">
          <span>Scheduled Date</span>
          <strong>{formatDateShort(booking.timeSlot)}</strong>
        </div>
        <div className="confirmation-row">
          <span>
            Escrow Total
            <small className="confirmation-row-note">
              {formatMoney(escrowBreakdown(booking).pricePaid)} service + {escrowBreakdown(booking).ratePercent}% platform fee
            </small>
          </span>
          <strong className="confirmation-total">{formatMoney(booking.total)}</strong>
        </div>
      </div>

      <div className="confirmation-actions">
        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onViewBookings}>
          View in My Bookings
        </button>
        <button type="button" className="btn btn-soft-neutral btn-block" onClick={onHome}>
          Return to Home
        </button>
      </div>
    </div>
  );
}
