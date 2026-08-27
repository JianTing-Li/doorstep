const URGENCY_PHRASES = {
  urgent: "as soon as possible",
  today: "today",
  tomorrow: "tomorrow",
  this_week: "sometime this week",
};

// Reads as one sentence rather than a label/value form — the facts are the
// same ones the old <dl> laid out, just composed the way a person would say
// them back to you instead of itemized under headers.
function summaryLine(request) {
  const clauses = [];
  if (request.neighborhood) clauses.push(`in ${request.neighborhood}`);
  if (request.urgency) clauses.push(URGENCY_PHRASES[request.urgency] ?? request.urgency);
  if (request.maxPrice != null) clauses.push(`up to $${request.maxPrice}`);
  const tail = clauses.length ? ` — ${clauses.join(", ")}` : "";

  if (!request.serviceLabels.length) return `Still narrowing down the service${tail}.`;
  return `Looking for ${request.serviceLabels.join(" + ")}${tail}.`;
}

export default function RequestSummary({ request }) {
  return (
    <div className="message-row from-bot message-enter">
      <article className="request-summary" aria-label="Service request summary">
        <p className="request-summary-description">“{request.description}”</p>
        <p className="request-summary-sentence">{summaryLine(request)}</p>
        <p className="request-summary-help">Type a correction at any time before choosing a provider.</p>
      </article>
    </div>
  );
}
