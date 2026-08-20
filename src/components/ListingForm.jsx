/**
 * ListingForm — create a new provider listing.
 *
 * Props (clear contract for parent state integration):
 *   onCreate(listing)       -> called with { listing_title, listing_description,
 *                               service_type, price_per_day } after validation
 *   serviceTypes?           -> array of { code, label } for the dropdown
 *                              (defaults to PRODUCT A's canonical codes)
 *
 * Keeps the language of the original spec (listing_title, price_per_day) while
 * producing the canonical shared schema values (service_type code, whole-dollar
 * price) so the dataset contract stays intact.
 */
import { useState } from "react";

import { SERVICE_TYPE_CODES } from "../constants";
import { validateListingForm } from "../utils/validation";

const DEFAULT_SERVICE_TYPES = SERVICE_TYPE_CODES.map((code) => ({
  code,
  label: code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export default function ListingForm({ onCreate, serviceTypes = DEFAULT_SERVICE_TYPES }) {
  const [form, setForm] = useState({
    listing_title: "",
    listing_description: "",
    service_type: "",
    price_per_day: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccessMessage("");
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundErrors = validateListingForm(form);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    const newListing = {
      listing_title: form.listing_title.trim(),
      listing_description: form.listing_description.trim(),
      service_type: form.service_type,
      price_per_day: Number(form.price_per_day),
    };
    onCreate(newListing);
    setSuccessMessage(`“${newListing.listing_title}” is now ready for pet parents.`);

    // Reset the form after a successful publish.
    setForm({
      listing_title: "",
      listing_description: "",
      service_type: "",
      price_per_day: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="listing-form" noValidate>
      <div className="form-heading">
        <span className="section-icon" aria-hidden="true">✦</span>
        <div>
          <p className="eyebrow">Grow your pet-care business</p>
          <h3>Create a New Listing</h3>
          <p className="form-intro">
            Share what makes your service special. You can review bookings as
            soon as your listing is published.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="success-message" role="status">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Listing published!</strong>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <label className="field">
        <span>Listing Title</span>
        <input
          name="listing_title"
          placeholder="e.g. Weekly Apartment Cleaning"
          value={form.listing_title}
          onChange={handleChange}
          required
        />
        <small className="field-hint">Use a clear, friendly title pet parents will recognize.</small>
        {errors.listing_title && <span className="field-error">{errors.listing_title}</span>}
      </label>

      <label className="field">
        <span>Listing Description</span>
        <textarea
          name="listing_description"
          placeholder="Describe exactly what the service covers, in your own voice."
          rows={3}
          value={form.listing_description}
          onChange={handleChange}
        />
      </label>

      <label className="field">
        <span>Service Type</span>
        <select
          name="service_type"
          value={form.service_type}
          onChange={handleChange}
          required
        >
          <option value="">Choose a service type…</option>
          {serviceTypes.map((st) => (
            <option key={st.code} value={st.code}>
              {st.label}
            </option>
          ))}
        </select>
        {errors.service_type && <span className="field-error">{errors.service_type}</span>}
      </label>

      <label className="field">
        <span>Price per Day (USD)</span>
        <input
          name="price_per_day"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 60"
          value={form.price_per_day}
          onChange={handleChange}
          required
        />
        <small className="field-hint">Set a fair daily rate before publishing.</small>
        {errors.price_per_day && <span className="field-error">{errors.price_per_day}</span>}
      </label>

      <button type="submit" className="btn btn-primary btn-publish">
        <span>Publish Listing</span>
        <span aria-hidden="true">→</span>
      </button>
      <p className="form-footnote">
        <span aria-hidden="true">🔒</span> Your listing details stay within the
        Doorstep provider network.
      </p>
    </form>
  );
}