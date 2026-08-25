import {
  UNRESOLVED_STATUSES,
  countReportsByListing,
  decisionEffects,
  getNextActionId,
  isCustomerVisible,
  matchesStatusFilter,
  prioritizeReports,
} from "./logic.mjs";
import {
  loadDoorstepData,
  readLocalState,
  writeLocalState,
} from "./data.mjs";

const elements = {
  metricOpen: document.querySelector("#metric-open"),
  metricHigh: document.querySelector("#metric-high"),
  metricHidden: document.querySelector("#metric-hidden"),
  metricActions: document.querySelector("#metric-actions"),
  queueCount: document.querySelector("#queue-count"),
  queueList: document.querySelector("#queue-list"),
  queueTemplate: document.querySelector("#queue-item-template"),
  searchInput: document.querySelector("#search-input"),
  riskFilter: document.querySelector("#risk-filter"),
  statusFilter: document.querySelector("#status-filter"),
  emptyState: document.querySelector("#empty-state"),
  caseContent: document.querySelector("#case-content"),
  caseId: document.querySelector("#case-id"),
  caseSubtitle: document.querySelector("#case-subtitle"),
  caseBadges: document.querySelector("#case-badges"),
  reportDescription: document.querySelector("#report-description"),
  reportFacts: document.querySelector("#report-facts"),
  evidenceLink: document.querySelector("#evidence-link"),
  linkedRecords: document.querySelector("#linked-records"),
  relatedReviews: document.querySelector("#related-reviews"),
  patternCount: document.querySelector("#pattern-count"),
  patternCopy: document.querySelector("#pattern-copy"),
  actionReason: document.querySelector("#action-reason"),
  actionButtons: document.querySelector("#action-buttons"),
  decisionStatus: document.querySelector("#decision-status"),
  auditTimeline: document.querySelector("#audit-timeline"),
};

const state = {
  data: null,
  selectedReportId: null,
  filters: { search: "", risk: "all", status: "unresolved" },
  local: loadLocalState(),
};

function loadLocalState() {
  return readLocalState();
}

function saveLocalState() {
  writeLocalState(state.local);
}

function formatLabel(value) {
  return String(value ?? "—").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value, includeTime = false) {
  if (!value) return "—";
  const options = includeTime
    ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(new Date(value));
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: state.data.meta.currency }).format(value);
}

function effectiveReport(report) {
  return { ...report, status: state.local.reportStatuses[report.report_id] ?? report.status };
}

function effectiveListing(listing) {
  return {
    ...listing,
    listing_status: state.local.listingStatuses[listing.listing_id] ?? listing.listing_status,
  };
}

function recordMap(records, key) {
  return new Map(records.map((record) => [record[key], record]));
}

function getCaseContext(report) {
  const listing = effectiveListing(state.maps.listings.get(report.listing_id));
  const provider = state.maps.providers.get(listing.provider_id);
  const booking = report.booking_id ? state.maps.bookings.get(report.booking_id) : null;
  const customer = report.reporter_id ? state.maps.customers.get(report.reporter_id) : null;
  const reviews = state.data.reviews
    .filter((review) => review.listing_id === report.listing_id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const actions = [...state.data.actions, ...state.local.actions]
    .filter((action) => action.report_id === report.report_id || action.listing_id === report.listing_id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return { report, listing, provider, booking, customer, reviews, actions };
}

function filteredQueue() {
  const query = state.filters.search.trim().toLowerCase();

  return prioritizeReports(state.data.reports, state.local.reportStatuses).filter((report) => {
    const { listing, provider } = getCaseContext(report);
    const matchesRisk = state.filters.risk === "all" || report.risk_level === state.filters.risk;
    const matchesStatus = matchesStatusFilter(report.status, state.filters.status);
    const haystack = [report.report_id, report.description, report.reason, listing.title, listing.listing_id, provider.name]
      .join(" ")
      .toLowerCase();
    return matchesRisk && matchesStatus && (!query || haystack.includes(query));
  });
}

function renderMetrics() {
  const reports = state.data.reports.map(effectiveReport);
  const listings = state.data.listings.map(effectiveListing);
  const actions = [...state.data.actions, ...state.local.actions];

  elements.metricOpen.textContent = reports.filter((report) => UNRESOLVED_STATUSES.has(report.status)).length;
  elements.metricHigh.textContent = reports.filter(
    (report) => UNRESOLVED_STATUSES.has(report.status) && ["critical", "high"].includes(report.risk_level),
  ).length;
  elements.metricHidden.textContent = listings.filter((listing) => listing.listing_status === "suspended").length;
  elements.metricActions.textContent = actions.length;
}

function renderQueue() {
  const queue = filteredQueue();
  elements.queueList.replaceChildren();
  elements.queueCount.textContent = `${queue.length} ${queue.length === 1 ? "case" : "cases"}`;

  if (!queue.length) {
    const message = document.createElement("p");
    message.className = "queue-empty";
    message.textContent = "No reports match these filters.";
    elements.queueList.append(message);
    state.selectedReportId = null;
    renderCase();
    return;
  }

  if (!queue.some((report) => report.report_id === state.selectedReportId)) {
    state.selectedReportId = queue[0].report_id;
  }

  for (const report of queue) {
    const { listing, provider } = getCaseContext(report);
    const fragment = elements.queueTemplate.content.cloneNode(true);
    const button = fragment.querySelector(".queue-item");
    const reportCount = state.reportCounts[report.listing_id];

    button.dataset.reportId = report.report_id;
    button.setAttribute("aria-selected", String(report.report_id === state.selectedReportId));
    button.classList.toggle("selected", report.report_id === state.selectedReportId);
    fragment.querySelector(".risk-badge").textContent = report.risk_level;
    fragment.querySelector(".risk-badge").classList.add(`risk-${report.risk_level}`);
    fragment.querySelector(".report-time").textContent = formatDate(report.created_at);
    fragment.querySelector(".queue-title").textContent = `${formatLabel(report.reason)} · ${listing.title}`;
    fragment.querySelector(".queue-provider").textContent = `${provider.name} · ${listing.provider_location}`;
    fragment.querySelector(".status-badge").textContent = formatLabel(report.status);
    fragment.querySelector(".status-badge").classList.add(`status-${report.status}`);
    fragment.querySelector(".pattern-mini").textContent = `${reportCount} report${reportCount === 1 ? "" : "s"} on listing`;
    button.addEventListener("click", () => {
      state.selectedReportId = report.report_id;
      elements.actionReason.value = "";
      elements.decisionStatus.textContent = "";
      renderQueue();
      renderCase();
    });
    elements.queueList.append(fragment);
  }
}

function badge(text, className) {
  const element = document.createElement("span");
  element.className = `badge ${className}`;
  element.textContent = text;
  return element;
}

function definition(label, value) {
  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value;
  wrapper.append(term, description);
  return wrapper;
}

function recordCard(label, title, detail) {
  const card = document.createElement("div");
  const labelElement = document.createElement("span");
  const titleElement = document.createElement("strong");
  const detailElement = document.createElement("span");
  card.className = "record-card";
  labelElement.className = "record-label";
  labelElement.textContent = label;
  titleElement.textContent = title;
  detailElement.textContent = detail;
  card.append(labelElement, titleElement, detailElement);
  return card;
}

function renderCase() {
  const report = state.data?.reports.find((item) => item.report_id === state.selectedReportId);
  if (!report) {
    elements.emptyState.hidden = false;
    elements.caseContent.hidden = true;
    return;
  }

  const context = getCaseContext(effectiveReport(report));
  const { listing, provider, booking, customer, reviews, actions } = context;
  const reportCount = state.reportCounts[report.listing_id];
  const lowReviews = reviews.filter((review) => review.rating <= 2).length;
  const serviceLabels = listing.service_type.map((code) => state.maps.serviceTypes.get(code)?.label ?? code).join(", ");

  elements.emptyState.hidden = true;
  elements.caseContent.hidden = false;
  elements.caseId.textContent = report.report_id;
  elements.caseSubtitle.textContent = `${listing.listing_id} · ${provider.name} · ${listing.provider_location}`;
  elements.caseBadges.replaceChildren(
    badge(report.risk_level, `risk-${report.risk_level}`),
    badge(formatLabel(report.status), `status-${report.status}`),
    badge(`${formatLabel(listing.listing_status)} listing`, `status-${isCustomerVisible(listing.listing_status) ? "open" : "dismissed"}`),
  );
  elements.reportDescription.textContent = report.description;
  elements.reportFacts.replaceChildren(
    definition("Reason", formatLabel(report.reason)),
    definition("Reported", formatDate(report.created_at, true)),
    definition("Reporter", customer?.name ?? report.reporter_id),
  );

  if (report.evidence_url) {
    elements.evidenceLink.href = report.evidence_url;
    elements.evidenceLink.textContent = "Open evidence";
    elements.evidenceLink.classList.remove("disabled");
    elements.evidenceLink.removeAttribute("aria-disabled");
  } else {
    elements.evidenceLink.removeAttribute("href");
    elements.evidenceLink.textContent = "No attachment";
    elements.evidenceLink.classList.add("disabled");
    elements.evidenceLink.setAttribute("aria-disabled", "true");
  }

  elements.linkedRecords.replaceChildren(
    recordCard("Listing", listing.title, `${serviceLabels} · ${money(listing.price)} ${listing.price_unit}`),
    recordCard("Provider", provider.name, `${provider.provider_status} · ${provider.rating ?? "No"} rating · ${provider.review_count} reviews`),
    recordCard(
      "Booking",
      booking?.booking_id ?? "No booking linked",
      booking ? `${formatLabel(booking.status)} · ${formatDate(booking.scheduled_slot, true)} · ${money(booking.price_paid)}` : "Report was filed directly against the listing",
    ),
    recordCard("Customer", customer?.name ?? "Unknown", customer ? `${customer.neighborhood} · joined ${formatDate(customer.signup_date)}` : report.reporter_id),
  );

  elements.relatedReviews.replaceChildren();
  if (!reviews.length) {
    const empty = document.createElement("p");
    empty.className = "timeline-empty";
    empty.textContent = "No reviews are attached to this listing.";
    elements.relatedReviews.append(empty);
  } else {
    for (const review of reviews.slice(0, 3)) {
      const item = document.createElement("article");
      const stars = document.createElement("span");
      const text = document.createElement("p");
      item.className = "review-item";
      stars.className = "review-stars";
      stars.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} · ${formatDate(review.created_at)}`;
      text.textContent = review.text;
      item.append(stars, text);
      elements.relatedReviews.append(item);
    }
  }

  elements.patternCount.textContent = `${reportCount} report${reportCount === 1 ? "" : "s"}`;
  elements.patternCopy.textContent = `${reportCount > 1 ? "Repeated reports increase queue priority." : "No repeated-report pattern yet."} ${lowReviews} low-rating review${lowReviews === 1 ? "" : "s"} on this listing.`;
  renderTimeline(actions);
}

function renderTimeline(actions) {
  elements.auditTimeline.replaceChildren();
  if (!actions.length) {
    const empty = document.createElement("li");
    empty.className = "timeline-empty";
    empty.textContent = "No prior moderation decision is recorded.";
    elements.auditTimeline.append(empty);
    return;
  }

  for (const action of actions) {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const meta = document.createElement("span");
    const reason = document.createElement("span");
    item.className = "timeline-item";
    title.textContent = `${formatLabel(action.action)} · ${action.risk_level} risk`;
    meta.textContent = `${action.admin_name} · ${formatDate(action.created_at, true)}`;
    reason.textContent = action.reason;
    item.append(title, meta, reason);
    elements.auditTimeline.append(item);
  }
}

function recordDecision(action) {
  const reason = elements.actionReason.value.trim();
  const report = state.data.reports.find((item) => item.report_id === state.selectedReportId);

  if (!report) return;
  if (reason.length < 10) {
    elements.decisionStatus.textContent = "Add a specific reason of at least 10 characters before recording the decision.";
    elements.decisionStatus.classList.add("error");
    elements.actionReason.focus();
    return;
  }

  const listing = effectiveListing(state.maps.listings.get(report.listing_id));
  const effects = decisionEffects(action, listing.listing_status);
  const entry = {
    action_id: getNextActionId(state.data.actions, state.local.actions),
    report_id: report.report_id,
    listing_id: report.listing_id,
    admin_name: "Ibtisam Hossain (demo)",
    action,
    risk_level: report.risk_level,
    reason,
    created_at: `${state.data.meta.reference_date}T23:59:00-04:00`,
  };

  state.local.actions.push(entry);
  state.local.reportStatuses[report.report_id] = effects.reportStatus;
  if (effects.listingStatus !== listing.listing_status) {
    state.local.listingStatuses[listing.listing_id] = effects.listingStatus;
  }
  saveLocalState();

  elements.actionReason.value = "";
  elements.decisionStatus.classList.remove("error");
  elements.decisionStatus.textContent = effects.hiddenFromMarketplace
    ? `Decision recorded. ${listing.listing_id} is hidden from Products B and C.`
    : "Decision recorded with a new audit entry.";
  renderAll();
}

function renderAll() {
  renderMetrics();
  renderQueue();
  renderCase();
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderQueue();
    renderCase();
  });
  elements.riskFilter.addEventListener("change", (event) => {
    state.filters.risk = event.target.value;
    renderQueue();
    renderCase();
  });
  elements.statusFilter.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    renderQueue();
    renderCase();
  });
  elements.actionButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (button) recordDecision(button.dataset.action);
  });
}

async function initialize() {
  try {
    state.data = await loadDoorstepData();
    state.maps = {
      listings: recordMap(state.data.listings, "listing_id"),
      providers: recordMap(state.data.providers, "provider_id"),
      bookings: recordMap(state.data.bookings, "booking_id"),
      customers: recordMap(state.data.customers, "customer_id"),
      serviceTypes: recordMap(state.data.serviceTypes, "code"),
    };
    state.reportCounts = countReportsByListing(state.data.reports);
    bindEvents();
    renderAll();
  } catch (error) {
    console.error(error);
    elements.queueList.innerHTML = '<p class="queue-empty">Serve the repository over HTTP so the dashboard can read <code>mock-data/</code>.</p>';
  }
}

initialize();
