import { useMemo, useState } from "react";
import Icon from "./Icon.jsx";
import ListingCard from "./ListingCard.jsx";
import ServiceMap from "./ServiceMap.jsx";
import { activeListings, CATEGORIES, CATEGORY_ICON, countInCategory } from "../lib/filters.js";
import { useApp } from "../AppContext.jsx";

export default function DashboardScreen({ listings, providersById, onOpenFeed, onOpenListing, onOpenAsk }) {
  const { customer } = useApp();
  const [query, setQuery] = useState("");
  const active = useMemo(() => activeListings(listings), [listings]);
  const featured = active.slice(0, 3);
  const categories = CATEGORIES.filter((c) => c !== "All");

  function runSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    // His original branched 3+ word / natural-language-shaped queries to the
    // AI chatbot modal. That destination doesn't exist this phase (the FAB
    // is removed; Ask has no matching logic until Phase 6) — see
    // INTEGRATION-NOTES.md. Every dashboard search goes to Browse for now.
    onOpenFeed({ search: trimmed, category: "All" });
  }

  return (
    <div className="screen-pad dashboard">
      <div className="dashboard-hero">
        <div className="dashboard-hero-row">
          <span className="eyebrow-pill">Verified Local Pros</span>
          <span className="dashboard-hello">
            Hello, <strong>{customer.name.split(" ")[0]}</strong>
          </span>
        </div>
        <h1 className="dashboard-title">Find trusted help for your home</h1>
        <p className="dashboard-subtitle">Book background-checked independent neighbors in Portland, OR.</p>
      </div>

      <div className="search-bar">
        <Icon name="search" size={15} className="search-bar-icon" />
        <input
          type="text"
          placeholder="Search e.g. clean, IKEA assembly, plumbing..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
        />
        {query ? (
          <button type="button" className="search-bar-clear" onClick={() => setQuery("")}>
            <Icon name="closeCircle" size={16} />
          </button>
        ) : (
          <button type="button" className="search-bar-go" onClick={runSearch}>
            <Icon name="arrowRight" size={13} />
          </button>
        )}
      </div>

      <button type="button" className="ai-matcher-banner" onClick={onOpenAsk}>
        <span className="ai-matcher-icon"><Icon name="sparkles" size={18} /></span>
        <span className="ai-matcher-copy">
          <span className="ai-matcher-kicker">
            Doorstep AI Matcher <em>Instant</em>
          </span>
          <span className="ai-matcher-title">Describe your task in plain English</span>
          <span className="ai-matcher-examples">&ldquo;Leaking pipe under sink&rdquo; &bull; &ldquo;Clean 2BR apartment&rdquo;</span>
        </span>
        <span className="ai-matcher-arrow"><Icon name="chevronRight" size={14} /></span>
      </button>

      <section>
        <div className="section-heading">
          <h2>Popular Categories</h2>
          <button type="button" className="link-button" onClick={() => onOpenFeed({ category: "All", search: "" })}>
            View All ({active.length})
          </button>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className="category-card"
              onClick={() => onOpenFeed({ category: cat, search: "" })}
            >
              <span className={`category-icon category-icon-${CATEGORY_ICON[cat]}`}>
                <Icon name={CATEGORY_ICON[cat]} size={18} />
              </span>
              <span>
                <strong>{cat}</strong>
                <small>{countInCategory(active, cat)} Pros Available</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span className="section-heading-live">
            <span className="live-dot" /> Nearby Service Map
          </span>
          <span className="section-heading-note">Portland, OR Metro</span>
        </div>
        <div className="map-frame">
          <ServiceMap listings={active} providersById={providersById} onOpenListing={onOpenListing} />
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>Top-Rated Providers</h2>
          <button type="button" className="link-button" onClick={() => onOpenFeed({ category: "All" })}>
            See Feed
          </button>
        </div>
        <div className="listing-stack">
          {featured.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              provider={providersById.get(listing.provider_id) || {}}
              onOpen={() => onOpenListing(listing.listing_id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
