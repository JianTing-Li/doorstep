import { useState } from "react";
import Icon from "./Icon.jsx";
import { formatSlotShort, initial, priceLabel, ratingLabel, referenceSlots } from "../lib/format.js";
import { useApp } from "../AppContext.jsx";

const FALLBACK_SLOTS = referenceSlots();

// Listing/provider profile — his getProfileHTML(), ported.
export default function ListingProfileScreen({ listing, provider, onBack, onContinue, onSelectSlot, selectedSlot }) {
  const { openProviderChat, openReport, showToast } = useApp();
  const slots = listing.availability?.length ? listing.availability : FALLBACK_SLOTS;

  function handleContinue() {
    if (!selectedSlot) {
      showToast("Please pick a time slot before continuing", "warning");
      return;
    }
    onContinue();
  }

  return (
    <div className="profile-screen">
      <div className="profile-cover">
        <button type="button" className="profile-back" onClick={onBack}><Icon name="arrowLeft" size={13} /></button>
        <span className="profile-cover-wordmark">DOORSTEP</span>
      </div>

      <div className="profile-sheet">
        <div className="profile-heading">
          <div className="profile-identity">
            <span className="avatar avatar-accent avatar-lg">{initial(provider.name)}</span>
            <div>
              <h1>{provider.name} <Icon name="checkCircle" size={13} className="verified-check" /></h1>
              <p className="profile-listing-title">{listing.title}</p>
            </div>
          </div>
          <div className="profile-price">
            {priceLabel(listing).replace(/(\/hr| flat)/, "")}
            <small>{listing.price_unit === "hourly" ? "/hr" : " flat"}</small>
          </div>
        </div>

        <div className="profile-stats">
          <div><span className="stat-highlight"><Icon name="star" size={11} /> {ratingLabel(listing.rating)}</span><small>{listing.review_count || 0} reviews</small></div>
          <div className="profile-stats-divider"><strong>{listing.provider_location}</strong><small>Portland Area</small></div>
          <div><span className="stat-highlight"><Icon name="shield" size={11} /> Escrow</span><small>Protected</small></div>
        </div>

        <div className="profile-actions">
          <button type="button" className="btn btn-soft-accent" onClick={() => openProviderChat(provider.provider_id, listing.listing_id)}>
            <Icon name="message" size={13} /> Message Provider
          </button>
          <button
            type="button"
            className="btn btn-soft-neutral"
            onClick={() => openReport({ listing_id: listing.listing_id, provider_id: provider.provider_id, booking_id: null })}
          >
            <Icon name="shieldCat" size={13} /> Safety Report
          </button>
        </div>

        <div className="profile-copy">
          <div>
            <h3>Service Scope</h3>
            <p>{listing.listing_description}</p>
          </div>
          <div>
            <h3>About Provider</h3>
            <p className="profile-bio">&ldquo;{provider.bio || "Experienced local home service provider."}&rdquo;</p>
          </div>
        </div>

        <h3 className="profile-slots-heading">Select Available Time Slot</h3>
        <div className="slot-grid">
          {slots.map((slot) => {
            const { dayName, dayNum, time } = formatSlotShort(slot);
            return (
              <button
                key={slot}
                type="button"
                className={`slot-card ${selectedSlot === slot ? "is-selected" : ""}`}
                onClick={() => onSelectSlot(slot)}
              >
                <span className="slot-day">{dayName}</span>
                <span className="slot-num">{dayNum}</span>
                <span className="slot-time">{time}</span>
              </button>
            );
          })}
        </div>

        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={handleContinue}>
          Continue to Checkout <Icon name="arrowRight" size={13} />
        </button>
      </div>
    </div>
  );
}
