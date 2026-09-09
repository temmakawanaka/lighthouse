import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sources = JSON.parse(await readFile("src/data/photo-sources.json", "utf8"));
const imageDirectory = resolve("public/images");
await mkdir(imageDirectory, { recursive: true });

const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

for (const [slug, photo] of Object.entries(sources)) {
  const destination = resolve(imageDirectory, `${slug}.jpg`);
  if (photo.src.startsWith("/")) continue;
  let response;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    response = await fetch(photo.src, { headers: { "User-Agent": "lighthouse-field-guide/1.0 (+https://github.com/temmakawanaka/lighthouse)" } });
    if (response.ok) break;
    if (response.status !== 429 || attempt === 4) throw new Error(`${slug}: HTTP ${response.status}`);
    await wait(attempt * 3000);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 10_000 || bytes.length > 8_000_000) throw new Error(`${slug}: unexpected image size ${bytes.length}`);
  await writeFile(destination, bytes);
  console.log(`${slug}: ${bytes.length} bytes`);
  await wait(1200);
}

for (const slug of Object.keys(sources)) {
  const path = slug === "omaesaki" ? resolve(imageDirectory, "omaezaki-lighthouse-alpsdake.jpg") : resolve(imageDirectory, `${slug}.jpg`);
  if ((await stat(path)).size < 10_000) throw new Error(`${slug}: local photo is missing or too small`);
}
