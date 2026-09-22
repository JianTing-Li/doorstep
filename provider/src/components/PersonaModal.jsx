// Provider's persona switcher — mirrors customer/src/components/PersonaModal.jsx
// (modal-backdrop / modal-card / persona-list / persona-row), picking which of
// the demo provider records this workspace is browsing as.
export default function PersonaModal({ providers, activeProviderId, onSelect, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-identity">
            <span className="icon-tile" aria-hidden="true">🛠</span>
            <div>
              <h3>Switch Provider Persona</h3>
              <p>Demo connected dataset providers</p>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="persona-list">
          {providers.map((p) => {
            const selected = p.provider_id === activeProviderId;
            return (
              <button key={p.provider_id} type="button" className={`persona-row ${selected ? "is-selected" : ""}`} onClick={() => onSelect(p.provider_id)}>
                <span className="avatar avatar-accent">{(p.name ?? "P").charAt(0)}</span>
                <span className="persona-row-text">
                  <span className="persona-row-name">
                    {p.name} {selected && <em className="persona-active-pill">Active</em>}
                  </span>
                  <small>{p.location ?? "Portland, OR"}</small>
                  <small className="mono-small">{p.provider_id}</small>
                </span>
                <span aria-hidden="true">{selected ? "✓" : "›"}</span>
              </button>
            );
          })}
        </div>

        <p className="modal-footnote">💡 Listings and bookings are shared, read-only mock data — switching persona just re-filters by provider_id.</p>
      </div>
    </div>
  );
}
