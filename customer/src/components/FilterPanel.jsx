import { useState } from "react";
import Icon from "./Icon.jsx";
import { CATEGORIES, DEFAULT_FILTERS } from "../lib/filters.js";

const RATING_OPTIONS = [
  { value: 0, label: "Any" },
  { value: 4.0, label: "4.0+ ⭐" },
  { value: 4.5, label: "4.5+ ⭐" },
  { value: 4.8, label: "4.8+ ⭐" },
];

// Filter & Sort — his drawer modal, ported 1:1: category, max-price slider,
// minimum rating, sort. Edits a draft copy and only commits on "Show
// Results", exactly like his tempFilters/filters split.
export default function FilterPanel({ filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet sheet-tall" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h3><Icon name="sliders" size={16} /> Filter &amp; Sort Providers</h3>
          <button type="button" className="icon-button" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        <div className="sheet-body">
          <div className="filter-group">
            <label>Category</label>
            <div className="chip-row">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-chip ${draft.category === cat ? "is-selected" : ""}`}
                  onClick={() => setDraft((d) => ({ ...d, category: cat }))}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-row">
              <label>Max Price</label>
              <span className="filter-price-value">${draft.maxPrice}</span>
            </div>
            <input
              type="range"
              min="30"
              max="250"
              step="5"
              value={draft.maxPrice}
              onChange={(e) => setDraft((d) => ({ ...d, maxPrice: Number(e.target.value) }))}
            />
            <div className="filter-price-scale">
              <span>$30</span><span>$140</span><span>$250+</span>
            </div>
          </div>

          <div className="filter-group">
            <label>Minimum Rating</label>
            <div className="rating-grid">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`rating-chip ${draft.minRating === opt.value ? "is-selected" : ""}`}
                  onClick={() => setDraft((d) => ({ ...d, minRating: opt.value }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={draft.sortBy}
              onChange={(e) => setDraft((d) => ({ ...d, sortBy: e.target.value }))}
            >
              <option value="recommended">Recommended / Featured</option>
              <option value="rating-desc">Highest Rated (★ 5.0 - 1.0)</option>
              <option value="price-asc">Price: Low to High ($)</option>
              <option value="price-desc">Price: High to Low ($$$)</option>
              <option value="reviews-desc">Most Reviewed</option>
            </select>
          </div>
        </div>

        <div className="sheet-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => { setDraft(DEFAULT_FILTERS); onApply(DEFAULT_FILTERS); }}
          >
            Reset All
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onApply(draft)}>
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
