import Icon from "./Icon.jsx";
import { initial } from "../lib/format.js";
import { useApp } from "../AppContext.jsx";

// His persona switcher — a distinct feature from shared/switcher.js (which
// picks a role: Customer/Provider/Admin). This one picks which of the 20
// demo customer records you're browsing as; see INTEGRATION-NOTES.md for
// why both are kept.
export default function PersonaModal({ customers, onClose }) {
  const { customerId, setCustomerId, showToast } = useApp();

  function pick(id) {
    setCustomerId(id);
    const c = customers.find((x) => x.customer_id === id);
    showToast(`Switched to Persona: ${c?.name ?? id}`, "userCheck");
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-identity">
            <span className="icon-tile"><Icon name="users" size={16} /></span>
            <div>
              <h3>Switch Customer Persona</h3>
              <p>Demo connected dataset personas</p>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose}><Icon name="close" size={16} /></button>
        </div>

        <div className="persona-list">
          {customers.map((c) => {
            const selected = c.customer_id === customerId;
            return (
              <button key={c.customer_id} type="button" className={`persona-row ${selected ? "is-selected" : ""}`} onClick={() => pick(c.customer_id)}>
                <span className="avatar avatar-accent">{initial(c.name)}</span>
                <span className="persona-row-text">
                  <span className="persona-row-name">
                    {c.name} {selected && <em className="persona-active-pill">Active</em>}
                  </span>
                  <small>{c.neighborhood ? `${c.neighborhood}, Portland, OR` : "Portland, OR"}</small>
                  <small className="mono-small">{c.customer_id}</small>
                </span>
                <Icon name={selected ? "checkCircle" : "chevronRight"} size={14} />
              </button>
            );
          })}
        </div>

        <p className="modal-footnote">💡 All bookings, messages, and reports are saved per persona in LocalStorage.</p>
      </div>
    </div>
  );
}
