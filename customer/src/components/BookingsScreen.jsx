import Icon from "./Icon.jsx";
import { formatMoney, formatSlotFull } from "../lib/format.js";
import { useApp } from "../AppContext.jsx";
import { completeCanonicalBooking } from "../lib/bookings.js";

// My Bookings & Activity — his getMyBookingsHTML(), ported. Three sections
// on one screen: upcoming jobs, completed history, trust & safety cases.
export default function BookingsScreen() {
  const { customer, bookings, setBookings, reports, openProviderChat, openReport, openReview, showToast } = useApp();
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const completed = bookings.filter((b) => b.status === "completed");

  function complete(bookingId) {
    completeCanonicalBooking(bookings.find((b) => b.id === bookingId));
    setBookings((prev) => prev.map((b) => (
      b.id === bookingId ? { ...b, status: "completed", escrowStatus: "released" } : b
    )));
    showToast("Job completed! Escrow released to provider.", "checkCircle");
    openReview(bookingId);
  }

  return (
    <div className="bookings-screen">
      <div className="sub-header sub-header-tight">
        <div>
          <h2>My Bookings &amp; Activity</h2>
          <span className="sub-header-note">Account: {customer.name}</span>
        </div>
      </div>

      <div className="screen-pad bookings-body">
        <section>
          <h3 className="section-label">
            <span className="dot dot-accent" /> Upcoming Jobs ({upcoming.length})
          </h3>
          {upcoming.length === 0 ? (
            <div className="empty-panel empty-panel-sm ds-empty-state">No upcoming bookings currently.</div>
          ) : (
            upcoming.map((b) => (
              <div key={b.id} className="booking-card">
                <div className="booking-card-top">
                  <div>
                    <span className="mono-pill">{b.id}</span>
                    <h4>{b.provider_name}</h4>
                    <p>{b.title}</p>
                  </div>
                  <span className="booking-amount">{formatMoney(b.total)} Escrow</span>
                </div>
                <div className="booking-card-meta">
                  <div><Icon name="clock" size={12} /> {formatSlotFull(b.timeSlot)}</div>
                  <div><Icon name="location" size={12} /> {b.address}</div>
                </div>
                <div className="booking-card-actions">
                  <button type="button" onClick={() => openProviderChat(b.provider_id || "prv_001", b.listing_id || "lst_001")}>
                    <Icon name="message" size={12} /> Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => openReport({ listing_id: b.listing_id, provider_id: b.provider_id, booking_id: b.id })}
                  >
                    <Icon name="shieldCat" size={12} /> Report
                  </button>
                  <button type="button" className="booking-card-complete" onClick={() => complete(b.id)}>
                    <Icon name="check" size={12} /> Complete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section>
          <h3 className="section-label"><Icon name="history" size={13} /> Completed History ({completed.length})</h3>
          {completed.length === 0 ? (
            <div className="empty-panel empty-panel-sm ds-empty-state">No completed jobs yet.</div>
          ) : (
            completed.map((b) => (
              <div key={b.id} className="booking-card booking-card-muted">
                <div className="booking-card-top">
                  <div>
                    <span className="mono-pill mono-pill-neutral">{b.id}</span>
                    <h4>{b.provider_name}</h4>
                    <p>{b.title}</p>
                  </div>
                  <span className="booking-amount-neutral">Paid {formatMoney(b.total)}</span>
                </div>
                {b.rating ? (
                  <div className="review-recap">
                    <div className="review-recap-stars">
                      {"★".repeat(b.rating)}{"☆".repeat(5 - b.rating)}
                      <small>Your Review</small>
                    </div>
                    <p>&ldquo;{b.review || "Great service!"}&rdquo;</p>
                  </div>
                ) : (
                  <button type="button" className="btn btn-soft-accent btn-block" onClick={() => openReview(b.id)}>
                    ★ Leave Rating &amp; Review
                  </button>
                )}
              </div>
            ))
          )}
        </section>

        <section>
          <h3 className="section-label section-label-danger"><Icon name="shieldCat" size={13} /> Trust &amp; Safety Cases ({reports.length})</h3>
          {reports.length === 0 ? (
            <div className="empty-panel empty-panel-sm ds-empty-state">No active safety reports filed for this account.</div>
          ) : (
            reports.map((rep) => (
              <div key={rep.report_id} className="report-card">
                <div className="report-card-top">
                  <div>
                    <span className="mono-pill mono-pill-danger">{rep.report_id}</span>
                    <h4>{(rep.safety_flag_type || "").replace(/_/g, " ")}</h4>
                  </div>
                  <span className="report-status">{rep.status || "Under Review"}</span>
                </div>
                <p className="report-card-details">{rep.report_details}</p>
                <div className="report-card-footer">
                  <span>Filed: {new Date(rep.created_at).toLocaleDateString()}</span>
                  <span className="report-card-assigned">Assigned to Product D Moderation</span>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
