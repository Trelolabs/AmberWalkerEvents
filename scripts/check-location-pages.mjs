import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import { setTimeout as delay } from "node:timers/promises";

const inventory = JSON.parse(await readFile(new URL("../.reference/routes.json", import.meta.url), "utf8"));
const paths = inventory.routes.map((url) => new URL(url).pathname).filter((pathname) => pathname !== "/corporateevents" && pathname !== "/weddingplanning" && pathname !== "/proposalplanning" && (
  pathname.startsWith("/corporateevents") || pathname.startsWith("/weddingplanning") || pathname.includes("proposalplanning") || pathname === "/newyorkpropsalplanning"
));
if (paths.length !== 65) throw new Error(`Expected 65 location routes, found ${paths.length}.`);

const port = 3314;
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
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  for (const pathname of paths) {
    const response = await page.goto(`${origin}${pathname}`, { waitUntil: "domcontentloaded" });
    assert(response?.status() === 200, `${pathname} did not return 200.`);
    assert(!(await page.locator(".milestone-placeholder").count()), `${pathname} still uses the milestone placeholder.`);
    assert(await page.locator("main.location-page").count(), `${pathname} does not use a location template.`);
    assert((await page.locator("h1").innerText()).trim(), `${pathname} has no visible H1 text.`);
    assert((await page.locator(".location-hero img, .location-hero video, .legacy-proposal-hero img").count()) > 0, `${pathname} has no local hero media.`);
    assert(await page.locator(".site-footer").count(), `${pathname} has no footer.`);
    const legacy = pathname === "/proposalplanningcalifornia" || pathname === "/proposalplanningtoronto";
    assert(await page.locator('[data-location-section="package"], [data-location-section="planning"]').count(), `${pathname} has no planning/package section.`);
    if (!legacy) {
      assert(await page.locator('[data-location-section="press"]').count(), `${pathname} has no press section.`);
      assert((await page.locator(".location-press img").count()) === 21, `${pathname} does not render the complete 21-logo press grid.`);
      assert(await page.locator('[data-location-section="gallery"]').count(), `${pathname} has no gallery section.`);
      const family = pathname.startsWith("/corporateevents") ? "corporate" : pathname.startsWith("/weddingplanning") ? "wedding" : "proposal";
      assert((await page.locator(".location-gallery img").count()) === (family === "corporate" ? 2 : 3), `${pathname} has an incomplete ordered media gallery.`);
      if (family === "corporate") assert((await page.locator(".location-planning img").count()) === 12, `${pathname} has an incomplete What We Plan grid.`);
      if (family === "wedding") assert((await page.locator(".location-feature-image img").count()) === 1, `${pathname} has no wedding editorial feature image.`);
      if (family === "proposal") assert((await page.locator(".proposal-package > img").count()) === 1, `${pathname} has no proposal package background.`);
      assert(!(await page.locator('[data-home-section="good-company"]').count()), `${pathname} incorrectly duplicates the homepage Good Company section.`);
    } else {
      assert(await page.locator('[data-location-section="reviews"]').count(), `${pathname} has no legacy review section.`);
      assert(await page.locator(".legacy-consultation form").count(), `${pathname} has no consultation form.`);
    }
    assert((await page.evaluate(() => document.documentElement.scrollHeight)) > 2600, `${pathname} is missing lower-page content.`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const pathname of ["/corporateeventsaustin", "/weddingplanningaustin", "/austinproposalplanning", "/proposalplanningcalifornia"]) {
    await page.goto(`${origin}${pathname}`, { waitUntil: "domcontentloaded" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 1, `${pathname} overflows the mobile viewport by ${overflow}px.`);
    assert(!(await page.locator('[data-home-section="good-company"]').count()), `${pathname} duplicates the homepage Good Company section on mobile.`);
  }
  console.log(`Location pages verified: ${paths.length} routes render typed local content and media.`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
