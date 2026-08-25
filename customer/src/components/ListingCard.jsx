import Icon from "./Icon.jsx";
import { initial, priceLabel, ratingLabel } from "../lib/format.js";
import { useApp } from "../AppContext.jsx";

// One card, used by both the Dashboard's featured list and the Browse feed
// — his original design used the same visual card in both places, just
// denser on the feed. `dense` controls that.
export default function ListingCard({ listing, provider, onOpen, dense = false }) {
  const { openProviderChat } = useApp();

  if (dense) {
    return (
      <article className="listing-card listing-card-dense">
        <div className="listing-card-top" onClick={onOpen} role="button" tabIndex={0}>
          <div className="listing-card-identity">
            <span className="avatar avatar-gradient">{initial(provider.name)}</span>
            <div>
              <h3 className="listing-card-provider">
                {provider.name} <Icon name="checkCircle" size={12} className="verified-check" />
              </h3>
              <span className="listing-card-location">{listing.provider_location}</span>
            </div>
          </div>
          <div className="listing-card-price">
            <span>${listing.price}</span>
            <small>{listing.price_unit === "hourly" ? "/hr" : " flat"}</small>
          </div>
        </div>

        <div onClick={onOpen} role="button" tabIndex={0}>
          <h4 className="listing-card-title">{listing.title}</h4>
          <p className="listing-card-desc">{listing.listing_description}</p>
        </div>

        <div className="listing-card-footer">
          <div className="listing-card-meta">
            <span className="rating-inline">
              <Icon name="star" size={11} /> {ratingLabel(listing.rating)}
              <small>({listing.review_count || 0})</small>
            </span>
            <span className="listing-card-escrow">
              <Icon name="shield" size={11} /> Escrow
            </span>
          </div>
          <div className="listing-card-actions">
            <button
              type="button"
              className="icon-button"
              title="Message Provider"
              onClick={(e) => { e.stopPropagation(); openProviderChat(provider.provider_id, listing.listing_id); }}
            >
              <Icon name="message" size={14} />
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={onOpen}>
              Book
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="listing-card listing-card-compact" onClick={onOpen} role="button" tabIndex={0}>
      <div className="listing-card-identity">
        <span className="avatar avatar-accent">{initial(provider.name)}</span>
        <div>
          <h4 className="listing-card-provider-sm">{provider.name}</h4>
          <p className="listing-card-title-sm">{listing.title}</p>
          <div className="listing-card-meta-sm">
            <span className="rating-inline"><Icon name="star" size={10} /> {ratingLabel(listing.rating)}</span>
            <span>&middot;</span>
            <span>{listing.provider_location}</span>
          </div>
        </div>
      </div>
      <div className="listing-card-side">
        <span className="listing-card-price-sm">{priceLabel(listing)}</span>
        <button
          type="button"
          className="chip-button"
          title="Chat with provider"
          onClick={(e) => { e.stopPropagation(); openProviderChat(provider.provider_id, listing.listing_id); }}
        >
          <Icon name="message" size={11} /> Chat
        </button>
      </div>
    </article>
  );
}
