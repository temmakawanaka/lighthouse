import { readFile, writeFile, mkdir } from "node:fs/promises";

const source = new URL("../../backend/app/db/seeds/lighthouses.json", import.meta.url);
const destination = new URL("../src/data/lighthouses.json", import.meta.url);
const records = JSON.parse(await readFile(source, "utf8"));
const slugs = new Set();
for (const record of records) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug) || slugs.has(record.slug)) throw new Error(`Invalid or duplicate slug: ${record.slug}`);
  slugs.add(record.slug);
  if (!record.name || !record.source_urls?.length) throw new Error(`Missing source: ${record.slug}`);
  const latitude = Number(record.latitude);
  const longitude = Number(record.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error(`Invalid coordinates: ${record.slug}`);
  for (const url of record.source_urls) {
    if (new URL(url).protocol !== "https:") throw new Error(`Invalid source URL: ${record.slug}`);
  }
}
const content = `${JSON.stringify(records, null, 2)}\n`;
if (process.argv.includes("--check")) {
  if (await readFile(destination, "utf8") !== content) throw new Error("Catalog is stale. Run npm run sync:catalog.");
} else {
  await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
  await writeFile(destination, content);
}
console.log(`Catalog: ${records.length} records, ${process.argv.includes("--check") ? "in sync" : "generated"}.`);
