import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "public", "media", "services", "display");
const specs = {
  corporateevents: [
    ["card", "w_240,h_229", 12],
    ["showcase", "w_697,h_400", 2],
  ],
  socialevents: [
    ["card", "w_240,h_229", 12],
    ["showcase", "w_697,h_400", 2],
  ],
};
const showcaseHashes = {
  corporateevents: ["faa16b9d", "9130be9b"],
  socialevents: ["ada3d921", "b87a0c02"],
};
const exactAssets = [
  ["legacy-header-logo.png", "copy-of-social-events", "0d875352", "/v1/fill/w_460,h_232,"],
  ["legacy-gallery-01.avif", "copy-of-social-events", "18b99c71512c4ec68808a504c921d9a4", "/v1/fill/w_697,h_400,"],
  ["legacy-gallery-02.avif", "copy-of-social-events", "548d8d5c", "/v1/fill/w_677,h_388,"],
  ["wedding-feature.avif", "weddingplanning", "e06b1aee", "/v1/fill/w_718,h_651,"],
  ["wedding-gallery-01.avif", "weddingplanning", "87439f31", "/v1/fit/w_480,h_361,"],
  ["wedding-gallery-02.avif", "weddingplanning", "e8444f2c", "/v1/fit/w_480,h_361,"],
  ["wedding-gallery-03.avif", "weddingplanning", "b2d69de4", "/v1/fill/w_480,h_361,"],
  ["proposal-package.avif", "proposalplanning", "e8444f2c", "/v1/fill/w_1440,h_804,"],
  ["proposal-tips-feature.avif", "proposaltips", "e8444f2c", "/v1/fill/w_1440,h_573,"],
  ["proposal-tips-gallery-01.avif", "proposaltips", "87439f31", "/v1/fit/w_480,h_361,"],
  ["proposal-tips-gallery-02.avif", "proposaltips", "bb74d201", "/v1/fill/w_480,h_361,"],
  ["proposal-tips-gallery-03.avif", "proposaltips", "51390383", "/v1/fit/w_480,h_361,"],
  ["about-brand.avif", "aboutawe", "9e935853", "/v1/fill/w_718,h_865,"],
  ["meet-amber.avif", "meetamber", "a14ee68c", "/v1/fill/w_503,h_685,"],
  ["socialevents-showcase-02.jpg", "socialevents", "548d8d5c", "/v1/fill/w_677,h_388,"],
];

await mkdir(output, { recursive: true });
for (const [page, groups] of Object.entries(specs)) {
  const html = await readFile(path.join(root, ".reference", "html", `${page}.html`), "utf8");
  const urls = [...new Set([...html.matchAll(/https:\/\/static\.wixstatic\.com\/media\/[^" ]+/g)]
    .map((match) => match[0].replaceAll("&amp;", "&")))];
  for (const [group, size, count] of groups) {
    const candidates = urls.filter((url) => url.includes(`/v1/fill/${size},`));
    const matches = group === "showcase"
      ? showcaseHashes[page].map((hash) => candidates.find((url) => url.includes(hash))).filter(Boolean)
      : candidates.slice(0, count);
    if (matches.length !== count) throw new Error(`Expected ${count} ${page} ${group} assets, found ${matches.length}.`);
    for (const [index, url] of matches.entries()) {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Could not capture ${page} ${group} ${index + 1}: HTTP ${response.status}.`);
      await writeFile(path.join(output, `${page}-${group}-${String(index + 1).padStart(2, "0")}.jpg`), new Uint8Array(await response.arrayBuffer()));
    }
  }
}

for (const [filename, page, hash, transform] of exactAssets) {
  const html = (await readFile(path.join(root, ".reference", "html", `${page}.html`), "utf8")).replaceAll("&amp;", "&");
  const url = [...new Set([...html.matchAll(/https:\/\/static\.wixstatic\.com\/media\/[^" ]+/g)].map((match) => match[0]))]
    .find((candidate) => candidate.includes(hash) && candidate.includes(transform));
  if (!url) throw new Error(`Could not find ${filename} in ${page}.html.`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not capture ${filename}: HTTP ${response.status}.`);
  await writeFile(path.join(output, filename), new Uint8Array(await response.arrayBuffer()));
}

console.log("Captured exact R2 display derivatives.");
