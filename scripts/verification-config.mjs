import { readFile } from "node:fs/promises";

export const visualThreshold = 1.5;

export const viewports = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "mobile", width: 390, height: 844 },
];

export const coreRoutes = [
  "/", "/proposalweddingvideos", "/meetamber", "/blog", "/proposaltips",
  "/weddingplanning", "/corporatesocialportfolio", "/socialevents", "/media",
  "/contact", "/corporateevents", "/copy-of-social-events", "/proposalplanning",
  "/corporatesocialvideos", "/aboutawe", "/proposalweddingportfolio",
];

export const serviceRoutes = [
  "/corporateevents", "/socialevents", "/weddingplanning", "/proposalplanning",
  "/proposaltips", "/copy-of-social-events", "/meetamber", "/aboutawe", "/contact",
];

export const richMediaRoutes = [
  "/corporatesocialportfolio", "/proposalweddingportfolio", "/corporatesocialvideos",
  "/proposalweddingvideos", "/media",
];

export function screenshotKey(pathname) {
  return pathname === "/" ? "home" : pathname.slice(1).replaceAll("/", "--");
}

export function isLocationRoute(pathname) {
  return pathname !== "/corporateevents" && pathname !== "/weddingplanning" && pathname !== "/proposalplanning" && (
    pathname.startsWith("/corporateevents") || pathname.startsWith("/weddingplanning") ||
    pathname.includes("proposalplanning") || pathname === "/newyorkpropsalplanning"
  );
}

export async function loadRouteInventory(root = process.cwd()) {
  const inventory = JSON.parse(await readFile(`${root}/.reference/routes.json`, "utf8"));
  return inventory.routes.map((url) => new URL(url).pathname || "/");
}

export async function routesForProject(project, root = process.cwd()) {
  const allRoutes = await loadRouteInventory(root);
  const projects = {
    all: allRoutes,
    home: ["/"],
    core: coreRoutes,
    services: serviceRoutes,
    locations: allRoutes.filter(isLocationRoute),
    "rich-media": richMediaRoutes,
    blog: allRoutes.filter((pathname) => pathname === "/blog" || pathname.startsWith("/blogs/")),
  };
  if (!projects[project]) throw new Error(`Unknown visual project: ${project}`);
  return projects[project];
}

export async function captureFullPage(page, options = {}) {
  const { animations = "disabled" } = options;
  await page.evaluate(async () => {
    const step = Math.max(500, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(150);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  const fullBuffer = await page.screenshot({ animations, fullPage: true });
  const metadata = await sharpMetadata(fullBuffer);
  const width = Math.min(viewportWidth, metadata.width);
  const buffer = metadata.width === width
    ? fullBuffer
    : await cropScreenshot(fullBuffer, width, metadata.height);
  return {
    buffer,
    dimensions: { width, height: metadata.height, overflowWidth: Math.max(0, metadata.width - width) },
  };
}

async function sharpMetadata(buffer) {
  const { default: sharp } = await import("sharp");
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Could not determine full-page screenshot dimensions.");
  return { width: metadata.width, height: metadata.height };
}

async function cropScreenshot(buffer, width, height) {
  const { default: sharp } = await import("sharp");
  return sharp(buffer).extract({ left: 0, top: 0, width, height }).png().toBuffer();
}
