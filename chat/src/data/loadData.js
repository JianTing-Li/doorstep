import exampleQueries from "../../../mock-data/example-queries.json" with { type: "json" };
import listings from "../../../mock-data/listings.json" with { type: "json" };
import meta from "../../../mock-data/_meta.json" with { type: "json" };
import neighborhoods from "../../../mock-data/neighborhoods.json" with { type: "json" };
import providers from "../../../mock-data/providers.json" with { type: "json" };
import serviceTypes from "../../../mock-data/service-types.json" with { type: "json" };

// This module is the only mock-data access point. Replace these getters with
// database-backed implementations later and the rest of the app stays intact.
export function loadData() {
  return { exampleQueries, listings, meta, neighborhoods, providers, serviceTypes };
}

export function getExampleQueries() {
  return exampleQueries;
}

export function getMarketplaceMeta() {
  return meta;
}

export function getNeighborhoods() {
  return neighborhoods;
}

export function getProviders() {
  return providers;
}

export function getRawListings() {
  return listings;
}

export function getServiceTypes() {
  return serviceTypes;
}
