/**
 * Presentation helpers. None of these touch the shared mock-data files;
 * they only format values for rendering.
 */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** $45, $120.50 — total_price and price are plain Numbers in the dataset. */
export function formatMoney(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }
  return currencyFormatter.format(Number(value));
}

/** "2026-08-19" -> "Aug 19, 2026". Keeps the shared YYYY-MM-DD as the stored shape. */
export function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Capitalize the first letter for human-readable status labels. */
export function humanize(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}