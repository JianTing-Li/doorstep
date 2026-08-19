# Doorstep mock data

Four standalone products — Provider App, Customer App, Matching Chatbot, Trust & Safety Dashboard — share this folder as their only data source. Nobody queries a live database; every product imports these JSON files read-only. Records across files link by ID (a booking, its listing, and its provider are three separate records tied together by `*_id` fields), so treat the set as one connected dataset rather than nine independent files.

Run `python3 mock-data/validate.py` after touching anything here — it checks all 95 invariants referenced below and exits non-zero on a break. Don't add a new service type or rename a field without telling the other three people first; a change here silently breaks somebody else's build.

---

## Read-only

These files are read-only input. Copy the data if you need to mutate it; keep any product-specific state — drafts, filters, session data — in your own store, not in these files.

---

## Quickstart

```js
import listings from "./mock-data/listings.json";
import serviceTypes from "./mock-data/service-types.json";
import meta from "./mock-data/_meta.json";

// Products B and C only ever show active listings
const activeListings = listings.filter(l => l.listing_status === "active");

// code -> label, for rendering only — compare on code, never on label
const labelByCode = Object.fromEntries(serviceTypes.map(s => [s.code, s.label]));

// service_type is always an array, even with one value, so filter with .includes()
const plumbingListings = activeListings.filter(l => l.service_type.includes("plumbing"));

// anchor "today" to reference_date, not the system clock
const today = new Date(meta.reference_date);

// writing a booking goes into your own state, never back into bookings.json
const myBookings = [...existingBookings, newBooking];
```

---

## Using this data, by product

Each product only touches a subset of the files, in a pattern shaped by its own screens.

### A — Provider App

- Dashboard: `listings.json` where `provider_id` matches — **all statuses**, not just `active`, so the provider sees their own drafts, paused, and suspended listings
- Bookings list: `bookings.json` filtered the same way, joined back to the listing for context
- Why a listing was suspended: join `reports.json` + `moderation-actions.json` on `listing_id`
- Reviews are read-only here: `reviews.json` filtered by `listing_id`, never written to

### B — Customer App

- Browse: filter `listings.json` to `listing_status: "active"`, group by `service_type` code
- Listing card: join `provider_id` for the provider's name, rating, and location
- Booking: pick an open slot from the listing's `availability`, write it as `scheduled_slot` — in the app's own state, since `bookings.json` is read-only input
- After a booking's `status` reaches `completed`, the customer can leave a review tied to that `booking_id`

### C — Matching Chatbot

- Matches free text against **active listings only**, using `listing_description` and `service_type` — not `title` alone
- `example-queries.json` is the tuning/test set, not live data — includes cases that should ask a clarifying question (`ambiguous`) or return nothing (`no_match`)
- Bookings it produces are written with `source: "chatbot"`
- Conversation state lives in its own session, not in any of these files

### D — Trust & Safety Dashboard

- Queue: `reports.json`, joined to any existing `moderation-actions.json` entries via `report_id` so prior history shows
- Prioritize by `risk_level` on the linked moderation action, or by report count per `listing_id`
- Needs `listings.json` at **every** status, since the point is often deciding whether to change one
- Recording a decision (dismiss/warn/suspend/resolve) is what produces a new `moderation-actions` entry

| Product | Imports |
| --- | --- |
| A — Provider App | `providers`, `listings`, `bookings`, `reviews`, `service-types`, `neighborhoods`, `_meta`; `reports` and `moderation-actions` to show a provider why a listing was suspended |
| B — Customer App | `listings` (active only), `providers`, `service-types`, `neighborhoods`, `reviews`, `bookings`, `customers`, `_meta` |
| C — Matching Chatbot | `listings` (active only), `service-types`, `providers`, `_meta`, `example-queries` as its test set |
| D — Trust & Safety Dashboard | `reports`, `moderation-actions`, `listings` (all statuses), `providers`, `reviews`, `bookings`, `customers`, `_meta` |

---

## Service types

Eight fixed codes, defined in `service-types.json`.

| code | label | Covers |
| --- | --- | --- |
| `cleaning_standard` | Home Cleaning | Regular apartment/house cleaning, kitchens, bathrooms, floors |
| `cleaning_deep` | Deep Cleaning | Move-in/move-out, post-renovation, appliance interiors |
| `handyman_general` | Handyman | Furniture assembly, mounting, patching, doors and locks |
| `plumbing` | Plumbing | Faucets, drains, leaks, toilets, under-sink work |
| `electrical` | Electrical | Outlets, switches, light fixtures, ceiling fans |
| `moving_help` | Moving Help | Loading, unloading, in-building moves, furniture hauling |
| `junk_removal` | Junk Removal | Furniture, boxes, garage and basement clearouts |
| `yard_outdoor` | Yard & Outdoor | Lawn, leaves, gutters, patio and deck cleanup |

---

## How records link

```
neighborhoods.json  (name)
   └─ providers.location, customers.neighborhood, listings.provider_location

providers.json  (prv_*)
   └─ listings.provider_id  └─ bookings.provider_id

customers.json  (cst_*)
   └─ bookings.customer_id  └─ reviews.customer_id  └─ reports.reporter_id

listings.json   (lst_*)
   ├─ provider_id       → providers.json
   ├─ service_type[]    → service-types.json.code
   └─ referenced by     bookings, reviews, reports, moderation-actions, example-queries

bookings.json   (bkg_*)
   ├─ listing_id / customer_id / provider_id
   └─ referenced by     reviews.booking_id, reports.booking_id (nullable)

reports.json    (rpt_*)
   └─ referenced by     moderation-actions.report_id
```

Fields that duplicate a value from elsewhere are guaranteed consistent — you can join or read the copy directly, whichever is easier: `bookings.provider_id` always matches its listing's provider; `reviews.listing_id` and `reviews.customer_id` always match the reviewed booking's; `moderation-actions.listing_id` always matches its report's; `listings.provider_location` always matches the owning provider's `location`.

Three record types look similar but mean different things. A **review** is a public star rating a customer leaves on a completed booking. A **report** is a private complaint with a `reason` code, filed against a listing, that may or may not be tied to a specific booking. A **moderation action** is the audit-log entry recording what staff decided about a report — dismiss, warn, suspend, or resolve.

---

## Field reference

Structural only — record counts and distributions are in [What's in this snapshot](#whats-in-this-snapshot).

### `_meta.json`

Dataset-wide settings every product needs but that don't belong on any one record — what "today" is, what city this is, what currency prices are in. Single object, not an array.

| Field | Type | Notes |
| --- | --- | --- |
| `reference_date` | string (date) | The "today" all other dates are relative to |
| `city` | string | The one city every provider and customer is in |
| `timezone` | string | IANA zone for every datetime. Each datetime carries its own correct offset for its date (`-08:00` before 8 Mar 2026, `-07:00` after) — parse the offset, don't assume one |
| `currency` | string | Currency for every price and commission |
| `commission_rate` | number | Doorstep's cut of each booking |
| `version` | string | Dataset version |
| `generated_at` | string (date) | When the dataset was produced |

### `neighborhoods.json`

The fixed list of neighborhood names used everywhere else in the dataset, each with a center point so distance and radius filtering are computable instead of just decorative text.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | The only spelling allowed anywhere else in the dataset |
| `latitude` | number | Centroid |
| `longitude` | number | Centroid |

### `service-types.json`

The fixed vocabulary of service categories a listing can belong to. `code` is the machine value to filter and match on; `label` is what a human reads — never compare against the label.

| Field | Type | Notes |
| --- | --- | --- |
| `code` | string | Machine value stored in the data |
| `label` | string | Display only, never stored on a listing |
| `description` | string | What the category covers |

### `providers.json`

Who performs the work. One row per provider account, independent of any listing they've posted.

| Field | Type | Notes |
| --- | --- | --- |
| `provider_id` | string | Primary key |
| `name` | string | Person or small business name, fictional |
| `bio` | string | 1–2 sentences, first person |
| `rating` | number or null | Mean of reviews on this provider's listings; null if unreviewed |
| `review_count` | integer | Matches `reviews.json` exactly |
| `location` | string | FK → `neighborhoods.json` |
| `latitude` / `longitude` | number | Neighborhood centroid ± jitter |
| `member_since` | string (date) | Join date |
| `provider_status` | enum | `active` \| `warned` \| `suspended` |

### `customers.json`

Who books the work. One row per customer account, independent of any booking they've made.

| Field | Type | Notes |
| --- | --- | --- |
| `customer_id` | string | Primary key |
| `name` | string | Fictional |
| `neighborhood` | string | FK → `neighborhoods.json` |
| `latitude` / `longitude` | number | Neighborhood centroid ± jitter |
| `signup_date` | string (date) | Always earlier than any booking they made |

### `listings.json`

What's for sale — one row per service a provider offers, at one price, with its own availability. The core record every other file eventually points back to.

| Field | Type | Notes |
| --- | --- | --- |
| `listing_id` | string | Primary key |
| `provider_id` | string | FK → `providers.json` |
| `title` | string | Short headline |
| `listing_description` | string | 2–4 sentences in the provider's voice, naming concrete tasks — the text Product C matches against |
| `service_type` | array of string | One or more codes — always an array, even with one value |
| `price` | number | Whole dollars |
| `price_unit` | enum | `flat` \| `hourly` |
| `duration_estimate_minutes` | integer | An estimate — bookings record the quantity actually billed |
| `provider_location` | string | FK → `neighborhoods.json`; matches the owning provider's `location` |
| `latitude` / `longitude` | number | Use with `service_radius_miles` for distance filtering |
| `service_radius_miles` | number | How far the provider travels |
| `rating` | number or null | Mean of this listing's reviews; null if unreviewed — render an empty state, don't coerce to 0 |
| `review_count` | integer | Reviews on this listing |
| `availability` | array of string | ISO 8601 datetimes, **open slots only** — a slot held by a `pending`/`confirmed` booking has already been removed; a `cancelled` booking releases its slot back |
| `listing_status` | enum | `draft` \| `active` \| `paused` \| `suspended` \| `archived` |

### `bookings.json`

A specific job scheduled between a customer and a listing. This is the transactional record everything downstream (reviews, revenue, chatbot attribution) hangs off of.

| Field | Type | Notes |
| --- | --- | --- |
| `booking_id` | string | Primary key, ordered by `created_at` |
| `listing_id` | string | FK → `listings.json` |
| `customer_id` | string | FK → `customers.json` |
| `provider_id` | string | Matches the listing's provider |
| `scheduled_slot` | string (datetime) | When the job happens |
| `created_at` | string (datetime) | Before `scheduled_slot`, after the customer's `signup_date` |
| `quantity` | number | Hours for hourly listings, always `1` for flat |
| `quantity_unit` | enum | `hours` \| `job` — agrees with the listing's `price_unit` |
| `price_paid` | number | Exactly `listing.price × quantity` |
| `commission_amount` | number | `price_paid` × `commission_rate`, rounded to 2 decimals |
| `status` | enum | `pending` \| `confirmed` \| `completed` \| `cancelled` |
| `job_address` | string | Fictional Portland address |
| `source` | enum | `customer_app` \| `chatbot` |

### `reviews.json`

The public star rating and comment a customer leaves after a completed booking. Customer-facing, always tied to one specific booking.

| Field | Type | Notes |
| --- | --- | --- |
| `review_id` | string | Primary key, ordered by `created_at` |
| `booking_id` | string | FK → `bookings.json`, always a `completed` booking, and unique — one review per booking |
| `listing_id` | string | Matches the booking's `listing_id` |
| `customer_id` | string | Matches the booking's `customer_id` |
| `rating` | integer | 1–5 |
| `text` | string | 1–3 sentences, specific |
| `created_at` | string (datetime) | After the booking's `scheduled_slot`, never after `reference_date` |

### `reports.json`

The customer-facing complaint queue — one row per issue a customer flags against a listing, before any staff decision has been made.

| Field | Type | Notes |
| --- | --- | --- |
| `report_id` | string | Primary key |
| `listing_id` | string | FK → `listings.json` |
| `booking_id` | string or null | When set, a booking on that listing by the reporter |
| `reporter_id` | string | FK → `customers.json` |
| `reason` | enum | `no_show` \| `quality` \| `pricing` \| `safety` \| `misleading_listing` \| `conduct` |
| `description` | string | 2–3 sentences from the customer |
| `evidence_url` | string or null | Attachment the customer supplied, or null if none |
| `created_at` | string (datetime) | After the cited booking, if any |
| `status` | enum | `open` \| `under_review` \| `resolved` \| `dismissed` |

### `moderation-actions.json`

The staff-facing audit log — one row per decision Trust & Safety made about a report. This is what happened *in response to* a report, not the complaint itself.

| Field | Type | Notes |
| --- | --- | --- |
| `action_id` | string | Primary key |
| `report_id` | string | FK → `reports.json` |
| `listing_id` | string | Matches the report's `listing_id` |
| `admin_name` | string | Fictional staff member |
| `action` | enum | `dismiss` \| `warn` \| `suspend` \| `resolve` |
| `risk_level` | enum | `low` \| `medium` \| `high` \| `critical` — sort the queue by this |
| `reason` | string | 1–2 sentences justifying the decision |
| `created_at` | string (datetime) | After the report's `created_at` |

### `example-queries.json`

Test fixtures for Product C. Not marketplace data — nothing else references them.

| Field | Type | Notes |
| --- | --- | --- |
| `query_id` | string | Primary key |
| `query` | string | What a customer would actually type — deliberately colloquial |
| `expected_codes` | array of string | Codes a correct match should land on; empty for `no_match` |
| `expected_listing_ids` | array of string | Listings a correct match should return, always `active`; empty for `ambiguous` and `no_match` |
| `match_type` | enum | `single_code` \| `multi_code` \| `ambiguous` \| `no_match` |
| `notes` | string | Why this is the expected answer |

The `multi_code` cases are the ones that justify `service_type` being an array. The `ambiguous` cases must **not** match — the correct behavior is a clarifying question. The `no_match` case names a service outside the vocabulary; the right answer is to say so.

---

## What this dataset does not model

Deliberate omissions, called out so four people building in parallel don't each invent their own answer:

- **One city only.** No region, state, or multi-city fields — every provider and customer is in the same place (`_meta.city`). Don't add location scoping without a team conversation.
- **No authentication.** No passwords, sessions, tokens, or login state. `provider_id` / `customer_id` are stable identifiers for joining data, not credentials — don't treat them as one.
- **No photos or media.** Listings and providers have no image URLs. If your product needs to show a picture, that's a placeholder or local asset, not a data field.
- **No payment details.** `bookings.price_paid` and `commission_amount` are the settled amounts; there's no card, payment method, or transaction ID. Checkout flows are out of scope for this dataset.
- **No messaging.** Nothing here models a chat or message thread between a customer and a provider — the Matching Chatbot's conversation is its own session state (see [Using this data, by product](#using-this-data-by-product)), not a stored thread.

If your product genuinely needs one of these, it's local state you own in your own app — see [Read-only](#read-only). Don't add a field to these files to cover it without telling the other three people first.

---

## What's in this snapshot

Facts about this version of the data, not schema rules — these numbers will drift as the dataset grows.

| | |
| --- | --- |
| Listing status | 32 active, 3 paused, 3 suspended, 1 draft, 1 archived (of 40) |
| Multi-code listings | 11 of 40 carry two `service_type` codes |
| Price unit | 25 flat, 15 hourly; price range $40–$400 |
| Booking status | 60 completed, 12 confirmed, 10 pending, 8 cancelled (of 90) |
| Booking source | 54 customer_app, 36 chatbot |
| Review ratings | 29 five-star, 12 four-star, 1 three-star, 6 two-star, 4 one-star (of 52) |
| Report status | 6 resolved, 2 open, 2 under_review, 2 dismissed (of 12) |
| Moderation actions | 3 suspend, 2 resolve, 2 dismiss, 1 warn (of 8) |

Planted Trust & Safety cases:

- `lst_008` carries **3 reports** — the top of the queue by report count, and still `active`.
- `lst_010`, `lst_036`, and `lst_023` are `suspended`, each with a matching `suspend` moderation action.
- `rpt_009` (on `lst_027`) and `rpt_010` (on `lst_022`) were investigated and **dismissed** — examples of the queue clearing without a penalty.

Cross-product behavior here is illustrated, not live: these files are a static snapshot, so a Trust & Safety action taken at runtime in Product D (suspending a listing, say) does not propagate to what Product C reads — both are reading the same file as it exists on disk right now, not a shared live store.
