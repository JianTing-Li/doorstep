import { createContext, useContext, useState } from "react";
import { usePersonaState } from "./lib/usePersonaState.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const persona = usePersonaState();

  // Global overlays: the provider-chat, safety-report, review, and persona
  // modals can be triggered from many different screens (Dashboard, Feed,
  // Profile, Bookings), so they're mounted once at the top and driven by
  // shared state rather than duplicated per screen — matching how his
  // original kept one instance of each modal in the DOM.
  const [providerChat, setProviderChat] = useState(null); // { providerId, listingId }
  const [reportTarget, setReportTarget] = useState(null); // { listing_id, provider_id, booking_id }
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [toast, setToastState] = useState(null); // { message, icon }

  function showToast(message, icon = "checkCircle") {
    const key = Date.now();
    setToastState({ message, icon, key });
    // Matches the original's 3.2s auto-dismiss. Guarded by key so a newer
    // toast fired before this one expires isn't clobbered by a stale timer.
    setTimeout(() => {
      setToastState((current) => (current?.key === key ? null : current));
    }, 3200);
  }

  const value = {
    ...persona,
    providerChat,
    openProviderChat: (providerId, listingId) => setProviderChat({ providerId, listingId }),
    closeProviderChat: () => setProviderChat(null),
    reportTarget,
    openReport: (target) => setReportTarget(target),
    closeReport: () => setReportTarget(null),
    reviewBookingId,
    openReview: (bookingId) => setReviewBookingId(bookingId),
    closeReview: () => setReviewBookingId(null),
    personaModalOpen,
    openPersonaModal: () => setPersonaModalOpen(true),
    closePersonaModal: () => setPersonaModalOpen(false),
    toast,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
