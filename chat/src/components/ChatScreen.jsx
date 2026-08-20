import { useMemo, useState } from "react";
import ExampleChips from "./ExampleChips.jsx";
import FilterChips from "./FilterChips.jsx";
import ResultsList from "./ResultsList.jsx";
import { isClearlyUnsupported, parseJob } from "../lib/parseJob.js";
import { matchListings } from "../lib/matchListings.js";

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "bot",
  text: "Hi, I’m your Doorstep matchmaker. Tell me what’s going on at home, and I’ll find the right kind of help.",
};

function replyForMatches(count) {
  if (count === 1) return "I found one especially strong match for that job.";
  return `I found ${count} active listings that fit. Here are the strongest matches first.`;
}

function requestStub(text) {
  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  }).catch(() => null);
}

export default function ChatScreen({ examples, listings, meta, serviceTypes }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [parsed, setParsed] = useState(null);
  const [results, setResults] = useState([]);
  const [followUps, setFollowUps] = useState(0);

  const serviceLabels = useMemo(
    () => new Map(serviceTypes.map(({ code, label }) => [code, label])),
    [serviceTypes],
  );

  function addExchange(text, botText, followUp = false) {
    const stamp = messages.length;
    setMessages((current) => [
      ...current,
      { id: `user-${stamp}`, role: "user", text },
      { id: `bot-${stamp}`, role: "bot", text: botText, followUp },
    ]);
  }

  function submit(text = draft) {
    const cleanText = text.trim();
    if (!cleanText) return;

    const nextParsed = parseJob(cleanText);
    const nextResults = matchListings(nextParsed, listings);
    const canFollowUp = followUps < 2;
    let botText;
    let isFollowUp = false;

    if (isClearlyUnsupported(cleanText)) {
      botText =
        "That service isn’t in Doorstep’s current catalog yet. I can help with cleaning, handyman work, plumbing, electrical, moving, junk removal, or yard work.";
    } else if (nextParsed.service_types.length === 0) {
      if (canFollowUp) {
        botText =
          "I need one more detail to match that well. Is this cleaning, a repair, moving, removal, or outdoor work? You can also skip this question.";
        isFollowUp = true;
      } else {
        botText =
          "I still don’t have enough detail to recommend someone confidently. Try a new request whenever you’re ready.";
      }
    } else if (nextResults.length === 0) {
      if (canFollowUp) {
        const categories = nextParsed.service_types
          .map((code) => serviceLabels.get(code))
          .filter(Boolean)
          .join(" and ");
        botText = `I heard ${categories}, but I need one clearer detail before I choose. What specifically needs to be done? You can also skip this question.`;
        isFollowUp = true;
      } else {
        botText =
          "I couldn’t find an active listing that fits all of those details. A simpler description or a different budget may help.";
      }
    } else {
      botText = replyForMatches(nextResults.length);
    }

    addExchange(cleanText, botText, isFollowUp);
    setParsed(nextParsed);
    setResults(nextResults);
    if (isFollowUp) setFollowUps((count) => count + 1);
    setDraft("");
    void requestStub(cleanText);
  }

  function skipFollowUp() {
    const stamp = messages.length;
    setMessages((current) => [
      ...current,
      { id: `user-skip-${stamp}`, role: "user", text: "Skip for now" },
      {
        id: `bot-skip-${stamp}`,
        role: "bot",
        text: "No problem. Describe the job another way, or tap an example below when you’re ready.",
      },
    ]);
  }

  function handleSubmit(event) {
    event.preventDefault();
    submit();
  }

  return (
    <div className="chat-workspace">
      <section className="chat-panel" aria-label="Doorstep matching conversation">
        <div className="conversation" aria-live="polite">
          {messages.map((message) => (
            <div className={`message-row ${message.role}`} key={message.id}>
              {message.role === "bot" ? (
                <span className="bot-avatar" aria-hidden="true">
                  D
                </span>
              ) : null}
              <div className="message-bubble">
                <p>{message.text}</p>
                {message.followUp ? (
                  <button className="skip-button" onClick={skipFollowUp} type="button">
                    Skip this question
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <label htmlFor="job-input">What do you need help with?</label>
          <div className="input-wrap">
            <textarea
              id="job-input"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder="e.g. My kitchen sink is leaking and the drain is slow…"
              rows="2"
              value={draft}
            />
            <button aria-label="Send request" disabled={!draft.trim()} type="submit">
              <span>Send</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </form>

        <FilterChips parsed={parsed} serviceTypes={serviceTypes} />
        <ExampleChips examples={examples} onSelect={submit} />
      </section>

      <ResultsList listings={results} meta={meta} serviceTypes={serviceTypes} />
    </div>
  );
}
