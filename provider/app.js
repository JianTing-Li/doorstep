// TaskLocal Provider Workspace Controller (Product A - JT Model)

const SERVICE_NEED_PROFILES = [
  {
    key: "routine_home_cleaning",
    prompt: "Keep a home routinely clean",
    helper: "Recurring or one-time upkeep for lived-in homes.",
    icon: "?",
    service_type: "cleaning_standard",
    service_label: "Home Cleaning",
    listing_title: "Routine Home Cleaning",
    tasks: [
      "Kitchen surfaces",
      "Bathroom cleaning",
      "Dusting",
      "Vacuuming",
      "Mopping",
      "Trash & recycling",
    ],
  },
  {
    key: "deep_home_reset",
    prompt: "Deep clean or reset a space",
    helper: "Move-in, move-out, appliance, or post-project cleaning.",
    icon: "??",
    service_type: "cleaning_deep",
    service_label: "Deep Cleaning",
    listing_title: "Deep Home Cleaning",
    tasks: [
      "Inside oven",
      "Inside refrigerator",
      "Cabinets & drawers",
      "Baseboards",
      "Window sills",
      "Heavy dust removal",
    ],
  },
  {
    key: "repairs_and_installation",
    prompt: "Fix or install things at home",
    helper: "Assembly, mounting, patching, doors, and locks.",
    icon: "??",
    service_type: "handyman_general",
    service_label: "Handyman",
    listing_title: "Home Repairs & Installation",
    tasks: [
      "Furniture assembly",
      "TV or shelf mounting",
      "Drywall patching",
      "Door repairs",
      "Lock replacement",
      "Cabinet adjustments",
    ],
  },
  {
    key: "water_and_drains",
    prompt: "Resolve a water or drain issue",
    helper: "Faucets, toilets, leaks, drains, and under-sink work.",
    icon: "??",
    service_type: "plumbing",
    service_label: "Plumbing",
    listing_title: "Plumbing Repair",
    tasks: [
      "Faucet replacement",
      "Drain clearing",
      "Leak repair",
      "Toilet repair",
      "Under-sink work",
      "Shutoff valve replacement",
    ],
  },
  {
    key: "lights_and_power",
    prompt: "Install or repair lights and power",
    helper: "Fixtures, fans, outlets, switches, and small electrical jobs.",
    icon: "??",
    service_type: "electrical",
    service_label: "Electrical",
    listing_title: "Electrical Installation & Repair",
    tasks: [
      "Light fixtures",
      "Ceiling fans",
      "Outlet replacement",
      "Switch replacement",
      "GFCI installation",
      "Circuit troubleshooting",
    ],
  },
  {
    key: "move_belongings",
    prompt: "Move belongings or furniture",
    helper: "Loading, unloading, in-building moves, and item hauling.",
    icon: "??",
    service_type: "moving_help",
    service_label: "Moving Help",
    listing_title: "Moving & Loading Help",
    tasks: [
      "Truck loading",
      "Truck unloading",
      "In-building move",
      "Furniture moving",
      "Packing help",
      "Moving blankets & straps",
    ],
  },
  {
    key: "remove_unwanted_items",
    prompt: "Remove unwanted items",
    helper: "Furniture, boxes, appliances, and room clear-outs.",
    icon: "??",
    service_type: "junk_removal",
    service_label: "Junk Removal",
    listing_title: "Junk Removal & Clear-Out",
    tasks: [
      "Furniture removal",
      "Box removal",
      "Appliance removal",
      "Garage clear-out",
      "Basement clear-out",
      "Donation drop-off",
    ],
  },
  {
    key: "care_for_outdoor_space",
    prompt: "Care for a yard or outdoor space",
    helper: "Lawns, leaves, gutters, patios, and seasonal cleanup.",
    icon: "??",
    service_type: "yard_outdoor",
    service_label: "Yard & Outdoor",
    listing_title: "Yard & Outdoor Care",
    tasks: [
      "Lawn mowing",
      "Edging & trimming",
      "Leaf clearing",
      "Gutter cleaning",
      "Patio or deck cleanup",
      "Yard debris removal",
    ],
  },
];

let providerState = {
  activeProviderId: "prv_001",
  form: {
    need_key: "",
    included_tasks: [],
    price_per_day: "",
  },
  errors: {},
  successMessage: "",
  showNoMatch: false,
};

function formatMoney(centsOrDollars) {
  const val = Number(centsOrDollars) || 0;
  return `$${val.toFixed(0)}`;
}

function formatDate(iso) {
  if (!iso) return "Today";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
  } catch (e) {
    return iso;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof window.initData === "function") {
    try {
      await window.initData();
    } catch (e) {
      console.warn("initData failed, using fallback mock data:", e);
    }
  }

  // If DB_PROVIDERS is available, ensure activeProviderId exists
  if (typeof DB_PROVIDERS !== "undefined" && DB_PROVIDERS.length > 0) {
    const exists = DB_PROVIDERS.find(p => p.provider_id === providerState.activeProviderId);
    if (!exists) providerState.activeProviderId = DB_PROVIDERS[0].provider_id;
  }

  renderDashboard();
});

function toggleSuiteMenu() {
  const dropdown = document.getElementById("suite-dropdown");
  if (dropdown) dropdown.classList.toggle("hidden");
}

window.addEventListener("click", (e) => {
  const btn = document.getElementById("suite-btn");
  const dropdown = document.getElementById("suite-dropdown");
  if (dropdown && !dropdown.classList.contains("hidden") && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

function switchProvider(providerId) {
  providerState.activeProviderId = providerId;
  providerState.form = { need_key: "", included_tasks: [], price_per_day: "" };
  providerState.errors = {};
  providerState.successMessage = "";
  providerState.showNoMatch = false;
  renderDashboard();
}

function chooseNeed(profile) {
  providerState.form.need_key = profile.key;
  providerState.form.included_tasks = [...profile.tasks];
  providerState.showNoMatch = false;
  providerState.successMessage = "";
  providerState.errors = {};
  renderDashboard();
}

function toggleTask(task) {
  const tasks = providerState.form.included_tasks;
  if (tasks.includes(task)) {
    providerState.form.included_tasks = tasks.filter(t => t !== task);
  } else {
    providerState.form.included_tasks.push(task);
  }
  renderDashboard();
}

function handlePriceChange(e) {
  providerState.form.price_per_day = e.target.value;
  renderDashboard();
}

function handleNoMatch() {
  providerState.showNoMatch = true;
  providerState.form = { need_key: "", included_tasks: [], price_per_day: "" };
  providerState.errors = {};
  providerState.successMessage = "";
  renderDashboard();
}

function handleListingSubmit(e) {
  e.preventDefault();
  const form = providerState.form;
  const matched = SERVICE_NEED_PROFILES.find(p => p.key === form.need_key);

  if (!matched) {
    providerState.errors.need_key = "Please select a service need.";
    renderDashboard();
    return;
  }
  if (!form.price_per_day || Number(form.price_per_day) <= 0) {
    providerState.errors.price_per_day = "Please enter a valid price.";
    renderDashboard();
    return;
  }

  const newListing = {
    listing_id: "lst_" + Date.now().toString(36),
    provider_id: providerState.activeProviderId,
    title: matched.listing_title,
    listing_description: `Professional ${matched.service_label} service covering ${form.included_tasks.join(", ")}.`,
    service_type: [matched.service_type],
    need_key: matched.key,
    included_tasks: [...form.included_tasks],
    price: Number(form.price_per_day),
    price_unit: "flat",
    listing_status: "active",
    rating: 5.0,
    review_count: 1,
    availability: ["2026-09-01T09:00:00Z", "2026-09-02T14:00:00Z"]
  };

  if (typeof DB_LISTINGS !== "undefined") {
    DB_LISTINGS.unshift(newListing);
  }

  providerState.successMessage = `?${newListing.title}? was built and published to ${matched.service_label}!`;
  providerState.form = { need_key: "", included_tasks: [], price_per_day: "" };
  providerState.errors = {};
  renderDashboard();
}

function updateBookingStatus(bookingId, newStatus) {
  if (typeof DB_BOOKINGS !== "undefined") {
    const bkg = DB_BOOKINGS.find(b => b.booking_id === bookingId);
    if (bkg) {
      bkg.status = newStatus;
      if (newStatus === "completed") bkg.escrow_status = "released";
      if (newStatus === "cancelled") bkg.escrow_status = "refunded";
    }
  }
  renderDashboard();
}

function renderDashboard() {
  const root = document.getElementById("provider-root");
  if (!root) return;

  const providers = typeof DB_PROVIDERS !== "undefined" ? DB_PROVIDERS : [
    { provider_id: "prv_001", name: "Marco Alvarez", location: "Sunnyside", rating: 4.9 },
    { provider_id: "prv_002", name: "Elena Chen", location: "Pearl District", rating: 4.8 },
    { provider_id: "prv_003", name: "Devonte Washington", location: "Montavilla", rating: 5.0 }
  ];

  const currentProvider = providers.find(p => p.provider_id === providerState.activeProviderId) || providers[0] || { name: "Marco Alvarez", location: "Sunnyside", rating: 4.9 };

  const allListings = typeof DB_LISTINGS !== "undefined" ? DB_LISTINGS : [];
  const providerListings = allListings.filter(l => l.provider_id === currentProvider.provider_id);
  const activeCount = providerListings.filter(l => l.listing_status === "active").length;

  const allBookings = typeof DB_BOOKINGS !== "undefined" ? DB_BOOKINGS : [];
  const providerBookings = allBookings.filter(b => b.provider_id === currentProvider.provider_id);

  const upcomingBookings = providerBookings.filter(b => b.status === "pending" || b.status === "confirmed");
  const pastBookings = providerBookings.filter(b => b.status === "completed" || b.status === "cancelled");

  const counts = {
    pending: providerBookings.filter(b => b.status === "pending").length,
    confirmed: providerBookings.filter(b => b.status === "confirmed").length,
    completed: providerBookings.filter(b => b.status === "completed").length,
    cancelled: providerBookings.filter(b => b.status === "cancelled").length,
  };

  const matchedProfile = SERVICE_NEED_PROFILES.find(p => p.key === providerState.form.need_key);

  root.innerHTML = `
    <div class="dashboard">
      <nav class="topbar" aria-label="Provider workspace">
        <a class="brand" href="#dashboard" aria-label="Go to dashboard overview">
          <span class="brand-mark" aria-hidden="true">TL</span>
          <span>
            <strong>TaskLocal</strong>
            <small>Provider workspace</small>
          </span>
        </a>
        <div class="dashboard-nav" aria-label="Dashboard sections">
          <a href="#dashboard">Dashboard</a>
          <a href="#create-listing">Create listing</a>
          <a href="#my-listings">My listings</a>
          <a href="#incoming-bookings">Bookings</a>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="suite-menu-container">
            <button class="suite-btn" id="suite-btn" onclick="toggleSuiteMenu()">
              <span>Products Suite</span> ?
            </button>
            <div class="suite-dropdown hidden" id="suite-dropdown">
              <a href="./" style="font-weight: 700; color: var(--forest);">?? Product A (Provider)</a>
              <a href="../">?? Product B (Customer App)</a>
              <a href="../chat/">?? Product C (AI Matcher)</a>
              <a href="../admin/">?? Product D (Safety Ops)</a>
            </div>
          </div>

          <div class="provider-select-wrap">
            <select onchange="switchProvider(this.value)" aria-label="Switch active provider">
              ${providers.map(p => `<option value="${p.provider_id}" ${p.provider_id === currentProvider.provider_id ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>

          <div class="provider-chip">
            <span class="provider-avatar" aria-hidden="true">${(currentProvider.name || 'P').charAt(0)}</span>
            <span>
              <strong>${currentProvider.name}</strong>
              <small>Trusted provider</small>
            </span>
          </div>
        </div>
      </nav>

      <header class="dashboard-header" id="dashboard">
        <div class="welcome-copy">
          <p class="eyebrow">Your provider workspace</p>
          <h1>Welcome back, ${(currentProvider.name || 'Provider').split(' ')[0]}!</h1>
          <p class="subtitle">
            Create clear home-service listings, manage local requests, and grow
            your independent business in one place.
          </p>
          <div class="trust-row">
            <span>? Verified profile</span>
            ${currentProvider.location ? `<span>? ${currentProvider.location}</span>` : ''}
            <span>? ${(currentProvider.rating || 5.0).toFixed(1)} provider rating</span>
          </div>
        </div>
        <div class="hero-service" aria-hidden="true">
          <span>??</span>
          <span class="hero-tool">?</span>
        </div>
        <p class="reference-date">
          <span aria-hidden="true">?</span> August 31, 2026
        </p>
      </header>

      <section class="stats-grid" aria-label="Booking summary">
        <a class="stat-card stat-orange" href="#incoming-bookings">
          <span class="stat-icon" aria-hidden="true">?</span>
          <span class="stat-content">
            <span class="stat-value">${counts.pending}</span>
            <span class="stat-label">Pending</span>
          </span>
          <span class="stat-arrow" aria-hidden="true">?</span>
        </a>
        <a class="stat-card stat-blue" href="#incoming-bookings">
          <span class="stat-icon" aria-hidden="true">??</span>
          <span class="stat-content">
            <span class="stat-value">${counts.confirmed}</span>
            <span class="stat-label">Confirmed</span>
          </span>
          <span class="stat-arrow" aria-hidden="true">?</span>
        </a>
        <a class="stat-card stat-green" href="#past-bookings">
          <span class="stat-icon" aria-hidden="true">?</span>
          <span class="stat-content">
            <span class="stat-value">${counts.completed}</span>
            <span class="stat-label">Completed</span>
          </span>
          <span class="stat-arrow" aria-hidden="true">?</span>
        </a>
        <a class="stat-card stat-red" href="#past-bookings">
          <span class="stat-icon" aria-hidden="true">?</span>
          <span class="stat-content">
            <span class="stat-value">${counts.cancelled}</span>
            <span class="stat-label">Cancelled</span>
          </span>
          <span class="stat-arrow" aria-hidden="true">?</span>
        </a>
        <a class="stat-card stat-purple" href="#my-listings">
          <span class="stat-icon" aria-hidden="true">?</span>
          <span class="stat-content">
            <span class="stat-value">${activeCount}</span>
            <span class="stat-label">Active Listings</span>
          </span>
          <span class="stat-arrow" aria-hidden="true">?</span>
        </a>
      </section>

      <div class="dashboard-grid">
        <section class="panel form-panel" id="create-listing">
          <form onsubmit="handleListingSubmit(event)" class="listing-form" noValidate>
            <div class="form-heading">
              <span class="section-icon" aria-hidden="true">?</span>
              <div>
                <p class="eyebrow">Guided service builder</p>
                <h3>What can you help with?</h3>
                <p class="form-intro">
                  No description writing needed. Choose the kind of home-service work
                  you provide and TaskLocal will build a clear, bookable listing.
                </p>
              </div>
            </div>

            ${providerState.successMessage ? `
              <div class="success-message" role="status">
                <span aria-hidden="true">?</span>
                <div>
                  <strong>Service built successfully</strong>
                  <p>${providerState.successMessage}</p>
                </div>
              </div>
            ` : ''}

            <fieldset class="need-fieldset">
              <legend>1. Choose the need you solve</legend>
              <p class="field-hint">
                We use this answer to assign the right service automatically.
              </p>
              <div class="need-options">
                ${SERVICE_NEED_PROFILES.map(profile => {
                  const isSelected = profile.key === providerState.form.need_key;
                  return `
                    <button
                      type="button"
                      class="need-option ${isSelected ? 'need-option-selected' : ''}"
                      onclick="chooseNeed(SERVICE_NEED_PROFILES.find(p => p.key === '${profile.key}'))"
                    >
                      <span class="need-option-icon" aria-hidden="true">${profile.icon}</span>
                      <span>
                        <strong>${profile.prompt}</strong>
                        <small>${profile.helper}</small>
                      </span>
                      <span class="need-option-check" aria-hidden="true">
                        ${isSelected ? '?' : '?'}
                      </span>
                    </button>
                  `;
                }).join('')}
              </div>
              <button type="button" class="no-match-link" onclick="handleNoMatch()">
                I don't see the need I solve
              </button>
            </fieldset>

            ${providerState.showNoMatch ? `
              <div class="no-match-message" role="status">
                <span aria-hidden="true">??</span>
                <div>
                  <strong>This service is not supported yet</strong>
                  <p>
                    TaskLocal will not guess or assign the wrong category. Your request
                    has been noted for review; choose a listed need only if it accurately
                    represents your work.
                  </p>
                </div>
              </div>
            ` : ''}

            ${matchedProfile ? `
              <div class="match-card" aria-live="polite">
                <span class="match-icon" aria-hidden="true">${matchedProfile.icon}</span>
                <div class="match-copy">
                  <span class="match-kicker">TaskLocal matched your service</span>
                  <strong>${matchedProfile.service_label}</strong>
                  <small>Customers will see ?${matchedProfile.listing_title}?</small>
                </div>
                <span class="auto-badge">Auto-assigned</span>
              </div>

              <fieldset class="task-fieldset">
                <legend>2. Confirm what is included</legend>
                <p class="field-hint">
                  Selected tasks become the service details customers see before booking.
                </p>
                <div class="task-options">
                  ${matchedProfile.tasks.map(task => {
                    const isChecked = providerState.form.included_tasks.includes(task);
                    return `
                      <label class="task-option ${isChecked ? 'task-option-selected' : ''}" onclick="toggleTask('${task}')">
                        <span aria-hidden="true">${isChecked ? '?' : ''}</span>
                        ${task}
                      </label>
                    `;
                  }).join('')}
                </div>
              </fieldset>

              <label class="field">
                <span>3. Set the total price (USD)</span>
                <div class="price-input-wrap">
                  <span aria-hidden="true">$</span>
                  <input
                    name="price_per_day"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="60"
                    value="${providerState.form.price_per_day}"
                    oninput="handlePriceChange(event)"
                    required
                  />
                  <span>flat price</span>
                </div>
                <small class="field-hint">
                  Customers see this exact price before they book?no hidden estimate.
                </small>
              </label>

              <section class="service-preview" aria-label="Customer service preview">
                <div class="preview-heading">
                  <div>
                    <span class="match-kicker">Customer preview</span>
                    <h4>${matchedProfile.listing_title}</h4>
                  </div>
                  <span class="preview-price">
                    ${providerState.form.price_per_day ? `$${providerState.form.price_per_day} flat` : 'Add price'}
                  </span>
                </div>
                <p>
                  Professional ${matchedProfile.service_label} service covering ${providerState.form.included_tasks.join(", ")}.
                </p>
                <div class="preview-meta">
                  <span>${matchedProfile.icon} ${matchedProfile.service_label}</span>
                  <span>? Scope shown before booking</span>
                </div>
              </section>

              <button type="submit" class="btn btn-primary btn-publish">
                <span>Build & Publish Service</span>
                <span aria-hidden="true">?</span>
              </button>
            ` : ''}

            <p class="form-footnote">
              <span aria-hidden="true">??</span> TaskLocal uses only your selections to
              build the service?nothing is invented.
            </p>
          </form>
        </section>

        <section class="panel listings-panel" id="my-listings">
          <div class="section-heading">
            <div>
              <p class="eyebrow">What local customers can book</p>
              <h3>My Listings <span class="count-pill">${providerListings.length}</span></h3>
            </div>
            <span class="section-illustration" aria-hidden="true">??</span>
          </div>
          <p class="hint status-summary">
            <span class="status-dot status-dot-active" /> ${activeCount} active
            <span class="status-divider">?</span>
            ${providerListings.length - activeCount} other
          </p>

          <ul class="listings-list">
            ${providerListings.map(listing => `
              <li class="listing-item">
                <div class="listing-icon" aria-hidden="true">??</div>
                <div class="listing-content">
                  <div class="listing-item-main">
                    <strong>${listing.title}</strong>
                    <span class="listing-price">$${listing.price} ${listing.price_unit === 'hourly' ? '/hr' : 'flat'}</span>
                  </div>
                  <div class="listing-item-meta">
                    <span>${(listing.service_type || []).join(', ')}</span>
                    <span class="listing-status listing-status-${listing.listing_status || 'active'}">
                      ${listing.listing_status || 'active'}
                    </span>
                  </div>
                  ${(listing.included_tasks && listing.included_tasks.length > 0) ? `
                    <p class="listing-includes">
                      <strong>Includes:</strong> ${listing.included_tasks.join(' ? ')}
                    </p>
                  ` : ''}
                </div>
              </li>
            `).join('')}
            ${providerListings.length === 0 ? `
              <li class="empty-state">No listings yet ? create your first one using the builder on the left.</li>
            ` : ''}
          </ul>
        </section>
      </div>

      <section class="panel bookings-section incoming-section" id="incoming-bookings">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Needs your attention</p>
            <h3>Incoming Bookings <span class="count-pill">${upcomingBookings.length}</span></h3>
          </div>
          <span class="section-illustration" aria-hidden="true">??</span>
        </div>
        ${upcomingBookings.length === 0 ? `
          <p class="empty-state">No pending or confirmed bookings right now.</p>
        ` : `
          <div class="bookings-grid">
            ${upcomingBookings.map(b => {
              const listing = allListings.find(l => l.listing_id === b.listing_id) || { title: 'Service Appointment', price: 60 };
              const cust = (typeof DB_CUSTOMERS !== 'undefined' ? DB_CUSTOMERS : []).find(c => c.customer_id === b.customer_id) || { name: 'Customer', location: 'Portland, OR' };
              return `
                <div class="booking-card">
                  <div class="booking-card-top">
                    <div class="booking-owner">
                      <span class="booking-avatar" aria-hidden="true">${(cust.name || 'C').charAt(0)}</span>
                      <div>
                        <h4>${cust.name}</h4>
                      </div>
                    </div>
                    <span class="badge badge-${b.status === 'confirmed' ? 'blue' : 'orange'}">
                      <span class="badge-dot" aria-hidden="true" />
                      ${b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>

                  <p class="booking-listing">${listing.title}</p>

                  <div class="booking-card-details">
                    <p class="booking-detail">
                      <span class="detail-icon" aria-hidden="true">??</span>
                      <span>
                        <small>Service date</small>
                        <strong>${formatDate(b.scheduled_slot)}</strong>
                      </span>
                    </p>
                    <p class="booking-detail">
                      <span class="detail-icon" aria-hidden="true">??</span>
                      <span>
                        <small>Escrow total</small>
                        <strong>$${b.total_amount || listing.price || 60} [Held]</strong>
                      </span>
                    </p>
                    <p class="booking-detail booking-address">
                      <span class="detail-icon" aria-hidden="true">?</span>
                      <span>
                        <small>Service location</small>
                        <strong>${cust.location || 'Portland, OR'}</strong>
                      </span>
                    </p>
                  </div>

                  <div class="booking-card-actions">
                    ${b.status === 'pending' ? `
                      <button type="button" class="btn btn-accept" onclick="updateBookingStatus('${b.booking_id}', 'confirmed')">
                        <span aria-hidden="true">?</span> Accept Request
                      </button>
                    ` : `
                      <button type="button" class="btn btn-complete" onclick="updateBookingStatus('${b.booking_id}', 'completed')">
                        <span aria-hidden="true">?</span> Mark Completed
                      </button>
                    `}
                    <button type="button" class="btn btn-cancel" onclick="updateBookingStatus('${b.booking_id}', 'cancelled')">
                      Decline
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </section>

      <section class="panel bookings-section past-section" id="past-bookings">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Your service history</p>
            <h3>Past Bookings <span class="count-pill">${pastBookings.length}</span></h3>
          </div>
          <span class="section-illustration" aria-hidden="true">??</span>
        </div>
        ${pastBookings.length === 0 ? `
          <p class="empty-state">No past bookings yet.</p>
        ` : `
          <div class="bookings-grid">
            ${pastBookings.map(b => {
              const listing = allListings.find(l => l.listing_id === b.listing_id) || { title: 'Service Appointment', price: 60 };
              const cust = (typeof DB_CUSTOMERS !== 'undefined' ? DB_CUSTOMERS : []).find(c => c.customer_id === b.customer_id) || { name: 'Customer', location: 'Portland, OR' };
              return `
                <div class="booking-card">
                  <div class="booking-card-top">
                    <div class="booking-owner">
                      <span class="booking-avatar" aria-hidden="true">${(cust.name || 'C').charAt(0)}</span>
                      <div>
                        <h4>${cust.name}</h4>
                      </div>
                    </div>
                    <span class="badge badge-${b.status === 'completed' ? 'green' : 'red'}">
                      <span class="badge-dot" aria-hidden="true" />
                      ${b.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </span>
                  </div>

                  <p class="booking-listing">${listing.title}</p>

                  <div class="booking-card-details">
                    <p class="booking-detail">
                      <span class="detail-icon" aria-hidden="true">??</span>
                      <span>
                        <small>Service date</small>
                        <strong>${formatDate(b.scheduled_slot)}</strong>
                      </span>
                    </p>
                    <p class="booking-detail">
                      <span class="detail-icon" aria-hidden="true">??</span>
                      <span>
                        <small>Total amount</small>
                        <strong>$${b.total_amount || listing.price || 60}</strong>
                      </span>
                    </p>
                    <p class="booking-detail booking-address">
                      <span class="detail-icon" aria-hidden="true">?</span>
                      <span>
                        <small>Service location</small>
                        <strong>${cust.location || 'Portland, OR'}</strong>
                      </span>
                    </p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </section>
    </div>
  `;
}
