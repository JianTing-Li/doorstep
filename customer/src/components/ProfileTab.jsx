import Icon from "./Icon.jsx";
import { initial } from "../lib/format.js";
import { useApp } from "../AppContext.jsx";

// New this phase — the bottom tab bar's "Profile" tab has no equivalent
// screen in his original app (the closest thing was the persona-switcher
// modal). Kept intentionally simple: current persona's own account info,
// plus the same persona switcher as an action, rather than inventing
// account-settings features nothing in his product asked for.
export default function ProfileTab({ bookings, reports, onSwitchPersona }) {
  const { customer } = useApp();
  const upcoming = bookings.filter((b) => b.status === "upcoming").length;
  const completed = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="screen-pad profile-tab">
      <div className="profile-tab-header">
        <span className="avatar avatar-accent avatar-xl">{initial(customer.name)}</span>
        <div>
          <h1>{customer.name}</h1>
          <span className="mono-small">{customer.customer_id}</span>
        </div>
      </div>

      <div className="profile-tab-stats">
        <div><strong>{upcoming}</strong><span>Upcoming</span></div>
        <div><strong>{completed}</strong><span>Completed</span></div>
        <div><strong>{reports.length}</strong><span>Safety Cases</span></div>
      </div>

      <div className="detail-list">
        <div className="detail-row"><Icon name="location" size={14} /><span>{customer.address || "Portland, OR"}</span></div>
        {customer.email && <div className="detail-row"><Icon name="message" size={14} /><span>{customer.email}</span></div>}
      </div>

      <button type="button" className="btn btn-soft-accent btn-block" onClick={onSwitchPersona}>
        <Icon name="users" size={14} /> Switch Demo Persona
      </button>

      <p className="profile-tab-note">
        This is a concept demo — no real account, payments, or login. Every persona's bookings, messages, and
        reports live in this browser's local storage.
      </p>
    </div>
  );
}
