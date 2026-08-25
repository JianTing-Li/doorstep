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

---

## Phase 2 — Shared shell

### `shared/tokens.css`

Lifted verbatim from `chat/src/styles.css`'s `:root` and `:root[data-theme="light"]` blocks — every color,
the two font stacks, the three radii, and the motion vocabulary are Product C's own values, unchanged. Chat
itself now `@import`s this file instead of declaring those values locally (`chat/src/styles.css:1`), so
nothing outside `shared/tokens.css` defines them, including in the product they were lifted from. Verified
pixel-identical before/after in both themes (screenshots below) and confirmed via the built CSS output that
both `--color-accent` values (`#87c7bc` dark, `#6fb3a8` light) bundle correctly.

Added on top of what Chat already had, since the brief asks for these categories and Chat's own UI never
needed them:
- **Semantic color** (success/warning/danger) — Chat has no error or destructive-confirmation UI, so there
  was nothing to lift. Picked values consistent with the existing muted-glass palette rather than
  saturated/candy colors, following the same "text-on-fill drops to a darker shade in light mode" pattern the
  accent already uses. Not measured against a contrast checker — flagging that as a follow-up, not a blocker,
  since nothing consumes these yet.
- **Spacing ramp** — an 4px-based `--space-1` (4px) through `--space-10` (64px). Chat's own CSS uses ad hoc
  px/rem paddings throughout rather than a scale; there was no existing ramp to lift, so this is new.
- **Type scale** — `--text-2xs` through `--text-2xl` plus `--text-display` (a `clamp()` for hero headlines).
  Sized by surveying the actual font-size values already in use across Chat, Admin, and Provider (Admin
  ranges 0.65rem–2.35rem, Provider uses `clamp(30px, 5vw, 48px)` for its hero) and snapping the cluster to
  clean steps, rather than inventing a scale from nothing.
- **`--radius-sm` (10px)** — Chat's own scale only had md/lg/full; Admin's most common radius (10px, 4
  occurrences) and Provider's dense controls needed a smaller step the existing scale didn't cover.
- **Weights** — kept to three (`--weight-regular` 400, `--weight-medium` 500, `--weight-semibold` 600), the
  dominant values across Chat's own CSS. 700 appears twice in Chat's stylesheet and wasn't promoted to a
  token — per the brief's "two or three weights actually in use," not every weight that appears once.
- **Focus ring** — `--focus-ring` / `--focus-ring-offset`, generalizing the `outline: 2px solid
  var(--color-accent)` pattern Chat already uses in two places (`.listing-card-tappable:focus-visible`,
  `.chat-input-bar input:focus`) into one token pair.
- **`prefers-reduced-motion`** — moved here verbatim from Chat's own stylesheet; it's global infrastructure,
  not Chat-specific, and the brief explicitly asks for it as a Color/Motion-adjacent token concern.

### Icon set

**Decision: Product C's own hand-drawn inline SVG convention** — 24×24 viewBox, `stroke="currentColor"`,
`stroke-width="1.7"`, round caps/joins, no fill. Not a library dependency; each icon is copied inline as
markup, the same way `chat/src/components/HeaderActions.jsx` already does its sun/moon/trash icons. This
avoids the "don't add a dependency without asking" question entirely — there's nothing to add, and every
product (React 18, React 19, and vanilla JS) can embed the same SVG markup with zero tooling. Proved out
immediately in `shared/switcher.js`, which uses the same convention for its chevron/check/sun/moon icons. The
Ask tab's sparkle icon (Phase 6) will follow the same convention when it's built.

### `shared/switcher.js` + `shared/switcher.css`

Plain DOM, framework-agnostic, exactly as specified. Mounts into `<div id="doorstep-switcher"></div>` in
`admin/index.html`, `provider/index.html`, and `customer/index.html`. Not added to `chat/` — Gate 2 asks for
the switcher to work "from all three products" (Customer/Provider/Admin), and Chat isn't one of the three
roles the switcher toggles between; it gets folded into Customer as the Ask tab in Phase 6, at which point it
inherits the switcher naturally rather than needing its own copy now.

**Persisted state**: `localStorage['doorstep:persona']` (`"customer" | "provider" | "admin"`) and
`localStorage['doorstep:theme']` (`"light" | "dark"`). Verified surviving a hard page reload, not just
in-session navigation.

**Hardcoded personas**, from real mock-data records so every product opens populated:
- Customer → `cst_001`, Hannah Breece (the brief's own example ID format, `cus_00X`, doesn't match the actual
  schema — real customer IDs are `cst_0XX`; corrected without asking, since the brief's own example was
  clearly illustrative, not literal)
- Provider → `prv_001`, Marisol Vega — already the hardcoded provider in `useProviderData.js`, so this
  matches what Provider already shows
- Admin → "Desmond Achebe," no formal ID. `moderation-actions.json` has no per-staff identity system — it's a
  free-text `admin_name` field, not a stable ID like `customer_id`/`provider_id`. Desmond Achebe is simply the
  most active name in that file (4 of 9 actions). Admin's own dashboard doesn't filter by staff identity, so
  there's nothing for this persona choice to actually change on the page — it exists for the switcher's own
  display purposes only.

**A theme toggle lives in the switcher's menu.** Not explicitly specified as switcher content in the brief
(items 4–6 describe the menu as persona-only) — added because nothing else in Provider or Admin offers any
way to change theme today, and item 7 ties persona and theme persistence together in the same sentence.
Without a toggle somewhere, "dark mode survives navigation" would be untestable in the three products that
actually need Phase 2's switcher. Chat's own theme toggle (`HeaderActions.jsx`) is untouched and separate —
reconciling the two is Phase 6 territory, when Chat and Customer become one app. Also worth noting: Chat's
`theme.js` currently doesn't persist to `localStorage` at all ("an explicit choice... overrides it for the
session only," by its own comment) — so there's no key collision risk with the switcher's `doorstep:theme`,
but also no existing convention to reconcile against yet.

**No Reset option yet.** Reset is specified under Phase 3 (`shared/demo-store.js`), not Phase 2. The switcher
will gain a "Reset demo data" menu item when that store exists to reset.

### A real bug worth recording: stacking-context trap from `backdrop-filter`

The switcher menu initially rendered *underneath* Provider's own dashboard hero banner — confirmed visually,
not assumed (screenshots in scratch). Root cause: `.ds-switcher-bar` uses `backdrop-filter` for the glass
effect, and `backdrop-filter` creates a stacking context. Without an explicit `z-index` on the *outer* mount
point (`#doorstep-switcher`), the whole bar — including the menu's own internal `z-index: 1000` — only
competed against Provider's content by DOM order at the "auto" stacking tier, and lost, because Provider's
`.dashboard-header` (which also happens to use `isolation: isolate`) sits later in the document. Cranking the
menu's own z-index to 999999 didn't help — the trap was one level up, not a magnitude problem. Confirmed by
elimination: forcing `isolation: auto` on Provider's header didn't fix it either, which is what pointed at
`.ds-switcher-bar`'s own `backdrop-filter` instead. Fixed by giving `#doorstep-switcher` itself `position:
relative; z-index: 1000;`, so the whole switcher gets a real, explicit stacking position at the body level
rather than an implicit one. Verified fixed via the same click-target test that first caught it, and via a
forced-red-background stacking test that made the wrong paint order directly visible before the fix.

### Mounting strategy: an in-flow bar, not an overlay

Positioned as a normal (non-fixed, non-sticky) full-width bar, inserted as early as possible in each
product's `<body>` — after Admin's skip-link (so the skip-link stays the first tabbable element), before
Provider's `#root`, and as the first element in Customer's `<body>`. Two things ruled out a simpler-looking
overlay approach:
- **A fixed/absolute overlay would cover real content in every product** — Admin's own "Reset demo decisions"
  button and status pill sit top-right; Provider's provider-identity chip sits top-right; Customer's *own*
  persona dropdown and order-history icon sit top-right (see below). There's no empty corner across all three
  without touching each product's own header.
- **Sticky was ruled out specifically for Admin** — `admin/styles.css`'s own `.topbar` is already `position:
  sticky; top: 0`. Two `top: 0` sticky elements don't stack automatically; without editing Admin's own CSS
  (not allowed this phase), a sticky switcher bar would fight Admin's sticky topbar during scroll rather than
  sitting above it. A plain in-flow bar sidesteps this entirely — it scrolls away with the page, and Admin's
  own sticky header takes over the top position normally once the switcher bar scrolls past.

**One real exception, confined to one file:** Customer's `<body>` is `h-screen flex items-center justify-center
overflow-hidden` (a fixed-height, centered, non-scrolling frame — the mobile-app-in-a-box pattern flagged at
Gate 0). Inserting an unaccounted-for sibling there would silently *clip* the bottom of his existing UI rather
than push it down, since nothing scrolls. Added one rule, directly in `customer/index.html`'s own `<style>`
block (not in the shared file — this is specific to his page's own layout, not a general concern):
`body { padding-top: 56px !important; }`. The `!important` is necessary and deliberately scoped — his own
`p-0 md:p-4` Tailwind utility would otherwise win on specificity for that same property. Verified via computed
style (`56px`, exactly matching the bar's own `min-height`) and a full-page screenshot showing zero clipping.
This is the one CSS touch to a product's own file this phase; every other product needed none.

**Provider needed one more real fix, not anticipated going in.** `<script type="module" src="/shared/...">`
and `<link href="/shared/...">` tags in `provider/index.html` don't survive a Vite build as written — Vite's
HTML asset pipeline tries to resolve and bundle any `src`/`href` it finds as part of the app's own module
graph, fails to resolve a sibling deploy folder, and (even when marked `external` in Rollup config) silently
drops the tag from the output rather than leaving it as a literal URL. Fixed by loading the shared shell via
a small inline bootstrap `<script>` (no `src` attribute) that creates the `<link>`/`<script>` elements at
runtime — inline scripts aren't part of Vite's asset-resolution graph, so this survives the build untouched.
Confirmed by inspecting the actual built `provider/dist/index.html`. Also added a dev-only middleware to
`provider/vite.config.js` (mirroring the pattern `chat/vite.config.js` already uses for its landing-page
plugin) so `npm run dev` resolves `/shared/*` locally too, not just the production build.

`chat/vite.config.js` also picked up a small addition: `server.fs.allow` extended to the repo root, since
`styles.css` now does `@import "../../shared/tokens.css"` and Chat's dev server otherwise can't read outside
its own project root.

### `shared/patterns.css`

Created but **not yet consumed by any product** — Gate 2's own success criteria (switcher, tokens, icon set)
don't require it to be live anywhere yet, and no product's screens change this phase. Holds the reusable
classes for what the brief asks to be "defined once": a skeleton loading block, an empty-state shell, an
error-state shell, a bottom-anchored toast, inline field-validation styling, and the destructive-confirm
pattern — generalizing Chat's own existing "Clear chat?" inline two-button swap
(`HeaderActions.jsx`) into a shared class rather than a Chat-specific one. Phase 4 (A, D primitives) and
Phase 5 (the B port) are where these actually get adopted into real screens.

### `build.sh`

One addition: `cp -R shared dist/shared`, alongside the existing `mock-data` copy — same reasoning, the
three products reference it by absolute path (`/shared/...`), which only resolves once it's a sibling of
`dist/admin/`, `dist/provider/`, and `dist/customer/`.

### Verification

- **Stacking/click test**: the exact scenario that first caught the z-index bug (open menu → click
  theme-toggle) now correctly hits the button, confirmed via `elementFromPoint` at the button's real
  coordinates, not just a screenshot.
- **Cross-product persistence, verified end-to-end**, not just per-product in isolation: toggled theme in
  Provider → switched to Admin (theme still applied, persona correctly "admin") → switched to Customer (theme
  still applied, persona correctly "customer," body padding confirmed exactly 56px, full-page screenshot
  shows zero clipping) → hard-reloaded Customer (theme and persona both survived the reload, confirming real
  `localStorage` persistence, not in-memory state that a fresh test happened not to catch).
- **Chat**: rebuilt after the `@import` refactor, bundled CSS spot-checked for both theme values, and
  screenshotted in both dark and light — pixel-identical to the Phase 0/1 baselines in both.
- **Admin, Provider**: full-page screenshots after the switcher lands — both match their Phase 0/1 baselines
  exactly below the new switcher bar; nothing else moved.
- **Tests**: `mock-data/validate.py` — all 104 checks pass. `admin/test.mjs` — passes. Chat's matching suite —
  **49/49 booking, 20/25 parseJob**, unchanged from every prior gate.
- **Routes**: all five (`/`, `/customer`, `/provider`, `/admin`, `/chat`) still resolve from a full `bash
  build.sh` run.

### Left alone, as instructed

- No product's screen composition, IA, or copy changed.
- `shared/patterns.css` exists but isn't wired into anything yet.
- Chat did not get the switcher (see above — deliberate, not an oversight).
- Reset was not added to the switcher (Phase 3 territory).

---

## Phase 3 — Shared data layer

### `shared/demo-store.js`

A write **overlay** over read-only mock-data, not a data source: it never loads mock-data itself. Each
product's data module supplies the pristine array (however that product gets it) and the store merges the
overlay over it. That is what lets one store serve four products with four different loading strategies —
build-time JSON imports (chat, provider), a runtime fetch (admin), and a generated `data.js` snapshot
(customer).

Overlay shape, one flat store under `localStorage["doorstep:demo:v1"]`:

```
{ [collection]: { created: [ …whole records… ], patched: { [id]: { …changed fields… } } } }
```

`mergeCollection(name, pristine)` shallow-merges patches in place (so a record keeps its field order and every
untouched field) and appends created records. `{ newestFirst: true }` prepends instead — used only by
provider, because Product A's own pre-Phase-3 behaviour put a freshly created draft at the top of the list.

Details worth knowing:
- **Collections are whitelisted** (`ID_FIELDS`). A typo'd collection name throws rather than silently writing
  an overlay nothing will ever read back.
- **Patching a record created in this session edits it in place** rather than adding a `patched` entry, so a
  record can't end up with two competing representations.
- **`localStorage` is accessed through a guarded accessor** with an in-memory fallback. This is not defensive
  padding: `chat/`'s test suite runs in Node, where `localStorage` doesn't exist. The fallback is why
  `matching.test.js` still reports 49/49 and 20/25 without the tests being touched — in Node the store is
  always empty, so tests see pristine data, which is what they assert against.
- **Cross-tab sync is deliberately not implemented.** Navigation between products is a full page load, so
  every product re-reads the overlay on mount anyway. `subscribe()` exists for same-document re-reads.

Unit-tested directly (16 assertions: merge, patch, create ordering, `newestFirst`, in-place edit of created
records, bulk replace, unknown-collection throw, reset). Not committed as a product test file — it lives in
scratch, since the brief says not to add test files without asking. Happy to add it under `shared/` if you want
it permanent.

### Per-product wiring

| Product | Data module | Diff to the product's own code |
|---|---|---|
| chat | `chat/src/data/loadData.js` (already existed) | file rewritten in place; nothing else in `chat/` touched |
| provider | `provider/src/data/loadData.js` (new) | **`useProviderData.js` only** — +22 / −20 |
| admin | `admin/data.mjs` (new) | **`app.mjs` only** — +14 / −42 |
| customer | `customer/src/data/loadData.js` (new) | **`app.js` — 2 added lines**, `index.html` — 1 script tag |

**Provider.** The seven JSON imports moved out of `useProviderData.js` into the new data module unchanged;
the hook now imports named getters instead. Its two write functions changed from React-state updates to
store writes followed by a re-read (`addListing(...)` then `setListings(getListings())`), which preserves the
existing re-render behaviour exactly. No component, no layout, no copy touched.

**Admin.** Kept Product D's own `state.local` shape — `{ actions, reportStatuses, listingStatuses }` —
byte-for-byte, and projected it on and off the shared store instead. That is why the diff is net **−28 lines**:
`loadLocalState()`/`saveLocalState()` became one-line delegations, and D's own `effectiveListing()`,
`effectiveReport()`, `prioritizeReports(...)` and every render function are completely untouched. Per the D-3
decision, its writes and its existing "Reset demo decisions" button now go through the shared store.

Two deliberate notes on Admin:
- `moderation-actions` is intentionally **not** merged into `state.data.actions`. D already concatenates
  `[...state.data.actions, ...state.local.actions]` in three places; merging as well would double-count every
  demo decision in the "Audit entries" metric. The created actions arrive via `state.local.actions`, which is
  now store-backed — one path, no double count. Verified: the metric goes 9 → 10 on one decision, not 9 → 11.
- D's Reset button now **reloads** instead of re-rendering in place. It has to: `loadDoorstepData()` bakes the
  merged overlay into `state.data` at load time, so clearing the overlay without reloading would leave the
  old merged values on screen. This is a small behaviour change to D (it previously re-rendered and showed a
  status message) and is called out here rather than buried.

**Customer.** B is still the vanilla build until Phase 5, so its data arrives as `DB_*` globals from the
generated `data.js`. The new module is a bridge, loaded as `<script type="module">` — which runs *after* the
classic `data.js`/`app.js` scripts but *before* `DOMContentLoaded`, i.e. after the globals are defined and
before `app.js` first reads them. It rewrites each mutable `DB_*` global through `mergeCollection`.

For writes, B's booking objects use its own display shape (`BK-#####`, `status: "upcoming"`, `escrowStatus`),
not the mock-data booking schema. Rather than restructure state in a build that Phase 5 replaces wholesale,
each new booking is **also** written to the store in canonical form (`booking_id`, `scheduled_slot`,
`price_paid`, `commission_amount`, `source: "customer_app"`, …), with B's extra fields riding along. B keeps
rendering from its own list; the other three products read the canonical record. Two call sites, two added
lines, both `window.Doorstep?.recordBooking?.(newBooking)` — optional-chained so a failure can never block
B's own booking flow. **Flagged for Phase 5 to collapse into a single representation.**

### Reset

Added to the switcher menu as specified: inline two-step confirm (matching Product C's "Clear chat?" pattern
and `shared/patterns.css`), then `resetDemoData()` and a reload. The row is disabled and reads "No demo
changes yet" until something has actually been written, so the destructive action isn't live when it would
be a no-op. Reset also clears the **pre-Phase-3 keys** — D's old `doorstep-product-d-demo-v1` and B's
per-customer `doorstep_bookings_*` / `doorstep_messages_*` / `doorstep_reports_*` — otherwise a reset would
leave stale state behind in exactly the two products that had their own layer before this store existed.

### Gate 3 demonstration (measured, one browser context throughout)

| | provider incoming | admin needs-review / hidden / audit | chat active listings |
|---|---|---|---|
| pristine | 3 | 4 / 3 / 9 | 32 |
| after customer books (real UI, checkout → authorize) | **4** | 4 / 3 / 9 | 32 |
| after admin suspends a listing | 4 | **3 / 4 / 10** | **31** |
| after Reset via the switcher | **3** | **4 / 3 / 9** | **32** |

Zero page errors throughout. The customer's booking renders in Provider inside Kamal's own `BookingCard`,
with the customer name correctly resolved (`cst_001` → Hannah Breece) — screenshot in scratch.

### One real bug found and fixed: unreadable overlay

The switcher menu used `--glass-fill-strong` (translucent). Over Provider's high-contrast dashboard the page
content bled through and collided with the menu text — legible in isolation, genuinely unreadable in place.
Fixed by adding a **`--surface-overlay`** token (opaque; `#2c4a75` dark / `#f6fafe` light — the values the
glass already resolves to over each theme's own ground, so it looks the same, just legible) and using it for
the menu. Floating overlays get an opaque surface; inline cards keep the glass. Verified in both themes.

Also replaced the reset icon's path — the first arc I wrote rendered as a blob rather than a refresh arrow.

### Verification

- **No layout drift**, measured rather than eyeballed: pixel-diffed every product against the Phase 2
  screenshots. Landing and Provider are byte-identical. **Admin: 0 pixels differ** (the md5 mismatch was PNG
  encoding nondeterminism, not a visual change). Customer: 52 px (0.016%) inside an 8×8 box in the Leaflet
  map corner — map-tile nondeterminism, not layout.
- **Tests**: `mock-data/validate.py` 104/104; `admin/test.mjs` passes; chat **49/49 booking, 20/25 parseJob** —
  identical to every prior gate. No test file was modified.
- **No stray reads**: grepped the whole tree. The four data modules are the only files that reference
  `mock-data`; every other hit is a comment or user-facing error copy. D's private storage key is gone from
  `admin/app.mjs`.

### Left alone, as instructed

- **Chat's booking functions are untouched.** `chat/src/lib/booking.js` is pure and carries 49 of the suite's
  assertions; its bookings stay in conversation state, exactly as `chat/README.md` documents. Phase 6 is where
  the brief calls for "one bookings list… both written through `shared/demo-store.js`" — doing it now would
  mean changing a tested module for a flow that phase rebuilds anyway.
- No screen composition, IA, or copy changed in any product.
- `shared/patterns.css` still isn't consumed by any product (Phase 4/5 adopt it).

## Suggestions — not applied (additions)

- **B**: `state.currentCustomerId` defaults to `"cust_00001"`, which matches **no record** in `DB_CUSTOMERS`
  (real ids are `cst_001`…`cst_020`) — so `getCurrentCustomer()` always falls through to a hardcoded "Maya
  Lin" object, while B's own persona modal lists the real customers. A pre-existing bug, not introduced here.
  Worked around rather than fixed: the canonical booking attributes to B's active persona when it resolves to
  a real customer, else `cst_001` (the switcher's Customer persona). Worth fixing properly in Phase 5.

---

## Phase 4 — Conform A and D

Token adoption only, as specified. No screen composition, IA, or copy changed in either product — verified
below, not just claimed.

### Scope decisions made before touching either file

Two judgment calls, made once and applied consistently to both products, documented here rather than left
implicit:

1. **Each product's page background (canvas) stays its own, not the shared `--color-page`.** Shared tokens'
   light-theme page is a saturated sky blue, tuned for Chat's consumer aesthetic. D's neutral gray canvas and
   A's warm cream canvas are core to their own identity — an admin tool and a provider workspace reading as
   neutral/warm rather than "branded blue" is the "different composition" the brief already calls for D, and
   I extended the same reasoning to A. Both got **new, hand-authored dark-mode canvas values** (neither had a
   dark mode before) rather than deriving them from the shared page tokens, for the same reason.
2. **A's 8-color decorative category system (coral/sage/lavender/sky, used for the guided-builder service-need
   icons and avatar gradients) is left untouched.** These aren't semantic (danger/warning/success) — they're
   wayfinding color Kamal chose so eight categories stay visually distinct at a glance. Collapsing them into
   the one shared accent would be a functional regression, not a reskin. What **did** change: A's *primary*
   color (`--forest`, the hero banner, primary buttons, brand mark — previously a distinct dark green) now
   draws from the shared accent, and A's genuinely semantic states (booking status, focus rings) draw from
   the shared semantic tokens. Both are recorded as separate line items below since they're different in
   kind, not degree.

### Product D — `admin/styles.css`

Smaller job than A, as expected: D already centralized nearly everything through its own named custom
properties (`--ink`, `--green`, `--red`, …), so retokenizing was mostly redefining ~15 root variables rather
than touching all 936 lines individually.

- `--ink`/`--muted`/`--line` → shared `--color-ink`/`--color-ink-soft`/`--hairline`.
- `--green` (D's primary/brand color — a blue, `#2563eb`, despite the name) → shared `--color-accent` (teal).
  This is D's brand color now, replacing blue.
- **New: `--success`/`--success-soft`, split out from `--green`.** D's original file reused its brand blue
  for both "primary action" *and* "positive outcome" (`risk-low`, `status-resolved`, `status-dismissed`, the
  empty-state checkmark all shared one hue with the brand mark). That conflation is gone — brand and "this
  went well" are now two different tokens, which is more correct, not just recolored.
- `--amber`/`--red`/`--blue` (medium risk / critical-high risk / open-under_review) → shared
  `--color-warning`/`--color-danger`/`--color-accent` respectively. "Open/under review" reusing the accent
  (rather than getting its own hue) was a judgment call — shared/tokens.css has no dedicated "info" role, and
  "still needs attention, not yet resolved" reads as the same family as "primary action" more than as a
  fourth semantic category.
- Fonts: body → `--font-body`; the 4 Georgia headline declarations → `--font-display` (Fraunces, now actually
  loaded via a Google Fonts link added to `admin/index.html` — Georgia was always just the fallback, nothing
  had loaded the real face before).
- Type scale: every `font-size` snapped to the shared scale (some fine gradations legitimately collapsed —
  e.g. six close-but-different `0.65–0.71rem` values are now all `--text-2xs`; this is the intended effect of
  "one scale," not a bug).
- Radii: D's 10/13/14/16/22px values snapped to the shared 10/14/20px steps (the asymmetric brand-mark shape
  and the tiny `<code>` radius were deliberately left as literals — one-off decorative shapes, not scale
  values).
- Focus states: form-field focus now uses the shared ring pattern instead of a bespoke box-shadow glow.
- The `Reset` icon in the switcher menu was also fixed this phase — the arc I drew in Phase 3 rendered as a
  blob rather than a refresh arrow (visible once I was looking closely at icons across the site); replaced
  with a correct counter-clockwise arrow path.

Verified: `admin/test.mjs` passes (unchanged — this phase never touches `logic.mjs` or `app.mjs`). Zero
console errors in either theme.

### Product A — `provider/src/index.css` (Kamal Mohamed)

The larger job, as flagged before starting: 1,633 lines, its own 8-color palette (vs. D's single accent +
3 semantic), and far less consistent use of its own custom properties (only 60 unique hex literals outside
the root block, but scattered across ~46 individual declarations rather than concentrated).

- `--forest`/`--forest-light` (primary/hero/brand) → shared `--color-accent`/`--color-accent-strong`. This is
  the one big, very visible change — the hero banner goes from dark forest green to teal. Deliberate, per the
  scope decision above.
- **New: booking-status stat tiles split from the brand color.** `.stat-green` ("Completed") previously used
  `--forest-light` directly — now uses shared `--color-success`, same reasoning as D. `.stat-orange`
  (Pending) → `--color-warning`, `.stat-blue` (Confirmed) → `--color-accent-text`, `.stat-red` (Cancelled) →
  shared danger. `.stat-purple` (Active Listings — not a booking status at all) intentionally kept as A's own
  lavender; there's no 5th shared semantic slot for it and there doesn't need to be.
- `--text`/`--muted`/`--border` → shared ink/ink-soft/hairline, same as D.
- Radii: A had its own 10/18/28px scale; now aliased to the shared 10/14/20px scale. This is a real, visible
  reduction in corner roundness (18→14, 28→20) — flagged specifically because, unlike color, this wasn't
  forced by a "which token category" question; A's own scale could have stayed. I adopted the shared one
  because the brief names "one radius set" as an explicit goal and A's own `--radius-sm` already coincidentally
  matched the shared value exactly.
- Font: A's own stack ("Inter, ui-rounded, SF Pro Rounded…") → `var(--font-body)`. **No serif/display font was
  introduced** — A never had one, headings stay in the same rounded-sans family. Forcing Fraunces onto a
  product that never used a display face would be adding a new typeface to Kamal's design, not reskinning an
  existing one.
- ~11 literal `rgba(23, 63, 53, …)` / `rgba(36, 93, 77, …)` instances (the forest colors written as raw RGB
  channels, since a plain `rgba()` can't take a `var()` color) converted to `color-mix(in srgb, var(--forest)
  X%, transparent)` — same visual effect, now actually tied to the token.
- Every `outline: 3px solid rgba(36, 93, 77, X%)` focus ring → the shared focus-ring pattern.
- **Text-on-fill contrast, checked explicitly, not assumed.** Several elements had literal `color: white` on
  what is now an accent or danger fill. White-on-`--color-accent-strong` in dark mode (a light mint,
  `#9dd6cc`) would have been low-contrast — caught and fixed to `var(--color-on-accent)`/
  `var(--color-on-danger)` at 5 sites. The 3 remaining `color: white` instances are all on the *unchanged*
  coral background and were correctly left alone.

One real bug caught before it shipped: two of A's own radius/text custom properties (`--radius-sm`,
`--radius-lg`) happen to share their *names* with shared tokens of the same name. Writing
`--radius-sm: var(--radius-sm);` inside the same cascade is a **self-reference** — CSS treats a custom
property that references itself as invalid, not as "inherit the previous value." Caught by checking the
built output rather than assuming the alias worked; fixed by writing the literal pixel values instead
(`10px`/`20px` — the shared scale's own numbers).

Verified: builds clean (`vite build`, 48 modules), zero console errors in either theme, zero page errors.

### Verification

- **No layout drift in the three untouched products**: Landing and Chat are **byte-identical** to their
  Phase 3 screenshots. Customer differs by the same 52 pixels (0.016%, an 8×8 box in the Leaflet map corner)
  already identified in Phase 3 as map-tile rendering nondeterminism — confirmed it's the *same* diff, not a
  new one, and nothing in this phase touches `customer/`.
- **Tests**: `admin/test.mjs` passes, `mock-data/validate.py` 104/104, chat **49/49 booking, 20/25 parseJob**
  — identical to every prior gate.
- **Before/after screenshots**, both themes, saved to `docs/baseline/product-a/phase4-after/` and
  `docs/baseline/product-d/phase4-after/`, alongside the Phase 0 baselines for direct comparison.

### Left alone, as instructed

- No composition change in either product — every card, section, and interaction stays exactly where Kamal
  and Ibtisam put it.
- A's decorative 8-color category system.
- D's own `test.mjs`, `logic.mjs`, `app.mjs` — nothing in this phase touches D's behavior, only its
  stylesheet.

---

## Phase 5 — Port Product B: feature-parity checklist

Read `customer/app.js` (2,207 lines), `customer/chatbot-engine.js` (369 lines), and `customer/index.html`
(564 lines) in full before writing this. This is the contract for the phase — every row gets checked off at
Gate 5, or explicitly flagged if it can't be.

**This is a bigger app than the brief's own description assumed.** "A filter panel and a listing feed" undersells
it — this is 7 full screens, 6 modals, a persona-switching system, a two-way provider messaging simulator, a
trust-and-safety reporting flow, and a self-contained NLP-ish job-matching chatbot with its own parser. Flagging
the size now, before starting the build, per the instruction to stop and say so rather than push through
silently.

### Screens (7)

| # | Screen | Route in his code | Key elements |
|---|---|---|---|
| 1 | Dashboard | `dashboard` | Hero greeting ("Hello, {name}"), search bar (routes to chat *or* feed depending on query shape — see below), AI Matcher banner, 4-category grid with live counts, live Leaflet map, 3 featured top-rated listings |
| 2 | Feed / Browse | `feed` | Sticky header: back, search input, Filter button (badge dot when filters active), horizontal category chip row (All/Cleaning/Handyman/Moving/Yard & Outdoor), listing cards, empty state with "Reset All Filters" |
| 3 | Profile | `profile` | Cover banner, provider identity + rating/location/escrow stat row, Message Provider + Safety Report buttons, service scope + bio, 3 availability slots, "Continue to Checkout" |
| 4 | Schedule | `schedule` | A second, plainer booking-slot picker (reached only from the provider-chat "Book Pro" button) — a real, distinct second path to checkout, not a duplicate of Profile's slot picker |
| 5 | Checkout | `checkout` | Job summary, hourly-duration stepper (± hours, hourly listings only), address input, escrow trust notice, price breakdown (base + 15% fee), "Authorize $X in Escrow" |
| 6 | Confirmation | `confirmation` | Success state, booking reference/date/total, "View in My Bookings" / "Return to Home" |
| 7 | My Bookings & Activity | `my-bookings` | Upcoming jobs (Chat/Report/Complete actions), Completed history (rate-or-show-review), Trust & Safety Cases list — three sections, one screen |

### Modals (6)

| Modal | Trigger | Contents |
|---|---|---|
| AI Concierge chatbot | FAB, or dashboard search when query looks conversational | Full chat UI: quick-suggestion chips, active-filter pills, `ChatbotEngine`-parsed results with expandable slot picker, in-chat booking confirmation |
| Provider direct chat | "Message Provider" / "Chat" buttons | Per-provider thread, quick-question chips, simulated typing indicator, keyword-based auto-reply, "Book Pro" shortcut into Schedule |
| Trust & Safety report | "Safety Report" / "Report" buttons | 6 radio-button incident categories, details textarea, optional evidence URL |
| Persona switcher | Header avatar chip, or "Switch" on My Bookings | Lists all `DB_CUSTOMERS`, click to switch; footer note that bookings/messages/reports are saved per persona |
| Filter & Sort | Filter icon on Feed | Category chips, max-price slider ($30–250), min-rating chips (Any/4.0+/4.5+/4.8+), sort dropdown (recommended/rating/price asc/price desc/most-reviewed) |
| Rating & Review | "Complete" on a booking, or "Leave Rating & Review" | 5-star picker, review textarea, "Submit & Release Escrow" |

### Global chrome

- Header: logo → dashboard, persona chip (avatar + first name + chevron), bookings icon with an unread-style
  dot badge when any booking is `upcoming`.
- Floating chatbot FAB, bottom-right, sparkle+message icon. **Flagged below — this cannot port as-is.**
- Toast notification, bottom-anchored, auto-dismiss.

### Filters — every one (Browse / Filter modal)

Category (5, `All/Cleaning/Handyman/Moving/Yard & Outdoor`), free-text search (title, description, provider
name, provider bio, location — five fields), max price ($30–250 slider), minimum rating (Any/4.0/4.5/4.8),
sort (recommended/rating desc/price asc/price desc/review count desc). Dashboard search additionally
branches: 3+ words or a natural-language-shaped query opens the chatbot pre-filled; anything shorter goes
straight to Browse with that text as the query.

### His map-background browse concept

Not a background image (the *old* branch had that) — the real B has a **live Leaflet map** embedded directly
in the Dashboard (not Browse), centered on Portland, one marker per active listing at the provider's real
coordinates, each with a popup card (name, title, rating, price, "View Profile"). Confirmed this is a real,
working feature — it's not decorative.

### His card layout

Listing cards: gradient avatar initial, provider name + verified check, location; price top-right; title +
2-line description; footer row (rating + review count, an "Escrow" trust badge, a Message icon button, a Book
button). Consistent across Dashboard's featured list and the Browse feed, just denser on Browse.

### His copy — preserved verbatim where it survives

Section headers ("Verified Local Pros", "Find trusted help for your home", "Popular Categories", "Nearby
Service Map", "Top-Rated Providers", "Doorstep Escrow Guarantee", "My Bookings & Activity", etc.), button
labels ("Continue to Checkout", "Authorize $X in Escrow", "Submit & Release Escrow"), the escrow-guarantee
paragraph, and all 6 safety-report category descriptions carry over unchanged.

### Data & persistence behavior

- `localStorage` keys per persona: `doorstep_bookings_{id}`, `doorstep_messages_{id}`, `doorstep_reports_{id}`,
  plus `doorstep_active_persona`. **Superseded by `shared/demo-store.js`** — already true as of Phase 3 for
  bookings (mirrored via `window.Doorstep.recordBooking`); messages and reports are customer-app-local
  concepts with no equivalent shared collection, so they stay as-is under his own keys unless told otherwise.
- Booking object shape (`id`, `listing_id`, `provider_id`, `title`, `provider_name`, `timeSlot`, `address`,
  `total`, `status`, `escrowStatus`, `rating`, `review`) is his own display shape, separate from the
  canonical `shared/demo-store.js` shape his booking writes already also produce (Phase 3).
- Two seeded demo personas (`cust_00001`/Maya Lin, `cust_00002`) with hand-authored sample bookings, and a
  third (`cust_00004`) seeded with a sample safety report. **These IDs don't exist in real `DB_CUSTOMERS`**
  (see Known bug below) — the seeded content itself (the sample booking/report shape and copy) is worth
  keeping as realistic demo seed data, attached to real customer ids instead.

### Known pre-existing bug — will be fixed in the port, not carried forward

`state.currentCustomerId` defaults to `'cust_00001'`, which matches no record in the real `DB_CUSTOMERS`
(actual ids are `cst_001`…`cst_020`) — flagged at Gate 0 and worked around (not fixed) in Phase 3. Per the
non-negotiable rule ("when a ported product's code disagrees with local mock-data, change the code, not the
data"), the port fixes this outright: default persona becomes `cst_001` (Hannah Breece) — the same customer
the shared switcher already hardcodes for the site-wide Customer role, so the two stay in sync rather than
showing two different "the customer" identities depending on which switcher you used.

### Decision needed — the AI Concierge chatbot cannot be ported as specified

This is the one item that doesn't fit the checklist cleanly, flagged rather than quietly dropped or quietly
kept:

- The floating FAB is **explicitly forbidden** by the architecture ("Chat is a search modality... Never a
  floating bubble") and Phase 5 itself calls for a bottom tab bar with **Ask stubbed this phase** — real
  content arrives in Phase 6 when Product C is fused in.
- `chatbot-engine.js` is Abheeshu's **own** keyword-matching parser (`parseJob`, `matchListings`,
  `detectLocalIntent`) — a real, independent piece of engineering, separate from Product C's Gemini-backed
  one. It is not a stub; it's a working feature.
- Given both constraints together, the FAB and its modal are removed this phase (replaced by the Ask tab,
  stubbed) — I'm not aware of a reading where they survive, since "never a floating bubble" is unconditional.
  What I want confirmed rather than assume: **does `chatbot-engine.js` itself get deleted, or kept in the
  repo unused** (in case Phase 6 wants to borrow from its parsing logic, or simply so Abheeshu's own working
  code isn't erased)? I'd lean toward keeping the file, unused, with a comment explaining why — deleting a
  teammate's working feature outright feels like exactly the kind of unilateral call the preservation rules
  ask me not to make silently.

### Decision needed — his own persona switcher vs. the shared switcher

Flagged at Gate 0/Phase 3, resolving now: B's persona switcher (all 20 customers, switch who you're "logged
in" as) is **not the same feature** as `shared/switcher.js`'s Customer/Provider/Admin role switcher — one
picks *which customer*, the other picks *which role*. They don't conflict and both have a real purpose. **I'm
porting his persona switcher as its own feature**, reading through `customer/src/data/`. Its `localStorage`
key stays separate from the shared switcher's (`doorstep_active_persona` vs. `doorstep:persona`) since they
answer different questions.

### What I am *not* treating as in-scope for this checklist

The floating chatbot FAB and modal (see above — replaced by the stubbed Ask tab, not ported), and full
responsiveness up to a 34" monitor (a real, separate, substantial piece of new design work this phase also
requires per your earlier decision — not a "port" item since his original has zero responsive behavior above
phone width to port *from*).

---

## Phase 5 — Port Product B: build report and parity walk-through

Built as React 19 under `customer/`, per the checklist above. **His original vanilla files are not deleted —
`customer/legacy/` holds `app.js`, `data.js`, `index.html`, and `chatbot-engine.js` exactly as he wrote them**,
moved with `git mv` so `git blame` still attributes them to him. The port sits alongside in `customer/src/`.

### Parity checklist, item by item

**Screens — all 7 ported, all functional:**

| Screen | Status | Component |
|---|---|---|
| Dashboard | ✅ | `DashboardScreen.jsx` |
| Feed / Browse | ✅ | `ListingFeed.jsx` |
| Profile (listing) | ✅ | `ListingProfileScreen.jsx` |
| Schedule | ✅ | `ScheduleScreen.jsx` |
| Checkout | ✅ | `CheckoutScreen.jsx` |
| Confirmation | ✅ | `ConfirmationScreen.jsx` |
| My Bookings & Activity | ✅ | `BookingsScreen.jsx` |

**Modals — 5 of 6 ported; 1 flagged (below), not silently dropped:**

| Modal | Status | Component |
|---|---|---|
| Provider direct chat | ✅ — quick chips, simulated typing, keyword auto-reply all intact | `ProviderChatModal.jsx` |
| Trust & Safety report | ✅ — all 6 categories, verbatim copy, **now actually reaches Admin's queue** (see below) | `ReportModal.jsx` |
| Persona switcher | ✅ — kept as its own feature, see Gate 0/3 resolution above | `PersonaModal.jsx` |
| Filter & Sort | ✅ — category, price slider, rating, sort, all identical | `FilterPanel.jsx` |
| Rating & Review | ✅ | `ReviewModal.jsx` |
| AI Concierge chatbot | ❌ **Not ported — decided at the top of this phase.** Replaced by the stubbed Ask tab. `chatbot-engine.js` itself is untouched in `legacy/`, per your decision to delete rather than keep an unused copy in the active tree — the *file* still exists (git history preserved), it's just not wired into anything. | — |

**Global chrome:**

| Item | Status |
|---|---|
| Header (logo, persona chip, bookings badge) | ✅ ported exactly, `Header.jsx` |
| Floating chatbot FAB | ❌ removed — forbidden by the architecture; see above |
| Toast | ✅ same 3.2s auto-dismiss behavior |
| **Bottom tab bar (Browse · Ask · Bookings · Profile)** | ✅ new this phase, `TabBar.jsx` — Ask is a stub, the other three are fully real |

**Filters — every one, unchanged:** category (5), free-text search (same 5 fields: title, description,
provider name, provider bio, location), max price slider, minimum rating, sort (5 options). Verified by
walking the actual filter panel in the running app, not just reading the code.

**Map:** the live Leaflet map is real, not decorative — `ServiceMap.jsx` renders one marker per active
listing at the provider's real coordinates with a popup, same as his original, using the same CDN `L` global
(no new npm dependency).

**Card layout:** `ListingCard.jsx` is the one component both Dashboard's featured list and Browse's feed
render — matching his original design, where the two screens shared the same visual card at two densities.

**Copy:** verified against the running app screen by screen — section headers, button labels, the escrow
guarantee paragraph, all 6 safety-report category descriptions, all carry over exactly.

### The known pre-existing bug — fixed, not carried forward

`cust_00001` → `cst_001` (Hannah Breece), as flagged in the checklist. Verified in the running app: opening
fresh, the header shows "Hannah" and the persona modal correctly marks `cst_001` as "Active" — not a
fallback "Maya Lin" object that matches nothing in mock-data.

### A real cross-app connection made to actually work, not just documented

His UI already said "Assigned to Product D Moderation" on every filed report — Phase 5 is what makes that
literally true. A report filed through `ReportModal.jsx` now also writes to the shared store in canonical
shape (`lib/reports.js`), mapped through the 6-reason enum documented in the parity checklist. **Verified
end-to-end**, not assumed: filed a report through the real UI, Admin's "Needs review" metric went 4 → 5 in
the same run.

### Bugs found and fixed during build (all caught before the final verification pass, not left in)

1. **Navigation bug**: `goBrowse()`'s slot-reset logic cleared `selectedSlot` on the transition to
   `"checkout"` (it only preserved the value for `"profile"`/`"schedule"`), so every booking was written with
   a null `scheduled_slot`. This didn't break the *customer* app's own display (which never re-reads that
   field), but it crashed **Provider** — `selectors.js:52` does `booking.scheduled_slot.slice(0, 10)` with no
   null guard. Caught by the cross-app verification step, not by testing the customer app in isolation, which
   is exactly why that step exists. Fixed by only clearing the slot on a genuinely fresh browsing context
   (`"dashboard"`/`"feed"`), not on every non-profile/schedule view.
2. **CSS specificity bug**: a generic `input[type="text"]` base-style rule and three component-specific input
   rules (search bar, feed search, checkout address field) had identical selector specificity; the generic
   rule happened to be declared later in the file, so it silently won the cascade and collapsed the
   icon-clearance padding on all three inputs back to the generic value — the search icon rendered on top of
   the placeholder text. Fixed by moving the generic rule earlier, so component-specific overrides reliably
   win by source order rather than accidentally by specificity.
3. **A `useCallback` used incorrectly** (immediately invoked every render, which doesn't memoize anything —
   the same as not using it) — caught in my own review before it was ever run, replaced with `useMemo`.
4. **A confused conditional** in `ScheduleScreen`'s continue button (checking the setter function instead of
   the selected value) — also caught in review before running.

### Responsive layout — the explicit Phase 5 requirement

Verified at 390px (phone), 768px (tablet), 1920px, and 3440px (34"). Mobile is the base layout — same
single-column, bottom-tab experience his original had, just no longer artificially boxed into a fixed-height
phone frame (his original's body was `h-screen overflow-hidden`, the exact "phone in a void" pattern flagged
back at Gate 0). At 720px the category grid goes to 4 columns and the listing feed becomes 2 columns; at
1080px the Dashboard becomes a two-column layout (map and featured providers side by side) and the feed
becomes 3 columns. Screenshotted at all four widths — no horizontal scroll, no clipped controls, no empty
void at 34".

**One structural fix this required, caught before it shipped**: the app was originally built with `.app-main`
as its own internal `overflow-y: auto` scroll region — exactly the same "phone app in a box" pattern his
vanilla build had, just recreated. That breaks `position: sticky` on the header and tab bar the moment content
exceeds one viewport, and is generally wrong for desktop use. Fixed by making the whole page scroll normally
(matching Admin's and Provider's own pattern) — the header and tab bar stay pinned via ordinary `position:
sticky`, not a nested scroll container.

### Icon set

Every Font Awesome icon replaced with the shared inline-SVG convention (`Icon.jsx`, ~35 icons) — the
convergence Phase 2 said would happen here. No new dependency.

### Verification

- **Full user journey**, run twice against the final build with zero page errors both times: Dashboard →
  category → Browse → Filter → listing Profile → slot selection → Checkout → Authorize → Confirmation → My
  Bookings (new booking visible, correctly ordered above the seeded one) → Profile tab → Ask stub → Provider
  chat (seeded thread renders, a live message gets a correct keyword-matched reply) → Report modal (files
  correctly, appears in Bookings' Trust & Safety section) → Persona switcher (all 20 personas listed, current
  one marked Active).
- **Cross-app, through the real UI, not synthetic store calls**: booked → Provider's incoming count 3 → 4;
  filed a report → Admin's needs-review 4 → 5. Both zero errors.
- **Reset**, through the switcher: verified the *values* revert to the pristine seed (not just that
  localStorage keys exist) — bookings returned to exactly `["BK-49201"]`, the single seeded record.
- **No regression in the three untouched products**: Provider, Admin, Chat, and the landing page are all
  **byte-identical** to their Phase 3/4 screenshots (verified with matched capture methodology after
  discovering my first comparison attempt had a methodology mismatch, not a real difference — corrected
  before reporting it here).
- **Tests**: `mock-data/validate.py` 104/104, `admin/test.mjs` passes, chat **49/49 booking, 20/25 parseJob**
  — unchanged.
- **No stray data access**: `customer/src/data/loadData.js` is the only file in `customer/src/` that
  references `mock-data`; the two other hits are comments.
- `build.sh` updated — `customer/` is now built like `chat/`/`provider/` (it stopped being a static
  copy-through the moment it became a real Vite app).

### Left alone, as instructed

- His floating chatbot and `chatbot-engine.js` — not ported, not deleted, explained above.
- His persona switcher's own `localStorage` keys (`doorstep_bookings_*`, `doorstep_messages_*`,
  `doorstep_reports_*`) — messages have no shared-collection equivalent, so they stay app-local exactly as
  designed; bookings and reports also write to the shared store, as documented in Phase 3/5.

---

## Phase 6 — Fuse Product C into the customer app

Product C is now the **Ask** tab. Every file moved with `git mv`, so `git blame` still attributes the
matching, parsing, and booking logic to Jian Ting Li.

### What moved where

| From | To | Note |
|---|---|---|
| `chat/src/App.jsx` | `customer/src/components/AskScreen.jsx` | shell stripped, logic untouched |
| `chat/src/components/*` (12 files) | `customer/src/components/` | flat, so their `../lib/` and `../data/` imports stayed valid |
| `chat/src/lib/*` (6 files + `__tests__/`) | `customer/src/lib/` | **the test file needed zero edits** — see below |
| `chat/src/data/listings.js` | `customer/src/data/listings.js` | selector layer |
| `chat/src/styles.css` | `customer/src/ask.css` | scoped, see below |

**Deleted rather than moved:** `chat/src/components/ListingCard.jsx` (unified — see below),
`chat/src/components/HeaderActions.jsx` and `chat/src/lib/theme.js` (Ask is a tab now; the customer app's
header and the shared switcher own branding and theme).

**`chat/` still exists** and holds `api/chat.js` — the root `api/chat.js` re-export is unchanged, and the
Gemini key stays server-side, never `VITE_`-prefixed. `chat/` is simply no longer a build target.

### The test file needed zero edits

Predicted at the pre-phase check and it held: `matching.test.js` imports by relative path (`../parseJob.js`,
`../../data/loadData.js`). Moving `chat/src/lib/` → `customer/src/lib/` and `chat/src/data/listings.js` →
`customer/src/data/listings.js` kept every one of those paths correct. The only thing required was adding
`getExampleQueries` and `getNeighborhoods` to `customer/src/data/loadData.js` — purely additive.

**Result: booking 49/49, parseJob 20/25 — byte-identical to every gate since Phase 0, with the test file
untouched.** No "stop and ask" was needed.

### One ListingCard, rendered by Browse and Ask

`customer/src/components/ListingCard.jsx` is now the single card, with a `variant` prop:

- `compact` — Dashboard's Top-Rated strip
- `dense` — Browse feed
- `ask` — Ask results, adding the collapsed → expanded → booking → booked progression Product C owned

The **head markup is literally shared** across all three — same avatar, provider name, verified check,
location, price, title, rating. A chatbot result and a browse result are identical because they are the same
JSX, not because two components were tuned to match.

### Filter hand-off, both directions — `customer/src/lib/filterBridge.js`

The two screens describe a search differently and neither is wrong for its own context:

```
Browse  { category, searchQuery, maxPrice, minRating, sortBy }
Ask     { service_types[], max_price, neighborhood, urgency }
```

Ask's shape is the canonical one — strictly more expressive (N codes rather than one category, plus
neighborhood and urgency). `filterBridge.js` converts both ways, and **documents its lossiness honestly**:

- **Browse → Ask** (`toAskFilters` + `seedPromptFromBrowse`) loses nothing meaningful. `sortBy`/`minRating`
  have no Ask equivalent, but Ask ranks by relevance anyway. A price ceiling only carries if the customer
  actually moved it off the default, so Ask doesn't open pre-constrained for no reason.
- **Ask → Browse** (`toBrowseFilters`) genuinely cannot carry `neighborhood` or `urgency` (Browse has no
  control for either) and collapses N service codes to the one category containing the first. The original
  sentence carries into `searchQuery` so the text isn't silently dropped.

**Verified both directions in the running app:** Browse(Cleaning) → "Describe it instead" → Ask opened
pre-seeded with *"I need help with cleaning"* and returned 5 results; "See more like this" → Browse with the
Cleaning chip selected and the sentence in the search box.

### One bookings list

A booking made in Ask now runs the same path as one made from Browse — the customer app's own list plus the
canonical record via `shared/demo-store.js`. Confirmed in the walkthrough: after booking once from each,
**Upcoming Jobs (3)** (the seeded booking plus both new ones) and **provider incoming 3 → 5**.

### `/chat` redirects, does not 404

`chat/redirect.html` → `dist/chat/index.html`, redirecting to `/customer/?tab=ask` (both a `<meta refresh>`
and `location.replace`, so it works with or without JS). `App.jsx` reads `?tab=` on load and opens the right
tab. Verified: `/chat/` → `200` → lands on `/customer/?tab=ask` with the **Ask** tab active.

### Scoping Product C's stylesheet

`chat/src/styles.css` had **12 class-name collisions** with the customer app. Rather than rename anything in
Product C's markup, every selector was mechanically prefixed with `.ask-screen` into `customer/src/ask.css`.
Rules for the shell Ask no longer renders (`.app-shell`, `.app-header`, `.brand`, `.header-button`, the
clear-chat confirm) and the global resets were dropped rather than scoped, since the customer app owns those.

One real layout correction on top: Product C's composer was `position: fixed; bottom: 14px` — correct when it
owned the viewport, wrong now that the tab bar owns the bottom. Lifted clear of the tab bar, with the
thread's bottom padding grown to match. Caught by screenshot, not by reading the CSS.

---

## Consistency checklist (Gate 6)

| # | Item | Result |
|---|---|---|
| 1 | Every color/size/space/radius resolves to a token | **PASS with two documented exceptions** |
| 2 | One icon set, no leftover Font Awesome | **PASS** |
| 3 | Buttons, inputs, badges, loading/empty/error identical everywhere | **PARTIAL FAIL** |
| 4 | Dark mode in all four, survives navigation | **PASS** |
| 5 | No product reads mock-data directly | **PASS** |
| 6 | Usable at 390px, no horizontal scroll | **PASS — after fixing two real bugs** |
| 7 | Same word for the same concept | **PASS with one minor note** |

**1 — Tokens.** Fixed this phase: removed 5 redundant `--surface-overlay` literal fallbacks, tokenized the
Leaflet popup's 4 colors, and tokenized **all 11** remaining `rgba()`/hex literals in Product C's stylesheet
via `color-mix()`. `ask.css` now contains **zero** raw color literals. Two deliberate exceptions remain, both
documented in-file: the **4 category-icon colors and the avatar gradient** in `customer/`, and Product A's
**8-color category system** (Phase 4). Both exist so categories stay distinguishable at a glance, which one
shared accent cannot do — that is wayfinding, not a missing token.

**2 — Icons.** Zero Font Awesome outside `customer/legacy/` (the archived original, which isn't built or
served). All four products use the shared inline-SVG convention.

**3 — Interaction patterns. This one genuinely fails, and I'm not going to dress it up.**
`shared/patterns.css` was written in Phase 2 and **is still imported by nothing**. Each product defines its
own button primitive (customer 18 rules, provider 15, admin 6) and its own empty-state markup. The saving
grace is that they all consume the same tokens, so they *look* consistent — same accent, radius, type scale —
but the implementations are three parallel definitions, not one shared one. Wiring `patterns.css` in now
would mean touching Provider's and Admin's CSS again late in the phase for a mostly-cosmetic gain, so I've
left it and flagged it. **This is the one checklist item I'd fix given more time.**

**4 — Dark mode.** Verified in all four with the theme persisted through navigation: `data-theme="dark"`
survives `/customer/` → `/provider/` → `/admin/`, and the Ask tab renders correctly in dark (Product C's glass
aesthetic intact). *Note for the record:* customer's `body` reports `backgroundColor: rgba(0,0,0,0)` because
its background is a **gradient** (`background-image`), not a flat color — I checked `backgroundImage` before
reporting this as a bug, and it is not one.

**5 — Data access.** The four data modules are the only real readers. Every other `mock-data` hit across
`customer/src`, `provider/src`, `admin/`, and `shared/` is a **comment** — verified file by file by grepping
for actual `import`/`fetch`/`require` rather than trusting a filename match.

**6 — 390px.** Now PASS on all four (`scrollWidth === clientWidth === 390`). This required fixing **two real
bugs the check surfaced**:
- **Mine.** `.listing-card-compact` was still laid out as a flex *row*, but unifying the card gave every
  variant a stacked head — so the trailing "Chat" chip was pushed to `right: 433px`. Fixed by making compact
  a column and letting the identity block shrink.
- **Pre-existing in Product A.** `.dashboard-grid` collapses to `1fr` at ≤960px, but a grid item defaults to
  `min-width: auto`, so a plain `1fr` track refuses to shrink below its content's min-content width — panels
  measured 401px inside a 358px shell. Fixed with `minmax(0, 1fr)`. Confirmed pre-existing by diffing against
  the `gate-1` commit: the `minmax(330px, …)` rule is identical there, so Phase 4 did not introduce it. The
  fix is substrate-only and **provably changed nothing at desktop width** — Provider's full-page screenshot is
  byte-identical to Phase 4.
- Admin scrolls its queue inside its own container, which the checklist explicitly allows.

**7 — Vocabulary.** "Booking" is used consistently (466 occurrences); **zero** uses of "Trips" or
"Reservation". "Job" is used for *the work* ("Upcoming Jobs", "Job completed", "Job area") and "Booking" for
*the record* — a real distinction, applied consistently, not a mismatch. One minor note: `ScheduleScreen`
says "Available **Appointment** Slots" (Abheeshu's original copy, preserved verbatim). It refers to the slot
rather than the booking record, so it isn't strictly a conflict — but it is the one place a third word
appears. **Not rewriting a teammate's copy without asking.**

### Gate 6 walkthrough — every step verified in the running build

```
1. Cold entry     /customer/ /provider/ /admin/  → all render, switcher present on each
2. /chat          → 200 → /customer/?tab=ask, Ask tab active (no 404)
3. Persona switch → 3 personas offered from all three products
   BASELINE        provider incoming=3 · admin review=4 audit=9
4. Book from Browse → ok
5. Book from Ask    → ok   (2 canonical bookings written, source=customer_app)
6. Both under Bookings → Upcoming Jobs (3)  [seed + Browse + Ask]
7. Provider           → incoming 3 → 5
8. Report from Ask/Browse → admin review 4 → 5
9. Reset              → overlay null; provider 3, admin 4/9 — all back to pristine
   page errors: none
```

### Tests

`mock-data/validate.py` 104/104 · `admin/test.mjs` passes · matching **49/49 booking, 20/25 parseJob** —
unchanged from Phase 0, test file never edited.

### Secrets

Clean. `GEMINI_API_KEY` is read only via `process.env` in `chat/api/chat.js` and the two dev-only Vite
plugins. No `VITE_`-prefixed variable exists anywhere (every `VITE_` hit is a warning comment). Only
`.env.example` is tracked.

One real gap found and fixed: with dev now running from `customer/`, `loadEnv` would no longer have found the
key in `chat/.env.local`. The dev plugin now checks `customer/`, the repo root, and `chat/` — so an existing
local key keeps working without anyone moving a file.

### Left alone

- Product C's matching, parsing, intent, and booking logic — moved, not rewritten.
- `shared/patterns.css` — still unconsumed (item 3 above).
- Abheeshu's "Appointment Slots" copy.
- `customer/legacy/` — his original vanilla build, archived and unbuilt.
