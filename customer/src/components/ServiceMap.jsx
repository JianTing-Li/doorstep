import { useEffect, useRef } from "react";
import { priceLabel, ratingLabel } from "../lib/format.js";

// Live Leaflet map, centered on Portland, one marker per active listing —
// his original design exactly, just as a React component instead of an
// imperative initMap() call re-run on every navigate(). Leaflet itself
// stays a CDN global (`L`), matching his original: no new npm dependency.
export default function ServiceMap({ listings, providersById, onOpenListing }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || typeof window.L === "undefined") return;

    const map = window.L.map(containerRef.current, { zoomControl: false }).setView([45.525, -122.665], 11);
    mapRef.current = map;

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const markers = [];
    listings.forEach((listing) => {
      const provider = providersById.get(listing.provider_id);
      if (!provider || provider.latitude == null || provider.longitude == null) return;

      const popup = document.createElement("div");
      popup.className = "map-popup";
      popup.innerHTML = `
        <div class="map-popup-name">${provider.name}</div>
        <div class="map-popup-title">${listing.title}</div>
        <div class="map-popup-row">
          <span class="map-popup-rating">★ ${ratingLabel(listing.rating)}</span>
          <span class="map-popup-price">${priceLabel(listing)}</span>
        </div>
        <button type="button" class="map-popup-button">View Profile</button>
      `;
      popup.querySelector(".map-popup-button").addEventListener("click", () => onOpenListing(listing.listing_id));

      const marker = window.L.marker([provider.latitude, provider.longitude]).addTo(map).bindPopup(popup);
      markers.push(marker);
    });

    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, providersById]);

  return <div ref={containerRef} className="service-map" />;
}
