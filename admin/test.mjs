import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  countReportsByListing,
  decisionEffects,
  isCustomerVisible,
  prioritizeReports,
} from "./logic.mjs";

const dataRoot = new URL("../mock-data/", import.meta.url);
const reports = JSON.parse(await fs.readFile(new URL("reports.json", dataRoot), "utf8"));
const listings = JSON.parse(await fs.readFile(new URL("listings.json", dataRoot), "utf8"));

const reportCounts = countReportsByListing(reports);
assert.equal(reports.length, 12, "Product D should load all 12 GitHub mock reports");
assert.equal(reportCounts.lst_008, 3, "The repeated-report pattern for lst_008 must remain visible");

const queue = prioritizeReports(reports).filter((report) => ["open", "under_review"].includes(report.status));
assert.equal(queue.length, 4, "The default review queue should contain four unresolved reports");
assert.equal(queue[0].report_id, "rpt_002", "High-risk repeated reports should lead the queue");

const activeListing = listings.find((listing) => listing.listing_status === "active");
assert.equal(isCustomerVisible(activeListing.listing_status), true);
assert.equal(isCustomerVisible("suspended"), false);

const suspension = decisionEffects("suspend", "active");
assert.deepEqual(suspension, {
  reportStatus: "resolved",
  listingStatus: "suspended",
  hiddenFromMarketplace: true,
});

const dismissal = decisionEffects("dismiss", "active");
assert.equal(dismissal.reportStatus, "dismissed");
assert.equal(dismissal.listingStatus, "active");
assert.equal(dismissal.hiddenFromMarketplace, false);

console.log("Product D logic checks passed: GitHub mock data, queue priority, decisions, and visibility rule.");
