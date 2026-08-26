# Doorstep

A two-sided local marketplace for home services. It connects independent home-service providers like cleaners, handymen, and movers with customers in the same city. Doorstep does not employ providers. It takes a percentage of each booking made through the platform.

## Products

Doorstep is built as four standalone products, each owned by one developer, each living in its own folder at the repo root.

### Provider App — Product A ([`/provider`](provider/))

Providers create listings describing a specific service, set a price, and manage incoming bookings.

### Customer App — Product B ([`/customer`](customer/))

Customers browse and filter active listings by service type, price, and availability, and book directly.

### Matching Chatbot — Product C ([`/chat`](chat/))

Customers describe a job in their own words and get matched to current active listings that best fit jobs that do not map cleanly onto one service type.

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

## Repo Rules

1. Each product lives in its own folder and never imports from another product folder.
2. `/mock-data` is read-only and shared. Changing it requires team agreement.
3. Service type codes come from `mock-data/service-types.json`. Never invent new ones.
4. Use `_meta.reference_date` as "today", never `new Date()`.
5. The customer and chat products show only listings where `listing_status` is `"active"`.
6. Keep business logic in pure functions in `src/lib` or `lib/`, separate from rendering.
7. Run `python3 mock-data/validate.py` before committing any dataset change.
8. Never commit `node_modules` or `dist`.

## Local Development

There are no workspaces and no monorepo tooling. Each product remains a standalone app with its own stack
and dependencies. Run a product from its folder using that product's README. To exercise the integrated
site, build and serve the unified output from the repository root:

```bash
bash build.sh
python3 -m http.server 4173 -d dist
```

Then open `http://localhost:4173/` and use the landing page or shared product switcher to move between apps.
The root `package.json` is **not** a workspace root and does not own the product dependencies. It exists so
Vercel can install dependencies for serverless functions in `/api`; product dependencies remain in each
product's own `package.json`.

## Deployment

The repo deploys as one Vercel project, configured by `vercel.json` and assembled by `build.sh`:

- `/` — unified product landing page
- `/customer/` — Customer App (React/Vite)
- `/chat/` — Matching Chatbot (React/Vite)
- `/provider/` — Provider App (React/Vite)
- `/admin/` — Trust & Safety Dashboard (static ES modules)
- `/shared/` — common design tokens, role/theme switcher, and demo-state overlay
- `/mock-data/` — canonical connected synthetic dataset used by every product
- `/api/*` — serverless functions; each file re-exports the handler from its product folder

`/api/chat` needs a `GEMINI_API_KEY` environment variable set in the Vercel project. It is read
server-side only — never expose it to a client bundle, and never prefix it with `VITE_`.

## Developers

- Kamal Mohamed — Provider App (Product A) — [`/provider`](provider/)
- Abheeshu Dhungana — Customer App (Product B) — [`/customer`](customer/)
- Jian Ting Li — Matching Chatbot (Product C) — [`/chat`](chat/)
- Ibtisam Hossain — Trust & Safety Dashboard (Product D) — [`/admin`](admin/)
