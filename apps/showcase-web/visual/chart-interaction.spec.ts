import { expect, test } from "@playwright/test";

test.describe("chart story interactions", () => {
  test("scrubbing does not select chart text on web", async ({ page }) => {
    await page.goto(
      "/iframe.html?id=charts-v2linechart--while-active-scrub&viewMode=story"
    );
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

    await page.mouse.move(box.x + 85, box.y + 230);
    await page.mouse.down();
    await page.mouse.move(box.x + 310, box.y + 230, { steps: 8 });
    await expect(page.getByText("Actual:")).toBeVisible();
    await page.mouse.up();

    const selectedText = await page.evaluate(
      () => window.getSelection()?.toString() ?? ""
    );

    expect(selectedText).toBe("");
  });
});
