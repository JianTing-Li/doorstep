const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function priceLabel(listing) {
  const suffix = listing.price_unit === "hourly" ? "/hr" : " flat";
  return `$${listing.price}${suffix}`;
}

function formatSlot(slot) {
  if (!slot) return "Ask about availability";
  const [date, timeWithOffset] = slot.split("T");
  const [, month, day] = date.split("-").map(Number);
  const [hourValue, minute] = timeWithOffset.slice(0, 5).split(":").map(Number);
  const period = hourValue >= 12 ? "PM" : "AM";
  const hour = hourValue % 12 || 12;
  return `${MONTHS[month - 1]} ${day} · ${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

function serviceLabel(code, serviceTypes) {
  return serviceTypes.find((type) => type.code === code)?.label ?? code;
}

export default function ResultsList({ listings, meta, serviceTypes }) {
  if (!listings.length) return null;

  return (
    <section className="results-section" aria-labelledby="results-heading">
      <div className="results-heading-row">
        <div>
          <p className="eyebrow">Best matches</p>
          <h2 id="results-heading">A few good people for the job</h2>
        </div>
        <span>{listings.length} local options</span>
      </div>

      <div className="results-list">
        {listings.slice(0, 4).map((listing, index) => (
          <article className="result-card" key={listing.listing_id}>
            <div className="result-rank" aria-label={`Match ${index + 1}`}>
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="result-main">
              <div className="result-meta">
                {listing.service_type.map((code) => (
                  <span key={code}>{serviceLabel(code, serviceTypes)}</span>
                ))}
              </div>
              <h3>{listing.title}</h3>
              <p>{listing.listing_description}</p>
              <div className="provider-row">
                <span className="provider-avatar" aria-hidden="true">
                  {(listing.provider?.name ?? "D").charAt(0)}
                </span>
                <div>
                  <strong>{listing.provider?.name ?? "Doorstep provider"}</strong>
                  <span>{listing.provider_location}</span>
                </div>
              </div>
            </div>
            <div className="result-aside">
              <strong>{priceLabel(listing)}</strong>
              {listing.price_unit === "hourly" && listing.minimum_quantity > 1 ? (
                <span>{listing.minimum_quantity} hr minimum</span>
              ) : null}
              <span>
                {listing.rating == null
                  ? "New listing"
                  : `★ ${listing.rating.toFixed(1)} · ${listing.review_count} reviews`}
              </span>
              <span>Next: {formatSlot(listing.availability.find((slot) => slot.slice(0, 10) >= meta.reference_date))}</span>
              <button type="button">View details</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
