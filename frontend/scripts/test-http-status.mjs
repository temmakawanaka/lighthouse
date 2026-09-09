import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import process from "node:process";

const host = "127.0.0.1";
const knownSlug = "inubosaki";

const build = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  {
    env: {
      ...process.env,
      LIGHTHOUSE_DATA_SOURCE: "api",
      LIGHTHOUSE_API_BASE_URL: `http://${host}`,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: "inherit",
  },
);
assert.equal(build.status, 0, "API mode build failed");

const lighthouse = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "犬吠埼灯台",
  slug: knownSlug,
  description: "関東最東端の岬に立つ、白亜のレンガ造り灯台。",
  latitude: "35.707861",
  longitude: "140.868639",
  name_kana: "いぬぼうさきとうだい",
  english_name: "Inubosaki Lighthouse",
  country_code: "JP",
  prefecture: "千葉県",
  municipality: "銚子市",
  address: "千葉県銚子市犬吠埼9576",
  area_name: "犬吠埼",
  jcg_number: null,
  admiralty_number: null,
  operator: "海上保安庁",
  first_lit_date: "1874-11-15",
  built_year: 1874,
  construction_material: "レンガ造",
  tower_shape: "塔形",
  marking: "白色",
  lens: null,
  light_characteristic: "単せん白光",
  intensity_cd: 1100000,
  range_nm: "19.50",
  range_km: "36.00",
  tower_height_m: "31.30",
  focal_height_m: "51.80",
  is_visitable: true,
  visit_info: "通年参観できます。",
  admission_info: "中学生以上300円",
  closed_info: null,
  parking_info: null,
  phone_number: null,
  heritage_status: "重要文化財",
  selections: ["のぼれる灯台16"],
  source_urls: ["https://www.kaiho.mlit.go.jp/example"],
  source_notes: null,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, host, () => {
      server.off("error", reject);
      resolve(server.address());
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForResponse(url, child, logs) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js server exited with code ${child.exitCode}.\n${logs()}`);
    }

    try {
      return await fetch(url, { headers: { Accept: "text/html" }, redirect: "manual" });
    } catch {
      await delay(200);
    }
  }

  throw new Error(`Timed out waiting for ${url}.\n${logs()}`);
}

async function stopChild(child) {
  if (child.exitCode !== null) return;

  child.kill("SIGTERM");
  await Promise.race([
    once(child, "exit"),
    delay(5_000).then(() => {
      if (child.exitCode === null) child.kill("SIGKILL");
    }),
  ]);
}

const apiServer = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? host}`);

  if (url.pathname === `/api/v1/lighthouses/slug/${knownSlug}`) {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(lighthouse));
    return;
  }

  response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ detail: "Lighthouse not found" }));
});

const apiAddress = await listen(apiServer);
assert(apiAddress && typeof apiAddress === "object");

const portProbe = createServer();
const appAddress = await listen(portProbe);
assert(appAddress && typeof appAddress === "object");
await close(portProbe);

const output = [];
const appServer = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", host, "--port", String(appAddress.port)],
  {
    env: {
      ...process.env,
      LIGHTHOUSE_DATA_SOURCE: "api",
      LIGHTHOUSE_API_BASE_URL: `http://${host}:${apiAddress.port}`,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

appServer.stdout.on("data", (chunk) => output.push(chunk.toString()));
appServer.stderr.on("data", (chunk) => output.push(chunk.toString()));

const baseUrl = `http://${host}:${appAddress.port}`;

try {
  const existingResponse = await waitForResponse(
    `${baseUrl}/lighthouses/${knownSlug}`,
    appServer,
    () => output.join(""),
  );
  const existingHtml = await existingResponse.text();

  assert.equal(existingResponse.status, 200, output.join(""));
  assert.match(existingHtml, /犬吠埼灯台/);

  const missingResponse = await fetch(`${baseUrl}/lighthouses/does-not-exist`, {
    headers: { Accept: "text/html" },
    redirect: "manual",
  });
  const missingHtml = await missingResponse.text();

  assert.equal(missingResponse.status, 404, output.join(""));
  assert.match(missingHtml, /灯台が見つかりませんでした/);
  assert.match(missingHtml, /<meta[^>]+name="robots"[^>]+content="noindex"/);

  console.log("HTTP integration: existing slug=200, missing slug=404 with noindex");
} finally {
  await stopChild(appServer);
  await close(apiServer);
}
