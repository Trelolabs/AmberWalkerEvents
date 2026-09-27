import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const grepIndex = args.indexOf("--grep");
const grep = (grepIndex >= 0 ? args[grepIndex + 1] : "").toLowerCase();
const checks = new Set();
if (grep.includes("shared shell")) checks.add("scripts/check-shared-shell.mjs");
if (grep.includes("homepage") || grep.includes("carousel")) checks.add("scripts/check-homepage-interactions.mjs");
if (grep.includes("core page") || grep.includes("service") || grep.includes("editorial")) checks.add("scripts/check-core-pages.mjs");
if (grep.includes("portfolio") || grep.includes("video") || grep.includes("media")) checks.add("scripts/check-rich-media.mjs");
if (grep.includes("location route")) checks.add("scripts/check-location-pages.mjs");
if (grep.includes("blog article")) checks.add("scripts/check-route-completeness.mjs");
if (!checks.size) {
  checks.add("scripts/check-shared-shell.mjs");
  checks.add("scripts/check-homepage-interactions.mjs");
  checks.add("scripts/check-core-pages.mjs");
  checks.add("scripts/check-rich-media.mjs");
  checks.add("scripts/check-location-pages.mjs");
  checks.add("scripts/check-route-completeness.mjs");
}

for (const check of checks) {
  const result = spawnSync(process.execPath, [check], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
