import { expect, test } from "@playwright/test";

test("レビュー用に一覧と詳細画面を記録する", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /海の道しるべを、\s*次の旅の目的地に。/ }),
  ).toBeVisible();
  await expect(page.locator(".lighthouse-card")).toHaveCount(12);
  await testInfo.attach(`${testInfo.project.name}-home`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.goto("/lighthouses/inubosaki");
  await expect(page.getByRole("heading", { name: "犬吠埼灯台", level: 1 })).toBeVisible();
  await testInfo.attach(`${testInfo.project.name}-detail`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});
