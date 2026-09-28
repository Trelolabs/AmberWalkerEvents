import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { setTimeout as delay } from "node:timers/promises";

const routes = ["canaroma", "oscars", "chicagoproposal", "miamiwedding", "nagarro", "urbanplanet", "aliceinwonderland", "hbng", "amberwalkerdesigns", "llds", "cntower", "amg", "ajminter"];
const port = 3318;
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
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${origin}/blog`);
  assert(await page.locator(".blog-card").count() === 13, "Blog index must render all 13 source articles.");
  assert(await page.getByLabel("Filter Subject").count() === 1 && await page.getByLabel("Select Location").count() === 1, "Blog filters are missing.");
  await page.getByLabel("Filter Subject").selectOption("Corporate");
  await page.getByLabel("Select Location").selectOption("Toronto");
  assert(await page.locator(".blog-card").count() === 4, "Combined subject and location filters are incorrect.");
  await page.getByLabel("Filter Subject").selectOption("All");
  await page.getByLabel("Select Location").selectOption("All");
  assert(await page.locator(".blog-card").count() === 13, "All filter did not restore the article list.");

  for (const slug of routes) {
    await page.goto(`${origin}/blogs/${slug}`);
    assert(!(await page.locator(".milestone-placeholder").count()), `${slug} still uses the milestone placeholder.`);
    assert(await page.locator(".blog-lead h1").count() === 1, `${slug} title is missing.`);
    assert(await page.locator(".blog-labels").count() === 1, `${slug} subject/location labels are missing.`);
    assert(await page.locator(".blog-story-row").count() >= 2, `${slug} article flow is incomplete.`);
    assert(await page.locator('.blog-media img[src^="/media/"], .blog-media video[src^="/media/"]').count() >= 2, `${slug} does not use local article media.`);
    assert(await page.locator('.blog-article-nav a[href="/blog"]').count() === 1, `${slug} back navigation is missing.`);
    assert(await page.locator('.blog-article-nav a[href^="/blogs/"]').count() === 2, `${slug} previous/next navigation is incomplete.`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const pathname of ["/blog", ...routes.map((slug) => `/blogs/${slug}`)]) {
    await page.goto(`${origin}${pathname}`);
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth }));
    assert(dimensions.scrollWidth <= dimensions.innerWidth, `${pathname} has ${dimensions.scrollWidth - dimensions.innerWidth}px horizontal overflow.`);
  }
  console.log("Blog verified: 13 source articles, filters, local media, article navigation, and responsive no-overflow layouts.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
