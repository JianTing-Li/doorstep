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

**D-1 — Product A's "TaskLocal" in Kamal's copy.** **Decided: the app's name is Doorstep, final.** Rename
everywhere in Product A — title, topbar logo mark, and both body-copy sentences in `ProviderDashboard.jsx`
(0.2 #4) that currently say "TaskLocal." Full consistency, no partial rename. Will show Kamal the diff at
Gate 4 when he reviews screenshots anyway, but the decision itself is closed.

**D-2 — Product B's absent filters.** No filter UI exists to port (0.8). Options: (a) parity checklist records
Browse as category-only, and the filter set Phase 6 hands off is built fresh in Phase 6 where the Ask
handoff actually needs it; (b) build a filter panel in Phase 5 as new work, marked in the checklist as
added-not-ported. **Recommend (a)** — it keeps Phase 5 an honest port and puts the new work where there is a
stated requirement for it.

**D-3 — Product D's existing localStorage layer.** **Decided: redirect both reads and writes.** D currently
persists moderation decisions (dismiss/warn/suspend/resolve) under its own private key
(`doorstep-product-d-demo-v1`) and has its own "Reset demo decisions" button that only clears that key (0.7).
At Phase 3, D's write path gets repointed at `shared/demo-store.js` instead of its private key, and its
existing Reset button gets rewired to call the shared reset rather than clearing its own key alone. Net
effect: one write layer (a suspension recorded in Admin actually hides that listing in Customer/Chat, which
is what Gate 3's cross-app demo requires), and one Reset across all four products, not two independent ones.
This is wider than the brief's literal "read path only" exception for A and D — flagged for that reason, and
now confirmed rather than assumed.

**D-4 — Product B's payments/escrow checkout.** **Decided: keep as visual flavor.** The escrow copy, the fee
breakdown, "Authorize $X in Escrow" stay in the ported UI as demo chrome — no real payment processing, same
as today.

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

### Update — manual download resolves access, and it changes the Phase 5 picture

You downloaded Abheeshu's current repo by hand into `doorstep-productb/` at repo root (already covered by
`.gitignore`, confirmed — it will not get committed). This is **substantially newer** than the `product-b`
branch and changes several open items above.

**Scale.** `app.js` is 2,205 lines (was 371). Seven view functions instead of five — adds `getScheduleHTML`
and `getMyBookingsHTML`, so there is now a real `Bookings` ancestor to port (there wasn't one before). Also
adds a `chatbot-engine.js` (369 lines, his own keyword matcher), provider messaging, a review-submission flow,
a trust & safety reporting flow, and a real Leaflet map (`unpkg.com/leaflet`) replacing the old static
Wikipedia image.

**Data schema — verified, and it resolves cleanly.** `index.html` loads `data.js`, not the
`data/tasklocal-connected-dataset.json` the README points to. I parsed `data.js`'s `DB_LISTINGS`,
`DB_PROVIDERS`, `DB_CUSTOMERS`, and `DB_SERVICE_TYPES` and diffed each against local `mock-data/` as JSON —
**all four are exactly equal.** `data.js`'s own header comment says "Auto-generated ... from JT repository
mock-data," and `build_data.js` confirms it: it pulls straight from `origin/feature/mock-data` via `git show`
(the branch that's since been deleted — this file predates that deletion). So the active data path already
matches the canonical schema; nothing to reconcile there.

The `data/tasklocal-connected-dataset.json` the README references is dead weight: nothing loads it. Its
schema is the **historical, superseded one** Product A's README warned about — singular `service_category`
(not the array `service_type`), prices in cents (`rate_amount: 6500`), `list_00001`/`prov_00001` IDs, a
top-level `audit_log`. Confirmed by inspecting a record directly. Since the app never reads this file, it's
inert — noting it under Suggestions, not touching it.

**D-2 resolved.** `state.filters` is real: `category`, `searchQuery`, `maxPrice`, `minRating`, `sortBy`, with
a separate `tempFilters` staging object. There is now something genuine to port; the Phase 6 filter handoff
has real filter state to carry into Ask instead of being built from nothing.

**D-4 still open, more baked-in now.** The header comment literally advertises "Escrow Checkout & Lifecycle"
as a feature. Same question as before — keep as demo chrome or drop — just with more surface area riding on
the answer.

**New, not previously flagged: still has the floating chatbot FAB.** `index.html:157`, `toggleChatbot()`,
opens a modal — same shape as before, just restyled (gradient FAB, "Open AI Assistant"). Confirms the earlier
flag under 0.8: removing this is required by the architecture ("never a floating bubble"), not optional, and
is a bigger removal now that it's a more developed feature (his own `chatbot-engine.js` keyword matcher, not
just a stub).

**New, not previously flagged: his own persona switcher.** `state.currentCustomerId`, persisted to
`localStorage['doorstep_active_persona']`, lets you page through different **customer** personas inside his
app. This is a narrower concept than Phase 2's cross-role switcher (Customer/Provider/Admin) but sits in the
same territory. Two things to watch in Phase 2/5: the localStorage key must not collide with
`shared/switcher.js`'s, and a decision is needed on whether his intra-customer persona picker survives the
port as a distinct feature or gets superseded by the one hardcoded customer ID the brief specifies for
Phase 2. Not deciding now — flagging so it isn't lost.

**Secret scan: clean.** No API keys, Gemini or otherwise, anywhere in the dropped-in folder.

**One real gap: no `.git` history.** This is a file dump, not a clone — there's no commit log to preserve.
Phase 5's instruction to `git mv` mapping file-to-file and keep the relationship visible in history assumes a
shared lineage with what's already in the repo. There isn't one here. I can still credit Abheeshu fully in
the commit message and `customer/README.md` as instructed, and diffing this against the `product-b` branch
(which *does* share history with the repo) can anchor a real `git mv` for the four files that exist in both
(`app.js`, `data.js`, `index.html`, `README.md`) before layering the new files in as additions. That gets
close to the spirit of the rule without fabricating history that doesn't exist. Flagging as a Phase 5
mechanic to confirm with you when we get there, not a blocker now.

**Net effect on the earlier "Blocked" section above:** resolved for the purposes of writing the Phase 5
parity checklist. You also gave me the live deploy URL
(`https://doorstep-git-main-gana62.vercel.app/`) — I diffed `app.js`, `data.js`, and `chatbot-engine.js` from
that URL against the downloaded folder byte-for-byte (`md5`) and they are **identical**. (`index.html`
differs, but only because that URL serves a Vercel preview-alias redirect shim, not real page content — the
browser follows it to the same app.) So this is not just "newer than the branch," it is confirmed current to
the live deployment. Treating it as fully authoritative.

### Update — Product B is not responsive above phone width (live-verified)

You flagged that the live site looks like a mobile app even on a large monitor. Verified with screenshots at
3440×1440, 1920×1080, and 390×844 (Playwright, `/private/tmp/.../scratchpad/live-check/`): at every desktop
width the app renders as a fixed ~390px-wide card centered in empty space — it does not use the available
screen, it just floats a phone-shaped card in the middle of it. Confirmed on both the live URL and (since the
code is identical) the local folder.

This is not a violation of anything already agreed — the brief's only stated responsive requirement is the
Gate 6 checklist's floor ("usable on a phone at 390px wide, no horizontal scroll"), which this exceeds; it
never asked for desktop optimization. But it's a legitimate product decision for you to make, and Phase 5 is
the natural place to fix it, since B is the only product getting fully rebuilt — building a responsive layout
there doesn't touch A's or D's preservation rules and doesn't conflict with anything already decided.

For comparison: Product C does not have this problem. Checked it at 1920×1080 — it fills the viewport with a
full-bleed background and keeps the message column centered at a readable width, which is a normal desktop
treatment, not a phone-in-a-void. A and D's Phase 0 baseline screenshots already show full-width desktop
dashboards.

**Consequence for the Phase 0 baseline captured earlier.** `docs/baseline/product-b/` was captured against
the stale `product-b` branch, before this download existed. It is no longer representative of the product
Phase 5 actually ports. Re-captured — see below.

### Decisions closed at Gate 0

- **D-2** (filters) — resolved by the real download: `openFilterModal()` is a genuine filter/sort sheet
  (category chips, max-price slider, minimum-rating tiers, sort dropdown). Real filters exist; nothing to
  build fresh.
- **D-4** (escrow checkout) — **keep as visual flavor.** No real payment processing; the escrow copy and fee
  breakdown carry through the port unchanged in spirit.
- **Floating chat bubble** — **confirmed removal.** Ask becomes a tab, never a floating bubble, per the
  architecture. Not a decision so much as a re-confirmation; recorded here since it's now closed.
- **Responsive layout — new explicit requirement for Phase 5.** Product B must work as a real responsive
  layout from phone width through a 34" monitor (~3440px), not the current fixed ~390px card centered in
  empty space. This is now a stated requirement for the rewrite, not just "meets the 390px floor." Doesn't
  touch A's or D's preservation rules — it's scoped to the one product getting fully rebuilt anyway.

### Product B baseline — recaptured against the real, current product

`docs/baseline/product-b/` now holds 12 screenshots against the actual code (local folder and live deploy
are byte-identical, confirmed via `md5` on `app.js`, `data.js`, `chatbot-engine.js`):

| File | Shows |
|---|---|
| `01-dashboard.png` | Home: search, AI Matcher entry, category tiles, live Leaflet map |
| `02-feed.png` | Category feed |
| `03-profile.png` | Listing/provider profile |
| `04-schedule.png` | Time-slot picker |
| `05-checkout.png` | Escrow checkout — date/time, location, fee breakdown, "Authorize $X in Escrow" |
| `06-confirmation.png` | Booking confirmation |
| `07-my-bookings.png` | Bookings & Activity — upcoming jobs, per-booking Chat / Report / Complete, completed history, trust & safety cases |
| `08-persona-switcher.png` | His own customer-persona picker (see the persona-key-collision note above) |
| `09-filter-modal.png` | Filter & Sort sheet — category, max price slider, min rating, sort by |
| `10-ai-chatbot-fab-AS-LEFT.png` | The floating chatbot FAB + modal, exactly as it exists today — kept only as the "before" record; this is what Phase 6 removes |
| `11-desktop-1920-AS-LEFT.png` | 1920×1080 — the phone-in-a-void problem |
| `12-ultrawide-3440-AS-LEFT.png` | 3440×1440 — same problem, more empty space |

All mobile shots at 390×844 @2x except the two desktop captures. `-AS-LEFT` suffix marks the two things Phase
5 is explicitly changing (the FAB, the fixed-width layout) so the before-state stays on record.

---

## Phase 1 — Scaffold

Structural only, as required. No CSS/layout touched in any of the four products. Verified against Phase 0
baselines by screenshot diff after the build (see below) — everything matches except the one deliberate
rename in Product A.

### What moved where

- **`admin/`** ← Product D, copied straight in from `codex/product-d-trust-safety-dashboard`. Already had the
  right shape and the right `.gitignore` (byte-identical to the placeholder already in the tree). No file
  changes. `../mock-data` from `admin/app.mjs` already resolves correctly once `build.sh` copies `mock-data/`
  into `dist/mock-data/` — verified by running `admin/test.mjs` against local data (passes) and by loading
  `dist/admin/` in a browser (queue, metrics, and case detail all populated from real data).
- **`provider/`** ← Product A, copied in as a self-contained package. Purged the 2,240 committed
  `node_modules` files and the committed `dist/` — neither was copied over in the first place, since I copied
  only `src/`, `index.html`, `vite.config.js`, `package.json`, `package-lock.json`, `README.md` individually
  rather than the whole tree. `provider/.gitignore` (the placeholder already in the tree) covers
  `node_modules`/`dist`/`.env.local`/`.DS_Store`. Discarded A's own `mock-data/` copy — never brought over.
  - `vite.config.js`: added `base: "/provider/"`.
  - `src/hooks/useProviderData.js`: all 7 mock-data imports changed from `../../mock-data/` to
    `../../../mock-data/` — one more directory level now that A sits under `provider/` instead of at repo
    root. Verified by building (`vite build` succeeds, 46 modules) and loading the built output — listings,
    bookings, and provider profile all populate correctly.
- **`customer/`** ← Product B, but not the stale `product-b` branch: **the real, current product** (the
  folder you downloaded, confirmed byte-identical to the live deploy — see the Gate 0 addendum above). Copied
  everything except `mock-data/`, which was discarded per the non-negotiable rule. That includes his own
  `data/tasklocal-connected-dataset.json` (dead, unused, superseded schema — nothing loads it, see Suggestions
  below), `build_data.js`, `fix.py`, `test_integration.py`, and his own `vercel.json` (inert now that the root
  `vercel.json` governs the whole deploy; left in place, not deleted, per preservation).
  - **No data repoint was needed.** The Phase 1 brief assumed B's `data.js` did a runtime `fetch` to a dead
    GitHub branch — that was true of the old stale branch, not this real product. This `data.js` is a static
    file already generated from local `mock-data` (confirmed byte-identical at Gate 0) and has no network
    dependency on it at all. The only external network call in the whole product is the OpenStreetMap tile
    layer for the Leaflet map — grepped for it specifically, nothing else. So "bring B in as-is" needed
    literally zero code changes to make it work.
- **Root `index.html`** rebuilt as three doors — Customer, Provider, Admin — each with a one-line "who you
  are" description, a concept-demo/mock-data note, and a "Built by [name]" credit. No fourth door for Chat:
  the brief specifies three doors, and `/chat` still resolves as a route (Gate 1 requires it), it's just not
  advertised from the landing page. That's intentional — Chat isn't a persona the way Customer/Provider/Admin
  are; Phase 6 is what actually gives it a permanent home inside Customer.
- **`build.sh`** replaces the one-line `buildCommand`. Builds `chat/` and `provider/` (`npm install` + `vite
  build` each), copies `admin/` and `customer/` through as static files (stripping their `.gitignore` and, for
  admin, `test.mjs` — no reason to ship a Node test file to the browser), copies `mock-data/` into
  `dist/mock-data/`, copies the root landing page. `vercel.json`'s `buildCommand` is now `bash build.sh`;
  `outputDirectory` unchanged.

### Branding — Doorstep, per your decision

Only Product A needed a real change; B, C, and D already said "Doorstep" everywhere visible. Grepped all of
A's source for "TaskLocal" and found more instances than the Gate 0 scan caught (that scan only checked
`ProviderDashboard.jsx`; the guided-listing-builder copy is actually in `ListingForm.jsx`). Renamed every
**visible** instance:

- `index.html` — title and meta description
- `ProviderDashboard.jsx` — topbar wordmark, and the "TL" monogram → "DS" (kept the two-letter format, avoided
  "D" since Admin already uses a bare "D" for "Product D" — Phase 2's icon unification will replace ad hoc
  letter marks like this entirely; this is a placeholder, not a final treatment)
- `ListingForm.jsx` — four separate strings: the guided-builder intro copy, the "not supported yet" message,
  the "matched your service" kicker, and the footnote about not inventing listings

Left three **code comments** unchanged (`index.css:1`, `selectors.js:4`, `ListingForm.jsx:5`) — they mention
"TaskLocal" but aren't visible to anyone using the product, and the decision was about the app's name/branding
as presented, not a sweep of internal comments.

Added an author byline to `provider/README.md` and `customer/README.md`, matching the phrasing D's own README
already uses ("This folder contains [name]'s Product [X] build for Doorstep."), per the preservation rule to
credit each product to its builder.

### Verification

- **Build**: `bash build.sh` completes clean — chat (46 modules), provider (46 modules), admin and customer
  copied through, mock-data copied, landing page copied.
- **Routes**: served `dist/` locally, all five resolve — `/`, `/customer`, `/provider`, `/admin`, `/chat` (200
  directly with trailing slash; 301→200 without, standard static-host redirect behavior, matches how the
  landing page's own links are written).
- **Visual**: screenshotted all five from the built `dist/` output and compared against the Phase 0 baselines
  in `docs/baseline/`. Provider, Admin, Customer, and Chat are visually identical to their baselines except
  the intended Doorstep rename in Provider. Landing page is new (there was no three-door baseline to compare
  against).
- **Tests**: `mock-data/validate.py` — **ALL 104 CHECKS PASSED** (run for the first time; Gate 0 only noted it
  hadn't been run yet). `admin/test.mjs` — passes. `chat/src/lib/__tests__/matching.test.js` — **booking
  49/49, parseJob 20/25**, identical to the Phase 0 baseline, no regression.
- **Secrets**: `chat/.env.local` remains untracked (confirmed via `git status`, not just assumption). No
  secret-shaped string anywhere in the new files (`grep` for API-key patterns across `provider/`, `customer/`,
  `admin/`, root). Nothing in `git status --short` touches `dist/`, `node_modules/`, or `doorstep-productb/` —
  all three stay properly ignored.

### Left alone, as instructed

- `doorstep-productb/` at repo root — the folder you dropped in. Its content is now safely inside `customer/`
  (tracked in git), so it's redundant, but it's your file and it's gitignored either way. Not deleting it
  without you saying so — say the word and I'll remove it.
- Every screen composition, interaction flow, and piece of copy in all four products, except the Doorstep
  rename explicitly decided at Gate 0.

## Suggestions — not applied (additions)

- **B**: `customer/README.md` still points to `data/tasklocal-connected-dataset.json` as "Project data" and
  links the old TaskLocal spreadsheet as "source of truth" — both stale now that nothing in the app reads
  that file. Not correcting his copy without asking, same as the D `test.mjs` era.

## Reset from `git status`, in case it matters at Gate 1

- `.gitignore` — modified (added `.env*.local`, flagged as missing at Gate 0)
- `index.html`, `vercel.json` — modified (three-door landing page, `build.sh` wired in)
- `admin/`, `customer/`, `provider/` — populated (`.gitkeep` removed from each, real product files added)
- `build.sh` — new
