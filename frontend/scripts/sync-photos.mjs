import { mkdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const sources = JSON.parse(await readFile("src/data/photo-sources.json", "utf8"));
const imageDirectory = resolve("public/images");
const thumbnailDirectory = resolve(imageDirectory, "thumbs");
await mkdir(imageDirectory, { recursive: true });
await mkdir(thumbnailDirectory, { recursive: true });

const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

for (const [slug, photo] of Object.entries(sources)) {
  if (photo.src.startsWith("/")) continue;
  const localPhoto = resolve(imageDirectory, `${slug}.webp`);
  const localThumbnail = resolve(thumbnailDirectory, `${slug}.webp`);
  try {
    if ((await stat(localPhoto)).size >= 5_000 && (await stat(localThumbnail)).size >= 5_000) {
      console.log(`${slug}: cached`);
      continue;
    }
  } catch {
    // Missing or incomplete files are downloaded below.
  }
  let response;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    response = await fetch(photo.src, { headers: { "User-Agent": "lighthouse-field-guide/1.0 (+https://github.com/temmakawanaka/lighthouse)" } });
    if (response.ok) break;
    if (response.status !== 429 || attempt === 4) throw new Error(`${slug}: HTTP ${response.status}`);
    await wait(attempt * 3000);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 10_000 || bytes.length > 40_000_000) throw new Error(`${slug}: unexpected image size ${bytes.length}`);
  await sharp(bytes).rotate().resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toFile(localPhoto);
  await sharp(bytes).rotate().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toFile(localThumbnail);
  console.log(`${slug}: ${bytes.length} bytes`);
  await wait(1200);
}

for (const slug of Object.keys(sources)) {
  const filename = slug === "omaesaki" ? "omaezaki-lighthouse-alpsdake" : slug;
  for (const path of [resolve(imageDirectory, `${filename}.webp`), resolve(thumbnailDirectory, `${filename}.webp`)]) {
    if ((await stat(path)).size < 5_000) throw new Error(`${slug}: local photo is missing or too small`);
  }
}
