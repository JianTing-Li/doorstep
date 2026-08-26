import { chromium } from "playwright";

const BASE = process.env.UI_BASE ?? "http://localhost:5174";
const APP = `${BASE.replace(/\/$/, "")}/customer/?tab=ask`;
const results = [];

function check(label, pass, detail = "") {
  results.push({ label, pass: Boolean(pass), detail });
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label}${detail ? `\n          ${detail}` : ""}`);
}

const responses = {
  mixed: {
    intent: "job",
    service_types: ["handyman_general", "electrical"],
    max_price: null,
    neighborhood: null,
    urgency: null,
    clear_filters: [],
    confidence: "high",
    referenced_listing_id: null,
    clarification_question: null,
    route: "gemini",
  },
  unclear: {
    intent: "unclear",
    service_types: ["cleaning_standard", "plumbing"],
    max_price: null,
    neighborhood: null,
    urgency: null,
    clear_filters: [],
    confidence: "low",
    referenced_listing_id: null,
    clarification_question: "Does the sink need cleaning or a plumbing repair?",
    route: "gemini",
  },
  offTopic: {
    intent: "off_topic",
    service_types: [],
    max_price: null,
    neighborhood: null,
    urgency: null,
    clear_filters: [],
    confidence: "high",
    referenced_listing_id: null,
    clarification_question: null,
    route: "gemini",
  },
};

const browser = await chromium.launch();

async function openPage(responder = () => responses.mixed) {
  const page = await browser.newPage({ viewport: { width: 390, height: 820 } });
  const requests = [];
  await page.route("**/api/chat", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    requests.push(body);
    const response = responder(body);
    if (response === "fail") {
      await route.fulfill({ status: 502, contentType: "application/json", body: '{"error":"Extraction failed"}' });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(response) });
  });
  await page.goto(APP);
  await page.waitForSelector(".example-chip", { timeout: 15000 });
  return { page, requests };
}

async function send(page, text) {
  await page.locator(".chat-input-bar input").fill(text);
  await page.locator(".chat-input-bar button").click();
  await page.waitForTimeout(700);
}

async function botTexts(page) {
  return page.locator(".message-bubble.bot").allTextContents();
}

console.log("--- conversation quality regressions ---");

{
  const { page, requests } = await openPage();
  await send(page, "I need a plumber for a leaking sink");
  const bots = await botTexts(page);
  check("a straightforward request gets one concise explanatory bubble", bots.length === 1 && /plumbing/.test(bots[0]) && /4 options/.test(bots[0]), bots.join(" | "));
  check("a confident single-service request stays off the model API", requests.length === 0, `${requests.length} API call(s)`);
  await page.close();
}

{
  const { page, requests } = await openPage(() => responses.unclear);
  await send(page, "My sink is a mess");
  const bots = await botTexts(page);
  check("an ambiguous sink request asks one specific question", bots.at(-1) === responses.unclear.clarification_question, bots.at(-1));
  check("the ambiguous single-code shortcut now escalates", requests.length === 1, `${requests.length} API call(s)`);
  await page.close();
}

{
  const { page } = await openPage(() => responses.mixed);
  await send(page, "Install a ceiling fan where the old light was");
  const bots = await botTexts(page);
  check("mixed-service results distinguish complete from partial matches", /complete match/.test(bots.at(-1)) && /partial option/.test(bots.at(-1)), bots.at(-1));
  check("mixed-service acknowledgement and result count share one bubble", bots.length === 1, `${bots.length} bot bubble(s)`);
  await page.close();
}

{
  const { page } = await openPage(() => responses.offTopic);
  await send(page, "What is the capital of France?");
  const bots = await botTexts(page);
  check("off-topic copy redirects without claiming a human capability", /jobs around the home/.test(bots.at(-1)), bots.at(-1));
  await page.close();
}

{
  const { page } = await openPage();
  await send(page, "I need a plumber for a leaking sink");
  const before = (await botTexts(page)).length;
  await send(page, "Actually make it under $100");
  const correction = (await botTexts(page)).slice(before);
  check("a no-result budget correction remains applied and explains the conflict", correction.length === 1 && /under \$100/.test(correction[0]) && /over budget/.test(correction[0]), correction.join(" | "));
  check("the correction does not emit a second request-summary message", (await page.locator(".request-summary").count()) === 0, `${await page.locator(".request-summary").count()} summaries`);
  await page.close();
}

{
  const { page } = await openPage();
  await send(page, "I need help with a leaking sink under $150");
  await send(page, "Remove the budget");
  const bots = await botTexts(page);
  check("a customer can explicitly clear a filter", /without a budget limit/.test(bots.at(-1)), bots.at(-1));
  await page.close();
}

{
  const { page } = await openPage();
  await send(page, "I need a plumber for a leaking sink");
  await send(page, "Which one is cheaper?");
  const bots = await botTexts(page);
  check("comparison answers the question before listing supporting prices", /lowest-priced option/.test(bots.at(-1)), bots.at(-1));
  await page.close();
}

{
  const { page } = await openPage();
  await send(page, "I need a plumber for a leaking sink");
  await send(page, "What's included in that price?");
  const bots = await botTexts(page);
  check("a listing follow-up resolves against visible state", /flat price for the job/.test(bots.at(-1)), bots.at(-1));
  await page.close();
}

{
  const { page } = await openPage();
  await send(page, "show me all bookings");
  const bots = await botTexts(page);
  check("an empty booking list gives a direct session-aware answer", bots.at(-1) === "You haven't booked anything yet this session.", bots.at(-1));
  await send(page, "cancel the ceiling fan one");
  const afterCancel = await botTexts(page);
  check("cancelling with no bookings does not invent state", afterCancel.at(-1) === "There's nothing booked to cancel yet.", afterCancel.at(-1));
  await page.close();
}

{
  const { page, requests } = await openPage(() => "fail");
  await send(page, "I need a plumber for a leaking sink");
  await send(page, "Please keep it below $100");
  const bots = await botTexts(page);
  check("both-model failure preserves the active service during a correction", /plumbing/.test(bots.at(-1)) && /under \$100/.test(bots.at(-1)), bots.at(-1));
  check("fallback copy is transparent about unverified wording", /couldn’t verify/.test(bots.at(-1)), bots.at(-1));
  check("state is sent with the correction request", requests.at(-1)?.context?.active_request?.serviceTypes?.includes("plumbing"), JSON.stringify(requests.at(-1)?.context?.active_request));
  await page.close();
}

await browser.close();
const passed = results.filter((result) => result.pass).length;
console.log(`\nconversation: ${passed}/${results.length}`);
if (passed !== results.length) process.exitCode = 1;
