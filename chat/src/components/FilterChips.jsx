function getServiceLabel(code, serviceTypes) {
  return serviceTypes.find((serviceType) => serviceType.code === code)?.label ?? code;
}

export default function FilterChips({ parsed, serviceTypes }) {
  if (!parsed) return null;

  const chips = [
    ...parsed.service_types.map((code) => ({
      key: `service-${code}`,
      label: getServiceLabel(code, serviceTypes),
    })),
    parsed.max_price != null
      ? { key: "price", label: `Up to $${parsed.max_price}` }
      : null,
    parsed.neighborhood
      ? { key: "neighborhood", label: parsed.neighborhood }
      : null,
    parsed.urgency ? { key: "urgency", label: parsed.urgency } : null,
  ].filter(Boolean);

  if (chips.length === 0) return null;

  return (
    <div className="filter-row" aria-label="Detected filters">
      <span className="filter-label">I heard</span>
      {chips.map((chip) => (
        <span className="filter-chip" key={chip.key}>
          <span aria-hidden="true">✓</span>
          {chip.label}
        </span>
      ))}
    </div>
  );
}
