import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const reference = path.join(root, ".reference");
const failures = [];

async function readJson(file) {
  return JSON.parse(await readFile(path.join(reference, file), "utf8"));
}

const routes = await readJson("routes.json");
const manifest = await readJson("media-manifest.json");

if (routes.discoveredCount !== 94) failures.push(`Expected 94 discovered routes, found ${routes.discoveredCount}.`);
if (routes.routes.length !== 94) failures.push(`Expected 94 audited routes, found ${routes.routes.length}.`);
if (manifest.routeCount !== 94) failures.push(`Media manifest covers ${manifest.routeCount}/94 routes.`);
if (manifest.errorCount) failures.push(`${manifest.errorCount} media downloads failed.`);

for (const url of routes.routes) {
  const pathname = new URL(url).pathname;
  const key = pathname === "/" ? "home" : pathname.slice(1).replaceAll("/", "--");
  for (const relative of [
    `content/${key}.json`,
    `screenshots/desktop/${key}.png`,
    `screenshots/mobile/${key}.png`,
  ]) {
    try {
      await access(path.join(reference, relative));
    } catch {
      failures.push(`Missing ${relative}.`);
    }
  }
  const page = await readJson(`content/${key}.json`);
  if (page.status !== 200) failures.push(`${pathname} returned ${page.status}.`);
  if (!page.title) failures.push(`${pathname} has no captured title.`);
  if (page.errors.length) failures.push(`${pathname}: ${page.errors.join("; ")}`);
}

for (const asset of manifest.assets) {
  if (asset.status !== "downloaded" || !asset.localPath) continue;
  try {
    const file = path.join(root, "public", asset.localPath.replace(/^\/media\//, "media/"));
    await access(file);
    const { size } = await stat(file);
    if (!size) failures.push(`Downloaded asset is empty: ${asset.localPath}.`);
  } catch {
    failures.push(`Missing downloaded asset ${asset.localPath}.`);
  }
}

if (failures.length) {
  console.error(`Source audit failed with ${failures.length} issue(s):`);
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  if (failures.length > 100) console.error(`- ...and ${failures.length - 100} more`);
  process.exit(1);
}

console.log(`Source audit verified: ${routes.routes.length} routes, ${manifest.downloadedCount} local media files, and ${manifest.unavailableCount || 0} documented unavailable sources.`);
