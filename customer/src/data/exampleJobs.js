// Hardcoded from mock-data/example-queries.json's real phrasings and
// expected_codes. These never call parseJob — the filter object is fixed.
// Plain .js (not .jsx) specifically so it can be imported by the conversation
// test suite (a plain Node script, no JSX transform) as well as by
// ExampleChips.jsx (the chip row) and AskScreen.jsx (the "show me examples"
// plain-text answer) — one list, three consumers, no drift between them.
export const EXAMPLE_JOBS = [
  {
    text: "Looking for someone to come every other week and clean my one bedroom.",
    filters: { service_types: ["cleaning_standard"], max_price: null, neighborhood: null, urgency: null },
  },
  {
    text: "Kitchen tap drips constantly and the shutoff valve underneath is seized.",
    filters: { service_types: ["plumbing"], max_price: null, neighborhood: null, urgency: null },
  },
  {
    text: "Need two guys to help load a U-Haul on Sunday, I have the truck already.",
    filters: { service_types: ["moving_help"], max_price: null, neighborhood: null, urgency: null },
  },
  {
    text: "Gutters are overflowing and there are leaves all over the lawn.",
    filters: { service_types: ["yard_outdoor"], max_price: null, neighborhood: null, urgency: null },
  },
  {
    text: "I want a ceiling fan put in where the old light fixture is.",
    filters: { service_types: ["handyman_general", "electrical"], max_price: null, neighborhood: null, urgency: null },
  },
];
