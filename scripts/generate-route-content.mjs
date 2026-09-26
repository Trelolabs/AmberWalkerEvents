import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const reference = path.join(root, ".reference");
const routeInventory = JSON.parse(await readFile(path.join(reference, "routes.json"), "utf8"));

function routeKey(url) {
  const pathname = new URL(url).pathname;
  return pathname === "/" ? "home" : pathname.slice(1).replaceAll("/", "--");
}

function themeFor(pathname) {
  if (pathname === "/proposalplanningcalifornia" || pathname === "/proposalplanningtoronto") return "light";
  if (pathname === "/proposalplanning" || pathname === "/proposaltips" || pathname === "/proposalweddingportfolio" || pathname === "/proposalweddingvideos" || pathname === "/media" || pathname.includes("proposalplanning") || pathname === "/newyorkpropsalplanning") return "lilac";
  if (pathname === "/copy-of-social-events" || pathname === "/weddingplanning" || pathname.startsWith("/weddingplanning")) return "light";
  return "dark";
}

const records = [];
for (const url of routeInventory.routes) {
  const pathname = new URL(url).pathname || "/";
  const capture = JSON.parse(await readFile(path.join(reference, "content", `${routeKey(url)}.json`), "utf8"));
  records.push({ pathname, title: capture.title, description: capture.description, canonical: capture.canonical || url, headings: capture.h1, theme: themeFor(pathname) });
}

const output = `// Generated from the frozen source audit. Do not edit by hand.\n\nexport type SiteTheme = "dark" | "light" | "lilac";\n\nexport type RouteRecord = { pathname: string; title: string; description: string; canonical: string; headings: string[]; theme: SiteTheme; };\n\nexport const routeRecords = ${JSON.stringify(records, null, 2)} as const satisfies readonly RouteRecord[];\n\nexport const routeByPath = new Map<string, RouteRecord>(routeRecords.map((route) => [route.pathname, route]));\n`;

await mkdir(path.join(root, "src", "content"), { recursive: true });
await writeFile(path.join(root, "src", "content", "routes.generated.ts"), output);
console.log(`Generated ${records.length} route records.`);
