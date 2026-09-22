/**
 * Shared constants for Product A. Centralizing them keeps components lean
 * and lets Products B, C, and D import the same contract.
 */

/** Booking status -> badge color (matches the spec's green/orange/red). */
export const BOOKING_STATUS_COLORS = {
  completed: "green",
  confirmed: "blue",
  pending: "orange",
  cancelled: "red",
};

/** Booking statuses a provider can act on from the dashboard. */
export const ACTIONABLE_BOOKING_STATUSES = ["pending", "confirmed"];

/** The 8 canonical service-type codes from mock-data/service-types.json. */
export const SERVICE_TYPE_CODES = [
  "cleaning_standard",
  "cleaning_deep",
  "handyman_general",
  "plumbing",
  "electrical",
  "moving_help",
  "junk_removal",
  "yard_outdoor",
];

/**
 * Guided provider choices. Providers describe the outcome customers need rather
 * than writing marketing copy or choosing an internal service code.
 */
export const SERVICE_NEED_PROFILES = [
  {
    key: "routine_home_cleaning",
    prompt: "Keep a home routinely clean",
    helper: "Recurring or one-time upkeep for lived-in homes.",
    icon: "✨",
    service_type: "cleaning_standard",
    service_label: "Home Cleaning",
    listing_title: "Routine Home Cleaning",
    tasks: [
      "Kitchen surfaces",
      "Bathroom cleaning",
      "Dusting",
      "Vacuuming",
      "Mopping",
      "Trash & recycling",
    ],
  },
  {
    key: "deep_home_reset",
    prompt: "Deep clean or reset a space",
    helper: "Move-in, move-out, appliance, or post-project cleaning.",
    icon: "🧽",
    service_type: "cleaning_deep",
    service_label: "Deep Cleaning",
    listing_title: "Deep Home Cleaning",
    tasks: [
      "Inside oven",
      "Inside refrigerator",
      "Cabinets & drawers",
      "Baseboards",
      "Window sills",
      "Heavy dust removal",
    ],
  },
  {
    key: "repairs_and_installation",
    prompt: "Fix or install things at home",
    helper: "Assembly, mounting, patching, doors, and locks.",
    icon: "🔨",
    service_type: "handyman_general",
    service_label: "Handyman",
    listing_title: "Home Repairs & Installation",
    tasks: [
      "Furniture assembly",
      "TV or shelf mounting",
      "Drywall patching",
      "Door repairs",
      "Lock replacement",
      "Cabinet adjustments",
    ],
  },
  {
    key: "water_and_drains",
    prompt: "Resolve a water or drain issue",
    helper: "Faucets, toilets, leaks, drains, and under-sink work.",
    icon: "💧",
    service_type: "plumbing",
    service_label: "Plumbing",
    listing_title: "Plumbing Repair",
    tasks: [
      "Faucet replacement",
      "Drain clearing",
      "Leak repair",
      "Toilet repair",
      "Under-sink work",
      "Shutoff valve replacement",
    ],
  },
  {
    key: "lights_and_power",
    prompt: "Install or repair lights and power",
    helper: "Fixtures, fans, outlets, switches, and small electrical jobs.",
    icon: "💡",
    service_type: "electrical",
    service_label: "Electrical",
    listing_title: "Electrical Installation & Repair",
    tasks: [
      "Light fixtures",
      "Ceiling fans",
      "Outlet replacement",
      "Switch replacement",
      "GFCI installation",
      "Circuit troubleshooting",
    ],
  },
  {
    key: "move_belongings",
    prompt: "Move belongings or furniture",
    helper: "Loading, unloading, in-building moves, and item hauling.",
    icon: "📦",
    service_type: "moving_help",
    service_label: "Moving Help",
    listing_title: "Moving & Loading Help",
    tasks: [
      "Truck loading",
      "Truck unloading",
      "In-building move",
      "Furniture moving",
      "Packing help",
      "Moving blankets & straps",
    ],
  },
  {
    key: "remove_unwanted_items",
    prompt: "Remove unwanted items",
    helper: "Furniture, boxes, appliances, and room clear-outs.",
    icon: "🚚",
    service_type: "junk_removal",
    service_label: "Junk Removal",
    listing_title: "Junk Removal & Clear-Out",
    tasks: [
      "Furniture removal",
      "Box removal",
      "Appliance removal",
      "Garage clear-out",
      "Basement clear-out",
      "Donation drop-off",
    ],
  },
  {
    key: "care_for_outdoor_space",
    prompt: "Care for a yard or outdoor space",
    helper: "Lawns, leaves, gutters, patios, and seasonal cleanup.",
    icon: "🌿",
    service_type: "yard_outdoor",
    service_label: "Yard & Outdoor",
    listing_title: "Yard & Outdoor Care",
    tasks: [
      "Lawn mowing",
      "Edging & trimming",
      "Leaf clearing",
      "Gutter cleaning",
      "Patio or deck cleanup",
      "Yard debris removal",
    ],
  },
];

/** Server-side generator for new stable IDs (draft listings live in app state). */
export function nextId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}