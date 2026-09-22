import { EXAMPLE_JOBS } from "../data/exampleJobs.js";

export default function ExampleChips({ onSelect }) {
  return (
    <div className="example-chips">
      {EXAMPLE_JOBS.map((example) => (
        <button
          type="button"
          key={example.text}
          className="example-chip"
          onClick={() => onSelect(example)}
        >
          {example.text}
        </button>
      ))}
    </div>
  );
}
