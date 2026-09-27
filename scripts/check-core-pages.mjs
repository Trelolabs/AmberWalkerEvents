import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { setTimeout as delay } from "node:timers/promises";

const paths = ["/", "/proposalweddingvideos", "/meetamber", "/blog", "/proposaltips", "/weddingplanning", "/corporatesocialportfolio", "/socialevents", "/media", "/contact", "/corporateevents", "/copy-of-social-events", "/proposalplanning", "/corporatesocialvideos", "/aboutawe", "/proposalweddingportfolio"];
const goodCompanyPaths = new Set(["/", "/corporateevents", "/socialevents", "/weddingplanning", "/proposalplanning"]);
const port = 3313;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: "ignore" });

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(origin)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error("Next.js server did not start.");
}

function assert(value, message) { if (!value) throw new Error(message); }

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  for (const pathname of paths) {
    const response = await page.goto(`${origin}${pathname}`, { waitUntil: "domcontentloaded" });
    assert(response?.status() === 200, `${pathname} did not return 200.`);
    assert(!(await page.locator(".milestone-placeholder").count()), `${pathname} still uses the milestone placeholder.`);
    assert(await page.locator("main").count(), `${pathname} has no main content.`);
    assert(await page.locator("h1").count(), `${pathname} has no H1.`);
    assert(await page.locator(".site-footer").count(), `${pathname} has no footer.`);
    if (goodCompanyPaths.has(pathname)) {
      const goodCompany = page.locator('[data-home-section="good-company"]');
      assert(await goodCompany.count(), `${pathname} Good Company section is missing.`);
      assert((await page.locator(".brand-flow img").count()) === 50, `${pathname} does not render the duplicated 25-logo marquee.`);
      assert((await page.locator(".testimonial-slide").count()) === 12, `${pathname} does not render all twelve source testimonial cards.`);
      await goodCompany.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector(".brand-flow img")?.naturalWidth > 0);
    } else {
      assert(!(await page.locator('[data-home-section="good-company"]').count()), `${pathname} incorrectly duplicates the homepage Good Company section.`);
    }
  }
  await page.goto(`${origin}/contact`);
  assert(!(await page.locator("form.contact-form").count()), "Contact page incorrectly duplicates the modal inquiry form.");
  assert((await page.getByText("2219 Main Street, Unit 198,").count()) === 1, "Contact page has the wrong California address.");
  assert((await page.getByText("27 Bathurst Street,").count()) === 1, "Contact page has the wrong Toronto address.");
  for (const pathname of ["/corporateevents", "/socialevents"]) {
    await page.goto(`${origin}${pathname}`);
    assert((await page.locator(".service-press img").count()) === 21, `${pathname} press grid is incomplete.`);
    assert((await page.locator(".service-planning article").count()) === 12, `${pathname} planning grid is incomplete.`);
    assert((await page.locator(".service-showcase img").count()) === 2, `${pathname} showcase is incomplete.`);
    assert((await page.locator(".service-portfolio-links a").count()) === 2, `${pathname} portfolio links are incomplete.`);
  }
  await page.goto(`${origin}/weddingplanning`);
  assert((await page.locator(".wedding-service-feature img").count()) === 1, "Wedding editorial feature is missing.");
  assert((await page.locator(".service-showcase img").count()) === 3, "Wedding gallery is incomplete.");
  await page.goto(`${origin}/proposalplanning`);
  assert((await page.locator(".proposal-location-selector a").count()) === 21, "Proposal location selector is incomplete.");
  assert((await page.locator(".service-portfolio-links a").count()) === 2, "Proposal portfolio links are incomplete.");
  assert((await page.locator(".site-footer").getByText("YOUR PROPOSAL").count()) === 1, "Proposal footer uses generic event copy.");
  await page.goto(`${origin}/proposaltips`);
  assert((await page.locator(".proposal-review").count()) === 1, "Proposal Tips testimonial is missing.");
  assert((await page.locator(".service-showcase img").count()) === 3, "Proposal Tips gallery is incomplete.");
  await page.goto(`${origin}/aboutawe`);
  assert((await page.locator(".brand-layout").count()) === 1 && (await page.locator(".service-press img").count()) === 21, "Brand page composition is incomplete.");
  await page.goto(`${origin}/copy-of-social-events`);
  assert((await page.locator(".legacy-social-cta a").count()) === 1 && (await page.locator(".legacy-social-portfolio a").count()) === 1, "Legacy social calls to action are incomplete.");
  await page.goto(`${origin}/corporatesocialportfolio`);
  assert((await page.locator(".gallery-grid img").count()) >= 12, "Corporate gallery has too few images.");
  console.log(`Core pages verified: ${paths.length} routes render local content and media.`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
