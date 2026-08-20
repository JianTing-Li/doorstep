const FEATURED_QUERY_IDS = ["qry_001", "qry_004", "qry_013", "qry_016"];

export default function ExampleChips({ examples, onSelect }) {
  const featured = FEATURED_QUERY_IDS.map((id) =>
    examples.find((example) => example.query_id === id),
  ).filter(Boolean);

  return (
    <div className="example-section">
      <p>Not sure where to start? Try an example.</p>
      <div className="example-chips" aria-label="Example requests">
        {featured.map((example) => (
          <button
            className="example-chip"
            key={example.query_id}
            onClick={() => onSelect(example.query)}
            type="button"
          >
            {example.query}
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}
