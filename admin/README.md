# Product D — Trust & Safety Dashboard

This folder contains Ibtisam Hossain's Product D build for Doorstep. It is intentionally isolated from Products A, B, and C.

## Core workflow

1. Load the repository's shared files from `../mock-data/`.
2. Prioritize unresolved reports by risk level, repeated reports on a listing, then report age.
3. Join the selected report to its listing, provider, booking, customer, reviews, and prior moderation actions.
4. Require a human teammate to enter a reason and choose `dismiss`, `warn`, `suspend`, or `resolve`.
5. Add an audit entry. A suspension changes the demo listing status to `suspended`, which means Products B and C must hide it.

The GitHub JSON files remain read-only. New demo decisions are stored in browser-local state so the source fixtures are never overwritten.

The interface uses Doorstep's shared blue product color and the same listing and moderation terminology as the Provider, Customer, and Chat products. Demo audit timestamps are anchored to the shared `_meta.reference_date` rather than the viewer's system clock.

## Run locally

From the repository root:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/admin/`.

## Verify

```bash
python3 mock-data/validate.py
node admin/test.mjs
```

No external API, invented fixture, or teammate product branch is used by Product D.
