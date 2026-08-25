# Doorstep — Customer App (Product B)

This folder contains Abheeshu Dhungana's Product B design, ported to React 19 for Doorstep (Phase 5).

**His original vanilla build lives in [`legacy/`](legacy/)**, kept in the same history rather than deleted —
`app.js`, `data.js`, `index.html`, and `chatbot-engine.js` are exactly as he wrote them (moved with `git mv`,
so `git blame` still shows him as the author). The React port in `src/` is built one-to-one against a feature
parity checklist written from those files — every screen, every filter, his map-background browse concept,
his card layout, his copy — documented in full at the repo root in `INTEGRATION-NOTES.md` under "Phase 5."

One feature did not carry forward as-is: his own floating AI-matcher chatbot (`legacy/chatbot-engine.js`) is
disconnected — a floating chat bubble is outside the shared architecture's design (chat lives as the **Ask**
tab, not a popup), and Product C's chatbot takes over that role in Phase 6. His parser and matching logic are
untouched in `legacy/`, not deleted.

A two-sided local marketplace for home services. It connects independent home-service providers like cleaners, handymen, and movers with customers in the same city. Doorstep does not employ providers. It takes a percentage of each booking made through the platform.

## Products

Doorstep combines four product contributions into three user-facing applications:

### Provider App (Product A)

Providers create listings describing a specific service, set a price, and manage incoming bookings.

### Customer App (Product B)

Customers browse and filter active listings by service type, price, and availability, and book directly.

### Matching Chatbot (Product C, Customer Ask tab)

Customers describe a job in their own words and get matched to current active listings that best fit jobs that do not map cleanly onto one service type.

### Trust & Safety Dashboard (Product D)

The internal team reviews listings and bookings with reports or low reviews, prioritizes risky cases, records a human moderation decision, and writes an audit entry. Suspended listings are excluded from Products B and C.

## Shared Data Architecture

Customer reads canonical data through `src/data/loadData.js` and writes booking lifecycle changes, reviews,
and safety reports through `shared/demo-store.js`. Provider-message threads and Customer's display-oriented
per-persona state remain local to this app; canonical marketplace records do not.

## Developers

- Kamal Mohamed — Provider App (Product A)
- Abheeshu Dhungana — Customer App (Product B)
- Jian Ting Li — Matching Chatbot (Product C)
- Ibtisam Hossain — Trust & Safety Dashboard (Product D)
