# Doorstep

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

All four products use one connected synthetic dataset and the same schema contract. Stable IDs connect customers, providers, listings, bookings, reviews, reports, moderation cases, and audit entries.

- Product A writes provider and listing data.
- Product B reads active listings and writes bookings, reviews, and reports.
- Product C reads active listings for recommendations.
- Product D reads safety signals and writes moderation status and audit entries.
- Only listings with `status = active` are customer-visible.

Project data: [`data/tasklocal-connected-dataset.json`](data/tasklocal-connected-dataset.json)

Reviewable source of truth: [TaskLocal / Doorstep Connected Synthetic Dataset](https://docs.google.com/spreadsheets/d/1CRYa-m6E0FnbR1py-Wu9XeLZ5H1WX0zQgkwOswCXHRY/edit)

## Developers

- Kamal Mohamed — Provider App (Product A)
- Abheeshu Dhungana — Customer App (Product B)
- Jian Ting Li — Matching Chatbot (Product C)
- Ibtisam Hossain — Trust & Safety Dashboard (Product D)
