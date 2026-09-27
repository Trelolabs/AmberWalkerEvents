import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { setTimeout as delay } from "node:timers/promises";

const port = 3317;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: "ignore" });
const galleryRoutes = ["/corporatesocialportfolio", "/proposalweddingportfolio"];
const videoRoutes = ["/corporatesocialvideos", "/proposalweddingvideos"];
const routes = [...galleryRoutes, ...videoRoutes, "/media"];

function assert(value, message) { if (!value) throw new Error(message); }

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

  for (const pathname of galleryRoutes) {
    await page.goto(`${origin}${pathname}`);
    assert(await page.locator(".gallery-grid > button").count() === 16, `${pathname} must render the 16 source gallery images.`);
    assert(await page.locator('.gallery-grid img[src^="/media/portfolio/display/"]').count() === 16, `${pathname} gallery images are not local display derivatives.`);
    await page.locator(".gallery-grid > button").first().click();
    const dialog = page.locator(".portfolio-lightbox");
    assert(await dialog.evaluate((element) => element.open), `${pathname} lightbox did not open.`);
    assert(await dialog.getByText("1 / 16").count() === 1, `${pathname} lightbox counter is wrong.`);
    await page.keyboard.press("ArrowRight");
    assert(await dialog.getByText("2 / 16").count() === 1, `${pathname} lightbox keyboard navigation failed.`);
    await page.keyboard.press("Escape");
    assert(!(await dialog.evaluate((element) => element.open)), `${pathname} lightbox did not close with Escape.`);
  }

  for (const pathname of videoRoutes) {
    await page.goto(`${origin}${pathname}`);
    assert(await page.locator(".video-carousel").count() === 1, `${pathname} video carousel is missing.`);
    await page.getByRole("button", { name: "Show video selection" }).click();
    assert(await page.locator(".video-carousel-menu > button").count() === 4, `${pathname} must expose all four source videos.`);
    await page.locator(".video-carousel-menu > button").nth(1).click();
    await page.getByRole("button", { name: "Play Video" }).click();
    const video = page.locator(".video-stage video");
    assert(await video.count() === 1 && await video.getAttribute("controls") !== null, `${pathname} playback controls are missing.`);
    assert((await video.getAttribute("src"))?.startsWith("/media/"), `${pathname} does not reuse a local video.`);
  }

  await page.goto(`${origin}/media`);
  assert(await page.locator(".media-video img").getAttribute("src") === "/media/video/media-cityline-poster.jpg", "Media feature poster is not local.");
  assert((await page.locator(".media-video").getAttribute("href"))?.includes("youtube.com/watch?v=HgUBDIkKF70"), "Media feature has the wrong playback destination.");
  assert(await page.locator(".media-press img").count() === 21, "Media press inventory is incomplete.");

  await page.setViewportSize({ width: 390, height: 844 });
  for (const pathname of routes) {
    await page.goto(`${origin}${pathname}`);
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth }));
    assert(dimensions.scrollWidth <= dimensions.innerWidth, `${pathname} has ${dimensions.scrollWidth - dimensions.innerWidth}px horizontal overflow.`);
  }
  console.log("Rich media verified: source galleries, lightbox keyboard controls, video carousels, media links, and responsive no-overflow layouts.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
