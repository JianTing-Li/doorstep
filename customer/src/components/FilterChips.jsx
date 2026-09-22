import { useState } from "react";
import { getServiceTypes } from "../data/loadData.js";

const URGENCY_LABELS = {
  urgent: "Urgent",
  today: "Today",
  tomorrow: "Tomorrow",
  this_week: "This week",
};

function buildChips(filters, labelByCode) {
  const chips = [];

  for (const code of filters.service_types ?? []) {
    chips.push({ id: `service_types:${code}`, key: "service_types", value: code, label: labelByCode[code] ?? code });
  }
  if (filters.max_price != null) {
    chips.push({ id: "max_price", key: "max_price", value: null, label: `Under $${filters.max_price}` });
  }
  if (filters.neighborhood) {
    chips.push({ id: "neighborhood", key: "neighborhood", value: null, label: filters.neighborhood });
  }
  if (filters.urgency) {
    chips.push({ id: "urgency", key: "urgency", value: null, label: URGENCY_LABELS[filters.urgency] ?? filters.urgency });
  }

  return chips;
}

export default function FilterChips({ filters, onRemove }) {
  // Matches --duration-enter so the chip finishes fading before it unmounts.
  const EXIT_MS = 180;
  const [removingIds, setRemovingIds] = useState(() => new Set());
  const labelByCode = Object.fromEntries(getServiceTypes().map(({ code, label }) => [code, label]));
  const chips = buildChips(filters, labelByCode);

  if (chips.length === 0) return null;

  function handleRemove(chip) {
    setRemovingIds((current) => new Set(current).add(chip.id));
    setTimeout(() => onRemove(chip.key, chip.value), EXIT_MS);
  }

  return (
    <div className="filter-chips">
      {chips.map((chip) => (
        <span key={chip.id} className={`filter-chip ${removingIds.has(chip.id) ? "removing" : ""}`}>
          {chip.label}
          <button
            type="button"
            className="filter-chip-remove"
            aria-label={`Remove filter: ${chip.label}`}
            onClick={() => handleRemove(chip)}
          >
            <span className="filter-chip-remove-glyph" aria-hidden="true">
              ×
            </span>
          </button>
        </span>
      ))}
    </div>
  );
}
