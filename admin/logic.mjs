export const RISK_WEIGHT = Object.freeze({
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
});

export const UNRESOLVED_STATUSES = new Set(["open", "under_review"]);

export function countReportsByListing(reports) {
  return reports.reduce((counts, report) => {
    counts[report.listing_id] = (counts[report.listing_id] ?? 0) + 1;
    return counts;
  }, {});
}

export function prioritizeReports(reports, statusOverrides = {}) {
  const reportCounts = countReportsByListing(reports);

  return reports
    .map((report) => ({ ...report, status: statusOverrides[report.report_id] ?? report.status }))
    .sort((a, b) => {
      const riskDifference = (RISK_WEIGHT[b.risk_level] ?? 0) - (RISK_WEIGHT[a.risk_level] ?? 0);
      if (riskDifference !== 0) return riskDifference;

      const patternDifference = reportCounts[b.listing_id] - reportCounts[a.listing_id];
      if (patternDifference !== 0) return patternDifference;

      return a.created_at.localeCompare(b.created_at);
    });
}

export function decisionEffects(action, currentListingStatus) {
  if (!new Set(["dismiss", "warn", "suspend", "resolve"]).has(action)) {
    throw new Error(`Unsupported moderation action: ${action}`);
  }

  return {
    reportStatus: action === "dismiss" ? "dismissed" : "resolved",
    listingStatus: action === "suspend" ? "suspended" : currentListingStatus,
    hiddenFromMarketplace: action === "suspend" || currentListingStatus !== "active",
  };
}

export function getNextActionId(baseActions, localActions) {
  const number = baseActions.length + localActions.length + 1;
  return `demo_mod_${String(number).padStart(3, "0")}`;
}

export function isCustomerVisible(listingStatus) {
  return listingStatus === "active";
}

export function matchesStatusFilter(status, filter) {
  if (filter === "all") return true;
  if (filter === "unresolved") return UNRESOLVED_STATUSES.has(status);
  return status === filter;
}
