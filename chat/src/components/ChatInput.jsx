import { useState } from "react";

export default function ChatInput({ onSubmit }) {
  const [value, setValue] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form className="chat-input-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Describe the job"
        aria-label="Describe the job you need done"
      />
      <button type="submit" disabled={!value.trim()}>
        Send
      </button>
    </form>
  );
}
