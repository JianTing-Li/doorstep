export default function ListingCard({ listing, onSelect }) {
  const priceLabel =
    listing.price_unit === "hourly" ? `$${listing.price}/hr` : `$${listing.price} flat`;

  return (
    <article
      className="listing-card listing-card-tappable"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(listing)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(listing);
        }
      }}
    >
      <div className="listing-card-top">
        <h3 className="listing-card-title">{listing.title}</h3>
        <span className="listing-card-price">{priceLabel}</span>
      </div>
      <p className="listing-card-provider">{listing.provider?.name ?? "Doorstep provider"}</p>
      <div className="listing-card-meta">
        {listing.rating != null ? (
          <span className="listing-card-rating">★ {listing.rating.toFixed(1)} ({listing.review_count})</span>
        ) : (
          <span className="listing-card-rating">Not yet rated</span>
        )}
        {listing.matchedLabels.map((label) => (
          <span className="service-label" key={label}>
            {label}
          </span>
        ))}
      </div>
      <p className="listing-card-reason">{listing.reason}</p>
    </article>
  );
}
