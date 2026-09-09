import { expect, test } from "@playwright/test";

test("現在地から近い灯台を端末内で探せる", async ({ context, page }) => {
  await context.grantPermissions(["geolocation"], { origin: "http://127.0.0.1:3000" });
  await context.setGeolocation({ latitude: 34.6, longitude: 138.2 });
  await page.goto("/map/");
  await page.getByRole("button", { name: "現在地から探す" }).click();
  await expect(page.getByText("現在地に近い順で表示しました。")).toBeVisible();
  await expect(page.locator(".nearest-list > li")).toHaveCount(5);
  await expect(page.locator(".nearest-list > li").first()).toContainText("御前埼灯台");
});

test("訪問日とメモを保存し、バックアップを書き出せる", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "訪問記録" }).first().click();
  await page.goto("/my-lighthouses/");
  await page.getByLabel("訪問日").fill("2026-09-09");
  await page.getByLabel("メモ").fill("岬からの海がきれいだった");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("lighthouse-field-guide:user-state:v1"))).toContain("岬からの海がきれいだった");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "バックアップを書き出す" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^lighthouse-backup-\d{4}-\d{2}-\d{2}\.json$/);
});

test("共有URLの旅程を確認してから端末へ保存できる", async ({ page }) => {
  await page.goto("/trip/?stops=omaesaki,inubosaki&date=2026-10-01");
  await expect(page.getByText(/共有された旅程を表示しています/)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("lighthouse-field-guide:trip-plan:v1"))).toBeNull();
  await page.getByRole("button", { name: "この旅程を保存" }).click();
  await expect(page.getByText(/共有された旅程を表示しています/)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("lighthouse-field-guide:trip-plan:v1"))).toContain("omaesaki");
  await expect(page.getByRole("button", { name: "この旅程を共有する" })).toBeVisible();
});
