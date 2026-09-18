import { expect, test } from "@playwright/test";

test("静的版で検索・詳細・再読み込み・一覧への復帰が動く", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).pathname.startsWith("/api/")) apiRequests.push(request.url()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "灯台一覧 52件" })).toBeVisible();
  await page.getByLabel("キーワード").fill("御前崎");
  await page.getByRole("button", { name: "検索する" }).click();
  await expect(page.getByRole("heading", { name: "灯台一覧 1件" })).toBeVisible();
  await page.getByRole("link", { name: /灯台の記録を見る/ }).click();
  await expect(page.getByRole("heading", { name: "御前埼灯台", level: 1 })).toBeVisible();
  await page.reload();
  await expect(page.getByText(/参観情報の確認日/)).toBeVisible();
  await expect(page.getByRole("link", { name: /公式の参観案内/ })).toHaveAttribute("href", "https://www.tokokai.org/tourlight/tourlight07/");
  await page.getByRole("link", { name: "一覧へ戻る" }).click();
  await expect(page.getByLabel("キーワード")).toHaveValue("御前崎");
  await expect(page.getByRole("heading", { name: "灯台一覧 1件" })).toBeVisible();
  expect(apiRequests).toEqual([]);
});

test("静的版のURL条件・戻る・ページ補正・0件を処理する", async ({ page }) => {
  await page.goto("/?prefecture=千葉県");
  await expect(page.getByLabel("都道府県")).toHaveValue("千葉県");
  await page.getByLabel("都道府県").selectOption("静岡県");
  await expect(page.getByRole("heading", { name: "御前埼灯台" })).toBeVisible();
  await page.goBack();
  await expect(page.getByLabel("都道府県")).toHaveValue("千葉県");
  await page.goto("/?page=999");
  await expect(page.locator(".pagination__status")).toContainText("5 / 5ページ");
  await expect(page.locator(".lighthouse-card")).toHaveCount(4);
  await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe("5");
  await page.goto("/?q=存在しない灯台");
  await expect(page.getByRole("heading", { name: "条件に一致する灯台が見つかりませんでした" })).toBeVisible();
});

test("現地のGPSチェックインでスタンプを獲得できる", async ({ context, page }) => {
  await context.grantPermissions(["geolocation"], { origin: "http://127.0.0.1:3000" });
  await context.setGeolocation({ latitude: 34.595556, longitude: 138.226389 });
  await page.goto("/lighthouses/omaesaki/");
  await page.getByRole("button", { name: "GPSでチェックイン" }).click();
  await expect(page.getByText(/スタンプを獲得しました/)).toBeVisible();
  await page.goto("/stamps/");
  await expect(page.getByRole("heading", { name: "1 / 52 基" })).toBeVisible();
  await expect(page.locator(".stamp-slot--earned")).toHaveCount(1);
});

test("静的版の詳細直リンクと404、各画面幅の表示を維持する", async ({ page }) => {
  const response = await page.goto("/lighthouses/omaesaki/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "御前埼灯台", level: 1 })).toBeVisible();
  await expect(page.getByRole("img", { name: /御前埼灯台と御前崎の海岸線/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  const missing = await page.goto("/lighthouses/does-not-exist/");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "灯台が見つかりませんでした" })).toBeVisible();
});
