import { useState } from "react";
import Icon from "./Icon.jsx";
import { formatMoney, formatSlotFull, initial } from "../lib/format.js";
import { buildDisplayBooking, recordCanonicalBooking } from "../lib/bookings.js";
import { useApp } from "../AppContext.jsx";

// Escrow checkout — his getCheckoutHTML(), ported. Kept as visual flavor
// per the Gate 0 decision: no real payment processing, same copy and fee
// breakdown as before.
export default function CheckoutScreen({ listing, provider, slot, onBack, onConfirmed }) {
  const { customer, customerId, setBookings, showToast } = useApp();
  const [hours, setHours] = useState(1);
  const [address, setAddress] = useState(customer.address || "1420 NW Lovejoy St, Portland, OR");
  const [paying, setPaying] = useState(false);

  const isHourly = listing.price_unit === "hourly";
  const subtotal = isHourly ? listing.price * hours : listing.price;
  const platformFee = subtotal * 0.15;
  const total = subtotal + platformFee;

  function authorize() {
    setPaying(true);
    setTimeout(() => {
      const booking = buildDisplayBooking({ listing, provider, timeSlot: slot, address, total });
      setBookings((prev) => [booking, ...prev]);
      recordCanonicalBooking(booking, customerId);
      showToast("Escrow Payment Authorized!", "shield");
      setPaying(false);
      onConfirmed(booking);
    }, 1100);
  }

  return (
    <div className="sub-screen">
      <div className="sub-header">
        <button type="button" className="icon-button" onClick={onBack}><Icon name="arrowLeft" size={16} /></button>
        <h2>Escrow Checkout</h2>
        <span className="sub-header-spacer" />
      </div>

      <div className="sub-body checkout-body">
        <div className="checkout-card">
          <div className="checkout-provider-row">
            <span className="avatar avatar-accent">{initial(provider.name)}</span>
            <div>
              <h4>{provider.name}</h4>
              <p>{listing.title}</p>
            </div>
          </div>
          <div className="checkout-line">
            <span><Icon name="calendar" size={12} /> Date &amp; Time</span>
            <strong>{slot ? formatSlotFull(slot) : "Pending Slot"}</strong>
          </div>
          {isHourly && (
            <div className="checkout-line checkout-line-border">
              <span><Icon name="clock" size={12} /> Estimated Duration</span>
              <span className="stepper">
                <button type="button" onClick={() => setHours((h) => Math.max(1, h - 1))}>&minus;</button>
                <strong>{hours} hr</strong>
                <button type="button" onClick={() => setHours((h) => Math.min(8, h + 1))}>+</button>
              </span>
            </div>
          )}
        </div>

        <div className="checkout-card">
          <label className="field-label">Service Location</label>
          <div className="input-with-icon">
            <Icon name="location" size={13} />
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
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
            <span>Base Service {isHourly ? `($${listing.price}/hr × ${hours}h)` : "Rate"}</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <div className="price-row">
            <span>Doorstep Trust &amp; Escrow Fee (15%)</span>
            <strong>{formatMoney(platformFee)}</strong>
          </div>
          <div className="price-row price-row-total">
            <span>Total Held in Escrow</span>
            <strong>{formatMoney(total)}</strong>
          </div>
        </div>

        <button type="button" className="btn btn-escrow btn-block btn-lg" onClick={authorize} disabled={paying}>
          <Icon name={paying ? "spinner" : "lock"} size={13} className={paying ? "spin" : ""} />
          <span>{paying ? "Securing Escrow Funds..." : `Authorize ${formatMoney(total)} in Escrow`}</span>
        </button>
      </div>
    </div>
  );
}
