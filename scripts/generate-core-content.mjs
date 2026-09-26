import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const reference = path.join(root, ".reference");
const manifest = JSON.parse(await readFile(path.join(reference, "media-manifest.json"), "utf8"));
const bySource = new Map(manifest.assets.map((asset) => [asset.sourceUrl, asset]));
const corePaths = ["/", "/proposalweddingvideos", "/meetamber", "/blog", "/proposaltips", "/weddingplanning", "/corporatesocialportfolio", "/socialevents", "/media", "/contact", "/corporateevents", "/copy-of-social-events", "/proposalplanning", "/corporatesocialvideos", "/aboutawe", "/proposalweddingportfolio"];
const ignoredMediaIds = ["78396c_87da34", "78396c_4652a1", "78396c_4ee4ae", "1a6711_832291"];
const ignoredText = new Set(["ABOUT", "EVENT PORTFOLIO", "SERVICES", "BLOGS", "CONTACT", "Or", "Event Inquiry", "Inquire Now", "Become A Vendor", "Follow us: @AmberWalkerEvents"]);

const key = (pathname) => pathname === "/" ? "home" : pathname.slice(1).replaceAll("/", "--");

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
for (const pathname of corePaths) {
  const capture = JSON.parse(await readFile(path.join(reference, "content", `${key(pathname)}.json`), "utf8"));
  const html = (await readFile(path.join(reference, "html", `${key(pathname)}.html`), "utf8")).replaceAll("\\/", "/").replaceAll("\\u002F", "/");
  const urls = html.match(/https:\/\/(?:static\.wixstatic\.com\/media|video\.wixstatic\.com\/video)\/[^\s"'<>\\]+/g) || [];
  const seen = new Set();
  const media = [];
  for (const raw of urls) {
    const source = canonicalMedia(raw);
    if (!source || seen.has(source) || ignoredMediaIds.some((id) => source.includes(id))) continue;
    seen.add(source);
    const asset = bySource.get(source);
    if (!asset?.localPath || asset.status === "unavailable") continue;
    media.push({ src: asset.localPath, type: asset.contentType, source });
  }
  const lines = capture.text.split(/\n+/).map((line) => line.trim()).filter((line) => line && !ignoredText.has(line) && !/^\d+\/\d+$/.test(line) && !line.startsWith("Disclaimer:") && !line.startsWith("Copyright ©"));
  records.push({ pathname, lines, media });
}

const output = `// Generated from the frozen source audit. Do not edit by hand.\n\nexport type CoreMedia = { src: string; type: string; source: string };\nexport type CorePageRecord = { pathname: string; lines: string[]; media: CoreMedia[] };\n\nexport const corePageRecords = ${JSON.stringify(records, null, 2)} as const satisfies readonly CorePageRecord[];\nexport const corePageByPath = new Map<string, CorePageRecord>(corePageRecords.map((page) => [page.pathname, page]));\n`;
await writeFile(path.join(root, "src", "content", "core-pages.generated.ts"), output);
console.log(`Generated ${records.length} core page records.`);
