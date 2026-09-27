import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { corePageByPath } from "../src/content/core-pages.generated.ts";

const outputDirectory = path.join(process.cwd(), "public", "media", "portfolio", "display");
await mkdir(outputDirectory, { recursive: true });

for (const pathname of ["/corporatesocialportfolio", "/proposalweddingportfolio"]) {
  const page = corePageByPath.get(pathname);
  const html = await readFile(path.join(process.cwd(), ".reference", "html", `${pathname.slice(1)}.html`), "utf8");
  const displayUrls = [...html.matchAll(/https:\/\/static\.wixstatic\.com\/media\/[^" ]+\/v1\/(?:fill|fit)\/w_480,h_480,[^" ]+/g)].map((match) => match[0].replaceAll("&amp;", "&"));
  const media = page.media.filter((item) => item.type.startsWith("image/") && !item.src.includes("11062b-")).slice(1, 17);
  for (const item of media) {
    const sourceUrl = displayUrls.find((url) => url.startsWith(`${item.source}/v1/`));
    if (!sourceUrl) throw new Error(`Missing frozen display derivative for ${item.source}`);
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`Could not fetch ${sourceUrl}: ${response.status}`);
    await writeFile(path.join(outputDirectory, `${path.parse(item.src).name}.avif`), Buffer.from(await response.arrayBuffer()));
  }
}

console.log("Captured 32 exact frozen portfolio display derivatives.");
