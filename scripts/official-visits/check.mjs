#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const catalogPath = resolve(root, "frontend/src/data/lighthouses.json");
const reviewPath = resolve(root, "frontend/src/data/visit-reviews.json");
const baselinePath = resolve(root, "scripts/official-visits/baseline.json");
const reportDirectory = resolve(root, "artifacts/official-visits");
const acceptBaseline = process.argv.includes("--accept-baseline");

const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const reviews = JSON.parse(await readFile(reviewPath, "utf8"));

function normalizeHtml(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]
    ?? html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1]
    ?? html;
  return main
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#(?:x27|39);/gi, "'")
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPage(record) {
  const sourceUrl = reviews[record.slug]?.source_url;
  if (!sourceUrl || !record.source_urls.includes(sourceUrl)) {
    throw new Error("review source URL is missing from the catalog");
  }
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(sourceUrl, {
        headers: { "User-Agent": "lighthouse-field-guide-change-monitor/1.0 (+https://github.com/temmakawanaka/lighthouse)" },
        redirect: "follow",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const length = Number(response.headers.get("content-length") ?? 0);
      if (length > 2_000_000) throw new Error("response is larger than 2 MB");
      const text = normalizeHtml(await response.text());
      if (text.length < 500) throw new Error("normalized page is unexpectedly short");
      return {
        slug: record.slug,
        name: record.name,
        source_url: sourceUrl,
        sha256: createHash("sha256").update(text).digest("hex"),
        normalized_length: text.length,
      };
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolveWait) => setTimeout(resolveWait, 2000));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

const results = [];
for (const record of catalog) {
  try {
    results.push({ ok: true, ...(await fetchPage(record)) });
  } catch (error) {
    results.push({ ok: false, slug: record.slug, name: record.name, source_url: reviews[record.slug]?.source_url, error: String(error) });
  }
}

if (acceptBaseline) {
  const failed = results.filter((result) => !result.ok);
  if (failed.length) {
    console.error(`Baseline was not updated: ${failed.length} page(s) failed.`);
    process.exitCode = 1;
  } else {
    const baseline = { version: 1, generated_at: new Date().toISOString(), pages: Object.fromEntries(results.map(({ ok: _ok, ...result }) => [result.slug, result])) };
    await writeFile(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
    console.log(`Saved official-page baseline for ${results.length} lighthouses.`);
  }
} else {
  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  const changes = results.filter((result) => result.ok && baseline.pages[result.slug]?.sha256 !== result.sha256);
  const failures = results.filter((result) => !result.ok);
  const status = failures.length ? "error" : changes.length ? "changed" : "unchanged";
  const report = { checked_at: new Date().toISOString(), baseline_generated_at: baseline.generated_at, status, changes, failures };
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(resolve(reportDirectory, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  const lines = ["# 公式参観ページ更新監視", "", `確認日時: ${report.checked_at}`, `結果: ${status}`, ""];
  if (changes.length) {
    lines.push("## 変更候補", "", ...changes.map((item) => `- [${item.name}](${item.source_url})（${item.slug}）`), "", "自動更新はしていません。公式ページを確認し、カタログと確認記録を人手で更新してください。", "");
  }
  if (failures.length) lines.push("## 取得エラー", "", ...failures.map((item) => `- ${item.name}: ${item.error}`), "");
  if (!changes.length && !failures.length) lines.push(`16基すべてについて、保存済み基準との差分はありません。`, "");
  await writeFile(resolve(reportDirectory, "report.md"), `${lines.join("\n")}\n`);
  console.log(`${status}: ${changes.length} change candidate(s), ${failures.length} fetch error(s)`);
  if (failures.length) process.exitCode = 1;
  else if (changes.length) process.exitCode = 2;
}
