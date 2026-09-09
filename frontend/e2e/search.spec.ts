import { expect, test, type Locator, type Page } from "@playwright/test";

async function expectQuery(page: Page, expected: Record<string, string | null>) {
  await expect
    .poll(() => {
      const params = new URL(page.url()).searchParams;
      return Object.fromEntries(
        Object.keys(expected).map((key) => [key, params.get(key)]),
      );
    })
    .toEqual(expected);
}

// Cards intentionally expose both "行きたい" and "訪問済み" controls. Allow
// enough tab stops to traverse a full 12-card result page before pagination.
async function tabTo(page: Page, locator: Locator, maxTabs = 80) {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press("Tab");
    if (await locator.evaluate((element) => document.activeElement === element)) return;
  }

  throw new Error(`Could not reach ${await locator.getAttribute("aria-label")} with Tab`);
}

test("連続した絞り込みと並び替えで条件が欠落しない", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("都道府県").selectOption("千葉県");
  await page.getByRole("checkbox", { name: "登れる灯台のみ" }).check();
  await page.getByLabel("並び替え").selectOption("name");

  await expectQuery(page, {
    prefecture: "千葉県",
    visitable: "true",
    sort: "name",
  });
  await expect(page.getByLabel("都道府県")).toHaveValue("千葉県");
  await expect(page.getByRole("checkbox", { name: "登れる灯台のみ" })).toBeChecked();
  await expect(page.getByLabel("並び替え")).toHaveValue("name");
  await expect(page.getByText("条件：千葉県・登れる灯台")).toBeVisible();
  await expect(page.locator(".lighthouse-card")).toHaveCount(2);
});

test("キーワード、ページング、戻る、再読み込みでURL状態を復元する", async ({ page }) => {
  await page.goto("/");

  const query = page.getByLabel("キーワード");
  await query.fill("犬吠");
  await query.press("Enter");
  await expectQuery(page, { q: "犬吠" });
  await expect(page.getByRole("heading", { name: "犬吠埼灯台" })).toBeVisible();

  await page.goto("/?prefecture=千葉県&visitable=true&sort=name");
  await expect(page.getByLabel("都道府県")).toHaveValue("千葉県");
  await page.getByLabel("都道府県").selectOption("神奈川県");
  await expectQuery(page, { prefecture: "神奈川県", visitable: "true", sort: "name" });

  await page.goBack();
  await expectQuery(page, { prefecture: "千葉県", visitable: "true", sort: "name" });
  await expect(page.getByLabel("都道府県")).toHaveValue("千葉県");
  await expect(page.getByRole("checkbox", { name: "登れる灯台のみ" })).toBeChecked();

  await page.reload();
  await expect(page.getByLabel("都道府県")).toHaveValue("千葉県");
  await expect(page.getByLabel("並び替え")).toHaveValue("name");

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /灯台一覧 15件/ })).toBeVisible();
  const next = page.getByRole("link", { name: /次へ/ });
  await next.focus();
  await page.keyboard.press("Enter");
  await expectQuery(page, { page: "2" });
  await expect(page.locator(".pagination__status")).toContainText("2 / 2ページ");
  await expect(page.locator(".lighthouse-card")).toHaveCount(3);
});

test("キーボードだけで検索・絞り込み・ページ移動ができる", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "本文へ移動" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  const focusStyle = await skipLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, top: style.top };
  });
  expect(focusStyle).toEqual({ outlineStyle: "solid", outlineWidth: "3px", top: "12px" });

  const query = page.getByLabel("キーワード");
  await tabTo(page, query);
  await page.keyboard.type("犬吠");
  await page.keyboard.press("Enter");
  await expectQuery(page, { q: "犬吠" });

  await page.goto("/");
  const visitable = page.getByRole("checkbox", { name: "登れる灯台のみ" });
  await tabTo(page, visitable);
  await page.keyboard.press("Space");
  await expectQuery(page, { visitable: "true" });

  await page.goto("/");
  const next = page.getByRole("link", { name: /次へ/ });
  await tabTo(page, next);
  await page.keyboard.press("Enter");
  await expectQuery(page, { page: "2" });
});
