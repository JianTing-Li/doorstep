import { useEffect, useMemo, useState } from "react";
import { getCustomers, getMeta } from "../data/loadData.js";

// Per-persona local state: bookings, provider messages, safety reports.
// Same localStorage keys and seeded demo content as Abheeshu's original
// (doorstep_bookings_{id} / doorstep_messages_{id} / doorstep_reports_{id} /
// doorstep_active_persona) — messages and reports have no equivalent shared
// collection, so they stay local to this app, per persona, exactly as before.
//
// One real fix from the original: the default persona id is now `cst_001`
// (Hannah Breece), a record that actually exists in mock-data. His original
// default, `cust_00001`, matches nothing — see INTEGRATION-NOTES.md. This
// also keeps the app's own default persona the same customer the shared
// switcher already hardcodes for the site-wide Customer role.
const DEFAULT_PERSONA_ID = "cst_001";
const ACTIVE_PERSONA_KEY = "doorstep_active_persona";

function referenceDateTime(dayOffset, hour) {
  const at = new Date(`${getMeta().reference_date}T12:00:00Z`);
  at.setUTCDate(at.getUTCDate() + dayOffset);
  return `${at.toISOString().slice(0, 10)}T${hour}:00:00-07:00`;
}

const SEED_BOOKINGS = {
  cst_001: [
    {
      id: "BK-49201",
      listing_id: "lst_001",
      provider_id: "prv_001",
      title: "Weekly & Bi-Weekly Apartment Cleaning",
      provider_name: "Marisol Vega",
      timeSlot: referenceDateTime(2, "10"),
      address: "1420 NW Lovejoy St, Apt 3B, Portland, OR",
      total: 51.75,
      status: "upcoming",
      escrowStatus: "held",
      rating: null,
      review: null,
    },
  ],
  cst_002: [
    {
      id: "BK-31082",
      listing_id: "lst_010",
      provider_id: "prv_005",
      title: "IKEA Furniture Assembly & Mounting",
      provider_name: "Tomasz Bak",
      timeSlot: referenceDateTime(-3, "14"),
      address: "825 SE Hawthorne Blvd, Portland, OR",
      total: 86.25,
      status: "completed",
      escrowStatus: "released",
      rating: 5,
      review: "Super quick with assembling the PAX wardrobe!",
    },
  ],
};

const SEED_MESSAGES = {
  cst_001: {
    prv_001: [
      { id: "m1", sender: "provider", text: "Hi! I saw your booking for Friday. Do you have any specific pet instructions for my visit?", timestamp: referenceDateTime(0, "08") },
      { id: "m2", sender: "customer", text: "Hi Marisol! Yes, our cat will be in the bedroom during cleaning. Thanks for asking!", timestamp: referenceDateTime(0, "09") },
      { id: "m3", sender: "provider", text: "Sounds wonderful! Looking forward to Friday.", timestamp: referenceDateTime(0, "10") },
    ],
  },
};

const SEED_REPORTS = {
  cst_004: [
    {
      report_id: "report_00001",
      reporter_customer_id: "cst_004",
      listing_id: "lst_004",
      provider_id: "prv_004",
      booking_id: "BK-10492",
      safety_flag_type: "payment_request_off_platform",
      report_details: "Provider asked for cash payment outside Doorstep escrow after accepting.",
      evidence_url: "",
      created_at: referenceDateTime(-4, "12"),
      status: "in_review",
    },
  ],
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function usePersonaState() {
  const [customerId, setCustomerId] = useState(
    () => localStorage.getItem(ACTIVE_PERSONA_KEY) || DEFAULT_PERSONA_ID,
  );
  const [bookings, setBookings] = useState(() =>
    readJSON(`doorstep_bookings_${customerId}`, SEED_BOOKINGS[customerId] || []),
  );
  const [messages, setMessages] = useState(() =>
    readJSON(`doorstep_messages_${customerId}`, SEED_MESSAGES[customerId] || {}),
  );
  const [reports, setReports] = useState(() =>
    readJSON(`doorstep_reports_${customerId}`, SEED_REPORTS[customerId] || []),
  );

  // Re-hydrate when persona changes.
  useEffect(() => {
    setBookings(readJSON(`doorstep_bookings_${customerId}`, SEED_BOOKINGS[customerId] || []));
    setMessages(readJSON(`doorstep_messages_${customerId}`, SEED_MESSAGES[customerId] || {}));
    setReports(readJSON(`doorstep_reports_${customerId}`, SEED_REPORTS[customerId] || []));
    localStorage.setItem(ACTIVE_PERSONA_KEY, customerId);
  }, [customerId]);

  useEffect(() => {
    localStorage.setItem(`doorstep_bookings_${customerId}`, JSON.stringify(bookings));
  }, [customerId, bookings]);
  useEffect(() => {
    localStorage.setItem(`doorstep_messages_${customerId}`, JSON.stringify(messages));
  }, [customerId, messages]);
  useEffect(() => {
    localStorage.setItem(`doorstep_reports_${customerId}`, JSON.stringify(reports));
  }, [customerId, reports]);

  const customer = useMemo(() => {
    const found = getCustomers().find((c) => c.customer_id === customerId);
    return found || { customer_id: customerId, name: "Guest", address: "Portland, OR" };
  }, [customerId]);

  return {
    customerId,
    setCustomerId,
    customer,
    bookings,
    setBookings,
    messages,
    setMessages,
    reports,
    setReports,
  };
}
