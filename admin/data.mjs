import {
  getCreated,
  getPatches,
  mergeCollection,
  setCreated,
  setPatches,
} from "/shared/demo-store.js";

// Product D's single access point for mock-data (Phase 3).
//
// The DATA_ROOT fetch that used to live in app.mjs moved here unchanged, and
// the mutable collections are merged through shared/demo-store.js on the way
// out — so a listing suspended here is hidden in Customer and Chat, and a
// booking made in Customer appears in the case context here.
//
// Product D already kept its own local demo state under
// "doorstep-product-d-demo-v1" with the shape
// { actions, reportStatuses, listingStatuses }. That shape is preserved
// exactly; it is now projected on and off the shared store instead of being
// written to Product D's private key, so its existing effectiveListing() /
// effectiveReport() helpers and its Reset button keep working untouched.

// Absolute, like every other cross-folder reference in the app: a
// parent-relative path breaks the moment admin/ is served as its own root,
// and silently leaves the queue at "0 cases" rather than erroring visibly.
const DATA_ROOT = "/mock-data";

const dataFiles = {
  meta: "_meta.json",
  reports: "reports.json",
  actions: "moderation-actions.json",
  listings: "listings.json",
  providers: "providers.json",
  bookings: "bookings.json",
  customers: "customers.json",
  reviews: "reviews.json",
  serviceTypes: "service-types.json",
};

// Collections that carry a shared write overlay. The rest (meta, service
// types) are static reference tables.
const MERGED = {
  reports: "reports",
  listings: "listings",
  providers: "providers",
  bookings: "bookings",
  customers: "customers",
  reviews: "reviews",
};

export async function loadDoorstepData() {
  const entries = await Promise.all(
    Object.entries(dataFiles).map(async ([key, file]) => {
      const response = await fetch(`${DATA_ROOT}/${file}`);
      if (!response.ok) throw new Error(`Could not load ${file}`);
      return [key, await response.json()];
    }),
  );
  const data = Object.fromEntries(entries);

  for (const [key, collection] of Object.entries(MERGED)) {
    data[key] = mergeCollection(collection, data[key]);
  }
  return data;
}

/** The shared overlay, projected into Product D's existing local-state shape. */
export function readLocalState() {
  return {
    actions: getCreated("moderation-actions"),
    reportStatuses: mapOf(getPatches("reports"), "status"),
    listingStatuses: mapOf(getPatches("listings"), "listing_status"),
  };
}

/** Product D's local-state shape, projected back onto the shared overlay. */
export function writeLocalState(local) {
  setCreated("moderation-actions", local.actions ?? []);
  setPatches("reports", patchesOf(local.reportStatuses, "status"));
  setPatches("listings", patchesOf(local.listingStatuses, "listing_status"));
}

function mapOf(patched, field) {
  return Object.fromEntries(
    Object.entries(patched)
      .filter(([, patch]) => patch && patch[field] !== undefined)
      .map(([id, patch]) => [id, patch[field]]),
  );
}

function patchesOf(byId, field) {
  return Object.fromEntries(
    Object.entries(byId ?? {}).map(([id, value]) => [id, { [field]: value }]),
  );
}
