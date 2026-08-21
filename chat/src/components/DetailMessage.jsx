import { bookableSlots, formatSlot } from "../lib/booking.js";

// The expanded section of a listing card — provider background and the full
// listing text. Rendered inside the card, never as its own thread message.
export default function DetailMessage({ listing, onBook, showBookButton, disabled = false }) {
  const provider = listing.provider;
  const slots = bookableSlots(listing);
  const slotCount = slots.length;

  return (
    <div className="detail-section">
      {/* provider.rating — the provider's overall score across all their
          listings, not this listing's. Labelled so the two never read as the
          same number. */}
      <p className="detail-provider-meta">
        {provider?.rating != null ? (
          <>
            ★ {provider.rating.toFixed(1)} ({provider.review_count}){" "}
            <span className="rating-scope">provider overall</span>
          </>
        ) : (
          <span className="rating-scope">Provider not yet rated</span>
        )}
        {provider?.member_since ? ` · on Doorstep since ${provider.member_since.slice(0, 4)}` : ""}
      </p>
      {provider?.bio && <p className="detail-provider-bio">{provider.bio}</p>}

      <p className="detail-provider-meta">
        Based in {listing.provider_location} · serves up to {listing.service_radius_miles} miles
      </p>

      <p className="detail-listing-description">{listing.listing_description}</p>
      <p className="detail-availability">
        {slotCount > 0
          ? `Earliest: ${formatSlot(slots[0])} · ${slotCount} open time${slotCount === 1 ? "" : "s"}`
          : "No open times right now"}
      </p>

      {listing.relevantReview?.text && (
        <blockquote className="detail-review">
          “{listing.relevantReview.text}”
          <cite>Verified Doorstep booking · {listing.relevantReview.rating}/5</cite>
        </blockquote>
      )}

      {showBookButton && (
        <button
          type="button"
          className="detail-book-button"
          // Book opens the slot picker; it must not also collapse the card.
          onClick={(event) => {
            event.stopPropagation();
            onBook(listing);
          }}
          disabled={disabled || slotCount === 0}
        >
          Choose a time
        </button>
      )}
    </div>
  );
}
