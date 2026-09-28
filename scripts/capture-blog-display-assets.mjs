import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const outputDirectory = path.join(root, "public", "media", "blog", "display");
const avenirSource = "https://static.parastorage.com/fonts/v2/af36905f-3c92-4ef9-b0c1-f91432f16ac1/v1/avenir-lt-w01_35-light1475496.woff2";
const slugs = ["canaroma", "oscars", "chicagoproposal", "miamiwedding", "nagarro", "urbanplanet", "aliceinwonderland", "hbng", "amberwalkerdesigns", "llds", "cntower", "amg", "ajminter"];
const videoHeroes = new Set(["aliceinwonderland", "amberwalkerdesigns", "amg", "canaroma", "chicagoproposal", "cntower", "hbng", "llds", "urbanplanet"]);
const mediaCounts = { ajminter: 4, aliceinwonderland: 3, amberwalkerdesigns: 3, amg: 4, canaroma: 4, chicagoproposal: 3, cntower: 3, hbng: 3, llds: 5, miamiwedding: 3, nagarro: 8, oscars: 3, urbanplanet: 3 };

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(filename)); else files.push(filename);
  }
  return files;
}

const existing = new Map();
for (const filename of await walk(path.join(root, "public", "media"))) {
  if (filename.startsWith(outputDirectory)) continue;
  const hash = createHash("sha256").update(await readFile(filename)).digest("hex");
  existing.set(hash, `/${path.relative(path.join(root, "public"), filename)}`);
}

await mkdir(outputDirectory, { recursive: true });
for (const filename of await readdir(outputDirectory)) {
  if (/^(article|index)-/.test(filename)) await unlink(path.join(outputDirectory, filename));
}
const manifest = { fonts: {}, index: {}, indexCopy: {}, articles: {} };
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });

async function save(source, basename) {
  const response = await fetch(source, { headers: { accept: "image/avif,image/webp,image/*" } });
  if (!response.ok) return null;
  const buffer = Buffer.from(await response.arrayBuffer());
  const hash = createHash("sha256").update(buffer).digest("hex");
  if (existing.has(hash)) return existing.get(hash);
  const type = response.headers.get("content-type") || "image/jpeg";
  const extension = type.includes("avif") ? "avif" : type.includes("webp") ? "webp" : type.includes("png") ? "png" : "jpg";
  const filename = path.join(outputDirectory, `${basename}.${extension}`);
  await writeFile(filename, buffer);
  existing.set(hash, `/${path.relative(path.join(root, "public"), filename)}`);
  return existing.get(hash);
}

async function saveFont(source, basename) {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not fetch required font: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const hash = createHash("sha256").update(buffer).digest("hex");
  if (existing.has(hash)) return existing.get(hash);
  const filename = path.join(root, "public", "fonts", `${basename}.woff2`);
  await writeFile(filename, buffer);
  existing.set(hash, `/${path.relative(path.join(root, "public"), filename)}`);
  return existing.get(hash);
}

manifest.fonts.avenir = await saveFont(avenirSource, "avenir-lt-w01-light");

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await page.goto("https://www.amberwalkerevents.com/blog", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(3000);
  manifest.indexCopy = await page.locator('a[href*="/blogs/"]').evaluateAll((links) => Object.fromEntries(links.map((link) => {
    let panel = link.parentElement;
    while (panel && panel.getBoundingClientRect().height < 300) panel = panel.parentElement;
    const sourceSlug = new URL(link.href).pathname.split("/").filter(Boolean).at(-1);
    const slug = sourceSlug === "cntower1" ? "cntower" : sourceSlug;
    const lines = (panel?.innerText || "").split(/\n+/).map((line) => line.trim()).filter((line) => line && line !== "Read Story");
    return [slug, { title: lines[0], subject: lines[1], location: lines[2], excerpt: lines.slice(3).join(" ") }];
  }).filter(([slug]) => slug)));
  const indexSources = await page.locator("main img").evaluateAll((images) => images.filter((image) => image.getBoundingClientRect().top + scrollY > 300 && image.naturalWidth).map((image) => image.currentSrc));
  for (let index = 0; index < slugs.length; index += 1) manifest.index[slugs[index]] = await save(indexSources[index], `index-${slugs[index]}`);

  for (const slug of slugs) {
    await page.goto(`https://www.amberwalkerevents.com/blogs/${slug}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(700);
    const minimumY = videoHeroes.has(slug) ? 900 : 300;
    const sources = (await page.locator("main img").evaluateAll((images, minimumY) => images.filter((image) => image.getBoundingClientRect().top + scrollY > minimumY && image.naturalWidth).map((image) => image.currentSrc), minimumY)).slice(0, mediaCounts[slug] - (videoHeroes.has(slug) ? 1 : 0));
    const offset = videoHeroes.has(slug) ? 1 : 0;
    manifest.articles[slug] = [];
    for (let index = 0; index < sources.length; index += 1) manifest.articles[slug][index + offset] = await save(sources[index], `article-${slug}-${String(index + offset + 1).padStart(2, "0")}`);
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Captured blog display media after repository-wide SHA-256 deduplication.`);
