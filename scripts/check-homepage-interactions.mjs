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
  assert((await desktop.locator(".home-hero-slide").count()) === 3, "Homepage hero must contain all three captured slides.");
  assert((await desktop.locator(".home-hero-counter span").count()) === 3, "Homepage hero counter is incomplete.");
  assert((await desktop.locator(".brand-flow img").count()) === 50, "Logo track must contain two complete 25-logo sets.");
  assert((await desktop.locator(".testimonial-slide").count()) === 12, "Testimonial carousel must contain all twelve source cards.");
  await desktop.waitForFunction(() => [...document.querySelectorAll(".brand-flow img")].slice(0, 8).every((image) => image.complete && image.naturalWidth > 0));
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
  assert(await desktop.locator(".home-hero-slide").first().evaluate((node) => getComputedStyle(node).animationName === "home-hero-fade"), "Hero slideshow is not animated.");
  assert(await desktop.locator(".testimonial-slide").first().evaluate((node) => getComputedStyle(node).animationName === "testimonial-fade"), "Testimonial cards are not animated.");

  const footerAction = desktop.locator(".footer-action-carousel");
  await footerAction.scrollIntoViewIfNeeded();
  assert(await desktop.getByRole("button", { name: "Inquire Now" }).isVisible(), "Footer does not initially show Inquire Now.");
  await footerAction.hover();
  const eventInquiry = desktop.getByRole("button", { name: "Event Inquiry" });
  const vendorInquiry = desktop.getByRole("link", { name: "Become A Vendor" });
  assert(await eventInquiry.isVisible(), "Event Inquiry is not revealed on hover.");
  assert(await vendorInquiry.isVisible(), "Become A Vendor is not revealed on hover.");
  const [eventBox, vendorBox] = await Promise.all([eventInquiry.boundingBox(), vendorInquiry.boundingBox()]);
  assert(eventBox && vendorBox, "Footer split actions have no layout boxes.");
  assert(Math.abs(eventBox.width - vendorBox.width) < 0.5, "Footer split actions are not equal widths.");
  assert(Math.abs(vendorBox.x - eventBox.x - eventBox.width - 30) < 0.5, "Footer split action gap does not match the source.");
  assert(await vendorInquiry.getAttribute("href") === "mailto:vendors@amberwalkerevents.com?subject=Vendor%20Application%20", "Vendor action is not the source mailto link.");
  const beforeInquiryUrl = desktop.url();
  await eventInquiry.click();
  const inquiryDialog = desktop.locator("dialog.inquiry-modal");
  assert(await inquiryDialog.isVisible(), "Event Inquiry does not open a modal.");
  assert(desktop.url() === beforeInquiryUrl, "Event Inquiry navigated away instead of opening in place.");
  assert((await inquiryDialog.locator("input[required]").count()) === 5, "Event Inquiry modal is missing required inputs.");
  assert((await inquiryDialog.locator("select[required]").count()) === 3, "Event Inquiry modal is missing source selectors.");
  assert((await inquiryDialog.locator("textarea[required]").count()) === 1, "Event Inquiry modal is missing event details.");
  await desktop.keyboard.press("Escape");
  assert(!(await inquiryDialog.isVisible()), "Event Inquiry modal does not close with Escape.");

  const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const reduced = await reducedContext.newPage();
  await reduced.goto(origin, { waitUntil: "domcontentloaded" });
  await reduced.locator('[data-home-section="good-company"]').scrollIntoViewIfNeeded();
  assert(await reduced.locator(".brand-flow > div").evaluate((node) => getComputedStyle(node).animationName === "none"), "Reduced-motion mode does not stop the carousel.");
  assert(await reduced.locator(".home-hero-slide").first().evaluate((node) => getComputedStyle(node).animationName === "none"), "Reduced-motion mode does not stop the hero slideshow.");
  assert(await reduced.locator(".testimonial-slide").first().evaluate((node) => getComputedStyle(node).animationName === "none"), "Reduced-motion mode does not stop the testimonial carousel.");
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

  console.log("Homepage interactions verified: carousels work, footer actions split evenly, vendor uses mailto, and Event Inquiry stays in a modal.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
