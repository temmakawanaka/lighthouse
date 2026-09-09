import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const pageUrl = new URL("../src/app/lighthouses/[slug]/page.tsx", import.meta.url);
const dynamicMode = 'export const dynamic = "force-dynamic";';
const staticMode = 'export const dynamic = "force-static";';
const originalPage = await readFile(pageUrl, "utf8");

if (!originalPage.includes(dynamicMode)) {
  throw new Error("Detail route mode marker was not found.");
}

let status = 1;
try {
  await writeFile(pageUrl, originalPage.replace(dynamicMode, staticMode));
  const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
    stdio: "inherit",
    env: { ...process.env, LIGHTHOUSE_STATIC_EXPORT: "true", LIGHTHOUSE_DATA_SOURCE: "catalog" },
  });
  if (result.error) throw result.error;
  status = result.status ?? 1;
} finally {
  await writeFile(pageUrl, originalPage);
}

process.exit(status);
