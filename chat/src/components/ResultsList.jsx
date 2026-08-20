import ListingCard from "./ListingCard.jsx";

export default function ResultsList({ listings }) {
  if (listings.length === 0) return null;

  return (
    <div className="message-row from-bot message-enter">
      <div className="results-list">
        {listings.map((listing) => (
          <ListingCard key={listing.listing_id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
