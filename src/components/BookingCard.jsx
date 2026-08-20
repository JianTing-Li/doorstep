/**
 * BookingCard — displays a single booking with a status badge and action buttons.
 *
 * Props (exact contract consumed by Products B/C/D if they share this card):
 *   booking: {
 *     booking_id, owner_name, pet_type, start_date, end_date,
 *     total_price, status, listing_title, job_address, quantity, quantity_unit
 *   }
 *   onUpdateStatus?(bookingId, nextStatus) — parent-owned state update.
 *     When omitted, no action buttons render (read-only view for other products).
 *
 * Status -> color: completed = green, confirmed = blue, pending = orange,
 * cancelled = red, anything else = gray.
 */
import { BOOKING_STATUS_COLORS } from "../constants";
import { formatDate, formatMoney, humanize } from "../utils/format";

const STATUS_LABELS = {
  completed: "Completed",
  confirmed: "Confirmed",
  pending: "Pending",
  cancelled: "Cancelled",
};

export default function BookingCard({ booking, onUpdateStatus }) {
  const {
    booking_id,
    owner_name,
    pet_type,
    start_date,
    end_date,
    total_price,
    status,
    listing_title,
    job_address,
    quantity,
    quantity_unit,
  } = booking;

  const statusKey = status ?? "unknown";
  const statusColor = BOOKING_STATUS_COLORS[statusKey] || "gray";
  const statusLabel = STATUS_LABELS[statusKey] || humanize(statusKey);
  const money = formatMoney(total_price);
  const dateLabel =
    start_date === end_date
      ? formatDate(start_date)
      : `${formatDate(start_date)} → ${formatDate(end_date)}`;

  // Hourly bookings carry quantity; flat jobs are a single "job".
  const priceLine =
    quantity_unit === "hours" && quantity > 1
      ? `${money} · ${quantity} hours`
      : money;

  return (
    <div className="booking-card">
      <div className="booking-card-top">
        <div className="booking-owner">
          <span className="booking-avatar" aria-hidden="true">
            {owner_name?.charAt(0) || "P"}
          </span>
          <div>
            <h4>{owner_name}</h4>
            {pet_type && (
              <span className="booking-pet">
                <span aria-hidden="true">🐾</span> {humanize(pet_type)}
              </span>
            )}
          </div>
        </div>
        <span className={`badge badge-${statusColor}`}>
          <span className="badge-dot" aria-hidden="true" />
          {statusLabel}
        </span>
      </div>

      {listing_title && <p className="booking-listing">{listing_title}</p>}

      <div className="booking-card-details">
        <p className="booking-detail">
          <span className="detail-icon" aria-hidden="true">📅</span>
          <span>
            <small>Service date</small>
            <strong>{dateLabel}</strong>
          </span>
        </p>
        <p className="booking-detail">
          <span className="detail-icon" aria-hidden="true">💳</span>
          <span>
            <small>Booking total</small>
            <strong>{priceLine}</strong>
          </span>
        </p>
        {job_address && (
          <p className="booking-detail booking-address">
            <span className="detail-icon" aria-hidden="true">⌖</span>
            <span>
              <small>Service location</small>
              <strong>{job_address}</strong>
            </span>
          </p>
        )}
      </div>

      {onUpdateStatus && (
        <div className="booking-card-actions">
          {status === "pending" && (
            <button
              type="button"
              className="btn btn-accept"
              onClick={() => onUpdateStatus(booking_id, "confirmed")}
            >
              <span aria-hidden="true">✓</span> Accept Request
            </button>
          )}
          {status === "confirmed" && (
            <button
              type="button"
              className="btn btn-complete"
              onClick={() => onUpdateStatus(booking_id, "completed")}
            >
              <span aria-hidden="true">✓</span> Mark Completed
            </button>
          )}
          {(status === "pending" || status === "confirmed") && (
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => onUpdateStatus(booking_id, "cancelled")}
            >
              Decline
            </button>
          )}
        </div>
      )}
    </div>
  );
}