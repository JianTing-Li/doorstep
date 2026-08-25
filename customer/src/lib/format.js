// Presentation helpers, extracted from Abheeshu's inline formatting so every
// screen formats the same way. Behavior matches his original exactly.

import { getMeta } from "../data/loadData.js";

export function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

export function priceLabel(listing) {
  const unit = listing.price_unit === "hourly" ? "/hr" : " flat";
  return `$${listing.price}${unit}`;
}

export function ratingLabel(value) {
  return value == null ? "New" : value.toFixed(1);
}

export function referenceTimestamp(hour = "12", minute = "00") {
  return `${getMeta().reference_date}T${hour}:${minute}:00-07:00`;
}

export function referenceSlots() {
  const at = new Date(`${getMeta().reference_date}T12:00:00Z`);
  return [1, 2, 3].map((days) => {
    const slot = new Date(at);
    slot.setUTCDate(slot.getUTCDate() + days);
    return `${slot.toISOString().slice(0, 10)}T10:00:00-07:00`;
  });
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
