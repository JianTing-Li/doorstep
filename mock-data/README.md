# Doorstep mock data

This folder is the single shared dataset behind all four Doorstep products. Product A (Provider App), Product B (Customer App), Product C (Matching Chatbot) and Product D (Trust & Safety Dashboard) are being built separately by four people, and none of them talks to a live database. Instead every product imports these JSON files read-only and treats them as the source of truth for providers, listings, bookings, reviews and moderation history. The records are interlinked by ID, so a booking you see in the Provider App is the same booking the Customer App shows and the same one a Trust & Safety report points at. That only holds as long as the files stay in sync, which is why nobody edits them in isolation — see [Rules of the road](#rules-of-the-road).

All files are JSON arrays of objects, except `_meta.json` which is a single object. Two-space indent, UTF-8, no comments.

**Everything is dated relative to `reference_date` = `2026-08-19`.** Treat that as "today" rather than the real clock, otherwise every availability slot will look like it is in the past.

Run `python3 mock-data/validate.py` after touching anything here. It checks all 95 invariants below and exits non-zero on a break.

---

## Files at a glance

| File | Records | IDs |
| --- | --- | --- |
| `_meta.json` | 1 object | — |
| `neighborhoods.json` | 15 | name strings |
| `service-types.json` | 8 | slug strings |
| `providers.json` | 15 | `prv_001`–`prv_015` |
| `customers.json` | 20 | `cst_001`–`cst_020` |
| `listings.json` | 40 | `lst_001`–`lst_040` |
| `bookings.json` | 90 | `bkg_001`–`bkg_090` |
| `reviews.json` | 52 | `rev_001`–`rev_052` |
| `reports.json` | 12 | `rpt_001`–`rpt_012` |
| `moderation-actions.json` | 8 | `mod_001`–`mod_008` |
| `example-queries.json` | 22 | `qry_001`–`qry_022` |
| `validate.py` | — | integrity checks, not data |

---

## Service type vocabulary

Eight slugs, defined in `service-types.json`. This list is fixed.

| slug | label | Covers |
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

## Field reference

### `_meta.json`

Single object, not an array.

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `reference_date` | string (date) | The "today" all other dates are relative to | `2026-08-19` |
| `city` | string | The one city every provider and customer is in | `Portland, Oregon` |
| `timezone` | string | IANA zone for every datetime in the dataset | `America/Los_Angeles`. Each datetime carries its own correct offset: `-08:00` before 8 Mar 2026, `-07:00` after. Parse the offset, don't assume one |
| `currency` | string | Currency for every price and commission | `USD`, whole dollars |
| `commission_rate` | number | Doorstep's cut of each booking | `0.15` |
| `version` | string | Dataset version | `1.0.0` |
| `generated_at` | string (date) | When the dataset was produced | `2026-08-19` |

### `neighborhoods.json`

The neighborhood vocabulary plus a centroid for each, so distance and radius filtering are actually computable.

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `name` | string | Neighborhood name | The only spelling allowed anywhere in the dataset |
| `latitude` | number | Centroid latitude | ~45.46–45.59 |
| `longitude` | number | Centroid longitude | ~-122.76 to -122.57 |

### `service-types.json`

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `slug` | string | Machine value stored in the data | One of the eight above |
| `label` | string | Human label | Display only, never stored on a listing |
| `description` | string | What the category covers | Useful as chatbot matching context |

### `providers.json`

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `provider_id` | string | Primary key | `prv_001`–`prv_015` |
| `name` | string | Person or small business name | Fictional |
| `bio` | string | 1–2 sentences, first person | — |
| `rating` | number or **null** | Mean of all reviews on this provider's listings | 1.0–5.0, one decimal. `null` only if unreviewed; every provider currently has 2–6 reviews |
| `review_count` | integer | Reviews across this provider's listings | Matches `reviews.json` exactly |
| `location` | string | Neighborhood | FK → `neighborhoods.json` |
| `latitude` / `longitude` | number | Provider's base point | Neighborhood centroid ± jitter |
| `member_since` | string (date) | Join date | `YYYY-MM-DD`, within 3 years before `reference_date` |
| `provider_status` | enum | Account standing | `active` \| `warned` \| `suspended` |

### `customers.json`

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `customer_id` | string | Primary key | `cst_001`–`cst_020` |
| `name` | string | Customer name | Fictional |
| `neighborhood` | string | Where they live | FK → `neighborhoods.json` |
| `latitude` / `longitude` | number | Home point | Neighborhood centroid ± jitter |
| `signup_date` | string (date) | Account creation | Always earlier than any booking they made |

### `listings.json`

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `listing_id` | string | Primary key | `lst_001`–`lst_040` |
| `provider_id` | string | Owning provider | FK → `providers.json` |
| `title` | string | Short listing headline | — |
| `listing_description` | string | 2–4 sentences in the provider's voice, naming concrete tasks | This is the text Product C matches against |
| `service_type` | array of string | One or more slugs | **Always an array, even with one value.** 11 listings carry 2 slugs |
| `price` | number | Whole dollars | Range 40–400 |
| `price_unit` | enum | How `price` is charged | `flat` \| `hourly` (25 flat, 15 hourly) |
| `duration_estimate_minutes` | integer | Expected job length | An estimate — bookings record the hours actually billed |
| `provider_location` | string | Neighborhood | FK → `neighborhoods.json`; always equals the owning provider's `location` |
| `latitude` / `longitude` | number | Where the listing is based | Use with `service_radius_miles` for distance filtering |
| `service_radius_miles` | number | How far they travel | 6–25 |
| `rating` | number or **null** | Mean of this listing's reviews | `null` for the 5 active listings with no reviews yet — render an empty state, don't show 0 |
| `review_count` | integer | Reviews on this listing | 0–3 |
| `availability` | array of string | 3–8 ISO 8601 datetimes, **open slots only** | All after `reference_date` and within 60 days. Booked slots are already removed — see rule 4 |
| `listing_status` | enum | Visibility | `draft` \| `active` \| `paused` \| `suspended` \| `archived` (32/3/3/1/1) |

### `bookings.json`

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `booking_id` | string | Primary key | `bkg_001`–`bkg_090`, ordered by `created_at` |
| `listing_id` | string | Booked listing | FK → `listings.json` |
| `customer_id` | string | Who booked | FK → `customers.json` |
| `provider_id` | string | Who performs it | Always equals the listing's `provider_id` |
| `scheduled_slot` | string (datetime) | When the job happens | ISO 8601 |
| `created_at` | string (datetime) | When it was booked | Before `scheduled_slot`, and after the customer's `signup_date` |
| `quantity` | number | Units billed | Hours for hourly listings, always `1` for flat |
| `quantity_unit` | enum | What `quantity` counts | `hours` \| `job`. Agrees with the listing's `price_unit` |
| `price_paid` | number | Amount charged | Exactly `listing.price × quantity` — no hidden arithmetic |
| `commission_amount` | number | Doorstep's cut | `price_paid` × 0.15, rounded to 2 decimals |
| `status` | enum | Booking state | `pending` \| `confirmed` \| `completed` \| `cancelled` (10/12/60/8) |
| `job_address` | string | Street address | Fictional Portland addresses |
| `source` | enum | Which product produced the booking | `customer_app` \| `chatbot` (54/36) |

### `reviews.json`

**One review per booking.** `booking_id` is unique in this file.

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `review_id` | string | Primary key | `rev_001`–`rev_052`, ordered by `created_at` |
| `booking_id` | string | Booking being reviewed | FK → `bookings.json`; always a `completed` booking; unique |
| `listing_id` | string | Reviewed listing | Always equals that booking's `listing_id` |
| `customer_id` | string | Reviewer | Always equals that booking's `customer_id` |
| `rating` | integer | Star rating | 1–5. Distribution: 29 fives, 12 fours, 1 three, 6 twos, 4 ones |
| `text` | string | 1–3 sentences, specific | Every text is unique |
| `created_at` | string (datetime) | When written | After the booking's `scheduled_slot`, never after `reference_date` |

52 reviews against 60 completed bookings — the 8 unreviewed ones are deliberate, because not every customer leaves a review.

### `reports.json`

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `report_id` | string | Primary key | `rpt_001`–`rpt_012` |
| `listing_id` | string | Reported listing | FK → `listings.json` |
| `booking_id` | string or **null** | Related booking, if any | Nullable — 2 of 12. When set, it is a booking on that listing by the reporter |
| `reporter_id` | string | Reporting customer | FK → `customers.json` |
| `reason` | enum | Report category | `no_show` \| `quality` \| `pricing` \| `safety` \| `misleading_listing` \| `conduct` |
| `description` | string | 2–3 sentences from the customer | — |
| `evidence_url` | string or **null** | Attachment the customer supplied | `https://evidence.doorstep.example/…`, or `null` when they filed nothing |
| `created_at` | string (datetime) | When filed | Within 45 days before `reference_date`, and after the cited booking |
| `status` | enum | Triage state | `open` \| `under_review` \| `resolved` \| `dismissed` (2/2/6/2) |

### `moderation-actions.json`

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `action_id` | string | Primary key | `mod_001`–`mod_008` |
| `report_id` | string | Report acted on | FK → `reports.json` |
| `listing_id` | string | Affected listing | Always equals that report's `listing_id` |
| `admin_name` | string | Staff member | Fictional internal names |
| `action` | enum | Decision taken | `dismiss` \| `warn` \| `suspend` \| `resolve` (2/1/3/2) |
| `risk_level` | enum | Severity assigned at triage | `low` \| `medium` \| `high` \| `critical` — use this to sort the queue |
| `reason` | string | 1–2 sentences justifying it | — |
| `created_at` | string (datetime) | When decided | Always after the report's `created_at` |

### `example-queries.json`

Test fixtures for Product C. Not marketplace data — nothing else references them.

| Field | Type | Description | Notes |
| --- | --- | --- | --- |
| `query_id` | string | Primary key | `qry_001`–`qry_022` |
| `query` | string | What a customer would actually type | Deliberately colloquial; several name no service at all |
| `expected_slugs` | array of string | Slugs a correct match should land on | Empty for `no_match` |
| `expected_listing_ids` | array of string | Listings a correct match should return | Always `active`. Empty for `ambiguous` and `no_match` |
| `match_type` | enum | What the fixture is testing | `single_slug` \| `multi_slug` \| `ambiguous` \| `no_match` (16/3/2/1) |
| `notes` | string | Why this is the expected answer | Read this before "fixing" a failing case |

The three `multi_slug` cases are the ones that justify `service_type` being an array. The two `ambiguous` cases must **not** match — the correct behaviour is to ask a clarifying question. The `no_match` case asks for exterior painting, which is not in the vocabulary; the right answer is to say so, not to reach for the handyman listings.

---

## Relationship map

```
neighborhoods.json  (name)
   └─ providers.json.location
   └─ customers.json.neighborhood
   └─ listings.json.provider_location

providers.json  (prv_*)
   └─ listings.json.provider_id
   └─ bookings.json.provider_id          (mirrors the listing's provider)

customers.json  (cst_*)
   └─ bookings.json.customer_id
   └─ reviews.json.customer_id           (mirrors the booking's customer)
   └─ reports.json.reporter_id           (mirrors the cited booking's customer)

listings.json   (lst_*)
   ├─ .provider_id       → providers.json
   ├─ .service_type[]    → service-types.json.slug
   └─ referenced by      bookings.json.listing_id
                         reviews.json.listing_id
                         reports.json.listing_id
                         moderation-actions.json.listing_id
                         example-queries.json.expected_listing_ids

bookings.json   (bkg_*)
   ├─ .listing_id        → listings.json
   ├─ .customer_id       → customers.json
   ├─ .provider_id       → providers.json
   └─ referenced by      reviews.json.booking_id   (completed only, unique)
                         reports.json.booking_id   (nullable)

reports.json    (rpt_*)
   └─ referenced by      moderation-actions.json.report_id
```

Denormalised mirrors you can rely on: `bookings.provider_id` = the listing's provider; `reviews.listing_id` / `reviews.customer_id` = the booking's; `moderation-actions.listing_id` = the report's; `listings.provider_location` = the provider's `location`. All consistent, so join or short-circuit, whichever is easier.

---

## Rules of the road

1. **`service_type` is always an array.** Even single-category listings use `["plumbing"]`. Never read it as a string.
2. **The slug lives in the data; the label is for UI only.** Filter, match and store on `slug`. Look `label` up from `service-types.json` when you render. Never compare against a label.
3. **Products B and C display only `listing_status: "active"`.** `draft`, `paused`, `suspended` and `archived` listings exist so the Provider App and the Trust & Safety Dashboard have something to show — they must not appear in customer browse, search or chatbot matches. Product A shows the owning provider all of their own statuses; Product D shows everything.
4. **`availability` is open slots only.** A slot taken by a `pending` or `confirmed` booking has already been removed, so you can render the array directly without subtracting bookings. A `cancelled` booking releases its slot, so it stays listed. If a product ever writes a booking, it must remove the slot too.
5. **`rating` can be `null`.** Five active listings have no reviews yet. Render an empty state — do not coerce `null` to `0`, which would sort them below one-star listings.
6. **Coordinates are neighborhood centroids with a little jitter, not real addresses.** They are precise enough for radius filtering and sorting by distance, and meaningless below about a quarter mile. `job_address` is fictional and is not geocoded.
7. **Nobody edits these files, and nobody adds a slug, without telling the team first.** Four products read the same IDs. A renamed field, a deleted listing or a ninth slug silently breaks somebody else's build. Raise it, change it once, and everyone re-pulls together. Run `validate.py` before you commit.
8. **Read-only in code.** Import and copy; do not mutate the imported objects in place. If a product needs its own state (a draft booking, a filter), keep it in that product's own store.
9. **`_meta.reference_date` is "today".** Do not use the system clock for anything date-relative, or availability and booking history will look wrong.

---

## Who reads what

| Product | Reads |
| --- | --- |
| **A — Provider App** | `providers`, `listings`, `bookings`, `reviews`, `service-types`, `neighborhoods`, `_meta`. Also `reports` and `moderation-actions` if you show a provider why a listing was suspended. |
| **B — Customer App** | `listings` (active only), `providers`, `service-types`, `neighborhoods`, `reviews`, `bookings`, `customers`, `_meta`. |
| **C — Matching Chatbot** | `listings` (active only) — `listing_description` and `service_type` are the matching surface — plus `service-types`, `providers`, `_meta`, and `example-queries` as its test set. Writes bookings with `source: "chatbot"`. |
| **D — Trust & Safety Dashboard** | `reports`, `moderation-actions`, `listings` (all statuses), `providers`, `reviews`, `bookings`, `customers`, `_meta`. |

### What Product D is meant to surface

- `lst_008` (Nell Sandoval, still **active**) has **3 reports** — one resolved with a warning, one open, one under review — plus three 1–2 star reviews. It is the unambiguous top of the queue and the only listing with three reports.
- `lst_010` and `lst_036` (both QuickFix Home Services, `prv_013`) are suspended with two reports each and a `suspend` action apiece. The provider account is `suspended`.
- `lst_023` (Amara Oyelaran, `prv_014`) is suspended over a billing dispute, logged at `risk_level: "critical"`. The provider account is only `warned`, because their other listing is fine.
- `rpt_009` on `lst_027` and `rpt_010` on `lst_022` were investigated and **dismissed** — examples of the queue clearing without a penalty.
- Sort by `risk_level` on the moderation action, or by open report count per listing, and the same handful of listings should rise to the top.
