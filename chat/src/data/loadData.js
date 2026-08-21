import exampleQueries from "../../../mock-data/example-queries.json" with { type: "json" };
import listings from "../../../mock-data/listings.json" with { type: "json" };
import meta from "../../../mock-data/_meta.json" with { type: "json" };
import neighborhoods from "../../../mock-data/neighborhoods.json" with { type: "json" };
import providers from "../../../mock-data/providers.json" with { type: "json" };
import reviews from "../../../mock-data/reviews.json" with { type: "json" };
import serviceTypes from "../../../mock-data/service-types.json" with { type: "json" };

// Single access point for all mock-data JSON. Nothing else in this app
// imports from /mock-data directly.
export function getExampleQueries() {
  return exampleQueries;
}

export function getListings() {
  return listings;
}

export function getMeta() {
  return meta;
}

export function getNeighborhoods() {
  return neighborhoods;
}

export function getProviders() {
  return providers;
}

export function getReviews() {
  return reviews;
}

export function getServiceTypes() {
  return serviceTypes;
}
