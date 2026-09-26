import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { setTimeout as delay } from "node:timers/promises";

const port = 3316;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: "ignore" });
const assert = (value, message) => { if (!value) throw new Error(message); };

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(origin)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error("Next.js server did not start.");
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(origin, { waitUntil: "domcontentloaded" });
  const section = desktop.locator('[data-home-section="good-company"]');
  assert(await section.count(), "Homepage Good Company section is absent.");
  await section.scrollIntoViewIfNeeded();
  assert(await section.isVisible(), "Homepage Good Company section is not visible.");
  assert((await desktop.locator(".brand-flow img").count()) === 28, "Logo track must contain two complete 14-logo sets.");
  await desktop.waitForFunction(() => [...document.querySelectorAll(".brand-flow img")].every((image) => image.complete && image.naturalWidth > 0));
  const track = desktop.locator(".brand-flow > div");
  const animation = await track.evaluate((node) => ({
    name: getComputedStyle(node).animationName,
    iterations: getComputedStyle(node).animationIterationCount,
    before: node.getBoundingClientRect().x,
  }));
  await desktop.waitForTimeout(900);
  const after = await track.evaluate((node) => node.getBoundingClientRect().x);
  assert(animation.name === "brand-marquee", `Unexpected logo animation: ${animation.name}.`);
  assert(animation.iterations === "infinite", "Logo carousel is not configured to loop.");
  assert(Math.abs(after - animation.before) > 1, "Logo carousel did not move.");

  const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const reduced = await reducedContext.newPage();
  await reduced.goto(origin, { waitUntil: "domcontentloaded" });
  await reduced.locator('[data-home-section="good-company"]').scrollIntoViewIfNeeded();
  assert(await reduced.locator(".brand-flow > div").evaluate((node) => getComputedStyle(node).animationName === "none"), "Reduced-motion mode does not stop the carousel.");
  assert(await reduced.locator(".brand-flow img").first().isVisible(), "Reduced-motion fallback hides the client logos.");
  await reducedContext.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(origin, { waitUntil: "domcontentloaded" });
  await mobile.locator(".review-flow").scrollIntoViewIfNeeded();
  const reviewFlow = mobile.locator(".review-flow");
  const scrollable = await reviewFlow.evaluate((node) => node.scrollWidth > node.clientWidth);
  assert(scrollable, "Mobile testimonials are not horizontally scrollable.");
  await reviewFlow.evaluate((node) => { node.scrollLeft = Math.min(node.clientWidth, node.scrollWidth - node.clientWidth); });
  await mobile.waitForTimeout(150);
  assert(await reviewFlow.evaluate((node) => node.scrollLeft > 0), "Mobile testimonial swipe fallback cannot advance.");

  console.log("Homepage carousel verified: visible, loaded, moving, looping, reduced-motion safe, and mobile-scrollable.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
