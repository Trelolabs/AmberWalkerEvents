import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { chromium } from "playwright-core";
import sharp from "sharp";
import { setTimeout as delay } from "node:timers/promises";
import {
  captureFullPage,
  routesForProject,
  screenshotKey,
  viewports,
  visualThreshold,
} from "./verification-config.mjs";

const args = process.argv.slice(2);
const projectArg = args.find((arg) => arg.startsWith("--project="));
const projectIndex = args.indexOf("--project");
const project = projectArg?.split("=")[1] || (projectIndex >= 0 ? args[projectIndex + 1] : "core");
const grepArg = args.find((arg) => arg.startsWith("--grep="));
const grepIndex = args.indexOf("--grep");
const grep = grepArg?.split("=")[1] || (grepIndex >= 0 ? args[grepIndex + 1] : "");
const maxDifference = Number(process.env.VISUAL_MAX_DIFF || visualThreshold);
const pixelThreshold = Number(process.env.PIXELMATCH_THRESHOLD || 0.5);
const port = Number(process.env.VISUAL_PORT || 3315);
const origin = `http://127.0.0.1:${port}`;
const root = process.cwd();
const outputRoot = path.join(root, ".visual", project);
const routes = (await routesForProject(project, root)).filter((pathname) => !grep || new RegExp(grep).test(pathname));
if (!routes.length) throw new Error(`No ${project} routes match --grep ${grep}.`);
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: "ignore" });

const assert = (value, message) => { if (!value) throw new Error(message); };

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(origin)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error("Next.js server did not start.");
}

async function loadMasks() {
  const filename = path.join(root, ".reference", "visual-masks.json");
  try {
    await access(filename);
    return JSON.parse(await readFile(filename, "utf8"));
  } catch {
    return {};
  }
}

async function normalize(buffer, width, height) {
  const metadata = await sharp(buffer).metadata();
  assert(metadata.width === width, `Expected ${width}px screenshot, received ${metadata.width}px.`);
  assert(metadata.height && metadata.height <= height, "Screenshot height could not be normalized.");
  return sharp(buffer)
    .ensureAlpha()
    .extend({ bottom: height - metadata.height, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .raw()
    .toBuffer();
}

function applyMasks(reference, current, width, height, masks) {
  for (const mask of masks) {
    const left = Math.max(0, Math.floor(mask.x));
    const top = Math.max(0, Math.floor(mask.y));
    const right = Math.min(width, Math.ceil(mask.x + mask.width));
    const bottom = Math.min(height, Math.ceil(mask.y + mask.height));
    for (let y = top; y < bottom; y += 1) {
      for (let x = left; x < right; x += 1) {
        const offset = (y * width + x) * 4;
        reference.fill(255, offset, offset + 4);
        current.fill(255, offset, offset + 4);
      }
    }
  }
}

async function dynamicMasks(page) {
  return page.locator(".site-header, .site-footer, .core-hero-media:has(video), .video-stage, .media-video, .brand-flow, .review-flow, .service-press > div, .service-showcase, .brand-image, .about-image, .legacy-social-gallery, .legacy-social-testimonial, .legacy-good-company").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { x: rect.left, y: rect.top + window.scrollY, width: rect.width, height: rect.height };
  }));
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
  const masks = await loadMasks();
  const results = [];

  for (const viewport of viewports) {
    const currentRoot = path.join(outputRoot, viewport.name, "current");
    const diffRoot = path.join(outputRoot, viewport.name, "diff");
    await mkdir(currentRoot, { recursive: true });
    await mkdir(diffRoot, { recursive: true });
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();

    for (const pathname of routes) {
      const key = screenshotKey(pathname);
      const response = await page.goto(`${origin}${pathname}`, { waitUntil: "domcontentloaded" });
      assert(response?.status() === 200, `${pathname} did not return 200.`);
      await page.waitForTimeout(350);
      const { buffer: currentBuffer, dimensions } = await captureFullPage(page);
      await writeFile(path.join(currentRoot, `${key}.png`), currentBuffer);

      const referencePath = path.join(root, ".reference", "screenshots", viewport.name, `${key}.png`);
      const referenceBuffer = await readFile(referencePath);
      const referenceMetadata = await sharp(referenceBuffer).metadata();
      const currentMetadata = await sharp(currentBuffer).metadata();
      assert(referenceMetadata.width === viewport.width, `${viewport.name} reference for ${pathname} is ${referenceMetadata.width}px wide; expected ${viewport.width}px. Recapture the reference.`);
      assert(currentMetadata.width === viewport.width, `${viewport.name} capture for ${pathname} is ${currentMetadata.width}px wide; expected ${viewport.width}px.`);
      const height = Math.max(referenceMetadata.height || 0, currentMetadata.height || 0);
      assert(height > 0, `Could not determine screenshot height for ${pathname}.`);
      const referenceRaw = await normalize(referenceBuffer, viewport.width, height);
      const currentRaw = await normalize(currentBuffer, viewport.width, height);
      const routeMasks = [...(masks[pathname]?.[viewport.name] || []), ...await dynamicMasks(page)];
      applyMasks(referenceRaw, currentRaw, viewport.width, height, routeMasks);
      const diff = new PNG({ width: viewport.width, height });
      const changed = pixelmatch(referenceRaw, currentRaw, diff.data, viewport.width, height, { threshold: pixelThreshold, includeAA: false });
      const difference = changed / (viewport.width * height) * 100;
      await writeFile(path.join(diffRoot, `${key}.png`), PNG.sync.write(diff));

      const sections = await page.locator("main > section").evaluateAll((nodes) => nodes.map((node, index) => {
        const rect = node.getBoundingClientRect();
        return {
          index,
          name: node.getAttribute("data-home-section") || node.getAttribute("data-location-section") || node.className || node.tagName.toLowerCase(),
          top: Math.round(rect.top + window.scrollY),
          height: Math.round(rect.height),
        };
      }));
      const result = {
        pathname,
        viewport: viewport.name,
        difference: Number(difference.toFixed(2)),
        passed: difference <= maxDifference,
        referenceHeight: referenceMetadata.height,
        currentHeight: dimensions.height,
        masks: routeMasks.length,
        sections,
      };
      results.push(result);
      console.log(`${viewport.name.padEnd(8)} ${pathname.padEnd(34)} ${difference.toFixed(2)}% ${result.passed ? "PASS" : "FAIL"}`);
    }
    await context.close();
  }

  const failures = results.filter((result) => !result.passed);
  const worst = Math.max(...results.map((result) => result.difference));
  const average = results.reduce((sum, result) => sum + result.difference, 0) / results.length;
  await writeFile(path.join(outputRoot, "report.json"), `${JSON.stringify({ project, threshold: maxDifference, pixelThreshold, average: Number(average.toFixed(2)), worst, failures: failures.length, results }, null, 2)}\n`);
  assert(!failures.length, `${failures.length}/${results.length} ${project} comparisons exceed ${maxDifference}%. See ${path.relative(root, path.join(outputRoot, "report.json"))}.`);
  console.log(`${project} visual comparison passed: average ${average.toFixed(2)}%, worst ${worst.toFixed(2)}%, threshold ${maxDifference}%.`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
