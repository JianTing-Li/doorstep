// Tiny shared localStorage helpers — same read/write shape usePersonaState.js
// already used privately for bookings/messages/reports, now shared so
// AskScreen's own conversation persistence (a separate concern, provider-chat
// messages already occupy the `doorstep_messages_*` key) uses the identical,
// proven pattern rather than a second slightly-different one.

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (private browsing, quota) — the data just
    // won't survive this navigation. Not worth surfacing to the user.
  }
}
