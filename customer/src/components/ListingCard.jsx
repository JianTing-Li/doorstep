import Icon from "./Icon.jsx";
import DetailMessage from "./DetailMessage.jsx";
import SlotPicker from "./SlotPicker.jsx";
import ConfirmationMessage from "./ConfirmationMessage.jsx";
import { initial, priceLabel, ratingLabel } from "../lib/format.js";
import { availabilityLabel } from "../lib/booking.js";
import { useApp } from "../AppContext.jsx";

// role="button" on a <div>/<article> gets tab focus for free but not
// keyboard activation — a real <button> responds to Enter and Space
// natively; this doesn't, so the compact and dense variants below were
// focusable but silently did nothing on either key. The "ask" variant's own
// onKeyDown already covered this; these two just never got it.
function activateOnKey(onActivate) {
  return (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onActivate();
  };
}

// THE listing card — one component, rendered by Browse and by Ask (Phase 6).
// A result from the chatbot and a result from the feed are visually identical
// because they are literally the same head markup; only the affordances below
// it differ by variant.
//
//   compact — Dashboard's "Top-Rated Providers" strip
//   dense   — Browse feed
//   ask     — Ask results; adds the collapsed -> expanded -> booking -> booked
//             progression the chatbot owns (a card in Ask books in place,
//             rather than navigating away to the Profile screen)
export default function ListingCard({
  listing,
  provider,
  variant = "compact",
  onOpen,
  // ask-only
  state = "collapsed",
  booking,
  transitionName,
  isRescheduling,
  onToggle,
  onStartBooking,
  onChooseSlot,
  onCancelBooking,
  onToggleReschedule,
  onChooseReschedule,
  disabled = false,
}) {
  const { openProviderChat } = useApp();
  const resolvedProvider = provider ?? listing.provider ?? {};

  // A booked card in Ask is replaced by its confirmation, which owns the
  // reschedule/cancel affordances.
  if (variant === "ask" && state === "booked") {
    return (
      <ConfirmationMessage
        booking={booking}
        listing={listing}
        transitionName={transitionName}
        isRescheduling={isRescheduling}
        onCancel={onCancelBooking}
        onReschedule={onToggleReschedule}
        onChooseSlot={onChooseReschedule}
      />
    );
  }

  // ---- The shared head. Identical markup in every variant. ----
  const head = (
    <>
      <div className="listing-card-top">
        <div className="listing-card-identity">
          <span className="avatar avatar-gradient">{initial(resolvedProvider.name)}</span>
          <div>
            <h3 className="listing-card-provider">
              {resolvedProvider.name || "Doorstep provider"}{" "}
              <Icon name="checkCircle" size={12} className="verified-check" />
            </h3>
            <span className="listing-card-location">{listing.provider_location}</span>
          </div>
        </div>
        <div className="listing-card-price">
          <span>${listing.price}</span>
          <small>{listing.price_unit === "hourly" ? "/hr" : " flat"}</small>
        </div>
      </div>

      <h4 className="listing-card-title">{listing.title}</h4>

      <div className="listing-card-meta">
        <span className="rating-inline">
          <Icon name="star" size={11} /> {ratingLabel(listing.rating)}
          <small>({listing.review_count || 0})</small>
        </span>
        {variant === "ask" ? (
          <span className="listing-card-availability">{availabilityLabel(listing)}</span>
        ) : (
          <span className="listing-card-escrow">
            <Icon name="shield" size={11} /> Escrow
          </span>
        )}
      </div>
    </>
  );

  // ---- compact: Dashboard strip ----
  if (variant === "compact") {
    return (
      <article
        className="listing-card listing-card-compact"
        onClick={onOpen}
        onKeyDown={activateOnKey(onOpen)}
        role="button"
        tabIndex={0}
      >
        {head}
        <button
          type="button"
          className="chip-button listing-card-chat"
          title="Chat with provider"
          onClick={(e) => { e.stopPropagation(); openProviderChat(resolvedProvider.provider_id, listing.listing_id); }}
        >
          <Icon name="message" size={11} /> Chat
        </button>
      </article>
    );
  }

  // ---- dense: Browse feed ----
  if (variant === "dense") {
    return (
      <article className="listing-card listing-card-dense">
        <div onClick={onOpen} onKeyDown={activateOnKey(onOpen)} role="button" tabIndex={0}>
          {head}
          <p className="listing-card-desc">{listing.listing_description}</p>
        </div>
        <div className="listing-card-footer">
          <div className="listing-card-actions">
            <button
              type="button"
              className="icon-button"
              title="Message Provider"
              onClick={(e) => { e.stopPropagation(); openProviderChat(resolvedProvider.provider_id, listing.listing_id); }}
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

  // ---- ask: same head, plus the in-place booking progression ----
  const isOpen = state === "expanded" || state === "booking";
  return (
    <article
      className={`listing-card listing-card-ask listing-card-tappable ${isOpen ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-expanded={isOpen}
      aria-disabled={disabled}
      style={transitionName ? { viewTransitionName: transitionName } : undefined}
      onClick={() => !disabled && onToggle(listing)}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle(listing);
        }
      }}
    >
      <div className="listing-card-head">
        {head}
        {listing.matchedLabels?.length > 0 && (
          <div className="listing-card-labels">
            {listing.matchedLabels.map((label) => (
              <span className="service-label" key={label}>{label}</span>
            ))}
          </div>
        )}
        {listing.reason && <p className="listing-card-reason">{listing.reason}</p>}
      </div>

      {/* Kept mounted so height can animate in both directions — unmounting on
          collapse would cut straight to zero. The grid-rows 0fr/1fr pair is what
          makes an auto height animatable. */}
      <div className={`collapse ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
        <div className="collapse-inner">
          <div className="listing-card-body">
            <DetailMessage
              listing={listing}
              onBook={onStartBooking}
              showBookButton={state === "expanded"}
              disabled={disabled}
            />
            <div className={`collapse ${state === "booking" ? "is-open" : ""}`}>
              <div className="collapse-inner">
                <SlotPicker listing={listing} onChoose={onChooseSlot} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
