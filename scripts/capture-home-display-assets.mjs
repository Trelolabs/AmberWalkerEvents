import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const html = await readFile(path.join(root, ".reference", "html", "home.html"), "utf8");
const output = path.join(root, "public", "media", "home", "display");

const assets = [
  ["header-logo.avif", "78396c_87da34b9245943a0a35864870b0e2113", "w_367,h_184"],
  ["hero-1.avif", "1a6711_db5a50c85d09493bad25712093d75668", "w_1440,h_500"],
  ["service-social.avif", "78396c_d2439cdb060e4979a9964a3fd4009109", "w_265,h_265"],
  ["service-corporate.avif", "1a6711_db5a50c85d09493bad25712093d75668", "w_265,h_265"],
  ["service-proposal.avif", "1a6711_daf27737a6364bb7aa7503a31d0af9a9", "w_265,h_265"],
  ["service-wedding.avif", "1a6711_e06b1aee48ac4126bc2d644956b9104a", "w_265,h_265"],
  ["testimonial-proposal.avif", "1a6711_bcf9b1c90d12489082d2b89699a2eea3", "w_479,h_456"],
  ["testimonial-corporate.avif", "1a6711_121cabdd5f8340f4b6de1c2806b27f4b", "w_481,h_456"],
  ["testimonial-wedding.avif", "1a6711_2c2e9b87d68c46888b95c92cd6dc6da0", "w_480,h_456"],
  ["press-01.avif", "1a6711_2afe3389827e4ddfbf73bbb2ed3ea320", "w_100,h_100"],
  ["press-02.avif", "1a6711_d70d483c5d5648f0afd63bf6bc03207d", "w_100,h_100"],
  ["press-03.avif", "1a6711_df348b60d673462fb30d271b2b51c857", "w_100,h_100"],
  ["press-04.avif", "1a6711_b06b162fdb2040939a275384f8381458", "w_100,h_100"],
  ["press-05.avif", "1a6711_d9b4d29c58514e07a8701040ba6b7064", "w_100,h_100"],
  ["press-06.avif", "1a6711_45817a35423d42ff9c60ca96a97cae9f", "w_100,h_100"],
  ["press-07.avif", "1a6711_fc4960e68c144dcf956fa98c6545da21", "w_100,h_100"],
  ["press-08.avif", "1a6711_083494d25ebf450595667bf403d3caeb", "w_100,h_100"],
  ["press-09.avif", "1a6711_d8183d1b12a0443c9f0ce1bc243d52fe", "w_100,h_100"],
  ["press-10.avif", "1a6711_e4c2c59ce01040cf97f49f350a5a1cfc", "w_100,h_100"],
  ["press-11.avif", "1a6711_c0467b34fed34c31adcf4f66198496b6", "w_100,h_100"],
  ["press-12.avif", "1a6711_f4dfa7ec58eb49629754fa11d39d9a07", "w_100,h_100"],
  ["press-13.avif", "1a6711_c84be58764e8430aad46fb1e72c16811", "w_100,h_100"],
  ["press-14.avif", "1a6711_d52d6adcb87f4716a4802558b4f876ae", "w_100,h_100"],
  ["press-15.avif", "1a6711_d05f69ebe72e4f6e8b15f72e3cb4709e", "w_100,h_100"],
  ["press-16.avif", "1a6711_5a45dbfb7654419498394ff267394967", "w_100,h_100"],
  ["press-17.avif", "1a6711_d0f6a10f780346c498d6d48b16300813", "w_100,h_100"],
  ["press-18.avif", "1a6711_7dbf6d86e52243198cf9e5a6f175a8e9", "w_100,h_100"],
  ["press-19.avif", "1a6711_0503ed8705c943b9bc9a132fabf11eb2", "w_100,h_100"],
  ["press-20.avif", "1a6711_411460c39f5640cfa26230bd6ee648f9", "w_100,h_100"],
  ["press-21.avif", "1a6711_17aeb03ab6f04682a30adbab96867e20", "w_100,h_100"],
];

const sourceUrls = [...html.matchAll(/https:\/\/static\.wixstatic\.com\/media\/[^" ]+/g)]
  .map((match) => match[0].replaceAll("&amp;", "&"));

await mkdir(output, { recursive: true });
for (const [filename, hash, size] of assets) {
  const source = sourceUrls.find((url) => url.includes(hash) && url.includes(size));
  if (!source) throw new Error(`Missing source derivative for ${filename}.`);
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not capture ${filename}: HTTP ${response.status}.`);
  await writeFile(path.join(output, filename), new Uint8Array(await response.arrayBuffer()));
}

console.log(`Captured ${assets.length} exact homepage display assets.`);
