import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { captureFullPage, viewports as verificationViewports } from "./verification-config.mjs";

const ORIGIN = "https://www.amberwalkerevents.com";
const ROOT = process.cwd();
const REFERENCE = path.join(ROOT, ".reference");
const MEDIA_ROOT = path.join(ROOT, "public", "media");
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const LIMIT = Number(process.env.AUDIT_LIMIT || 0);
const SCREENSHOTS = process.env.AUDIT_SCREENSHOTS !== "0";
const DOWNLOADS = process.env.AUDIT_DOWNLOADS !== "0";
const PAGE_CONCURRENCY = Number(process.env.AUDIT_CONCURRENCY || 3);
const REUSE_CAPTURE = process.env.AUDIT_REUSE_CAPTURE === "1";
const ROUTE_FILTER = process.env.AUDIT_ROUTE || "";
const CAPTURE_ONLY = process.env.AUDIT_CAPTURE_ONLY === "1";
const VIEWPORT_FILTER = process.env.AUDIT_VIEWPORT || "";

const viewports = Object.fromEntries(
  verificationViewports
    .filter(({ name }) => !VIEWPORT_FILTER || name === VIEWPORT_FILTER)
    .map(({ name, width, height }) => [name, { width, height }]),
);
if (!Object.keys(viewports).length) throw new Error(`Unknown AUDIT_VIEWPORT=${VIEWPORT_FILTER}`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function xmlLocations(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/gs)].map((match) => decodeXml(match[1].trim()));
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "AmberWalkerMigrationAudit/1.0" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function routeKey(url) {
  const pathname = new URL(url).pathname;
  return pathname === "/" ? "home" : pathname.slice(1).replaceAll("/", "--");
}

function routeFamily(url) {
  const pathname = new URL(url).pathname;
  if (pathname === "/") return "home";
  if (pathname.startsWith("/blogs/")) return `blog/${routeKey(url).replace("blogs--", "")}`;
  if (pathname.startsWith("/corporateevents") && pathname !== "/corporateevents") return `locations/${routeKey(url)}`;
  if (pathname.startsWith("/weddingplanning") && pathname !== "/weddingplanning") return `locations/${routeKey(url)}`;
  if (pathname.includes("proposalplanning") || pathname === "/newyorkpropsalplanning") return `locations/${routeKey(url)}`;
  if (pathname.includes("portfolio")) return "portfolio";
  if (pathname.includes("video")) return "video";
  if (pathname === "/media") return "press";
  return `pages/${routeKey(url)}`;
}

function cleanMediaUrl(raw) {
  let value = decodeXml(raw).replaceAll("\\/", "/").replaceAll("\\u002F", "/");
  value = value.replace(/[\\,;}\])]+$/g, "");
  try {
    const url = new URL(value);
    if (url.hostname === "static.wixstatic.com" && url.pathname.startsWith("/media/")) {
      const beforeTransform = url.pathname.split("/v1/")[0];
      return `${url.origin}${beforeTransform}`;
    }
    if (url.hostname === "video.wixstatic.com" && url.pathname.startsWith("/video/")) {
      url.search = "";
      return url.toString();
    }
    return null;
  } catch {
    return null;
  }
}

function extractMedia(html) {
  const normalized = html.replaceAll("\\/", "/").replaceAll("\\u002F", "/");
  const matches = normalized.match(/https:\/\/(?:static\.wixstatic\.com\/media|video\.wixstatic\.com\/video)\/[^\s"'<>\\]+/g) || [];
  return [...new Set(matches.map(cleanMediaUrl).filter(Boolean))];
}

function safeName(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function extensionFromType(type, url) {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase();
  if (ext && ext.length <= 6) return ext;
  const known = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
  };
  return known[type.split(";")[0]] || ".bin";
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function discoverRoutes() {
  const sitemap = await fetchText(`${ORIGIN}/sitemap.xml`);
  const childMaps = xmlLocations(sitemap);
  const nested = await Promise.all(childMaps.map(fetchText));
  return [...new Set(nested.flatMap(xmlLocations))].sort((a, b) => {
    if (a === ORIGIN) return -1;
    if (b === ORIGIN) return 1;
    return a.localeCompare(b);
  });
}

async function crawlPage(browser, url) {
  const key = routeKey(url);
  const result = { url, key, status: 0, title: "", description: "", canonical: "", h1: [], text: "", media: [], links: [], errors: [] };
  let html = "";

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: "en-US" });
    const page = await context.newPage();
    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
      result.status = response?.status() || result.status;
      await page.waitForLoadState("load", { timeout: 20_000 }).catch(() => {});
      await sleep(1_500);
      if (viewportName === "desktop") {
        html = await page.content();
        const pageData = await page.evaluate(() => ({
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
          h1: [...document.querySelectorAll("h1")].map((node) => node.textContent?.trim() || "").filter(Boolean),
          text: document.body?.innerText || "",
          links: [...document.querySelectorAll("a[href]")].map((node) => node.href).filter(Boolean),
          media: [
            ...[...document.images].flatMap((image) => [image.currentSrc, image.src]),
            ...[...document.querySelectorAll("video, video source")].flatMap((node) => [node.currentSrc, node.src, node.getAttribute("poster")]),
            ...performance.getEntriesByType("resource").map((entry) => entry.name),
          ].filter(Boolean),
        }));
        Object.assign(result, pageData);
      }
      if (SCREENSHOTS) {
        const directory = path.join(REFERENCE, "screenshots", viewportName);
        await mkdir(directory, { recursive: true });
        const { buffer } = await captureFullPage(page);
        await writeFile(path.join(directory, `${key}.png`), buffer);
      }
    } catch (error) {
      result.errors.push(`${viewportName}: ${error.message}`);
    } finally {
      await context.close();
    }
  }

  result.text = result.text.replace(/\n{3,}/g, "\n\n").trim();
  result.links = [...new Set(result.links)].sort();
  result.media = [...new Set([...result.media.map(cleanMediaUrl).filter(Boolean), ...extractMedia(html)])].sort();
  if (!CAPTURE_ONLY) {
    await mkdir(path.join(REFERENCE, "content"), { recursive: true });
    await mkdir(path.join(REFERENCE, "html"), { recursive: true });
    await writeFile(path.join(REFERENCE, "content", `${key}.json`), `${JSON.stringify(result, null, 2)}\n`);
    await writeFile(path.join(REFERENCE, "html", `${key}.html`), html);
  }
  return result;
}

async function downloadAsset(asset, index) {
  const sourceBase = decodeURIComponent(path.basename(new URL(asset.sourceUrl).pathname));
  const sourceExtension = path.extname(sourceBase);
  const stem = safeName(path.basename(sourceBase, sourceExtension)) || `asset-${index + 1}`;
  const directory = path.join(MEDIA_ROOT, asset.family);
  await mkdir(directory, { recursive: true });
  const existingNames = (await readdir(directory).catch(() => []))
    .filter((name) => name.startsWith(`${stem}-`));
  const nonEmpty = [];
  for (const name of existingNames) {
    const info = await stat(path.join(directory, name));
    if (info.size > 0) nonEmpty.push({ name, size: info.size });
  }
  if (nonEmpty.length === 1) {
    const candidate = nonEmpty[0];
    const localFile = path.join(directory, candidate.name);
    return {
      ...asset,
      localPath: `/media/${path.posix.join(asset.family, candidate.name)}`,
      bytes: candidate.size,
      sha256: await hashFile(localFile),
      contentType: extensionContentType(path.extname(candidate.name)),
      status: "existing",
    };
  }

  const response = await fetch(asset.sourceUrl, { headers: { "user-agent": "AmberWalkerMigrationAudit/1.0" } });
  if (!response.ok) throw new Error(`${response.status} ${asset.sourceUrl}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const type = response.headers.get("content-type") || "application/octet-stream";
  const digest = createHash("sha256").update(bytes).digest("hex");
  const ext = extensionFromType(type, asset.sourceUrl);
  const relative = path.posix.join(asset.family, `${stem}-${digest.slice(0, 10)}${ext}`);
  const target = path.join(MEDIA_ROOT, relative);
  await mkdir(path.dirname(target), { recursive: true });
  const targetInfo = await stat(target).catch(() => null);
  if (targetInfo?.size) {
    return { ...asset, localPath: `/media/${relative}`, bytes: targetInfo.size, sha256: await hashFile(target), sourceSha256: digest, contentType: type, status: "existing" };
  }
  await writeFile(target, bytes);
  return { ...asset, localPath: `/media/${relative}`, bytes: bytes.length, sha256: digest, sourceSha256: digest, contentType: type, status: "downloaded" };
}

function extensionContentType(extension) {
  return ({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm" })[extension.toLowerCase()] || "application/octet-stream";
}

async function hashFile(file) {
  const hash = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(file);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

async function main() {
  await mkdir(REFERENCE, { recursive: true });
  const discovered = await discoverRoutes();
  const routes = ROUTE_FILTER
    ? discovered.filter((url) => new URL(url).pathname === ROUTE_FILTER)
    : LIMIT ? discovered.slice(0, LIMIT) : discovered;
  if (!routes.length) throw new Error(`No route matched AUDIT_ROUTE=${ROUTE_FILTER}`);
  if (!CAPTURE_ONLY) {
    await writeFile(path.join(REFERENCE, "routes.json"), `${JSON.stringify({ source: ORIGIN, capturedAt: new Date().toISOString(), discoveredCount: discovered.length, routes }, null, 2)}\n`);
  }
  console.log(`Discovered ${discovered.length} routes; auditing ${routes.length}.`);

  let pages;
  if (REUSE_CAPTURE) {
    console.log("Reusing previously captured page content.");
    pages = await Promise.all(routes.map((url) => readFile(path.join(REFERENCE, "content", `${routeKey(url)}.json`), "utf8").then(JSON.parse)));
  } else {
    const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"] });
    pages = await mapLimit(routes, PAGE_CONCURRENCY, async (url, index) => {
      console.log(`[page ${index + 1}/${routes.length}] ${url}`);
      return crawlPage(browser, url);
    });
    await browser.close();
  }

  if (CAPTURE_ONLY) {
    console.log(`Capture-only run complete for ${pages.length} route(s).`);
    return;
  }

  const bySource = new Map();
  for (const page of pages) {
    for (const sourceUrl of page.media) {
      if (!bySource.has(sourceUrl)) bySource.set(sourceUrl, { sourceUrl, family: routeFamily(page.url), routes: [] });
      bySource.get(sourceUrl).routes.push(new URL(page.url).pathname || "/");
    }
  }
  const assets = [...bySource.values()].map((asset) => ({ ...asset, routes: [...new Set(asset.routes)].sort() }));
  console.log(`Found ${assets.length} unique source media files.`);

  let manifestAssets = assets;
  if (DOWNLOADS) {
    manifestAssets = await mapLimit(assets, 5, async (asset, index) => {
      try {
        console.log(`[asset ${index + 1}/${assets.length}] ${asset.sourceUrl}`);
        return await downloadAsset(asset, index);
      } catch (error) {
        const unavailable = /^(?:401|403|404|410)\b/.test(error.message);
        return { ...asset, status: unavailable ? "unavailable" : "error", error: error.message };
      }
    });
  }

  const manifest = {
    source: ORIGIN,
    capturedAt: new Date().toISOString(),
    routeCount: routes.length,
    assetCount: manifestAssets.length,
    downloadedCount: manifestAssets.filter((asset) => ["downloaded", "existing"].includes(asset.status)).length,
    errorCount: manifestAssets.filter((asset) => asset.status === "error").length,
    unavailableCount: manifestAssets.filter((asset) => asset.status === "unavailable").length,
    assets: manifestAssets,
  };
  await writeFile(path.join(REFERENCE, "media-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Audit complete: ${manifest.routeCount} routes, ${manifest.downloadedCount}/${manifest.assetCount} assets downloaded, ${manifest.errorCount} errors.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
