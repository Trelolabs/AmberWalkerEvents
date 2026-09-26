import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { coreRoutes, loadRouteInventory, routesForProject, viewports, visualThreshold } from "./verification-config.mjs";

const root = process.cwd();
const failures = [];
const assert = (value, message) => { if (!value) failures.push(message); };
const routes = await loadRouteInventory(root);

assert(routes.length === 94, `Expected 94 routes, found ${routes.length}.`);
assert(visualThreshold === 1.5, `Expected a 1.5% visual threshold, found ${visualThreshold}%.`);
assert(viewports.some(({ name, width }) => name === "desktop" && width === 1440), "Desktop verification viewport is not 1440px.");
assert(viewports.some(({ name, width }) => name === "mobile" && width === 390), "Mobile verification viewport is not 390px.");
assert(coreRoutes.length === 16, `Expected 16 core routes, found ${coreRoutes.length}.`);

for (const [project, count] of [["home", 1], ["services", 9], ["locations", 65], ["rich-media", 5], ["blog", 14], ["all", 94]]) {
  const projectRoutes = await routesForProject(project, root);
  assert(projectRoutes.length === count, `${project} project contains ${projectRoutes.length}/${count} routes.`);
}

for (const viewport of viewports) {
  for (const pathname of routes) {
    const key = pathname === "/" ? "home" : pathname.slice(1).replaceAll("/", "--");
    const screenshot = path.join(root, ".reference", "screenshots", viewport.name, `${key}.png`);
    try {
      const metadata = await sharp(screenshot).metadata();
      assert(metadata.width === viewport.width, `${viewport.name}/${key}.png is ${metadata.width}px wide; expected ${viewport.width}px.`);
      assert((metadata.height || 0) > viewport.height, `${viewport.name}/${key}.png is not a full-page capture.`);
    } catch (error) {
      failures.push(`Cannot validate ${viewport.name}/${key}.png: ${error.message}`);
    }
  }
}

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
for (const script of ["verify:harness", "audit:routes", "verify:routes", "test:carousel", "visual:test"]) {
  assert(packageJson.scripts[script], `Missing package script ${script}.`);
}

if (failures.length) {
  console.error(`Verification harness failed with ${failures.length} issue(s):`);
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Verification harness verified: 94 routes, six visual projects, 1440px/390px full-page references, and a 1.5% fidelity gate.");
