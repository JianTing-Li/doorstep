// Presentation helpers, extracted from Abheeshu's inline formatting so every
// screen formats the same way. Behavior matches his original exactly.

export function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

export function priceLabel(listing) {
  const unit = listing.price_unit === "hourly" ? "/hr" : " flat";
  return `$${listing.price}${unit}`;
}

export function ratingLabel(value) {
  return value ? value.toFixed(1) : "5.0";
}

export function formatSlotShort(dateStr) {
  const d = new Date(dateStr);
  return {
    dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
    dayNum: d.getDate(),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function formatSlotLong(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
    ", " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatSlotFull(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function initial(name) {
  return name ? name.charAt(0).toUpperCase() : "P";
}
