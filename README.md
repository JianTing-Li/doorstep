# Doorstep

A two-sided local marketplace for home services. It connects independent home-service providers like cleaners, handymen, and movers with customers in the same city. Doorstep does not employ providers. It takes a percentage of each booking made through the platform.

## Products

Doorstep combines four product contributions into three user-facing applications. Product C's matching
experience is integrated into Product B as the Customer app's Ask tab; its server-side handler remains in
`chat/` and is exposed through the root API entry point.

### Provider App — Product A ([`/provider`](provider/))

Providers create listings describing a specific service, set a price, and manage incoming bookings.

### Customer App — Product B ([`/customer`](customer/))

Customers browse and filter active listings by service type, price, and availability, and book directly.

### Matching Chatbot — Product C ([`/customer/?tab=ask`](customer/))

Customers describe a job in their own words and get matched to current active listings that best fit jobs
that do not map cleanly onto one service type. The legacy `/chat/` URL redirects to this Ask tab.

### Trust & Safety Dashboard — Product D ([`/admin`](admin/))

The internal team reviews listings and bookings with reports or low reviews, prioritizes risky cases, records a human moderation decision, and writes an audit entry. Suspended listings are excluded from Products B and C.

## Shared Data Architecture

All four products read one shared synthetic dataset and the same schema contract. Nobody queries a live
database. Stable IDs connect neighborhoods, providers, customers, listings, bookings, reviews, reports,
and moderation actions, so a booking in the Provider App is the same record the Trust & Safety Dashboard
reviews.

**Source of truth: [`mock-data/`](mock-data/) — start with its [README](mock-data/README.md).**
It documents every field, the relationship map, and the rules all four products follow.

- Product A writes provider and listing data.
- Product B reads active listings and writes booking lifecycle changes, reviews, and reports through the shared overlay.
- Product C's Ask tab reads active listings for recommendations and has its own test fixtures in
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

## Repo Rules

1. Product UI modules do not import from another product folder. Cross-product infrastructure is exposed
   through root or `shared/` entry points.
2. `/mock-data` is read-only and shared. Changing it requires team agreement.
3. Service type codes come from `mock-data/service-types.json`. Never invent new ones.
4. Use `_meta.reference_date` as "today". Parsing or formatting an existing datetime with `Date` is fine;
   do not use the system clock to decide demo dates.
5. The customer and chat products show only listings where `listing_status` is `"active"`.
6. Keep business logic in pure functions in `src/lib` or `lib/`, separate from rendering.
7. Run `python3 mock-data/validate.py` before committing any dataset change.
8. Never commit `node_modules` or `dist`.

## Local Development

There are no workspaces and no monorepo tooling. Customer and Provider are standalone Vite apps; Admin is
static. Product C's UI and tests now live under Customer, while its server handler remains under `chat/`.

The root `package.json` is **not** a workspace root and does not build or own any product. It exists
only because the repo deploys as a single Vercel project whose root directory is the repo root, and
Vercel resolves dependencies for the serverless functions in `/api` from the root manifest. Add a
dependency there only if a function under `/api` imports it; product dependencies belong in that
product's own `package.json`.

## Deployment

The repo deploys as one Vercel project, configured by `vercel.json` at the root:

- `/` — the static landing page in `index.html`
- `/chat/` — compatibility redirect to `/customer/?tab=ask`
- `/api/*` — serverless functions; each file re-exports the handler from its product folder

`/api/chat` uses `GEMINI_API_KEY` as its primary structured-language interpreter and
`ANTHROPIC_API_KEY` as the fallback. Both are read server-side only — never expose them
to a client bundle, and never prefix them with `VITE_`.

## Developers

- Kamal Mohamed — Provider App (Product A) — [`/provider`](provider/)
- Abheeshu Dhungana — Customer App (Product B) — [`/customer`](customer/)
- Jian Ting Li — Matching Chatbot (Product C) — [`/customer/?tab=ask`](customer/)
- Ibtisam Hossain — Trust & Safety Dashboard (Product D) — [`/admin`](admin/)
