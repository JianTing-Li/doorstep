// A compact read of session bookings, in the order they were booked. Not a
// search result — these cards are records, so nothing here is tappable.
export default function BookingList({ bookings }) {
  return (
    <div className="message-row from-bot message-enter">
      <div className="results-list">
        {bookings.map((b) => (
          <article className="listing-card is-booked" key={b.id}>
            <p className="booked-marker">Booked</p>
            <p className="booked-title">
              {b.title} <span className="booked-provider">· {b.provider}</span>
            </p>
            <p className="booked-line">{b.when}</p>
            <p className="booked-line">{b.price}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
