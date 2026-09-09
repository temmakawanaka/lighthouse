import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { once } from "node:events";
import { createStaticServer } from "./serve-static.mjs";

const catalog = JSON.parse(await readFile("src/data/lighthouses.json", "utf8"));
const server = createStaticServer();
server.listen(0, "127.0.0.1");
await once(server, "listening");
const origin = `http://127.0.0.1:${server.address().port}`;
const checkedAssets = new Set();
try {
  for (const record of [null, ...catalog]) {
    const path = record ? `/lighthouses/${record.slug}/` : "/?q=御前崎";
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert(html.includes(record ? record.name : "のぼれる灯台を探す"), path);
    assert(html.includes('lang="ja"'));
    if (record) {
      assert(html.includes("参観情報の確認日"), path);
      assert(html.includes("2026年9月9日"), path);
      assert(html.includes("ここへの経路を調べる"), path);
      assert(html.includes(record.source_urls.find((url) => /\/tourlight\/tourlight\d+\//.test(url))), path);
    }
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const url = new URL(match[1].replaceAll("&amp;", "&"), origin + path);
      if (url.origin !== origin || !/\.(js|css|jpg|png|svg|webp|woff2|ico)$/.test(url.pathname) || checkedAssets.has(url.pathname)) continue;
      assert((await stat(resolve("out", `.${decodeURIComponent(url.pathname)}`))).size > 0, url.pathname);
      checkedAssets.add(url.pathname);
    }
  }
  for (const [path, expected] of [["/map/", "地図から灯台を探す"], ["/trip/", "灯台めぐりの旅程"], ["/my-lighthouses/", "マイ灯台"]]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    assert((await response.text()).includes(expected), path);
  }
  assert.equal((await fetch(origin + "/manifest.webmanifest")).status, 200);
  assert.equal((await fetch(origin + "/sw.js")).status, 200);
  assert.equal((await fetch(origin + "/sitemap.xml")).status, 200);
  assert.equal((await fetch(origin + "/robots.txt")).status, 200);
  const missing = await fetch(origin + "/lighthouses/does-not-exist/");
  assert.equal(missing.status, 404);
  const missingHtml = await missing.text();
  assert(missingHtml.includes("灯台が見つかりませんでした"));
  assert.match(missingHtml, /name="robots"[^>]+content="noindex"/);
  assert.equal((await fetch(origin + "/lighthouses/omaesaki/", { method: "HEAD" })).status, 200);
  assert.equal((await fetch(origin, { method: "POST" })).status, 405);
  console.log(`Static export: homepage + ${catalog.length} details, ${checkedAssets.size} assets, source dates, direct routes and genuine 404 passed.`);
} finally {
  server.closeAllConnections();
  await new Promise((resolveClose) => server.close(resolveClose));
}
