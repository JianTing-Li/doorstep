import Icon from "./Icon.jsx";
import { formatMoney } from "../lib/format.js";
import { formatSlot } from "../lib/booking.js";
import { getMeta } from "../data/loadData.js";

// The Ask-flow's escrow step — a compact, inline version of CheckoutScreen's
// authorize step (same copy, same fee math, same commission_rate), rendered
// inside the card's own collapse instead of a separate screen. See
// CheckoutScreen.jsx for the full-screen original this mirrors.
export default function EscrowAuthorize({ listing, slot, isAuthorizing, onAuthorize }) {
  const isHourly = listing.price_unit === "hourly";
  const quantity = isHourly ? (listing.minimum_quantity ?? 1) : 1;
  const subtotal = isHourly ? listing.price * quantity : listing.price;
  const commissionRate = getMeta().commission_rate ?? 0.15;
  const platformFee = subtotal * commissionRate;
  const total = subtotal + platformFee;

  return (
    <div className="escrow-authorize">
      <div className="checkout-card">
        <div className="checkout-line">
          <span><Icon name="calendar" size={12} /> Date &amp; Time</span>
          <strong>{slot ? formatSlot(slot) : "Pending Slot"}</strong>
        </div>
      </div>

      <div className="escrow-notice">
        <span className="escrow-notice-icon"><Icon name="shield" size={16} /></span>
        <div>
          <h4>Doorstep Escrow Guarantee</h4>
          <p>Funds are held securely by Doorstep and only released to the provider <strong>after you verify job completion</strong>.</p>
        </div>
      </div>

      <div className="checkout-card">
        <div className="price-row">
          <span>Base Service {isHourly ? `($${listing.price}/hr × ${quantity}h)` : "Rate"}</span>
          <strong>{formatMoney(subtotal)}</strong>
        </div>
        <div className="price-row">
          <span>Doorstep Trust &amp; Escrow Fee ({Math.round(commissionRate * 100)}%)</span>
          <strong>{formatMoney(platformFee)}</strong>
        </div>
        <div className="price-row price-row-total">
          <span>Total Held in Escrow</span>
          <strong>{formatMoney(total)}</strong>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-escrow btn-block escrow-authorize-button"
        onClick={onAuthorize}
        disabled={isAuthorizing}
      >
        <Icon name={isAuthorizing ? "spinner" : "lock"} size={13} className={isAuthorizing ? "spin" : ""} />
        <span>{isAuthorizing ? "Securing Escrow Funds..." : `Authorize ${formatMoney(total)} in Escrow`}</span>
      </button>
    </div>
  );
}
