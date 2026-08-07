import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalScroll(page: Page) {
  const dimensions = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));

  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test("代表的な画面幅で主要要素が表示され、横スクロールしない", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /海の道しるべを、\s*次の旅の目的地に。/ }),
  ).toBeVisible();
  await expect(page.getByLabel("キーワード")).toBeVisible();
  await expect(page.getByLabel("都道府県")).toBeVisible();
  await expect(page.getByLabel("並び替え")).toBeVisible();
  await expect(page.locator(".lighthouse-card")).toHaveCount(12);
  await expectNoHorizontalScroll(page);

  const controls = [
    page.getByLabel("キーワード"),
    page.getByLabel("都道府県"),
    page.getByRole("checkbox", { name: "登れる灯台のみ" }),
    page.getByLabel("並び替え"),
  ];
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Viewport is not configured");

  for (const control of controls) {
    const box = await control.boundingBox();
    if (!box) throw new Error("Control is not visible");
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  }
});

test("カードから正常な詳細画面へ移動できる", async ({ page }) => {
  await page.goto("/?q=犬吠");
  await page.getByRole("link", { name: /詳細を見る/ }).click();

  await expect(page).toHaveURL(/\/lighthouses\/inubosaki$/);
  await expect(page.getByRole("heading", { name: "犬吠埼灯台", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Google Mapsで開く/ })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("0件、APIエラー、詳細404を利用者向けに表示する", async ({ page }) => {
  await page.goto("/?q=存在しない灯台");
  await expect(page.getByRole("heading", { name: "条件に一致する灯台が見つかりませんでした" })).toBeVisible();
  await expect(page.getByRole("link", { name: "条件をクリア" })).toBeVisible();

  await page.goto("/?q=api-error");
  await expect(page.getByRole("heading", { name: "灯台情報を読み込めませんでした" })).toBeVisible();
  await expect(page.getByRole("button", { name: "再試行する" })).toBeVisible();

  const response = await page.goto("/lighthouses/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "灯台が見つかりませんでした" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
