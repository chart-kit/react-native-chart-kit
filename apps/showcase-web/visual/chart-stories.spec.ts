import { expect, test } from "@playwright/test";

import { chartStories } from "./stories";

test.describe("chart story screenshots", () => {
  for (const storyId of chartStories) {
    test(storyId, async ({ page }) => {
      await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
      await page.addStyleTag({
        content: `
          *,
          *::before,
          *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
            caret-color: transparent !important;
          }
        `
      });
      await page.evaluate(async () => {
        await document.fonts?.ready;
      });

      const frame = page.getByTestId("visual-frame");
      await expect(frame).toBeVisible();
      await expect(frame).toHaveScreenshot(`${storyId}.png`, {
        animations: "disabled"
      });
    });
  }
});
