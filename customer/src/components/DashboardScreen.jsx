import { useMemo, useState } from "react";
import Icon from "./Icon.jsx";
import ListingCard from "./ListingCard.jsx";
import { activeListings, CATEGORIES, CATEGORY_ICON, countInCategory, dashboardSearchDestination } from "../lib/filters.js";
import { useApp } from "../AppContext.jsx";

export default function DashboardScreen({ listings, providersById, onOpenFeed, onOpenListing, onOpenAsk }) {
  const { customer } = useApp();
  const [query, setQuery] = useState("");
  const active = useMemo(() => activeListings(listings), [listings]);
  // One card per provider, not one per listing: "Top-Rated Providers" was
  // just active.slice(0, 3), so whichever provider happened to have the
  // first several listings in mock-data filled every slot — Marisol Vega's
  // first three listings, back to back, rather than three different
  // top-rated providers. Pick each provider's own best-rated listing, then
  // rank providers by their provider-level rating (the thing the section
  // title actually promises), highest first.
  const featured = useMemo(() => {
    const bestListingByProvider = new Map();
    for (const listing of active) {
      const current = bestListingByProvider.get(listing.provider_id);
      if (!current || (listing.rating || 0) > (current.rating || 0)) {
        bestListingByProvider.set(listing.provider_id, listing);
      }
    }
    return [...bestListingByProvider.values()]
      .sort((a, b) => (providersById.get(b.provider_id)?.rating || 0) - (providersById.get(a.provider_id)?.rating || 0))
      .slice(0, 3);
  }, [active, providersById]);
  const categories = CATEGORIES.filter((c) => c !== "All");

  function runSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    // A short, keyword-shaped search ("plumbing," "IKEA assembly") filters
    // the catalogue, same as always. Anything long enough to read as an
    // actual job description routes into Ask instead — this box is now the
    // single entry point for both, replacing the separate "AI Matcher" card
    // that sat directly underneath it doing the same "describe what you
    // need" job with its own example bubbles.
    if (dashboardSearchDestination(trimmed) === "ask") {
      onOpenAsk(trimmed);
      return;
    }
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

      <div className="search-bar search-bar-unified">
        <Icon name="sparkles" size={15} className="search-bar-icon" />
        <input
          type="text"
          placeholder="Search a category, or describe the job — &ldquo;leaking pipe under the sink&rdquo;"
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

      <section className="dashboard-categories">
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

      <section className="dashboard-providers">
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
              variant="compact"
              onOpen={() => onOpenListing(listing.listing_id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
