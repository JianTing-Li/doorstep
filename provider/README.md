# Doorstep — Provider App (Product A)

This folder contains Kamal Mohamed's Product A build for Doorstep.

A two-sided local marketplace for home services. It connects independent home-service providers like cleaners, handymen, and movers with customers in the same city. Doorstep does not employ providers. It takes a percentage of each booking made through the platform.

## Products

Doorstep is built as four standalone products, each owned by one developer:

### Provider App (Product A)

Providers create listings describing a specific service, set a price, and manage incoming bookings.

### Customer App (Product B)

Customers browse and filter active listings by service type, price, and availability, and book directly.

### Matching Chatbot (Product C)

Customers describe a job in their own words and get matched to current active listings that best fit jobs that do not map cleanly onto one service type.

### Trust & Safety Dashboard (Product D)

The internal team reviews listings and bookings with reports or low reviews, prioritizes risky cases, records a human moderation decision, and writes an audit entry. Suspended listings are excluded from Products B and C.

## Shared Data Architecture

All four products read one shared synthetic dataset and the same schema contract. Nobody queries a live
database. Stable IDs connect neighborhoods, providers, customers, listings, bookings, reviews, reports,
and moderation actions, so a booking in the Provider App is the same record the Trust & Safety Dashboard
reviews.

**Source of truth: [`mock-data/`](mock-data/) — start with its [README](mock-data/README.md).**
It documents every field, the relationship map, and the rules all four products follow.

- Product A writes provider and listing data.
- Product B reads active listings and writes bookings, reviews, and reports.
- Product C reads active listings for recommendations, and has its own test fixtures in
  `mock-data/example-queries.json`.
- Product D reads safety signals and writes moderation actions.
- Only listings with `listing_status = "active"` are customer-visible to Products B and C.

Treat `_meta.reference_date` (`2026-08-19`) as "today" rather than the system clock, or every availability
slot will look like it is in the past.

Run `python3 mock-data/validate.py` before committing any change to the dataset. It checks foreign keys,
enums, derived counts, and date ordering, and exits non-zero on a break.

Historical reference: the earlier spreadsheet draft,
[TaskLocal / Doorstep Connected Synthetic Dataset](https://docs.google.com/spreadsheets/d/1CRYa-m6E0FnbR1py-Wu9XeLZ5H1WX0zQgkwOswCXHRY/edit).
It used a different schema (single-value `service_category`, prices in cents, a separate audit log) and has
been superseded by `mock-data/`.

## Developers

- Kamal Mohamed — Provider App (Product A)
- Abheeshu Dhungana — Customer App (Product B)
- Jian Ting Li — Matching Chatbot (Product C)
- Ibtisam Hossain — Trust & Safety Dashboard (Product D)
