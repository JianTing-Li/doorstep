import { bookableSlots, priceLabel } from "../lib/booking.js";

export default function DetailMessage({ listing, onBook }) {
  const provider = listing.provider;
  const slotCount = bookableSlots(listing).length;

  return (
    <div className="message-row from-bot message-enter">
      <article className="detail-card">
        <header className="detail-provider">
          <h3 className="detail-provider-name">{provider?.name ?? "Doorstep provider"}</h3>
          <p className="detail-provider-meta">
            {provider?.rating != null
              ? `★ ${provider.rating.toFixed(1)} (${provider.review_count})`
              : "Not yet rated"}
            {provider?.member_since ? ` · on Doorstep since ${provider.member_since.slice(0, 4)}` : ""}
          </p>
          {provider?.bio && <p className="detail-provider-bio">{provider.bio}</p>}
        </header>

        <div className="detail-listing">
          <div className="detail-listing-top">
            <h4 className="detail-listing-title">{listing.title}</h4>
            <span className="detail-listing-price">{priceLabel(listing)}</span>
          </div>
          <p className="detail-listing-description">{listing.listing_description}</p>
          <p className="detail-availability">
            {slotCount > 0
              ? `${slotCount} open time${slotCount === 1 ? "" : "s"}`
              : "No open times right now"}
          </p>
        </div>

        <button
          type="button"
          className="detail-book-button"
          onClick={() => onBook(listing)}
          disabled={slotCount === 0}
        >
          Book
        </button>
      </article>
    </div>
  );
}
