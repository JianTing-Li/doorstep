# Doorstep Matching Chatbot (Product C)

Describe a household job in plain language and the chatbot turns it into a compact
service request, ranks active Portland listings, explains why each one fits, and lets
the customer choose a preferred time in the thread.

This is a frontend marketplace proof of concept. Providers, listings, reviews,
availability, and bookings are synthetic. Choosing a time prepares an in-session
request; the UI explicitly explains that a provider would confirm next in a live
marketplace.

## Customer marketplace flow

1. The customer describes the problem in their own words.
2. Doorstep extracts service types and any stated budget, job area, or timing.
3. A visible service-request summary preserves the original description and exposes
   the structured interpretation for correction.
4. Active listings are filtered and ranked against the request.
5. Collapsed cards make the next opening visible immediately. Expanded cards also
   show match reasons, honest price minimums, provider background, service area,
   ratings, and a review from a completed mock booking.
6. Choosing a time prepares the request in session. The original job description
   stays attached so the eventual provider handoff would be actionable.

Customers can also compare visible listings, ask for more detail, change filters,
cancel a prepared request, or reschedule it. Multi-service jobs prefer one qualified
listing when possible and otherwise continue with the still-uncovered service. When
the customer marks a request done, its unselected cards become inactive and the
one-shot action becomes a calm completed state with an explicit reopen option.
Asking to show all bookings reveals the active request cards with a staggered entrance;
each history card remains synchronized and supports cancellation and rescheduling.
When cancellation is ambiguous, the conversation remembers the offered choices so a
follow-up such as `both`, `the yard one`, `first`, or `never mind` resolves in context.

## How intake works

`parseJob` reads the message with keywords first; it is right 17 times out of 18
when it lands on a single service type. When it finds **no** codes or **two or
more** — the shapes it gets wrong — `getFilters` escalates to Gemini through
`api/chat.js`. Returned codes, intents, and neighborhoods are validated against the
real mock-data vocabulary. Any failure, non-200 response, or 5-second timeout falls
back to the keyword interpretation with hedged customer-facing copy.

This inverts the original brief ("LLM first"): the free tier allows 20 requests per
day per model, so calling it for every message would cap the app at 20 messages.
Escalating only unreliable reads sends roughly 28% of messages to the model while
keeping the deterministic path fast.

Unsupported home services such as painting are distinct from off-topic messages.
Ambiguous requests can show all plausible service options instead of forcing the
customer to restart.

## How matching works

`matchListings` applies marketplace constraints before ranking:

- only active listings are eligible;
- a budget is compared with the true minimum spend, including minimum billable hours;
- a job neighborhood is checked against listing coordinates and service radius;
- `today`, `tomorrow`, `urgent`, and `this week` require compatible open slots;
- requested service types must overlap the listing;
- category coverage ranks first, then the customer's job wording is compared with
  listing titles and descriptions, and rating breaks the remaining tie.

When timing or budget removes every exact match, the chatbot explains the failed
constraint before showing same-service alternatives. It never replaces a failed
search with unrelated highly rated listings.

The 22 supported examples in `mock-data/example-queries.json` are also used as a
ranking regression set. With their expected service codes supplied, the current
deterministic ranker puts an expected listing first for all 22.

## Setup and running

```bash
cp .env.example .env.local     # add a key from https://aistudio.google.com
npm install && npm run dev
```

One server: landing page at `/`, chatbot at `/chat/`, and `/api/chat` running the
Gemini function in-process — `vercel dev` is **not** required. Without a key the
app still runs; every message uses the keyword path.

Tests: `node src/lib/__tests__/matching.test.js`
(add `CHAT_API_BASE=http://localhost:5199` to include the live LLM path).

## The key

`GEMINI_API_KEY` is read server-side only, in `api/chat.js`. Never commit `.env.local`,
and never rename it to a `VITE_` prefix — Vite inlines those into the client bundle,
publishing the key to anyone who opens devtools.

## Data

Reads `listings`, `providers`, `reviews`, `service-types`, `neighborhoods`, `_meta`,
and `example-queries` from `/mock-data` through `src/data/`. It writes nothing to the
shared dataset. Prepared requests live in conversation state and disappear on reload.
