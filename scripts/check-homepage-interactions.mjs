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
  assert(await inquiryDialog.getByRole("button", { name: "Close event inquiry" }).evaluate((node) => getComputedStyle(node).fontSize === "56px"), "Event Inquiry close icon does not use the compact desktop size.");
  const modalMark = inquiryDialog.locator(".inquiry-modal-logo");
  assert(await modalMark.evaluate((image) => image.complete && image.naturalWidth === 136), "Event Inquiry mark is not loaded when the modal opens.");
  const markBox = await modalMark.boundingBox();
  assert(markBox && Math.abs(markBox.x + markBox.width / 2 - 720) < 0.5 && Math.abs(markBox.y - 18) < 0.5, "Event Inquiry mark is not centered above the contact block.");
  assert(markBox && Math.abs(markBox.width - 100.8) < 0.5, "Event Inquiry mark does not use the approved unified scale.");
  const formBox = await inquiryDialog.locator(".inquiry-modal-form").boundingBox();
  assert(formBox && Math.abs(formBox.x + formBox.width / 2 - 720) < 0.5 && Math.abs(formBox.width - 721.8) < 0.5, "Event Inquiry form is not compact and centered.");
  assert((await inquiryDialog.locator("input[required]").count()) === 5, "Event Inquiry modal is missing required inputs.");
  assert((await inquiryDialog.locator("select[required]").count()) === 3, "Event Inquiry modal is missing source selectors.");
  assert((await inquiryDialog.locator("textarea[required]").count()) === 1, "Event Inquiry modal is missing event details.");
  await inquiryDialog.getByRole("button", { name: "Submit" }).click();
  assert((await inquiryDialog.locator(".inquiry-error").count()) === 9, "Event Inquiry does not show all source validation messages.");
  assert(await inquiryDialog.locator('[name="name"]').getAttribute("aria-invalid") === "true", "Required name field is not exposed as invalid.");
  assert(await inquiryDialog.locator('[name="email"]').getAttribute("aria-describedby") === "inquiry-email-error", "Email error is not associated with its input.");
  assert(await inquiryDialog.locator('[name="name"]').evaluate((node) => node === document.activeElement), "Validation does not focus the first invalid field.");
  assert(await inquiryDialog.getByText("Enter an email address like example@mysite.com.").isVisible(), "Source email validation message is missing.");
  assert(await inquiryDialog.locator(".inquiry-error").first().evaluate((node) => node.getBoundingClientRect().height >= 16), "Validation messages are visually clipped.");
  await inquiryDialog.locator('[name="name"]').fill("Amber Client");
  assert(!(await inquiryDialog.locator("#inquiry-name-error").count()), "Correcting a field does not clear its validation message.");
  await desktop.keyboard.press("Escape");
  assert(!(await inquiryDialog.isVisible()), "Event Inquiry modal does not close with Escape.");

  const laptop = await browser.newPage({ viewport: { width: 1063, height: 635 } });
  await laptop.goto(origin, { waitUntil: "domcontentloaded" });
  const laptopFooterAction = laptop.locator(".footer-action-carousel");
  await laptopFooterAction.scrollIntoViewIfNeeded();
  await laptopFooterAction.hover();
  await laptop.getByRole("button", { name: "Event Inquiry" }).click();
  const laptopDialog = laptop.locator("dialog.inquiry-modal");
  const laptopMark = await laptopDialog.locator(".inquiry-modal-logo").boundingBox();
  const laptopHeading = await laptopDialog.locator(".inquiry-modal-heading").boundingBox();
  const laptopForm = await laptopDialog.locator(".inquiry-modal-form").boundingBox();
  assert(await laptopDialog.getByRole("button", { name: "Close event inquiry" }).evaluate((node) => getComputedStyle(node).fontSize === "56px"), "Short-viewport close icon does not retain the compact size.");
  assert(laptopMark && Math.abs(laptopMark.x + laptopMark.width / 2 - 531.5) < 0.5 && Math.abs(laptopMark.width - 70.2) < 0.5, "Short-viewport modal mark is not compact and centered.");
  assert(laptopHeading && Math.abs(laptopHeading.x + laptopHeading.width / 2 - 531.5) < 0.5, "Short-viewport contact block is not centered.");
  assert(laptopForm && Math.abs(laptopForm.x + laptopForm.width / 2 - 531.5) < 0.5 && Math.abs(laptopForm.width - 721.8) < 0.5, "Short-viewport form grid is not compact and centered.");
  assert(laptopForm && laptopForm.y + laptopForm.height <= 635, "Short-viewport modal form extends below the fold.");
  await laptop.close();

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
