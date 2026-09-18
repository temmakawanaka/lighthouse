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

test("行きたい灯台とスタンプをバックアップできる", async ({ page }) => {
  await page.goto("/");
  await page.locator(".lighthouse-card").filter({ has: page.getByRole("heading", { name: "御前埼灯台" }) }).getByRole("button", { name: "行きたい" }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("lighthouse-field-guide:user-state:v1") ?? "{}").favorites?.length ?? 0)).toBe(1);
  await page.goto("/my-lighthouses/");
  await expect(page.getByRole("heading", { name: /行きたい灯台 1件/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "御前埼灯台" })).toBeVisible();

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

test("GPSなしのテスト印を押してまとめて消せる", async ({ page }) => {
  await page.goto("/stamps/");
  await page.getByRole("button", { name: "テストモードを開始" }).click();
  await page.getByRole("button", { name: "テストで押す" }).first().click();
  await expect(page.getByRole("heading", { name: "1 / 52 基" })).toBeVisible();
  await expect(page.getByText("確認用テスト印")).toBeVisible();
  await page.getByRole("button", { name: "閉じる" }).click();
  await page.getByRole("button", { name: /テスト印をすべて消す/ }).click();
  await expect(page.getByRole("heading", { name: "0 / 52 基" })).toBeVisible();
});

test("地図を地域移動と大きなボタンで拡大縮小できる", async ({ page }) => {
  await page.goto("/map/");
  await page.getByRole("button", { name: "関東" }).click();
  await expect(page.getByRole("button", { name: "関東" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "地図を拡大" })).toBeVisible();
  await page.getByRole("button", { name: "地図を拡大" }).click();
  await page.getByRole("button", { name: "地図を縮小" }).click();
});
