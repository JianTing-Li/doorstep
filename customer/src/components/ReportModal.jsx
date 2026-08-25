import { useState } from "react";
import Icon from "./Icon.jsx";
import { SAFETY_FLAGS, buildDisplayReport, recordCanonicalReport } from "../lib/reports.js";
import { useApp } from "../AppContext.jsx";

// Trust & Safety incident report — his 6 categories, verbatim copy.
export default function ReportModal({ target, listing, provider, onClose }) {
  const { customer, customerId, setReports, showToast } = useApp();
  const [flag, setFlag] = useState(SAFETY_FLAGS[0].value);
  const [details, setDetails] = useState("");
  const [evidence, setEvidence] = useState("");

  function submit() {
    if (!details.trim()) {
      showToast("Please provide details about the incident", "warning");
      return;
    }
    const report = buildDisplayReport({
      target, flagValue: flag, details: details.trim(), evidenceUrl: evidence.trim(), customerId,
    });
    setReports((prev) => [report, ...prev]);
    recordCanonicalReport(report, customerId);
    showToast("Report filed with Trust & Safety (Product D)", "shieldCat");
    onClose();
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer drawer-tall" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header drawer-header-danger">
          <div className="drawer-header-identity">
            <span className="icon-tile icon-tile-danger"><Icon name="shieldCat" size={16} /></span>
            <div>
              <h3>Trust &amp; Safety Report</h3>
              <p>Reviewed by Product D Moderation Team</p>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        <div className="drawer-body">
          <div className="report-target-card">
            <span className="field-label">Reporting Target</span>
            <strong>{provider.name || "Provider"} &bull; {listing.title || "Home Service"}</strong>
            <span className="mono-small">ID: {listing.listing_id || "—"} &bull; Reporter: {customer.name}</span>
          </div>

          <div className="filter-group">
            <label>Select Reason for Report</label>
            <div className="radio-list">
              {SAFETY_FLAGS.map((opt) => (
                <label key={opt.value} className={`radio-row ${flag === opt.value ? "is-selected" : ""}`}>
                  <input type="radio" name="safety_flag" checked={flag === opt.value} onChange={() => setFlag(opt.value)} />
                  <span>
                    <strong>{opt.label}</strong>
                    <small>{opt.detail}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Detailed Description</label>
            <textarea
              rows={3}
              placeholder="Provide specific dates, messages, or details to help the trust & safety team review this case..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Evidence Link (Optional)</label>
            <input type="url" placeholder="https://example.com/evidence-screenshot.png" value={evidence} onChange={(e) => setEvidence(e.target.value)} />
          </div>
        </div>

        <div className="sheet-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={submit}>
            <Icon name="paperPlane" size={12} /> Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
