import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public", "media");
const skipCount = Number(process.env.MEDIA_SKIP || 0);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  }));
  return nested.flat();
}

const files = (await filesUnder(root)).filter((file) => /\.(?:jpe?g|png|webp|avif)$/i.test(file));
let before = 0;
let after = 0;
let optimized = 0;

for (const [index, file] of files.entries()) {
  if (index < skipCount) {
    before += (await stat(file)).size;
    after += (await stat(file)).size;
    continue;
  }
  const original = (await stat(file)).size;
  before += original;
  try {
    let pipeline = sharp(file).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true });
    const extension = path.extname(file).toLowerCase();
    if (extension === ".png") pipeline = pipeline.png({ compressionLevel: 9, quality: 90, effort: 8 });
    else if (extension === ".webp") pipeline = pipeline.webp({ quality: 88, effort: 5 });
    else if (extension === ".avif") pipeline = pipeline.avif({ quality: 65, effort: 5 });
    else pipeline = pipeline.jpeg({ quality: 88, progressive: true, mozjpeg: true });
    const output = await pipeline.toBuffer();
    if (output.length < original) {
      await writeFile(file, output);
      optimized += 1;
    }
    after += Math.min(original, output.length);
  } catch (error) {
    console.warn(`Skipped unsupported image ${file}: ${error.message}`);
    after += original;
  }
  if ((index + 1) % 50 === 0) console.log(`Processed ${index + 1}/${files.length}`);
}

console.log(`Optimized ${optimized}/${files.length} images: ${(before / 1024 / 1024).toFixed(1)} MiB -> ${(after / 1024 / 1024).toFixed(1)} MiB.`);
