// Browser-level regressions that the pure-function suite cannot catch:
// how many bubbles a single send produces, and whether the thread only ever
// shows two message styles.
//
//   npm run dev            # in another terminal
//   node src/lib/__tests__/ui.test.mjs
//
// Override the origin with UI_BASE if the dev server is on another port.
import { chromium } from "playwright";

const BASE = process.env.UI_BASE ?? "http://localhost:5173";
const APP = `${BASE.replace(/\/$/, "")}/chat/`;

const results = [];
function check(label, pass, detail = "") {
  results.push({ label, pass, detail });
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label}${detail ? `\n          ${detail}` : ""}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 820 } });
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));
page.on("console", (m) => m.type() === "error" && pageErrors.push(m.text()));

try {
  await page.goto(APP);
  await page.waitForSelector(".example-chip", { timeout: 15000 });
} catch {
  console.log(`\nSkipped: no dev server at ${APP}. Start it with \`npm run dev\`.`);
  await browser.close();
  process.exit(0);
}

const send = async (text) => {
  await page.locator(".chat-input-bar input").fill(text);
  await page.locator(".chat-input-bar button").click();
  await page.waitForTimeout(2200);
};
const bubbles = (sel) => page.locator(sel).allTextContents();

console.log("--- one send, one bubble ---");

const CHIP_TEXT = "Gutters are overflowing and there are leaves all over the lawn.";
await page.locator(".example-chip").filter({ hasText: "Gutters" }).click();
await page.waitForSelector(".listing-card", { timeout: 20000 });
await page.waitForTimeout(800);

let users = await bubbles(".message-bubble.user");
check(
  "tapping one example chip produces exactly one user bubble",
  users.length === 1 && users[0].trim() === CHIP_TEXT,
  `${users.length} bubble(s)`,
);

const TYPED = "I want a ceiling fan put in";
await send(TYPED);
users = await bubbles(".message-bubble.user");
check(
  "sending one typed message adds exactly one more user bubble",
  users.length === 2 && users.filter((t) => t.trim() === TYPED).length === 1,
  `${users.length} total, ${users.filter((t) => t.trim() === TYPED).length} matching the new text`,
);

check(
  "no user bubble text is duplicated",
  new Set(users.map((t) => t.trim())).size === users.length,
  users.map((t) => `"${t.slice(0, 28)}"`).join(", "),
);

const ids = await page.$$eval(".message-row", (els) => els.length);
check("every message row rendered once", ids > 0, `${ids} rows`);

console.log("\n--- exactly two message styles ---");

// Force an off-topic reply too, so bot copy of more than one kind is present.
await send("can someone paint the exterior of my house");

const styles = await page.$$eval(".message-bubble", (els) =>
  els.map((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      kind: el.classList.contains("user") ? "user" : "bot",
      bg: s.backgroundColor,
      color: s.color,
      font: s.fontFamily.split(",")[0].replace(/"/g, ""),
      left: Math.round(r.x),
    };
  }),
);

const userStyles = styles.filter((s) => s.kind === "user");
const botStyles = styles.filter((s) => s.kind === "bot");

check("the conversation contains both user and bot messages", userStyles.length > 0 && botStyles.length > 0, `${userStyles.length} user, ${botStyles.length} bot`);

check(
  "all user bubbles share one background",
  new Set(userStyles.map((s) => s.bg)).size === 1,
  [...new Set(userStyles.map((s) => s.bg))].join(" | "),
);
check(
  "all bot bubbles share one background",
  new Set(botStyles.map((s) => s.bg)).size === 1,
  [...new Set(botStyles.map((s) => s.bg))].join(" | "),
);
check(
  "user and bot backgrounds differ",
  userStyles[0]?.bg !== botStyles[0]?.bg,
  `user ${userStyles[0]?.bg} vs bot ${botStyles[0]?.bg}`,
);

const userLeft = Math.min(...userStyles.map((s) => s.left));
const botLeft = Math.max(...botStyles.map((s) => s.left));
check(
  "user and bot are aligned to opposite sides",
  userLeft > botLeft,
  `nearest user edge ${userLeft}px, furthest bot edge ${botLeft}px`,
);

check(
  "no third bubble style exists",
  new Set(styles.map((s) => `${s.bg}|${s.font}`)).size === 2,
  [...new Set(styles.map((s) => `${s.bg} ${s.font}`))].join("  ///  "),
);

console.log("--- booked card: tap Cancel, tap Reschedule ---");

// Opens the first card with open slots, books it, and returns a locator on
// the resulting booked card. Some listings in a result set have no
// availability, so this skips past a disabled Book button rather than
// assuming the first card always has one.
async function bookFirstAvailable(resultsLocator) {
  const cards = resultsLocator.locator(".listing-card-tappable");
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    await card.click();
    await page.waitForTimeout(350);
    const bookButton = card.locator(".detail-book-button");
    if (await bookButton.isDisabled()) {
      await card.click();
      await page.waitForTimeout(350);
      continue;
    }
    const title = (await card.locator(".listing-card-title").innerText()).trim();
    await bookButton.click();
    await page.waitForTimeout(350);
    await card.locator(".slot-button").first().click();
    await page.waitForTimeout(700);
    return title;
  }
  return null;
}

const bookedByTapTitle = await bookFirstAvailable(page.locator(".results-list").first());
const bookedCard = page.locator(".listing-card.is-booked").filter({ hasText: bookedByTapTitle ?? "" });
await bookedCard.waitFor({ timeout: 5000 });

check("booking a card reaches booked state", (await bookedCard.count()) === 1, bookedByTapTitle ?? "no bookable card found");

const priceBefore = (await bookedCard.locator(".booked-line").nth(1).innerText()).trim();
const whenBefore = (await bookedCard.locator(".booked-line").first().innerText()).trim();

// Reschedule: reopens the picker in place, marks the current slot, and picking
// a different one must change only the time.
await bookedCard.locator(".booked-action", { hasText: "Reschedule" }).click();
await page.waitForTimeout(350);
const currentMark = bookedCard.locator(".slot-button.is-current");
check("reschedule marks the currently booked slot", (await currentMark.count()) === 1, `${await currentMark.count()} marked`);

await bookedCard.locator(".slot-button:not(.is-current)").first().click();
await page.waitForTimeout(700);

check("reschedule keeps the card in booked state", (await bookedCard.locator(".booked-marker").count()) === 1, "still shows the Booked marker");
const whenAfter = (await bookedCard.locator(".booked-line").first().innerText()).trim();
const priceAfter = (await bookedCard.locator(".booked-line").nth(1).innerText()).trim();
check("reschedule changes only the slot", whenAfter !== whenBefore && priceAfter === priceBefore, `${whenBefore} -> ${whenAfter}, price ${priceAfter}`);

// Cancel by tap: inline confirm, then the card reverts to a normal tappable
// card — same as what the chat intent does. A follow-up "Still open" message
// can land after it if the job had other codes outstanding, so the check
// looks across the new bot bubbles rather than assuming "Cancelled" is last.
let botCountBefore = (await bubbles(".message-bubble.bot")).length;
await bookedCard.locator(".booked-action", { hasText: "Cancel" }).click();
await page.waitForTimeout(300);
await bookedCard.locator(".booked-confirm-yes").click();
await page.waitForTimeout(700);

let newBotTexts = (await bubbles(".message-bubble.bot")).slice(botCountBefore);
check(
  "tap Cancel posts the same confirmation copy as the chat intent",
  newBotTexts.some((t) => t.includes("Cancelled")),
  newBotTexts.join(" | "),
);
check(
  "tap Cancel reverts the card out of booked state",
  (await page.locator(".listing-card.is-booked").filter({ hasText: bookedByTapTitle ?? "" }).count()) === 0,
  `${bookedByTapTitle} no longer booked`,
);

// Cancel by chat intent, on a fresh booking, should land in the identical
// end state: same confirmation copy, same reversion out of booked state.
const bookedByChatTitle = await bookFirstAvailable(page.locator(".results-list").first());
botCountBefore = (await bubbles(".message-bubble.bot")).length;
await send("cancel it");
newBotTexts = (await bubbles(".message-bubble.bot")).slice(botCountBefore);
check(
  "cancel_booking chat intent produces the same confirmation copy as tap Cancel",
  newBotTexts.some((t) => t.includes("Cancelled")),
  newBotTexts.join(" | "),
);
check(
  "cancel_booking chat intent reverts the card exactly like tap Cancel does",
  (await page.locator(".listing-card.is-booked").filter({ hasText: bookedByChatTitle ?? "" }).count()) === 0,
  `${bookedByChatTitle} no longer booked`,
);

check("no console or page errors", pageErrors.length === 0, pageErrors.join(" | "));

const passed = results.filter((r) => r.pass).length;
console.log(`\n========================================\nui       : ${passed}/${results.length}`);

await browser.close();
process.exit(passed === results.length ? 0 : 1);
