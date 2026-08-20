import ChatScreen from "../components/ChatScreen.jsx";
import { getExampleQueries, getMarketplaceMeta, getServiceTypes } from "../data/loadData.js";
import { getActiveListings } from "../data/listings.js";

export default function ChatRoute() {
  return (
    <main className="chat-route">
      <section className="route-intro" aria-labelledby="chat-heading">
        <p className="eyebrow">Doorstep matching</p>
        <h1 id="chat-heading">Tell us what needs doing.</h1>
        <p>
          Describe the job in your own words. We’ll sort through trusted local
          listings and bring the best fits to the top.
        </p>
      </section>

      <ChatScreen
        examples={getExampleQueries()}
        listings={getActiveListings()}
        meta={getMarketplaceMeta()}
        serviceTypes={getServiceTypes()}
      />
    </main>
  );
}
