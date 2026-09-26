import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import { setTimeout as delay } from "node:timers/promises";
import { isLocationRoute, loadRouteInventory } from "./verification-config.mjs";

const port = 3317;
const origin = `http://127.0.0.1:${port}`;
const reportOnly = process.env.ROUTE_AUDIT_REPORT_ONLY === "1";
const root = process.cwd();
const routes = await loadRouteInventory(root);
const knownRoutes = new Set(routes);
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: "ignore" });

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(origin)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error("Next.js server did not start.");
}

function expectedMain(pathname) {
  if (pathname.startsWith("/blogs/")) return "blog-article-page";
  if (isLocationRoute(pathname)) return "location-page";
  return null;
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const chunks = Array.from({ length: 4 }, () => []);
  routes.forEach((pathname, index) => chunks[index % chunks.length].push(pathname));
  const nested = await Promise.all(chunks.map(async (paths) => {
    const page = await context.newPage();
    const rows = [];
    for (const pathname of paths) {
      const failedMedia = [];
      const onResponse = (response) => {
        const url = new URL(response.url());
        if (url.origin === origin && url.pathname.startsWith("/media/") && response.status() >= 400) failedMedia.push(`${response.status()} ${url.pathname}`);
      };
      page.on("response", onResponse);
      const response = await page.goto(`${origin}${pathname}`, { waitUntil: "domcontentloaded", timeout: 15_000 });
      await page.waitForTimeout(80);
      const details = await page.evaluate(({ pathname, expected, validRoutes }) => {
        const links = [...document.querySelectorAll('a[href]')].map((link) => link.getAttribute("href")).filter(Boolean);
        const brokenInternalLinks = links.filter((href) => href.startsWith("/") && !href.startsWith("//") && !validRoutes.includes(href.split(/[?#]/)[0] || "/"));
        const images = [...document.images];
        return {
          pathname,
          status: 0,
          title: document.title,
          h1: [...document.querySelectorAll("h1")].map((node) => node.textContent?.trim()).filter(Boolean),
          mainClass: document.querySelector("main")?.className || "",
          sections: document.querySelectorAll("main > section").length,
          media: document.querySelectorAll("main img, main video").length,
          placeholder: Boolean(document.querySelector(".milestone-placeholder")),
          expectedTemplatePresent: !expected || document.querySelector(`main.${expected}`) !== null,
          brokenImages: images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
          brokenInternalLinks: [...new Set(brokenInternalLinks)],
          horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      }, { pathname, expected: expectedMain(pathname), validRoutes: [...knownRoutes] });
      details.status = response?.status() || 0;
      details.failedMedia = [...new Set(failedMedia)];
      details.failures = [
        details.status !== 200 && `HTTP ${details.status}`,
        !details.title && "missing title",
        !details.h1.length && "missing H1",
        details.placeholder && "placeholder content",
        !details.expectedTemplatePresent && `missing ${expectedMain(pathname)} template`,
        details.brokenImages.length && `${details.brokenImages.length} broken image(s)`,
        details.failedMedia.length && `${details.failedMedia.length} failed media request(s)`,
        details.brokenInternalLinks.length && `${details.brokenInternalLinks.length} unknown internal link(s)`,
        details.horizontalOverflow > 1 && `${details.horizontalOverflow}px horizontal overflow`,
      ].filter(Boolean);
      rows.push(details);
      page.off("response", onResponse);
    }
    await page.close();
    return rows;
  }));
  const results = nested.flat().sort((a, b) => routes.indexOf(a.pathname) - routes.indexOf(b.pathname));
  const failures = results.filter((result) => result.failures.length);
  await mkdir(path.join(root, ".visual"), { recursive: true });
  await writeFile(path.join(root, ".visual", "route-audit.json"), `${JSON.stringify({ routeCount: results.length, failedRoutes: failures.length, results }, null, 2)}\n`);
  for (const result of failures) console.error(`${result.pathname}: ${result.failures.join(", ")}`);
  console.log(`Route completeness audit: ${results.length} checked, ${failures.length} incomplete. Report: .visual/route-audit.json`);
  if (failures.length && !reportOnly) process.exitCode = 1;
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
