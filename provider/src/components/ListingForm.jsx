/**
 * ListingForm — a guided service builder for providers.
 *
 * Providers choose the customer outcome they can deliver and the concrete
 * tasks they include. TaskLocal then assigns the canonical service type and
 * generates customer-facing listing copy automatically.
 */
import { useMemo, useState } from "react";

import { SERVICE_NEED_PROFILES } from "../constants";
import { formatMoney } from "../utils/format";
import { validateListingForm } from "../utils/validation";

const EMPTY_FORM = {
  need_key: "",
  service_type: "",
  included_tasks: [],
  price_per_day: "",
};

export default function ListingForm({ onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showNoMatch, setShowNoMatch] = useState(false);

  const matchedProfile = useMemo(
    () => SERVICE_NEED_PROFILES.find((profile) => profile.key === form.need_key) ?? null,
    [form.need_key]
  );

  const generatedDescription = matchedProfile
    ? `Includes: ${form.included_tasks.join(", ")}.`
    : "";

  const chooseNeed = (profile) => {
    setForm((prev) => ({
      ...prev,
      need_key: profile.key,
      service_type: profile.service_type,
      included_tasks: profile.tasks,
    }));
    setShowNoMatch(false);
    setSuccessMessage("");
    setErrors((prev) => ({
      ...prev,
      need_key: "",
      included_tasks: "",
    }));
  };

  const toggleTask = (task) => {
    setForm((prev) => ({
      ...prev,
      included_tasks: prev.included_tasks.includes(task)
        ? prev.included_tasks.filter((includedTask) => includedTask !== task)
        : [...prev.included_tasks, task],
    }));
    setSuccessMessage("");
    if (errors.included_tasks) {
      setErrors((prev) => ({ ...prev, included_tasks: "" }));
    }
  };

  const handlePriceChange = (event) => {
    setForm((prev) => ({ ...prev, price_per_day: event.target.value }));
    setSuccessMessage("");
    if (errors.price_per_day) {
      setErrors((prev) => ({ ...prev, price_per_day: "" }));
    }
  };

  const handleNoMatch = () => {
    setShowNoMatch(true);
    setForm(EMPTY_FORM);
    setSuccessMessage("");
    setErrors({});
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const foundErrors = validateListingForm(form);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    const newListing = {
      listing_title: matchedProfile.listing_title,
      listing_description: generatedDescription,
      service_type: matchedProfile.service_type,
      need_key: matchedProfile.key,
      included_tasks: form.included_tasks,
      price_per_day: Number(form.price_per_day),
    };

    onCreate(newListing);
    setSuccessMessage(
      `“${newListing.listing_title}” was built and assigned to ${matchedProfile.service_label}.`
    );
    setForm(EMPTY_FORM);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="listing-form" noValidate>
      <div className="form-heading">
        <span className="section-icon" aria-hidden="true">✦</span>
        <div>
          <p className="eyebrow">Guided service builder</p>
          <h3>What can you help with?</h3>
          <p className="form-intro">
            No description writing needed. Choose the kind of home-service work
            you provide and Doorstep will build a clear, bookable listing.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="success-message" role="status">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Service built successfully</strong>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <fieldset className="need-fieldset">
        <legend>1. Choose the need you solve</legend>
        <p className="field-hint">
          We use this answer to assign the right service automatically.
        </p>
        <div className="need-options">
          {SERVICE_NEED_PROFILES.map((profile) => {
            const isSelected = profile.key === form.need_key;
            return (
              <button
                key={profile.key}
                type="button"
                className={`need-option${isSelected ? " need-option-selected" : ""}`}
                aria-pressed={isSelected}
                onClick={() => chooseNeed(profile)}
              >
                <span className="need-option-icon" aria-hidden="true">{profile.icon}</span>
                <span>
                  <strong>{profile.prompt}</strong>
                  <small>{profile.helper}</small>
                </span>
                <span className="need-option-check" aria-hidden="true">
                  {isSelected ? "✓" : "→"}
                </span>
              </button>
            );
          })}
        </div>
        {errors.need_key && <span className="field-error ds-field-error">{errors.need_key}</span>}
        <button type="button" className="no-match-link" onClick={handleNoMatch}>
          I don't see the need I solve
        </button>
      </fieldset>

      {showNoMatch && (
        <div className="no-match-message" role="status">
          <span aria-hidden="true">💬</span>
          <div>
            <strong>This service is not supported yet</strong>
            <p>
              Doorstep will not guess or assign the wrong category. Your request
              has been noted for review; choose a listed need only if it accurately
              represents your work.
            </p>
          </div>
        </div>
      )}

      {matchedProfile && (
        <>
          <div className="match-card" aria-live="polite">
            <span className="match-icon" aria-hidden="true">{matchedProfile.icon}</span>
            <div className="match-copy">
              <span className="match-kicker">Doorstep matched your service</span>
              <strong>{matchedProfile.service_label}</strong>
              <small>
                Customers will see “{matchedProfile.listing_title}”
              </small>
            </div>
            <span className="auto-badge">Auto-assigned</span>
          </div>

          <fieldset className="task-fieldset">
            <legend>2. Confirm what is included</legend>
            <p className="field-hint">
              Selected tasks become the service details customers see before booking.
            </p>
            <div className="task-options">
              {matchedProfile.tasks.map((task) => {
                const isChecked = form.included_tasks.includes(task);
                return (
                  <label
                    key={task}
                    className={`task-option${isChecked ? " task-option-selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTask(task)}
                    />
                    <span aria-hidden="true">{isChecked ? "✓" : ""}</span>
                    {task}
                  </label>
                );
              })}
            </div>
            {errors.included_tasks && (
              <span className="field-error ds-field-error">{errors.included_tasks}</span>
            )}
          </fieldset>

          <label className="field">
            <span>3. Set the total price (USD)</span>
            <div className="price-input-wrap">
              <span aria-hidden="true">$</span>
              <input
                name="price_per_day"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="60"
                value={form.price_per_day}
                onChange={handlePriceChange}
                required
              />
              <span>flat price</span>
            </div>
            <small className="field-hint">
              Customers see this exact price before they book—no hidden estimate.
            </small>
            {errors.price_per_day && (
              <span className="field-error ds-field-error">{errors.price_per_day}</span>
            )}
          </label>

          <section className="service-preview" aria-label="Customer service preview">
            <div className="preview-heading">
              <div>
                <span className="match-kicker">Customer preview</span>
                <h4>{matchedProfile.listing_title}</h4>
              </div>
              <span className="preview-price">
                {form.price_per_day
                  ? `${formatMoney(Number(form.price_per_day))} flat`
                  : "Add price"}
              </span>
            </div>
            <p>
              {form.included_tasks.length > 0
                ? generatedDescription
                : "Choose at least one included task."}
            </p>
            <div className="preview-meta">
              <span>{matchedProfile.icon} {matchedProfile.service_label}</span>
              <span>✓ Scope shown before booking</span>
            </div>
          </section>

          <button type="submit" className="btn btn-primary btn-publish">
            <span>Build & Publish Service</span>
            <span aria-hidden="true">→</span>
          </button>
        </>
      )}

      <p className="form-footnote">
        <span aria-hidden="true">🔒</span> Doorstep uses only your selections to
        build the service—nothing is invented.
      </p>
    </form>
  );
}
