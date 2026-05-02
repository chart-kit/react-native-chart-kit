import { expect, test } from "@playwright/test";

test.describe("Expo showcase chart interactions", () => {
  test("scrubbing does not select chart text on web", async ({ page }) => {
    await page.goto("/?story=v2-while-active&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    const frame = page.getByTestId("visual-frame");
    await expect(frame).toBeVisible();

    const box = await frame.boundingBox();
    expect(box).not.toBeNull();

    if (!box) {
      return;
    }

    await page.mouse.move(box.x + 92, box.y + 210);
    await page.mouse.down();
    await page.mouse.move(box.x + 330, box.y + 210, { steps: 8 });
    await expect(page.getByText("Actual:")).toBeVisible();
    await page.mouse.up();

    const selectedText = await page.evaluate(
      () => window.getSelection()?.toString() ?? ""
    );

    expect(selectedText).toBe("");
  });

  test("scrollable comparison tooltip closes on outside press", async ({
    page
  }) => {
    await page.goto("/?story=v2-scrollable-stock-comparison&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    const frame = page.getByTestId("visual-frame");
    await expect(frame).toBeVisible();
    await expect(page.getByText("MSFT:")).toBeVisible();

    const box = await frame.boundingBox();
    expect(box).not.toBeNull();

    if (!box) {
      return;
    }

    await page.mouse.click(box.x + 24, box.y + 178);
    await expect(page.getByText("MSFT:")).toBeHidden();
  });

  test("scrollable comparison still scrubs inside the plot", async ({
    page
  }) => {
    await page.goto("/?story=v2-scrollable-stock-comparison&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    const frame = page.getByTestId("visual-frame");
    await expect(frame).toBeVisible();
    await expect(page.getByText("Jan 10")).toBeVisible();

    const box = await frame.boundingBox();
    expect(box).not.toBeNull();

    if (!box) {
      return;
    }

    await page.mouse.move(box.x + 332, box.y + 176);
    await page.mouse.down();
    await page.mouse.move(box.x + 124, box.y + 176, { steps: 8 });
    await page.mouse.up();

    await expect(page.getByText("MSFT:")).toBeVisible();
    await expect(page.getByText("Jan 10")).toBeHidden();
  });
});
