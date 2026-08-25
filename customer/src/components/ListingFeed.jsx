import { useMemo, useState } from "react";
import Icon from "./Icon.jsx";
import ListingCard from "./ListingCard.jsx";
import FilterPanel from "./FilterPanel.jsx";
import { applyFilters, CATEGORIES, DEFAULT_FILTERS } from "../lib/filters.js";
import { browseHasActiveFilters } from "../lib/filterBridge.js";

// Browse feed — his getFeedHTML(), ported. Sticky search+filter header,
// horizontal category chips, listing list, empty state with a filter reset.
export default function ListingFeed({ listings, providersById, initialFilters, onOpenListing, onBack, onDescribeInstead }) {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters });
  const [filterOpen, setFilterOpen] = useState(false);

  const results = useMemo(
    () => applyFilters(listings, filters, providersById),
    [listings, filters, providersById],
  );

  const filtersActive = filters.minRating > 0 || filters.maxPrice < DEFAULT_FILTERS.maxPrice || filters.sortBy !== "recommended";

  return (
    <div className="feed-screen">
      <div className="feed-header">
        <div className="feed-header-row">
          <button type="button" className="icon-button" onClick={onBack}><Icon name="arrowLeft" size={16} /></button>
          <div className="feed-search">
            <Icon name="search" size={13} className="feed-search-icon" />
            <input
              type="text"
              placeholder="Search services..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
            />
            {filters.searchQuery && (
              <button type="button" className="feed-search-clear" onClick={() => setFilters((f) => ({ ...f, searchQuery: "" }))}>
                <Icon name="close" size={12} />
              </button>
            )}
          </div>
          <button type="button" className="icon-button feed-filter-button" onClick={() => setFilterOpen(true)} title="Filter & Sort">
            <Icon name="sliders" size={13} />
            {filtersActive && <span className="feed-filter-dot" />}
          </button>
        </div>

        <div className="chip-row chip-row-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-chip ${filters.category === cat ? "is-selected" : ""}`}
              onClick={() => setFilters((f) => ({ ...f, category: cat }))}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {browseHasActiveFilters(filters) && onDescribeInstead && (
        <button type="button" className="describe-instead" onClick={() => onDescribeInstead(filters)}>
          <Icon name="sparkles" size={14} />
          <span>Can&rsquo;t find it? <strong>Describe it instead</strong></span>
          <Icon name="chevronRight" size={13} />
        </button>
      )}

      <div className="feed-list">
        {results.length === 0 ? (
          <div className="empty-panel ds-empty-state">
            <span className="empty-panel-icon"><Icon name="search" size={20} /></span>
            <h3>No matching providers found</h3>
            <p>Try adjusting your filters or price slider to see more available options.</p>
            <button type="button" className="btn btn-ghost-accent" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Reset All Filters
            </button>
          </div>
        ) : (
          results.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              provider={providersById.get(listing.provider_id) || {}}
              variant="dense"
              onOpen={() => onOpenListing(listing.listing_id)}
            />
          ))
        )}
      </div>

      {filterOpen && (
        <FilterPanel
          filters={filters}
          onClose={() => setFilterOpen(false)}
          onApply={(next) => { setFilters(next); setFilterOpen(false); }}
        />
      )}
    </div>
  );
}
