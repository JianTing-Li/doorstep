// Doorstep shared demo store — Phase 3.
//
// The single answer to "where do writes go." The four products behave as if
// they share one database: a write in any product is visible in every other.
//
// mock-data/*.json is read-only, so this is a WRITE OVERLAY over it:
//   - pristine data comes from each product's own data module (build-time
//     import for chat/ and provider/, runtime fetch for admin/, a generated
//     data.js for customer/) — this file never loads mock-data itself
//   - the overlay lives in localStorage, shared by every product on the origin
//   - mergeCollection() applies the overlay to a pristine array and returns
//     the result; that merged array is what products actually render
//
// One flat store, not per-persona: everything written is visible to everyone.
//
// Plain JS, framework-agnostic — it runs inside React 18 (provider/),
// React 19 (chat/), and vanilla ES modules (admin/, customer/).

const STORE_KEY = "doorstep:demo:v1";

// Pre-Phase-3 per-product storage that "Reset demo data" must also clear, or
// a reset would leave stale state behind in the products that had their own
// layer before this store existed. Product D wrote its moderation decisions
// under a fixed key; Product B writes per-customer keys, so those are matched
// by prefix.
const LEGACY_KEYS = ["doorstep-product-d-demo-v1"];
const LEGACY_KEY_PREFIXES = ["doorstep_bookings_", "doorstep_messages_", "doorstep_reports_"];

// The id field for every collection the overlay can touch. Anything not
// listed here cannot be written — a typo'd collection name throws rather
// than silently writing an overlay nothing will ever read back.
const ID_FIELDS = {
  listings: "listing_id",
  bookings: "booking_id",
  reports: "report_id",
  "moderation-actions": "action_id",
  reviews: "review_id",
  providers: "provider_id",
  customers: "customer_id",
};

// chat/'s test suite runs in Node, where localStorage does not exist. Rather
// than let that throw (or force every caller to guard), fall back to an
// in-memory shim: tests then see pristine mock-data, which is what they
// assert against anyway.
const memoryShim = new Map();
const memoryStorage = {
  getItem: (k) => (memoryShim.has(k) ? memoryShim.get(k) : null),
  setItem: (k, v) => memoryShim.set(k, String(v)),
  removeItem: (k) => memoryShim.delete(k),
  key: (i) => Array.from(memoryShim.keys())[i] ?? null,
  get length() {
    return memoryShim.size;
  },
};

function storage() {
  try {
    if (typeof localStorage === "undefined") return memoryStorage;
    // Safari private mode allows the property but throws on write.
    const probe = "__doorstep_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return memoryStorage;
  }
}

function idFieldFor(collection) {
  const field = ID_FIELDS[collection];
  if (!field) {
    throw new Error(
      `demo-store: unknown collection "${collection}". Known: ${Object.keys(ID_FIELDS).join(", ")}`,
    );
  }
  return field;
}

/** The whole overlay: { [collection]: { created: [], patched: {} } }. */
export function readOverlay() {
  try {
    const raw = storage().getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    // A corrupt overlay should degrade to pristine data, never to a crash.
    return {};
  }
}

export function writeOverlay(next) {
  try {
    storage().setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    // Quota or a blocked storage backend: the demo keeps working read-only.
  }
  notify();
}

function collectionOverlay(overlay, collection) {
  const entry = overlay[collection] ?? {};
  return { created: entry.created ?? [], patched: entry.patched ?? {} };
}

/**
 * Apply the overlay for `collection` over a pristine array.
 *
 * Patched records are shallow-merged in place, so a record keeps its original
 * field order and every untouched field. Created records are appended, or
 * prepended with { newestFirst: true } where a product's own UI showed new
 * rows first before this store existed.
 */
export function mergeCollection(collection, pristine, { newestFirst = false } = {}) {
  const idField = idFieldFor(collection);
  const { created, patched } = collectionOverlay(readOverlay(), collection);
  const base = (pristine ?? []).map((record) => {
    const patch = patched[record[idField]];
    return patch ? { ...record, ...patch } : record;
  });
  if (created.length === 0) return base;
  return newestFirst ? [...created.slice().reverse(), ...base] : [...base, ...created];
}

/** Append a brand-new record. The caller supplies the id. */
export function createRecord(collection, record) {
  const idField = idFieldFor(collection);
  if (!record || !record[idField]) {
    throw new Error(`demo-store: a new ${collection} record needs a ${idField}`);
  }
  const overlay = readOverlay();
  const entry = collectionOverlay(overlay, collection);
  overlay[collection] = { created: [...entry.created, record], patched: entry.patched };
  writeOverlay(overlay);
  return record;
}

/** Shallow-merge a patch onto one existing record (pristine or created). */
export function patchRecord(collection, id, patch) {
  const idField = idFieldFor(collection);
  const overlay = readOverlay();
  const entry = collectionOverlay(overlay, collection);

  // A record created in this session is edited in place rather than gaining a
  // patch entry, so its created/patched representation cannot drift apart.
  const createdIndex = entry.created.findIndex((r) => r[idField] === id);
  if (createdIndex !== -1) {
    const nextCreated = entry.created.slice();
    nextCreated[createdIndex] = { ...nextCreated[createdIndex], ...patch };
    overlay[collection] = { created: nextCreated, patched: entry.patched };
  } else {
    overlay[collection] = {
      created: entry.created,
      patched: { ...entry.patched, [id]: { ...(entry.patched[id] ?? {}), ...patch } },
    };
  }
  writeOverlay(overlay);
}

/** Replace the whole patched map for a collection (bulk form of patchRecord). */
export function setPatches(collection, patchedById) {
  idFieldFor(collection);
  const overlay = readOverlay();
  const entry = collectionOverlay(overlay, collection);
  overlay[collection] = { created: entry.created, patched: { ...patchedById } };
  writeOverlay(overlay);
}

/** Replace the whole created list for a collection (bulk form of createRecord). */
export function setCreated(collection, records) {
  idFieldFor(collection);
  const overlay = readOverlay();
  const entry = collectionOverlay(overlay, collection);
  overlay[collection] = { created: [...records], patched: entry.patched };
  writeOverlay(overlay);
}

export function getCreated(collection) {
  idFieldFor(collection);
  return collectionOverlay(readOverlay(), collection).created;
}

export function getPatches(collection) {
  idFieldFor(collection);
  return collectionOverlay(readOverlay(), collection).patched;
}

/** True when anything at all has been written — used to label the demo state. */
export function hasDemoChanges() {
  const overlay = readOverlay();
  return Object.values(overlay).some(
    (entry) => (entry?.created?.length ?? 0) > 0 || Object.keys(entry?.patched ?? {}).length > 0,
  );
}

/**
 * Clear the overlay and every pre-Phase-3 per-product key, returning all four
 * products to pristine mock-data. Callers reload afterwards so the reset is
 * visible immediately.
 */
export function resetDemoData() {
  const store = storage();
  try {
    store.removeItem(STORE_KEY);
    for (const key of LEGACY_KEYS) store.removeItem(key);

    const stale = [];
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (key && LEGACY_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) stale.push(key);
    }
    for (const key of stale) store.removeItem(key);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
  notify();
}

// Same-document change notification. Products that render once per page load
// (admin/, customer/) do not need this; provider/ and chat/ use it to re-read
// after their own writes. Cross-TAB sync is deliberately not implemented —
// navigation between products is a full page load, so every product re-reads
// the overlay on mount anyway.
const listeners = new Set();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // One bad listener must not stop the others.
    }
  }
}

export const STORE_KEY_NAME = STORE_KEY;
