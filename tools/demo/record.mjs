// Service Desk Autopilot — clean walkthrough recorder for the technician console.
//
// Run on YOUR machine (this drives the real run over SSH, which is your action — not the agent's):
//   cd tools/demo && npm install && npx playwright install chromium && node record.mjs
//
// Output: tools/demo/recording/<id>.webm  →  feed into the Remotion project (tools/demo/remotion) to polish.
//
// The selectors below target the lightweight Vite console (port 5173). Start it with
//   docker compose --profile fallback up frontend-vite
// (the default `docker compose up` runs the richer Next.js dashboard on :3000; to record that
// instead, set APP_URL=http://localhost:3000 and update the selectors to the dashboard's DOM).
//
// Note: the Approve clicks are scripted only to get a clean, repeatable take for the video — the
// product genuinely gates every write behind a human; the script pauses visibly at each gate.
import { chromium } from "playwright";

const BASE = process.env.APP_URL || "http://localhost:5173";
const TICKET = process.env.TICKET_TITLE || "Status API intermittently unavailable";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: "recording", size: { width: 1440, height: 900 } },
});
const page = await context.newPage();

await page.goto(BASE);
await page.waitForSelector(".tk");
await sleep(2800); // intro — the ticket queue

await page.click(`.tk:has-text("${TICKET}")`);
await page.waitForSelector(".ticket-head");
await sleep(3200); // ticket detail + customer system

await page.click('button:has-text("Start AI troubleshooting session")');

// Drive the loop: read-only diagnostics stream on their own; approve writes when the gate appears.
const deadline = Date.now() + 4 * 60 * 1000;
while (Date.now() < deadline) {
  if (await page.locator('.card:has-text("Activity")').count()) break; // run concluded
  const approve = page.locator('button:has-text("Approve")').first();
  if (await approve.count()) {
    await approve.scrollIntoViewIfNeeded().catch(() => {});
    await sleep(2600); // let the viewer read the proposed command + rationale (the human gate)
    await approve.click();
  }
  await sleep(1200);
}

const gen = page.locator('button:has-text("Generate documentation")');
if (await gen.count()) {
  await gen.click();
  await page.waitForSelector(".field");
  await sleep(3200); // review the drafted activity
}
const submit = page.locator('button:has-text("Submit activity to ERP")');
if (await submit.count()) {
  await submit.click();
  await page.waitForSelector(".banner.success", { timeout: 30000 }).catch(() => {});
}
await sleep(3500); // success + audit trail

await context.close(); // flushes the .webm
await browser.close();
console.log("✓ Recording saved to demo/recording/  — now polish it with demo/remotion");
