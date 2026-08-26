import { useMemo, useState } from "react";
import { AppProvider, useApp } from "./AppContext.jsx";
import { getListings, getProviders, getCustomers } from "./data/loadData.js";
import { seedPromptFromBrowse } from "./lib/filterBridge.js";
import { withPageTransition } from "./lib/viewTransition.js";

import Header from "./components/Header.jsx";
import TabBar, { TopNav } from "./components/TabBar.jsx";
import Toast from "./components/Toast.jsx";
import DashboardScreen from "./components/DashboardScreen.jsx";
import ListingFeed from "./components/ListingFeed.jsx";
import ListingProfileScreen from "./components/ListingProfileScreen.jsx";
import ScheduleScreen from "./components/ScheduleScreen.jsx";
import CheckoutScreen from "./components/CheckoutScreen.jsx";
import ConfirmationScreen from "./components/ConfirmationScreen.jsx";
import BookingsScreen from "./components/BookingsScreen.jsx";
import ProfileTab from "./components/ProfileTab.jsx";
import AskScreen from "./components/AskScreen.jsx";
import FirstVisitStrip from "./components/FirstVisitStrip.jsx";
import ProviderChatModal from "./components/ProviderChatModal.jsx";
import ReportModal from "./components/ReportModal.jsx";
import ReviewModal from "./components/ReviewModal.jsx";
import PersonaModal from "./components/PersonaModal.jsx";

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

// /chat redirects to /customer/?tab=ask (Phase 6), so honour that on load.
function initialTab() {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return ["browse", "ask", "bookings", "profile"].includes(t) ? t : "browse";
  } catch {
    return "browse";
  }
}

function Shell() {
  const [tab, setTab] = useState(initialTab);
  // Every top-level page swap (Browse/Ask/Bookings/Profile) goes through
  // this instead of setTab directly, so the switch always crossfades rather
  // than the content just flashing to the next screen.
  function changeTab(next) {
    withPageTransition(() => setTab(next));
  }
  // Browse tab's own nested navigation — dashboard is its home; drilling
  // into a listing moves through profile -> checkout -> confirmation
  // without leaving the tab. Mirrors his own single-container navigate().
  const [browseView, setBrowseView] = useState("dashboard");
  const [browseParams, setBrowseParams] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  // Filter hand-off, both directions (Phase 6). askSeed carries a Browse
  // narrowing into Ask as an opening sentence; browseFilterOverride carries a
  // parsed Ask request back into Browse. See lib/filterBridge.js.
  const [askSeed, setAskSeed] = useState(null);
  const [browseFilterOverride, setBrowseFilterOverride] = useState(null);

  const {
    bookings, reports, providerChat, closeProviderChat,
    reportTarget, closeReport, reviewBookingId, closeReview,
    personaModalOpen, closePersonaModal, openPersonaModal,
  } = useApp();

  const listings = useMemo(() => getListings(), []);
  const providersList = useMemo(() => getProviders(), []);
  const customers = useMemo(() => getCustomers(), []);
  const providersById = useMemo(() => new Map(providersList.map((p) => [p.provider_id, p])), [providersList]);

  function goBrowse(view, params = {}) {
    changeTab("browse");
    setBrowseView(view);
    setBrowseParams(params);
    // Checkout and confirmation are downstream of profile/schedule for the
    // same listing and still need the chosen slot — only a fresh browsing
    // context (dashboard/feed) should forget it.
    if (view === "dashboard" || view === "feed") setSelectedSlot(null);
  }

  function openListing(id) {
    goBrowse("profile", { id });
  }

  const activeListing = browseParams.id ? listings.find((l) => l.listing_id === browseParams.id) : null;
  const activeProvider = activeListing ? providersById.get(activeListing.provider_id) : null;

  function renderBrowse() {
    switch (browseView) {
      case "feed":
        return (
          <ListingFeed
            listings={listings}
            providersById={providersById}
            initialFilters={
              browseFilterOverride ?? { category: browseParams.category, searchQuery: browseParams.search }
            }
            onOpenListing={openListing}
            onBack={() => goBrowse("dashboard")}
            onDescribeInstead={(currentFilters) => {
              setAskSeed(seedPromptFromBrowse(currentFilters));
              changeTab("ask");
            }}
          />
        );
      case "profile":
        if (!activeListing) return null;
        return (
          <ListingProfileScreen
            listing={activeListing}
            provider={activeProvider}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            onBack={() => goBrowse("feed")}
            onContinue={() => goBrowse("checkout", browseParams)}
          />
        );
      case "schedule":
        if (!activeListing) return null;
        return (
          <ScheduleScreen
            listing={activeListing}
            provider={activeProvider}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            onBack={() => goBrowse("dashboard")}
            onContinue={() => goBrowse("checkout", browseParams)}
          />
        );
      case "checkout":
        if (!activeListing) return null;
        return (
          <CheckoutScreen
            listing={activeListing}
            provider={activeProvider}
            slot={selectedSlot}
            onBack={() => goBrowse("profile", browseParams)}
            onConfirmed={(booking) => {
              setConfirmedBooking(booking);
              goBrowse("confirmation");
            }}
          />
        );
      case "confirmation":
        if (!confirmedBooking) return null;
        return (
          <ConfirmationScreen
            booking={confirmedBooking}
            onViewBookings={() => changeTab("bookings")}
            onHome={() => goBrowse("dashboard")}
          />
        );
      case "dashboard":
      default:
        return (
          <DashboardScreen
            listings={listings}
            providersById={providersById}
            onOpenFeed={(params) => goBrowse("feed", params)}
            onOpenListing={openListing}
            onOpenAsk={(prefill) => {
              if (prefill) setAskSeed(prefill);
              changeTab("ask");
            }}
          />
        );
    }
  }

  function goHome() {
    changeTab("browse");
    setBrowseView("dashboard");
    setBrowseParams({});
  }

  return (
    <div className="app-shell">
      <Header onLogoClick={goHome} onBookingsClick={() => changeTab("bookings")} />

      <TopNav active={tab} onSelect={changeTab} />

      <FirstVisitStrip />

      <main className="app-main">
        {tab === "browse" && renderBrowse()}
        {tab === "ask" && (
          <AskScreen
            seedPrompt={askSeed}
            onSeeMoreLikeThis={(browseFilters) => {
              setBrowseFilterOverride(browseFilters);
              setAskSeed(null);
              goBrowse("feed", {});
            }}
          />
        )}
        {tab === "bookings" && <BookingsScreen />}
        {tab === "profile" && (
          <ProfileTab bookings={bookings} reports={reports} onSwitchPersona={openPersonaModal} />
        )}
      </main>

      <TabBar active={tab} onSelect={changeTab} />
      <Toast />

      {providerChat && (
        <ProviderChatModal
          providerId={providerChat.providerId}
          listingId={providerChat.listingId}
          provider={providersById.get(providerChat.providerId) || { name: "Provider Pro" }}
          listing={listings.find((l) => l.listing_id === providerChat.listingId) || {}}
          onClose={closeProviderChat}
          onBookPro={() => {
            closeProviderChat();
            goBrowse("schedule", { id: providerChat.listingId });
          }}
        />
      )}

      {reportTarget && (
        <ReportModal
          target={reportTarget}
          listing={listings.find((l) => l.listing_id === reportTarget.listing_id) || {}}
          provider={providersById.get(reportTarget.provider_id) || {}}
          onClose={closeReport}
        />
      )}

      {reviewBookingId && (
        <ReviewModal
          bookingId={reviewBookingId}
          booking={bookings.find((b) => b.id === reviewBookingId)}
          onClose={closeReview}
        />
      )}

      {personaModalOpen && <PersonaModal customers={customers} onClose={closePersonaModal} />}
    </div>
  );
}
