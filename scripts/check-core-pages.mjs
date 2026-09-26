import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { setTimeout as delay } from "node:timers/promises";

const paths = ["/", "/proposalweddingvideos", "/meetamber", "/blog", "/proposaltips", "/weddingplanning", "/corporatesocialportfolio", "/socialevents", "/media", "/contact", "/corporateevents", "/copy-of-social-events", "/proposalplanning", "/corporatesocialvideos", "/aboutawe", "/proposalweddingportfolio"];
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
    if (pathname === "/") {
      assert(await page.locator('[data-home-section="good-company"]').count(), "Homepage Good Company section is missing.");
      assert((await page.locator(".brand-flow img").count()) === 28, "Homepage does not render the duplicated 14-logo marquee.");
      assert((await page.locator(".review-stars").count()) === 3, "Homepage does not render all three testimonial ratings.");
      await page.waitForFunction(() => document.querySelector(".brand-flow img")?.naturalWidth > 0);
    } else {
      assert(!(await page.locator('[data-home-section="good-company"]').count()), `${pathname} incorrectly duplicates the homepage Good Company section.`);
    }
  }
  await page.goto(`${origin}/contact`);
  assert(await page.locator("form.contact-form").count(), "Contact form is missing.");
  await page.goto(`${origin}/corporatesocialportfolio`);
  assert((await page.locator(".gallery-grid img").count()) >= 12, "Corporate gallery has too few images.");
  console.log(`Core pages verified: ${paths.length} routes render local content and media.`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
