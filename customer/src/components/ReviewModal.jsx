import { useState } from "react";
import Icon from "./Icon.jsx";
import { useApp } from "../AppContext.jsx";

export default function ReviewModal({ bookingId, booking, onClose }) {
  const { setBookings, showToast } = useApp();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  function submit() {
    setBookings((prev) => prev.map((b) => (
      b.id === bookingId ? { ...b, rating, review: text.trim() || "Excellent service and great communication!" } : b
    )));
    showToast("Review submitted & Escrow finalized! ★★★★★", "star");
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-center-header">
          <span className="icon-tile icon-tile-warm"><Icon name="star" size={22} /></span>
          <h3>Rate {booking?.provider_name}</h3>
          <p>{booking?.title}</p>
        </div>

        <div className="star-picker">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className={n <= rating ? "is-filled" : ""}>
              <Icon name="star" size={26} />
            </button>
          ))}
        </div>

        <div className="filter-group">
          <label>Write your review</label>
          <textarea
            rows={3}
            placeholder="Friendly, punctual, and did an outstanding job!"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="modal-actions-row">
          <button type="button" className="btn btn-outline" onClick={onClose}>Skip</button>
          <button type="button" className="btn btn-primary" onClick={submit}>Submit &amp; Release Escrow</button>
        </div>
      </div>
    </div>
  );
}
