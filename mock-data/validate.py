#!/usr/bin/env python3
"""Integrity checks for the Doorstep shared mock dataset.

Run from anywhere:  python3 mock-data/validate.py
Exits non-zero if any invariant is broken. Add new checks here whenever the
schema changes, so all four products can trust the contract.
"""
import json, os, sys, collections

D = os.path.dirname(os.path.abspath(__file__))
def L(n):
    with open(os.path.join(D, n), encoding="utf-8") as f:
        return json.load(f)

meta = L("_meta.json"); nb = L("neighborhoods.json"); st = L("service-types.json")
pr = L("providers.json"); cu = L("customers.json"); li = L("listings.json")
bk = L("bookings.json"); rv = L("reviews.json"); rp = L("reports.json")
mo = L("moderation-actions.json"); eq = L("example-queries.json")

fails, notes = [], []
def chk(cond, msg):
    (notes if cond else fails).append(("PASS  " if cond else "FAIL  ") + msg)

REF = meta["reference_date"]
CODES = {s["code"] for s in st}
NB = {n["name"] for n in nb}
PID = {p["provider_id"] for p in pr}; CID = {c["customer_id"] for c in cu}
LID = {l["listing_id"] for l in li}; BID = {b["booking_id"] for b in bk}
RID = {r["report_id"] for r in rp}
lby = {l["listing_id"]: l for l in li}; bby = {b["booking_id"]: b for b in bk}
rby = {r["report_id"]: r for r in rp}

# ---- shape ----------------------------------------------------------------
chk(isinstance(meta, dict), "_meta.json is a single object")
for k in ("reference_date", "city", "timezone", "currency",
          "commission_rate", "version", "generated_at"):
    chk(k in meta, "_meta has %s" % k)
chk(meta["commission_rate"] == 0.15, "commission_rate is 0.15")
for name, arr, n in [("service-types", st, 8), ("neighborhoods", nb, 15), ("providers", pr, 15),
                     ("customers", cu, 20), ("listings", li, 40), ("bookings", bk, 92),
                     ("reviews", rv, 52), ("reports", rp, 12), ("moderation-actions", mo, 9),
                     ("example-queries", eq, 25)]:
    chk(isinstance(arr, list) and len(arr) == n, "%s count == %d (got %d)" % (name, n, len(arr)))

def ids(arr, key, prefix, n):
    chk(sorted(x[key] for x in arr) == ["%s_%03d" % (prefix, i) for i in range(1, n + 1)],
        "%s ids are contiguous %s_001..%03d" % (key, prefix, n))
ids(pr, "provider_id", "prv", 15); ids(cu, "customer_id", "cst", 20)
ids(li, "listing_id", "lst", 40); ids(bk, "booking_id", "bkg", 92)
ids(rv, "review_id", "rev", 52); ids(rp, "report_id", "rpt", 12)
ids(mo, "action_id", "mod", 9);  ids(eq, "query_id", "qry", 25)

# ---- foreign keys ---------------------------------------------------------
chk(all(l["provider_id"] in PID for l in li), "listing.provider_id resolves")
bad = [b["booking_id"] for b in bk
       if b["listing_id"] not in LID or b["customer_id"] not in CID or b["provider_id"] not in PID]
chk(not bad, "booking FKs resolve %s" % bad[:5])
bad = [b["booking_id"] for b in bk if b["provider_id"] != lby[b["listing_id"]]["provider_id"]]
chk(not bad, "booking.provider_id == listing's provider %s" % bad[:5])
bad = [r["review_id"] for r in rv if r["booking_id"] not in BID]
chk(not bad, "review.booking_id resolves %s" % bad[:5])
bad = [r["review_id"] for r in rv if bby[r["booking_id"]]["status"] != "completed"]
chk(not bad, "every review targets a completed booking %s" % bad[:5])
bad = [r["review_id"] for r in rv
       if r["listing_id"] != bby[r["booking_id"]]["listing_id"]
       or r["customer_id"] != bby[r["booking_id"]]["customer_id"]]
chk(not bad, "review listing/customer mirror their booking %s" % bad[:5])
dupes = [b for b, c in collections.Counter(r["booking_id"] for r in rv).items() if c > 1]
chk(not dupes, "review.booking_id is UNIQUE - one review per booking %s" % dupes[:5])
bad = [r["report_id"] for r in rp
       if r["listing_id"] not in LID or r["reporter_id"] not in CID
       or (r["booking_id"] is not None and r["booking_id"] not in BID)]
chk(not bad, "report FKs resolve %s" % bad[:5])
bad = [r["report_id"] for r in rp
       if r["booking_id"] and bby[r["booking_id"]]["listing_id"] != r["listing_id"]]
chk(not bad, "report.booking_id is a booking on the reported listing %s" % bad[:5])
bad = [m["action_id"] for m in mo
       if m["report_id"] not in RID or m["listing_id"] != rby[m["report_id"]]["listing_id"]]
chk(not bad, "moderation FKs resolve and listing matches its report %s" % bad[:5])

# ---- vocabulary -----------------------------------------------------------
chk(not sorted({s for l in li for s in l["service_type"]} - CODES), "all service_type values are known codes")
chk(all(isinstance(l["service_type"], list) and l["service_type"] for l in li),
    "service_type is always a non-empty array")
bad = [l["listing_id"] for l in li
       if "minimum_quantity" in l
       and (l["price_unit"] != "hourly" or l["minimum_quantity"] < 1)]
chk(not bad, "minimum_quantity is positive and only used for hourly listings %s" % bad[:5])
cnt = collections.Counter(s for l in li for s in l["service_type"])
acnt = collections.Counter(s for l in li if l["listing_status"] == "active" for s in l["service_type"])
chk(all(cnt[s] >= 4 for s in CODES), "every code has >=4 listings %s" % dict(cnt))
chk(all(acnt[s] >= 4 for s in CODES), "every code has >=4 ACTIVE listings %s" % dict(acnt))
multi = sum(1 for l in li if len(l["service_type"]) >= 2)
chk(multi >= 5, "multi-code listings >=5 (%d)" % multi)
bad = sorted({p["location"] for p in pr} - NB) + sorted({c["neighborhood"] for c in cu} - NB) \
    + sorted({l["provider_location"] for l in li} - NB)
chk(not bad, "every neighborhood string resolves to neighborhoods.json %s" % bad)

# ---- timezone offsets ------------------------------------------------------
def want_offset(day):
    # US Pacific DST in 2026 runs 08 Mar -> 01 Nov
    return "-07:00" if "2026-03-08" <= day < "2026-11-01" else "-08:00"
stamps = []
for b in bk:
    stamps += [(b["booking_id"], b["scheduled_slot"]), (b["booking_id"], b["created_at"])]
stamps += [(r["review_id"], r["created_at"]) for r in rv]
stamps += [(r["report_id"], r["created_at"]) for r in rp]
stamps += [(m["action_id"], m["created_at"]) for m in mo]
stamps += [(l["listing_id"], a) for l in li for a in l["availability"]]
bad = [(i, t) for (i, t) in stamps if t[-6:] != want_offset(t[:10])]
chk(not bad, "every datetime carries the correct Pacific offset for its date %s" % bad[:3])
chk(all(len(t) == 25 for (_, t) in stamps), "every datetime is a full ISO 8601 string with an offset")

# ---- geo ------------------------------------------------------------------
def inbox(o):
    return 45.40 <= o["latitude"] <= 45.65 and -122.90 <= o["longitude"] <= -122.40
bad = [o.get("provider_id") or o.get("customer_id") or o.get("listing_id") or o.get("name")
       for o in list(pr) + list(cu) + list(li) + list(nb) if not inbox(o)]
chk(not bad, "every coordinate sits inside the Portland bounding box %s" % bad[:5])
chk(all("latitude" in o and "longitude" in o for o in list(pr) + list(cu) + list(li)),
    "providers, customers and listings all carry coordinates")

# ---- derived aggregates ---------------------------------------------------
lrev = collections.defaultdict(list)
for r in rv:
    lrev[r["listing_id"]].append(r["rating"])
bad = [l["listing_id"] for l in li if l["review_count"] != len(lrev.get(l["listing_id"], []))]
chk(not bad, "listing.review_count matches its reviews %s" % bad[:5])
bad = []
for l in li:
    rs = lrev.get(l["listing_id"], [])
    want = round(sum(rs) / len(rs), 1) if rs else None
    if l["rating"] != want:
        bad.append(l["listing_id"])
chk(not bad, "listing.rating == mean of its reviews (null when unreviewed) %s" % bad[:5])
prev_ = collections.defaultdict(list)
for r in rv:
    prev_[lby[r["listing_id"]]["provider_id"]].append(r["rating"])
bad = [(p["provider_id"], p["review_count"], len(prev_[p["provider_id"]]))
       for p in pr if p["review_count"] != len(prev_[p["provider_id"]])]
chk(not bad, "provider.review_count matches reviews on their listings %s" % bad[:5])
bad = []
for p in pr:
    rs = prev_[p["provider_id"]]
    want = round(sum(rs) / len(rs), 1) if rs else None
    if p["rating"] != want:
        bad.append(p["provider_id"])
chk(not bad, "provider.rating == mean of their reviews %s" % bad[:5])
chk(all(p["rating"] is None or 1.0 <= p["rating"] <= 5.0 for p in pr), "provider ratings within 1.0-5.0")

# ---- availability ---------------------------------------------------------
bad = [(l["listing_id"], a) for l in li for a in l["availability"] if not (a[:10] > REF)]
chk(not bad, "every availability datetime is after reference_date %s" % bad[:3])
bad = [(l["listing_id"], a) for l in li for a in l["availability"] if a[:10] > "2026-10-18"]
chk(not bad, "every availability datetime is within 60 days of reference_date %s" % bad[:3])
chk(all(3 <= len(l["availability"]) <= 8 for l in li), "3-8 availability slots per listing")
chk(all(len(set(l["availability"])) == len(l["availability"]) for l in li), "no duplicate slots")
clash = [b["booking_id"] for b in bk
         if b["status"] in ("pending", "confirmed")
         and b["scheduled_slot"] in lby[b["listing_id"]]["availability"]]
chk(not clash, "no pending/confirmed booking sits on a slot still advertised as open %s" % clash[:5])
freed = [b["booking_id"] for b in bk
         if b["status"] == "cancelled" and b["scheduled_slot"][:10] > REF
         and b["scheduled_slot"] not in lby[b["listing_id"]]["availability"]]
chk(not freed, "cancelled future bookings release their slot back to availability %s" % freed[:5])

# ---- bookings -------------------------------------------------------------
bad = [b["booking_id"] for b in bk if b["created_at"] >= b["scheduled_slot"]]
chk(not bad, "booking created_at precedes scheduled_slot %s" % bad[:5])
bad = [b["booking_id"] for b in bk if round(b["price_paid"] * 0.15, 2) != b["commission_amount"]]
chk(not bad, "commission == price_paid * 0.15 %s" % bad[:5])
bad = [b["booking_id"] for b in bk if b["price_paid"] != lby[b["listing_id"]]["price"] * b["quantity"]]
chk(not bad, "price_paid == listing price * quantity %s" % bad[:5])
bad = [b["booking_id"] for b in bk
       if (lby[b["listing_id"]]["price_unit"] == "flat") != (b["quantity_unit"] == "job")]
chk(not bad, "quantity_unit agrees with the listing's price_unit %s" % bad[:5])
bad = [b["booking_id"] for b in bk
       if b["quantity"] < lby[b["listing_id"]].get("minimum_quantity", 1)]
chk(not bad, "booking quantity meets the listing minimum %s" % bad[:5])
sig = {c["customer_id"]: c["signup_date"] for c in cu}
bad = [b["booking_id"] for b in bk if b["created_at"][:10] < sig[b["customer_id"]]]
chk(not bad, "no booking predates its customer's signup_date %s" % bad[:5])
mem = {p["provider_id"]: p["member_since"] for p in pr}
bad = [b["booking_id"] for b in bk if b["scheduled_slot"][:10] < mem[b["provider_id"]]]
chk(not bad, "no booking predates its provider's member_since %s" % bad[:5])
sc = collections.Counter(b["status"] for b in bk)
chk(set(sc) == {"pending", "confirmed", "completed", "cancelled"}
    and sc["completed"] == max(sc.values()), "all 4 booking statuses, completed heaviest %s" % dict(sc))
bad = [b["booking_id"] for b in bk
       if b["status"] == "completed" and b["scheduled_slot"][:10] >= REF]
chk(not bad, "completed bookings are before reference_date %s" % bad[:5])
bad = [b["booking_id"] for b in bk
       if b["status"] in ("pending", "confirmed") and b["scheduled_slot"][:10] <= REF]
chk(not bad, "pending/confirmed bookings are after reference_date %s" % bad[:5])
chat = sum(1 for b in bk if b["source"] == "chatbot")
chk(chat >= 8, "chatbot-sourced bookings >=8 (%d)" % chat)

# ---- reviews --------------------------------------------------------------
bad = [r["review_id"] for r in rv if r["created_at"] <= bby[r["booking_id"]]["scheduled_slot"]]
chk(not bad, "review created_at is after the booking's scheduled_slot %s" % bad[:5])
bad = [r["review_id"] for r in rv if r["created_at"][:10] > REF]
chk(not bad, "no review is dated after reference_date %s" % bad[:5])
chk(all(isinstance(r["rating"], int) and 1 <= r["rating"] <= 5 for r in rv), "review ratings are ints 1-5")
low = [r for r in rv if r["rating"] <= 2]
lc = collections.Counter(r["listing_id"] for r in low)
chk(len(low) >= 6, "low (1-2 star) reviews >=6 (%d)" % len(low))
chk(3 <= len(lc) <= 4, "low reviews cluster on 3-4 listings %s" % dict(lc))

# ---- listings -------------------------------------------------------------
ls = collections.Counter(l["listing_status"] for l in li)
chk(dict(ls) == {"active": 32, "paused": 3, "suspended": 3, "draft": 1, "archived": 1},
    "listing status spread %s" % dict(ls))
prices = [l["price"] for l in li]
chk(min(prices) <= 45 and max(prices) >= 380, "price spread %d-%d" % (min(prices), max(prices)))
pu = collections.Counter(l["price_unit"] for l in li)
chk(pu["flat"] and pu["hourly"], "flat/hourly mix %s" % dict(pu))
bad = [l["listing_id"] for l in li
       if l["provider_location"] != {p["provider_id"]: p["location"] for p in pr}[l["provider_id"]]]
chk(not bad, "listing.provider_location matches its provider %s" % bad[:5])

# ---- trust & safety -------------------------------------------------------
rc = collections.Counter(r["listing_id"] for r in rp)
top = rc.most_common(1)[0]
chk(top[1] >= 3 and list(rc.values()).count(top[1]) == 1,
    "exactly one listing tops the report queue with >=3 reports %s" % dict(rc))
susp = {l["listing_id"] for l in li if l["listing_status"] == "suspended"}
acted = {m["listing_id"] for m in mo if m["action"] == "suspend"}
chk(susp <= acted, "every suspended listing has a suspend action %s" % sorted(susp - acted))
bad = [m["action_id"] for m in mo if m["created_at"] <= rby[m["report_id"]]["created_at"]]
chk(not bad, "moderation created_at is after its report's created_at %s" % bad[:5])
bad = [r["report_id"] for r in rp if not ("2026-07-05" <= r["created_at"][:10] <= REF)]
chk(not bad, "reports fall within 45 days before reference_date %s" % bad[:5])
bad = [r["report_id"] for r in rp
       if r["booking_id"] and bby[r["booking_id"]]["created_at"] >= r["created_at"]]
chk(not bad, "a cited booking was created before the report %s" % bad[:5])
bad = [r["report_id"] for r in rp
       if r["booking_id"] and r["reason"] in {"no_show", "quality", "safety", "conduct"}
       and bby[r["booking_id"]]["scheduled_slot"] >= r["created_at"]]
chk(not bad, "post-service reports are after the scheduled slot %s" % bad[:5])
bad = [r["report_id"] for r in rp
       if r["booking_id"] and bby[r["booking_id"]]["customer_id"] != r["reporter_id"]]
chk(not bad, "reporter is the customer on the cited booking %s" % bad[:5])
chk(all(m["risk_level"] in {"low", "medium", "high", "critical"} for m in mo), "risk_level enum")
chk(all(r["risk_level"] in {"low", "medium", "high", "critical"} for r in rp),
    "every report has an intake risk_level")
chk(all(r["evidence_url"] is None or r["evidence_url"].startswith("https://") for r in rp),
    "evidence_url is null or https")
bad = [r["report_id"] for r in rp
       if r["reason"] == "no_show"
       and (not r["booking_id"] or bby[r["booking_id"]]["status"] != "cancelled")]
chk(not bad, "no-show reports link to cancelled bookings %s" % bad[:5])
acted_reports = {m["report_id"] for m in mo}
bad = [r["report_id"] for r in rp
       if (r["status"] in ("resolved", "dismissed")) != (r["report_id"] in acted_reports)]
chk(not bad, "closed reports have actions and unresolved reports do not %s" % bad[:5])
warned = {p["provider_id"] for p in pr if p["provider_status"] == "warned"}
warn_acted = {lby[m["listing_id"]]["provider_id"] for m in mo if m["action"] == "warn"}
chk(warned <= warn_acted, "every warned provider has a warning action %s" % sorted(warned - warn_acted))

# ---- example queries ------------------------------------------------------
bad = [q["query_id"] for q in eq if any(i not in LID for i in q["expected_listing_ids"])]
chk(not bad, "expected_listing_ids resolve %s" % bad[:5])
bad = [q["query_id"] for q in eq
       if any(lby[i]["listing_status"] != "active" for i in q["expected_listing_ids"])]
chk(not bad, "every expected listing is active %s" % bad[:5])
bad = [q["query_id"] for q in eq if any(s not in CODES for s in q["expected_codes"])]
chk(not bad, "expected_codes are known codes %s" % bad[:5])
mt = collections.Counter(q["match_type"] for q in eq)
chk(mt["ambiguous"] >= 2 and mt["no_match"] >= 1 and mt["multi_code"] >= 2,
    "fixtures cover ambiguous/no_match/multi_code %s" % dict(mt))
bad = [q["query_id"] for q in eq if q["match_type"] in ("ambiguous", "no_match") and q["expected_listing_ids"]]
chk(not bad, "ambiguous and no_match fixtures expect no listings %s" % bad[:5])

# ---- enums ----------------------------------------------------------------
chk(all(p["provider_status"] in {"active", "warned", "suspended"} for p in pr), "provider_status enum")
chk(all(l["listing_status"] in {"draft", "active", "paused", "suspended", "archived"} for l in li), "listing_status enum")
chk(all(b["status"] in {"pending", "confirmed", "completed", "cancelled"} for b in bk), "booking status enum")
chk(all(b["source"] in {"customer_app", "chatbot"} for b in bk), "booking source enum")
chk(all(r["reason"] in {"no_show", "quality", "pricing", "safety", "misleading_listing", "conduct"} for r in rp), "report reason enum")
chk(all(r["status"] in {"open", "under_review", "resolved", "dismissed"} for r in rp), "report status enum")
chk(all(m["action"] in {"dismiss", "warn", "suspend", "resolve"} for m in mo), "moderation action enum")

print("\n".join(notes))
if fails:
    print("\n=== %d FAILURE(S) ===" % len(fails))
    print("\n".join(fails))
    sys.exit(1)
print("\nALL %d CHECKS PASSED" % len(notes))
print("\nactive listings with no bookings: %d | with no reviews: %d" % (
    sum(1 for l in li if l["listing_status"] == "active" and l["listing_id"] not in {b["listing_id"] for b in bk}),
    sum(1 for l in li if l["listing_status"] == "active" and l["review_count"] == 0)))
print("provider review_count spread:", dict(sorted(collections.Counter(p["review_count"] for p in pr).items())))
print("rating histogram:", dict(sorted(collections.Counter(r["rating"] for r in rv).items())))
print("report status:", dict(collections.Counter(r["status"] for r in rp)))
print("moderation actions:", dict(collections.Counter(m["action"] for m in mo)))
