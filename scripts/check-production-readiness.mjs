import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { setTimeout as delay } from "node:timers/promises";
import { loadRouteInventory } from "./verification-config.mjs";

const port = 3318;
const origin = `http://127.0.0.1:${port}`;
const canonicalOrigin = "https://www.amberwalkerevents.com";
const routes = await loadRouteInventory(process.cwd());
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: "ignore" });

function assert(value, message) {
  if (!value) throw new Error(message);
}

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
  const [sitemap, robots, homeImage, routeImage] = await Promise.all([
    fetch(`${origin}/sitemap.xml`),
    fetch(`${origin}/robots.txt`),
    fetch(`${origin}/opengraph-image`),
    fetch(`${origin}/og/aboutawe`),
  ]);
  assert(sitemap.ok, "Sitemap endpoint failed.");
  assert(robots.ok, "Robots endpoint failed.");
  assert(homeImage.ok && homeImage.headers.get("content-type")?.startsWith("image/png"), "Home social image endpoint failed.");
  assert(routeImage.ok && routeImage.headers.get("content-type")?.startsWith("image/png"), "Route social image endpoint failed.");

  const sitemapText = await sitemap.text();
  const sitemapUrls = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert(sitemapUrls.length === routes.length, `Sitemap has ${sitemapUrls.length} URLs; expected ${routes.length}.`);
  for (const pathname of routes) assert(sitemapUrls.includes(`${canonicalOrigin}${pathname === "/" ? "" : pathname}`), `Sitemap is missing ${pathname}.`);
  assert((await robots.text()).includes(`${canonicalOrigin}/sitemap.xml`), "Robots file does not advertise the canonical sitemap.");

  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Inquire Now" }).evaluate((button) => button.click());
  await page.getByRole("button", { name: "Event Inquiry" }).evaluate((button) => button.click());
  assert(await page.getByText("This preview validates your details but does not send them yet.", { exact: false }).isVisible(), "Inquiry delivery limitation is not visible.");
  assert(await page.locator(".home-hero-slide").nth(1).evaluate((node) => getComputedStyle(node).animationName) === "none", "Reduced-motion animation safeguard is missing.");
  console.log(`Production readiness verified: ${routes.length} sitemap routes, robots, social images, form disclosure, and reduced motion.`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
