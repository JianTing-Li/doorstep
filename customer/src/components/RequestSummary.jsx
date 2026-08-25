const URGENCY_LABELS = {
  urgent: "Urgent — today or tomorrow",
  today: "Today",
  tomorrow: "Tomorrow",
  this_week: "Within the next 7 days",
};

export default function RequestSummary({ request }) {
  return (
    <div className="message-row from-bot message-enter">
      <article className="request-summary" aria-label="Service request summary">
        <p className="request-summary-kicker">Your service request</p>
        <p className="request-summary-description">“{request.description}”</p>
        <dl className="request-summary-details">
          <div>
            <dt>Service</dt>
            <dd>{request.serviceLabels.join(" + ") || "Needs clarification"}</dd>
          </div>
          {request.neighborhood && (
            <div>
              <dt>Job area</dt>
              <dd>{request.neighborhood}</dd>
            </div>
          )}
          {request.urgency && (
            <div>
              <dt>Timing</dt>
              <dd>{URGENCY_LABELS[request.urgency] ?? request.urgency}</dd>
            </div>
          )}
          {request.maxPrice != null && (
            <div>
              <dt>Budget ceiling</dt>
              <dd>${request.maxPrice}</dd>
            </div>
          )}
        </dl>
        <p className="request-summary-help">Type a correction at any time before choosing a provider.</p>
      </article>
    </div>
  );
}
