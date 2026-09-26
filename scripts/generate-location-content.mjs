import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const reference = path.join(root, ".reference");
const inventory = JSON.parse(await readFile(path.join(reference, "routes.json"), "utf8"));
const manifest = JSON.parse(await readFile(path.join(reference, "media-manifest.json"), "utf8"));
const bySource = new Map(manifest.assets.map((asset) => [asset.sourceUrl, asset]));
const ignoredText = new Set(["ABOUT", "EVENT PORTFOLIO", "SERVICES", "BLOGS", "CONTACT", "Or", "Event Inquiry", "Inquire Now", "Become A Vendor", "Follow us: @AmberWalkerEvents", "Let’s Discuss Your Event"]);
const ignoredMediaIds = ["78396c_87da34", "78396c_4652a1", "78396c_4ee4ae", "1a6711_832291"];

const key = (pathname) => pathname.slice(1).replaceAll("/", "--");
const familyFor = (pathname) => pathname.startsWith("/corporateevents") ? "corporate" : pathname.startsWith("/weddingplanning") ? "wedding" : "proposal";
const isLocation = (pathname) => pathname !== "/corporateevents" && pathname !== "/weddingplanning" && pathname !== "/proposalplanning" && (
  pathname.startsWith("/corporateevents") || pathname.startsWith("/weddingplanning") || pathname.includes("proposalplanning") || pathname === "/newyorkpropsalplanning"
);

function canonicalMedia(raw) {
  const cleaned = raw.replaceAll("\\/", "/").replaceAll("\\u002F", "/").replaceAll("&amp;", "&");
  try {
    const url = new URL(cleaned);
    if (url.hostname === "static.wixstatic.com" && url.pathname.startsWith("/media/")) return `${url.origin}${url.pathname.split("/v1/")[0]}`;
    if (url.hostname === "video.wixstatic.com" && url.pathname.startsWith("/video/")) { url.search = ""; return url.toString(); }
  } catch {}
  return null;
}

const records = [];
for (const url of inventory.routes) {
  const pathname = new URL(url).pathname;
  if (!isLocation(pathname)) continue;
  const capture = JSON.parse(await readFile(path.join(reference, "content", `${key(pathname)}.json`), "utf8"));
  const lines = capture.text.split(/\n+/).map((line) => line.trim()).filter((line) => line && !ignoredText.has(line) && !/^\d+\/\d+$/.test(line) && !line.startsWith("Disclaimer:") && !line.startsWith("Copyright ©"));
  const heroLines = [];
  for (const line of lines) {
    if (line.length > 70 || line === "AS SEEN ON") break;
    if (line === line.toUpperCase() && !["SCHEDULE NOW", "CALL US NOW"].includes(line)) heroLines.push(line);
    if (heroLines.length === 2) break;
  }
  const seen = new Set();
  const media = [];
  for (const raw of capture.media) {
    const source = canonicalMedia(raw);
    if (!source || seen.has(source) || ignoredMediaIds.some((id) => source.includes(id))) continue;
    seen.add(source);
    const asset = bySource.get(source);
    if (!asset?.localPath || asset.status === "unavailable") continue;
    media.push({ src: asset.localPath, type: asset.contentType, source });
  }
  records.push({ pathname, family: familyFor(pathname), heroTitle: heroLines.join(" ") || capture.title.split("|")[0].trim(), lines, media, cta: capture.links.find((link) => link.includes("calendly.com")) || "/contact" });
}

if (records.length !== 65) throw new Error(`Expected 65 location records, generated ${records.length}.`);
const output = `// Generated from the frozen source audit. Do not edit by hand.\n\nexport type LocationFamily = "corporate" | "wedding" | "proposal";\nexport type LocationMedia = { src: string; type: string; source: string };\nexport type LocationPageRecord = { pathname: string; family: LocationFamily; heroTitle: string; lines: string[]; media: LocationMedia[]; cta: string };\n\nexport const locationPageRecords = ${JSON.stringify(records, null, 2)} as const satisfies readonly LocationPageRecord[];\nexport const locationPageByPath = new Map<string, LocationPageRecord>(locationPageRecords.map((page) => [page.pathname, page]));\n`;
await writeFile(path.join(root, "src", "content", "location-pages.generated.ts"), output);
console.log(`Generated ${records.length} location page records.`);
