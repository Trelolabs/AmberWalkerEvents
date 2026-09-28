import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const articleOrder = ["canaroma", "oscars", "chicagoproposal", "miamiwedding", "nagarro", "urbanplanet", "aliceinwonderland", "hbng", "amberwalkerdesigns", "llds", "cntower", "amg", "ajminter"];
const mediaIds = {
  ajminter: ["a55010345f3a42549c1551a73e3f056e", "daf27737a6364bb7aa7503a31d0af9a9", "977d4c2c6e704dd8a2b8f7b9571a2fd0", "750ecffb3c1442ff9430a6e0e19b8655"],
  aliceinwonderland: ["bac597beee6e4660ae6b6d9d08a88e1b", "5333395ae01d48bd8fd21b62a0760901", "1339a88957ae409781ad77695a78cabe"],
  amberwalkerdesigns: ["17af3e5a3a91406d9d1512b67ffba34d", "ee3b7c0cf2904fdf8e7bce216e74b15a", "a79d84bb3ff14f2b9ae468954e1140b0"],
  amg: ["6a5e0c146bdd41b1a0a2c9c8f8c1e369", "5b792f1789f840a2a9abbd839b53cabe", "d27bb647beb34bcca0168f51bd5563bf", "d24db690f006440e87be83e63f129fc6"],
  canaroma: ["2ba1b5e7ae18496a82a88efea4410652", "3fba323180a14b898cffdea9dd7f1046", "8eb646ec911c46be8db2fb1ed3c6fa96", "13ddbabca13c47b7ac5c0a958ba2dafc"],
  chicagoproposal: ["e7ab43e54e504ee7a2316fc908b3209c", "84b286e052c64dc1804edd5242d11de6", "9adb96d8ec0942bea4d4b1abab57970b"],
  cntower: ["14b5985b57ec4d21b0f892df6e3a8941", "18cc1b9eaec344d988a6131490b979b6", "a79d84bb3ff14f2b9ae468954e1140b0"],
  hbng: ["c4768d3fe9bc41ac9fc278b04f842cba", "32317c990d104b548c605469bf30003d", "dd6aee9e99774f1db0b637d2ff53d602"],
  llds: ["e5c6fde7fd5d444f8051af58f84d2ca3", "faa16b9d6231469dab185cb8189c4b5d", "db5a50c85d09493bad25712093d75668", "69224323277b4dcca95e04c666ebbfbb", null],
  miamiwedding: ["ca9e122187c142049bf0acf2b9cbe470", "3a81fa1b6b4a400fa8e5f02f38bdf244", "aff7c523d00e4964a7c47abf9a6c5de9"],
  nagarro: ["8faebeca2fa141a589bdfd2f0675d930", "8ebcf7765cfb4880a1d3f8ed3a95cd16", "d75b0e05d9fb4e1c88ff6f661a9462ad", "ddc26cc9bea8450a8c6c3d000318e7a2", "a67fe4c848654755ab1a8d107bc0d843", null, null, null],
  oscars: ["443ac6ddeaa34d9e9ee78be643d78a36", "34c32910377f4888b868ce74ce19e8d6", "1b72f66a4ee74718a6890ee5b3b87539"],
  urbanplanet: ["068329dc0487453aa64eccf4f7c5e184", "8a116f59192045bbad9c917752c4ef46", "4a41170ae90c42ab8f07738f388dbcb3"],
};
const mediaHeights = {
  ajminter: [543, 336, 448, 448], aliceinwonderland: [718, 364, 364], amberwalkerdesigns: [543, 308, 364],
  amg: [543, 532, 672, 672], canaroma: [640, 504, 728, 672], chicagoproposal: [584, 252, 308],
  cntower: [612, 364, 336], hbng: [637, 308, 336], llds: [543, 532, 504, 532, 616],
  miamiwedding: [568, 252, 252], nagarro: [624, 336, 364, 336, 420, 364, 420, 448],
  oscars: [596, 756, 392], urbanplanet: [543, 308, 280],
};
const videoHeroes = new Set(["aliceinwonderland", "amberwalkerdesigns", "amg", "canaroma", "chicagoproposal", "cntower", "hbng", "llds", "urbanplanet"]);
const indexImages = ["3fba323180a14b898cffdea9dd7f1046", "34c32910377f4888b868ce74ce19e8d6", "9adb96d8ec0942bea4d4b1abab57970b", "ca9e122187c142049bf0acf2b9cbe470", "3f3259b1da924a4fb71fa5eb92cab8a1", "4a41170ae90c42ab8f07738f388dbcb3", "5333395ae01d48bd8fd21b62a0760901", "32317c990d104b548c605469bf30003d", "ee3b7c0cf2904fdf8e7bce216e74b15a", "a0a1bda1c81945e189dd42591af82a9e", "87439f319da3485da96d90682c9e7bc8", "5b792f1789f840a2a9abbd839b53cabe", "daf27737a6364bb7aa7503a31d0af9a9"];
const topGaps = { aliceinwonderland: 90, canaroma: 90, chicagoproposal: 90, cntower: 90, hbng: 90, llds: 72, urbanplanet: 75 };

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(filename)); else files.push(filename);
  }
  return files;
}

const files = await walk(path.join(root, "public", "media"));
let displayManifest = { index: {}, indexCopy: {}, articles: {} };
try { displayManifest = JSON.parse(await readFile(path.join(root, "public", "media", "blog", "display", "manifest.json"), "utf8")); } catch {}
function publicPath(filename) { return `/${path.relative(path.join(root, "public"), filename)}`; }
function findImage(id, slug) {
  const matches = files.filter((file) => file.includes(id) && !file.endsWith(".mp4") && !file.includes("/portfolio/display/"));
  const preferred = matches.find((file) => file.includes(`/blog/${slug}/`)) || matches.find((file) => file.includes("/pages/blog/")) || matches[0];
  if (!preferred) throw new Error(`No local image for ${slug}:${id}`);
  return publicPath(preferred);
}

function parseArticle(capture) {
  const chunks = capture.text.replaceAll("​", "").split(/\n\s*\n/).map((chunk) => chunk.trim()).filter(Boolean);
  const [title, subject, location] = chunks[2].split("\n").map((line) => line.trim());
  const sections = [];
  for (const chunk of chunks.slice(4, -1)) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    const first = lines[0];
    const heading = first.length < 100 && !first.startsWith("-") && !/[.!?]$/.test(first);
    if (heading) sections.push({ heading: first, paragraphs: lines.slice(1) });
    else (sections.at(-1) || (sections[sections.push({ heading: "", paragraphs: [] }) - 1])).paragraphs.push(lines.join("\n"));
  }
  return { title, subject, location, intro: chunks[3], sections };
}

const articles = [];
for (let index = 0; index < articleOrder.length; index += 1) {
  const slug = articleOrder[index];
  const capture = JSON.parse(await readFile(path.join(root, ".reference", "content", `blogs--${slug}.json`), "utf8"));
  const parsed = parseArticle(capture);
  const video = videoHeroes.has(slug) ? files.find((file) => file.includes(`/blog/${slug}/`) && file.endsWith(".mp4")) : null;
  const media = mediaIds[slug].map((id, mediaIndex) => ({
    kind: mediaIndex === 0 && video ? "video" : id ? "image" : "missing",
    src: mediaIndex === 0 && video ? publicPath(video) : displayManifest.articles[slug]?.[mediaIndex] || (id ? findImage(id, slug) : ""),
    aspect: (mediaIndex === 0 ? 720 : 670) / mediaHeights[slug][mediaIndex],
  }));
  const filterLocation = parsed.location === "DALLAS" ? "Texas" : parsed.location.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  const indexCopy = displayManifest.indexCopy?.[slug] || { title: parsed.title, subject: parsed.subject, location: filterLocation, excerpt: parsed.intro };
  articles.push({ slug, ...parsed, filterLocation, indexTitle: indexCopy.title, indexSubject: indexCopy.subject, indexLocation: indexCopy.location, indexExcerpt: indexCopy.excerpt, image: displayManifest.index[slug] || findImage(indexImages[index], slug), media, topGap: topGaps[slug] || 50 });
}

const output = `// Generated from the frozen source audit. Do not edit by hand.\n\nexport type BlogMedia = { kind: \"image\" | \"video\" | \"missing\"; src: string; aspect: number };\nexport type BlogSection = { heading: string; paragraphs: readonly string[] };\nexport type BlogArticle = { slug: string; title: string; subject: string; location: string; filterLocation: string; intro: string; indexTitle: string; indexSubject: string; indexLocation: string; indexExcerpt: string; image: string; media: readonly BlogMedia[]; sections: readonly BlogSection[]; topGap: number };\n\nexport const blogArticles = ${JSON.stringify(articles, null, 2)} as const satisfies readonly BlogArticle[];\nexport const blogArticleByPath = new Map<string, BlogArticle>(blogArticles.map((article) => [\`/blogs/\${article.slug}\`, article]));\n`;
await writeFile(path.join(root, "src", "content", "blog.generated.ts"), output);
console.log(`Generated ${articles.length} blog articles from frozen source content.`);
