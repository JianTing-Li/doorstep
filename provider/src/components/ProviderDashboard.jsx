/**
 * ProviderDashboard — Product A's main view.
 *
 * Composition:
 *   - ListingForm          (create a new listing)
 *   - My Listings summary  (all statuses, per Product A README spec)
 *   - Incoming bookings     (pending + confirmed by provider_id)
 *   - Past bookings         (completed / cancelled)
 *
 * Data comes from useProviderData(), the single bridge to the shared
 * read-only mock-data files. The same hook can be shared with Products B,
 * C, and D — everything it returns is snake_case and schema-aligned.
 */
import useProviderData from "../hooks/useProviderData";
import { formatMoney } from "../utils/format";
import BookingCard from "./BookingCard";
import ListingForm from "./ListingForm";

const LISTING_STATUS_LABELS = {
  draft: "draft",
  active: "active",
  paused: "paused",
  suspended: "suspended",
  archived: "archived",
};

export default function ProviderDashboard() {
  const {
    provider,
    reference_date,
    provider_listings,
    provider_listings_summary,
    upcoming_bookings,
    past_bookings,
    bookings_counts,
    createListing,
    updateBookingStatus,
  } = useProviderData();

  const activeCount = provider_listings.filter(
    (l) => l.listing_status === "active"
  ).length;

  return (
    <div className="dashboard">
      <nav className="topbar" aria-label="Provider workspace">
        <div className="dashboard-nav" aria-label="Dashboard sections">
          <a href="#dashboard">Dashboard</a>
          <a href="#create-listing">Create listing</a>
          <a href="#my-listings">My listings</a>
          <a href="#incoming-bookings">Bookings</a>
        </div>
        <div className="provider-chip">
          <span className="provider-avatar" aria-hidden="true">
            {(provider?.name ?? "P").charAt(0)}
          </span>
          <span>
            <strong>{provider?.name ?? "Provider"}</strong>
            <small>Trusted provider</small>
          </span>
        </div>
      </nav>

      <header className="dashboard-header" id="dashboard">
        <div className="welcome-copy">
          <p className="eyebrow">Your provider workspace</p>
          <h1>Welcome back, {(provider?.name ?? "Provider").split(" ")[0]}!</h1>
          <p className="subtitle">
            Create clear home-service listings, manage local requests, and grow
            your independent business in one place.
          </p>
          <div className="trust-row">
            <span>✓ Verified profile</span>
            {provider?.location && <span>⌖ {provider.location}</span>}
            {provider?.rating != null && (
              <span>★ {provider.rating.toFixed(1)} provider rating</span>
            )}
          </div>
        </div>
        <p className="reference-date">
          <span aria-hidden="true">☀</span> {reference_date}
        </p>
      </header>

      <section className="stats-grid" aria-label="Booking summary">
        <StatCard icon="⏳" label="Pending" value={bookings_counts.pending} tone="orange" href="#incoming-bookings" />
        <StatCard icon="🤝" label="Confirmed" value={bookings_counts.confirmed} tone="blue" href="#incoming-bookings" />
        <StatCard icon="✓" label="Completed" value={bookings_counts.completed} tone="green" href="#past-bookings" />
        <StatCard icon="↩" label="Cancelled" value={bookings_counts.cancelled} tone="red" href="#past-bookings" />
        <StatCard icon="✦" label="Active Listings" value={activeCount} tone="purple" href="#my-listings" />
      </section>

      <div className="dashboard-grid">
        <section className="panel form-panel" id="create-listing">
          <ListingForm onCreate={createListing} />
        </section>

        <section className="panel listings-panel" id="my-listings">
          <div className="section-heading">
            <div>
              <p className="eyebrow">What local customers can book</p>
              <h3>My Listings <span className="count-pill">{provider_listings.length}</span></h3>
            </div>
            <span className="section-illustration" aria-hidden="true">🏡</span>
          </div>
          <p className="hint status-summary">
            <span className="status-dot status-dot-active" /> {activeCount} active
            <span className="status-divider">•</span>
            {provider_listings.length - activeCount} other
          </p>

          <details className="integration-note">
            <summary>Shared data integration</summary>
            <p>
              {provider_listings_summary.length} schema-aligned records are
              available to Products B–D from the shared mock-data layer.
            </p>
          </details>

          <ul className="listings-list">
            {provider_listings.map((listing) => (
              <li key={listing.listing_id} className="listing-item">
                <div className="listing-icon" aria-hidden="true">🛠</div>
                <div className="listing-content">
                  <div className="listing-item-main">
                    <strong>{listing.listing_title}</strong>
                    <span className="listing-price">
                      {formatMoney(listing.price_per_day)}
                      {listing.price_unit === "hourly" ? "/hr" : " flat"}
                    </span>
                  </div>
                  <div className="listing-item-meta">
                    <span>{listing.service_type_labels.join(", ")}</span>
                    <span className={`listing-status listing-status-${listing.listing_status}`}>
                      {LISTING_STATUS_LABELS[listing.listing_status]}
                    </span>
                  </div>
                  {listing.included_tasks.length > 0 && (
                    <p className="listing-includes">
                      <strong>Includes:</strong> {listing.included_tasks.join(" • ")}
                    </p>
                  )}
                </div>
              </li>
            ))}
            {provider_listings.length === 0 && (
              <li className="empty-state">No listings yet — create your first one.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="panel bookings-section incoming-section" id="incoming-bookings">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Needs your attention</p>
            <h3>Incoming Bookings <span className="count-pill">{upcoming_bookings.length}</span></h3>
          </div>
          <span className="section-illustration" aria-hidden="true">💌</span>
        </div>
        {upcoming_bookings.length === 0 ? (
          <p className="empty-state">No pending or confirmed bookings right now.</p>
        ) : (
          <div className="bookings-grid">
            {upcoming_bookings.map((booking) => (
              <BookingCard
                key={booking.booking_id}
                booking={booking}
                onUpdateStatus={updateBookingStatus}
              />
            ))}
          </div>
        )}
      </section>

      <section className="panel bookings-section past-section" id="past-bookings">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your service history</p>
            <h3>Past Bookings <span className="count-pill">{past_bookings.length}</span></h3>
          </div>
          <span className="section-illustration" aria-hidden="true">🌿</span>
        </div>
        {past_bookings.length === 0 ? (
          <p className="empty-state">No past bookings yet.</p>
        ) : (
          <div className="bookings-grid">
            {past_bookings.map((booking) => (
              <BookingCard
                key={booking.booking_id}
                booking={booking}
                onUpdateStatus={
                  booking.status === "cancelled" ? undefined : updateBookingStatus
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** Small navigational stat tile used by the dashboard header. */
function StatCard({ icon, label, value, tone, href }) {
  return (
    <a
      className={`stat-card stat-${tone}`}
      href={href}
      aria-label={`${label}: ${value}. Go to section.`}
    >
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <span className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </span>
      <span className="stat-arrow" aria-hidden="true">→</span>
    </a>
  );
}
