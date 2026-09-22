import { mergeCollection } from "../../../shared/demo-store.js";

import exampleQueries from "../../../mock-data/example-queries.json" with { type: "json" };
import listings from "../../../mock-data/listings.json" with { type: "json" };
import meta from "../../../mock-data/_meta.json" with { type: "json" };
import neighborhoods from "../../../mock-data/neighborhoods.json" with { type: "json" };
import providers from "../../../mock-data/providers.json" with { type: "json" };
import reviews from "../../../mock-data/reviews.json" with { type: "json" };
import serviceTypes from "../../../mock-data/service-types.json" with { type: "json" };

// Single access point for all mock-data JSON. Nothing else in this app
// imports from /mock-data directly.
//
// Phase 3: the mutable collections now read through shared/demo-store.js,
// which merges the shared write overlay (localStorage) over the pristine
// imports above. A listing suspended in Admin, or created in Provider, is
// therefore visible here without this app knowing who wrote it. The static
// reference tables (meta, neighborhoods, service types, example queries) have
// no overlay and are returned as imported.
export function getExampleQueries() {
  return exampleQueries;
}

export function getListings() {
  return mergeCollection("listings", listings);
}

export function getMeta() {
  return meta;
}

export function getNeighborhoods() {
  return neighborhoods;
}

export function getProviders() {
  return mergeCollection("providers", providers);
}

export function getReviews() {
  return mergeCollection("reviews", reviews);
}

export function getServiceTypes() {
  return serviceTypes;
}
