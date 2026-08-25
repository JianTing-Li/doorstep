# Doorstep — Integration Notes

Working record for the four-product merge. Appended to as each phase lands.

Phase 0 recorded at commit `293e3a7`, branch `feature/jt-unified-app`.

---

## Phase 0 — Findings

### 0.1 Source inventory

| Product | Source | Commit | Stack | Build | Reads mock-data via |
|---|---|---|---|---|---|
| A — Provider | `producta` @ JianTing-Li/doorstep | `059adf8` | React 18.3.1, Vite 5.4.2 | yes | build-time import, `../../mock-data/*.json` |
| B — Customer | `product-b` @ JianTing-Li/doorstep | `3c32d23` | vanilla JS, Tailwind + Font Awesome CDN | none | runtime `fetch` to a **deleted** GitHub branch |
| C — Chat | local working tree | `293e3a7` | React 19.2.8, Vite 8.2.2 | yes | build-time import w/ import attributes, `../../../mock-data/*.json` |
| D — Admin | `codex/product-d-trust-safety-dashboard` | `cdc99b1` | vanilla ES modules | none | runtime `fetch`, `DATA_ROOT = "../mock-data"` |

Cloned read-only into a scratch directory outside the working tree. Nothing was checked out over the tree.

### 0.2 Corrections to the known findings

Each stated finding was checked against source. Five need correcting.

1. **`mock-data/` is not a superset.** This is the most consequential correction. Local `mock-data/` is
   **byte-identical** to Product D's copy, and identical to Product A's in every file except a single
   trailing space at the end of `_meta.json`. Same file count (13), same contents. The "more files, more
   complete data" premise is wrong. Product B carries no `mock-data/` at all.
   *This does not change the rule* — local still wins, nothing gets merged in — but the compatibility risk
   Phase 1 was budgeting for is not there. There are no data deltas to reconcile.
2. **`kamalunified` and `producta` are the same commit** — confirmed, both `059adf8`. Ignoring as instructed.
3. **`feature/mock-data` is genuinely gone from the remote**, confirmed by `git ls-remote`. B's fetch URL is
   dead. A stale remote-tracking ref for it still exists locally, which is why it may still look alive in
   `git branch -a`.
4. **Product A's "TaskLocal" branding is not confined to `index.html`.** It also appears inside Kamal's
   `ProviderDashboard.jsx` — the `TL` brand mark and `<strong>TaskLocal</strong>` in the topbar — and twice in
   his **body copy**: "…and TaskLocal will build a clear, bookable listing" and "TaskLocal uses only your
   selections to build the service—nothing is invented." See **Decision needed D-1**.
5. **Product A's committed `node_modules` is functional** — vite 5.4.21 runs straight from it with no install.
   Still being purged in Phase 1 as instructed; noted only because it made the baseline capture trivial.

Everything else in the known findings verified as stated: the scaffold, `vercel.json`, the root `api/chat.js`
re-export, the empty placeholders, C's single data access point, A's 2,240 committed `node_modules` files and
absent `.gitignore`, D's already-correct shape.

### 0.3 `.gitignore` audit (root)

Root `.gitignore` is `node_modules`, `dist`, `.DS_Store`, `.vercel`.

- covers `node_modules/` — yes
- covers `dist/` — yes
- covers `.env.local` / `.env*.local` — **NO**

Not fixed, per instructions. `chat/.gitignore` does cover `.env.local`, which is why the real key has stayed
out of history — but that protection is per-folder, and a `.env.local` created at repo root or in
`provider/` would currently be tracked. `admin/`, `customer/`, and `provider/` placeholder `.gitignore`s each
cover `.env.local` already. **Recommend adding `.env*.local` to root before Phase 1 writes anything.**

### 0.4 Secret audit

Clean. No secret in the working tree or in git history.

- `.env.local` is untracked and has never been added on any branch. Only `chat/.env.example` is committed,
  with an empty placeholder.
- `GEMINI_API_KEY` is confirmed present and non-empty (checked for non-emptiness only; never displayed).
- Read server-side only, at `chat/api/chat.js:179` and `:208`, via `process.env`. No occurrence anywhere in
  `chat/src/`.
- Every `VITE_` string in the repo is a warning comment in docs or config, never an actual variable.
- No key material in `dist/` or `chat/dist/`.

### 0.5 Tests — baseline before any change

| Suite | How to run | Baseline result |
|---|---|---|
| C — matching | `cd chat && node src/lib/__tests__/matching.test.js` | booking **49/49**; parseJob **20/25 (80%)**; LLM path skipped; **exit 0** |
| C — UI | `cd chat && npm run dev`, then `node src/lib/__tests__/ui.test.mjs` | needs a dev server + Playwright; self-skips without one |
| D — logic | `node admin/test.mjs` from repo root | **passes** against local `mock-data/` as well as its own copy |
| data | `python3 mock-data/validate.py` | not yet run — Phase 1 |

Two things worth flagging:

- **`matching.test.js` exits 0 even with 5 parseJob failures.** It is a reporting script, not a pass/fail
  gate. "Tests still pass" therefore cannot mean exit code alone. I am treating **49/49 and 20/25** as the
  numbers to hold, and will report both figures at every gate.
- The 5 parseJob failures are pre-existing on the hardcoded-parse path (`qry_003, 004, 019, 020, 021` —
  multi-service and vague queries the LLM path is meant to catch). Not caused by anything in this merge.
- **D's `test.mjs` asserts hard counts** against mock-data (12 reports, 3 on `lst_008`, a 4-case queue,
  `rpt_002` leading). It passes on local data — but it is now a tripwire on `mock-data/`, worth knowing before
  anyone touches that folder.

### 0.6 Committed that shouldn't be

- **A**: 2,240 `node_modules/` files, a built `dist/` (3 files), no `.gitignore`. Purged in Phase 1.
- **A**: ships its own `mock-data/` copy. Discarded in Phase 1.
- **D**: ships its own `mock-data/` copy, plus `chat/` `customer/` `provider/` placeholders that duplicate the
  local ones. Discarded in Phase 1.
- **B**: clean — 4 files, nothing stray.
- Nothing sensitive committed in any source.

### 0.7 Per-product detail

**A — Provider (Kamal Mohamed).** All files at repo root, so `index.html`, `src/`, `vite.config.js`, and
`package.json` collide with C's root files — hence the move to `provider/` as a self-contained package.
Single screen: `ProviderDashboard` composing `ListingForm` + listings summary + incoming bookings + past
bookings. Data via `src/hooks/useProviderData.js`, hardcoded to `ACTIVE_PROVIDER_ID = "prv_001"` (Marisol
Vega). Already holds writes in React state (`createListing`, `updateBookingStatus`) — those are the two call
sites Phase 3 redirects. `vite.config.js` sets no `base`; Phase 1 adds `/provider/`. 1,633 lines of CSS in
`src/index.css`; warm cream + dark-green palette, furthest of the four from C's.

**B — Customer (Abheeshu Dhungana).** 371-line `app.js`, 19-line `data.js`, 93-line `index.html`. Five views
behind one `navigate()` switch: `dashboard` → `feed` → `profile` → `checkout` → `confirmation`. Groups the 8
canonical service codes into his own 3 categories (Cleaning / Handyman / Moving) via `categoryMap`. See
**0.8** for what does and does not survive the port.

**C — Chat (Jian Ting Li).** Verified: `chat/src/data/loadData.js` is the sole importer of `/mock-data`;
`chat/src/data/listings.js` is a selector layer over it, not a second access point. That property holds and
will be preserved. `chat/vite.config.js` carries two dev-only plugins — one serving the root landing page at
`/`, one running the serverless handler in-process so `/api/chat` works under `npm run dev`. Dark theme is
the default (`:root`), light is opt-in via `[data-theme="light"]`.

**D — Admin (Ibtisam Hossain).** Already at `admin/` in its own branch, already fetching `../mock-data` —
drops in as-is. 441-line `app.mjs`, 58-line `logic.mjs` (pure, tested), 936-line `styles.css`. Blue + serif,
dense, three-step workflow: prioritized queue → human review → action + audit.
**Already persists to `localStorage`** under `doorstep-product-d-demo-v1`, and already has its own "Reset demo
decisions" button. Phase 3 has to reconcile that with the shared store rather than leave two write layers
side by side — see **Decision needed D-3**.

### 0.8 Product B — what the port inherits (early read, formalized in Phase 5)

Read `app.js` in full. Three things need deciding before Phase 5, not during it.

- **B has no working filters.** The "Filter" button at `app.js:112` has no handler, and the dashboard search
  input has no handler either. The only real narrowing is the 3-category `categoryMap`. The Phase 5 checklist
  says "every filter" and Phase 6 assumes "Browse with filters set" — there is no filter UI to port. Those
  filters would be **new construction**, not parity work. See **Decision needed D-2**.
- **B already has a chatbot** — a floating FAB opening a "Doorstep Gemini Assistant" modal with keyword
  matching (`app.js:305-371`). This directly contradicts the architecture ("never a floating bubble", chat
  is the Ask tab). It is a real feature of his product that the port is required to remove. Flagging so it is
  a recorded decision rather than a silent drop.
- **B's checkout is a payments flow** — 15% commission line, a Visa •••• 4242 card, an "Authorize Payment"
  button, and "Funds held in secure Escrow". The brief says no payments. Needs a call on whether the port
  keeps it as demo chrome or drops it.

Smaller notes: `.glass`, `.card-hover`, and `.btn-pop` are referenced 20 times across `app.js` but defined
nowhere — dead classes with no visual effect today. Two external images (a Wikipedia Manhattan street map as
the "map background", an Unsplash photo on the profile header); the Manhattan map is also a city mismatch,
since the dataset is Portland. No `Bookings` or `Profile` screen exists, so two of the four required tabs have
no ancestor in his code. Nothing in B ever persists a booking — confirmation invents a random `BK-#####`.

### 0.9 Baseline screenshots

13 screenshots in `docs/baseline/{product-a,product-b,product-c,product-d}/`. Captured at 1280×900 for A and
D, 390×844 @2x for B and C.

Product B is captured twice, deliberately:

- `01-AS-LEFT-*`, `02-AS-LEFT-*` — exactly as Abheeshu left it: the data fetch fails and the app renders
  "Failed to load data from remote branch". This is the honest record.
- `03-REVIVED-*` … `07-REVIVED-*` — the same build with the dead URL routed to local `mock-data` at the
  browser layer. **No code was modified**; the interception is in the capture script only. Without these
  there is no visual record of his product to write the Phase 5 parity checklist against.

The revived captures show the map background failing to load — that external image is a second broken
dependency, independent of the data fetch.

---

## Suggestions — not applied

Recorded per the preservation rules, not implemented.

- **A**: `nextId()` in `constants.js` is documented as a "server-side generator" but runs in the browser.
- **B**: `.glass` / `.card-hover` / `.btn-pop` are dead classes (0.8).
- **B**: the dashboard search input and the feed Filter button are decorative.
- **D**: the UI says "GitHub mock data" and "mock data connected" in two places; after the merge the data is
  local, so the wording will be inaccurate. Copy change — not touching it without approval.
- **Root**: `index.html` uses a blue gradient palette (`#1d4ed8`/`#0369a1`) that matches neither C's teal
  accent nor D's blue. Phase 1 rebuilds this page anyway, Phase 2 tokenizes it.

---

## Decisions needed at Gate 0

**D-1 — Product A's "TaskLocal" in Kamal's copy.** Phase 1 says normalize all visible branding to Doorstep.
Preservation says do not change their copy. These collide in two body-copy sentences inside
`ProviderDashboard.jsx` (0.2 #4), not just the title and topbar. Options: (a) change title + topbar +
copy — fully consistent, edits two of his sentences; (b) change title + topbar only, leave the two sentences
saying "TaskLocal" — visibly inconsistent; (c) as (a), and send Kamal the diff. **Recommend (a), flagged to
Kamal at Gate 4** when he reviews screenshots anyway.

**D-2 — Product B's absent filters.** No filter UI exists to port (0.8). Options: (a) parity checklist records
Browse as category-only, and the filter set Phase 6 hands off is built fresh in Phase 6 where the Ask
handoff actually needs it; (b) build a filter panel in Phase 5 as new work, marked in the checklist as
added-not-ported. **Recommend (a)** — it keeps Phase 5 an honest port and puts the new work where there is a
stated requirement for it.

**D-3 — Product D's existing localStorage layer.** D already persists moderation decisions under its own key
and has its own Reset button (0.7). Phase 3 wants one flat store and one Reset. Options: (a) repoint D's
persistence at `shared/demo-store.js` and have its existing Reset button call the shared reset — one write
layer, but touches slightly more of `app.mjs` than a pure read-path redirect; (b) leave D's write layer alone
and only redirect its reads — smaller diff, but two write layers and a Reset button that only half-resets.
**Recommend (a)**; it is the only option where a suspension in Admin actually hides the listing in Customer,
which is the cross-app demo Gate 3 asks for. Note this is wider than the "read path only" exception as
written, which is why I am asking rather than assuming.

**D-4 — Product B's payments/escrow checkout.** (0.8) Keep as demo chrome, or drop? Affects the parity
checklist. No recommendation — this is a product call.

---

## Blocked

**Abheeshu's repo is unreachable with the current credential.** Not a silent fallback — stopping here as
instructed.

- `git ls-remote https://github.com/abheeshudhungana-source/doorstep.git` → `403 Write access to repository
  not granted`. The API returns `404` for that repo, which is what GitHub returns for a private repo the
  caller cannot see.
- Authentication itself **succeeds** — the stored osxkeychain credential resolves and authenticates as
  `JianTing-Li`. The problem is authorization, not login.
- The token returns no `x-oauth-scopes` header and enumerates only repos under `JianTing-Li` (plus two org
  repos). That signature is a **fine-grained PAT**. Fine-grained PATs are scoped to a single resource owner
  and cannot reach another user's repository at all — collaborator access does not change this. So the grant
  you were given is real, but this credential cannot exercise it.
- `gh` is not installed on this machine (`command not found`), so the OAuth path is unavailable too.

To unblock, any one of: install `gh` and `gh auth login` (OAuth token, honours collaborator access); or
create a **classic** PAT with `repo` scope; or have Abheeshu push to a branch on `JianTing-Li/doorstep`.

**Consequence, and why it is not urgent yet.** Only the Phase 5 parity checklist must be written from the
newer copy. Phases 1–4 do not depend on it: Phase 1 brings B in as-is, and the `product-b` branch is the only
copy available to bring. I can proceed through Gate 4 and resolve this before Phase 5 — but if the answer is
"Abheeshu pushed more work", Phase 1's `customer/` starts from a stale copy and the Phase 5 `git mv`
authorship trail is built on it. **Cheapest fix is to sort access before Phase 1 commits.**

Until then, the "is `product-b` older than his repo?" diff is unanswered.
