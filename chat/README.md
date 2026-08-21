# Doorstep Matching Chatbot (Product C)

Describe a household job in plain language and the chatbot ranks active Portland
listings against it, then books one in the thread — details, open slots, confirmation.

## How matching works

`parseJob` reads the message with keywords first; it is right 17 times out of 18
when it lands on a single service type. When it finds **no** codes or **two or
more** — the shapes it gets wrong — `getFilters` escalates to Gemini via
`api/chat.js`. Returned codes and neighborhoods are validated against the real data,
and any failure, non-200, or 5s timeout falls back to the keyword result, hedged.

This inverts the original brief ("LLM first"): the free tier allows 20 requests per
day per model, so calling it every message capped the app at 20 messages. Escalating
only unreliable reads sends ~28% to the model and still fixes 4 of parseJob's 5 misses.

## Setup and running

```bash
cp .env.example .env.local     # add a key from https://aistudio.google.com
npm install && npm run dev
```

One server: landing page at `/`, chatbot at `/chat/`, and `/api/chat` running the
Gemini function in-process — `vercel dev` is **not** required. Without a key the
app still runs; every message uses the keyword path.

Tests: `node src/lib/__tests__/matching.test.js`
(add `CHAT_API_BASE=http://localhost:5199` to include the LLM path).

## The key

`GEMINI_API_KEY` is read server-side only, in `api/chat.js`. Never commit `.env.local`,
and never rename it to a `VITE_` prefix — Vite inlines those into the client bundle,
publishing the key to anyone who opens devtools.

## Data

Reads `listings`, `providers`, `service-types`, `neighborhoods`, `_meta`, and
`example-queries` from `/mock-data` through `src/data/`. Writes nothing — bookings
live in conversation state and disappear on reload.
