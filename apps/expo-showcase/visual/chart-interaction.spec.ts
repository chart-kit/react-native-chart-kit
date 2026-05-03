import { expect, test } from "@playwright/test";

test.describe("Expo showcase chart interactions", () => {
  test("showcase settings stay behind the settings button", async ({
    page
  }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Line & Area")).toBeVisible();
    await expect(page.getByText("High Contrast")).toHaveCount(0);
    await expect(page.getByText("Scenarios")).toHaveCount(0);

    await page.getByRole("button", { name: "Show preview settings" }).click();
    await expect(page.getByText("High Contrast")).toBeVisible();
    await expect(page.getByRole("button", { name: "QA" })).toBeVisible();
  });

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

  test("scrollable comparison remains passive", async ({ page }) => {
    await page.goto("/?story=v2-scrollable-stock-comparison&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    const frame = page.getByTestId("visual-frame");
    await expect(frame).toBeVisible();
    await expect(page.getByText("Scrollable", { exact: true })).toBeVisible();
    await expect(page.getByText("MSFT:")).toHaveCount(0);

    const box = await frame.boundingBox();
    expect(box).not.toBeNull();

    if (!box) {
      return;
    }

    await page.mouse.move(box.x + 332, box.y + 176);
    await page.mouse.down();
    await page.mouse.move(box.x + 124, box.y + 176, { steps: 8 });
    await page.mouse.up();

    await expect(page.getByText("MSFT:")).toHaveCount(0);
  });

  test("range selector overview changes the visible window", async ({
    page
  }) => {
    await page.goto("/?story=v2-range-selector");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Portfolio range")).toBeVisible();
    const chart = page.getByTestId("range-selector-chart");
    await expect(chart.getByText("Dec 15").first()).toBeVisible();
    await expect(chart.getByText("Jan 14").first()).toBeVisible();

    const rangeSelector = page.getByTestId(
      "range-selector-chart-range-selector"
    );
    await expect(rangeSelector).toBeVisible();
    await rangeSelector.scrollIntoViewIfNeeded();

    const rangeBox = await rangeSelector.boundingBox();
    expect(rangeBox).not.toBeNull();

    if (!rangeBox) {
      return;
    }

    await page.mouse.click(rangeBox.x + 56, rangeBox.y + rangeBox.height / 2);
    await expect(chart.getByText("Nov 3").first()).toBeVisible();
    await expect(chart.getByText("Jan 14")).toHaveCount(0);
  });

  test("main plot drag pans a controlled viewport", async ({ page }) => {
    await page.goto("/?story=v2-viewport-zoom-pan");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(
      page.getByText("Controlled viewport", { exact: true })
    ).toBeVisible();
    const chart = page.getByTestId("viewport-pan-chart");
    await chart.scrollIntoViewIfNeeded();
    await expect(chart.getByText("Jan 14").first()).toBeVisible();

    const chartBox = await chart.boundingBox();
    expect(chartBox).not.toBeNull();

    if (!chartBox) {
      return;
    }

    await page.mouse.move(chartBox.x + 112, chartBox.y + 150);
    await page.mouse.down();
    await page.mouse.move(chartBox.x + 310, chartBox.y + 150, { steps: 8 });
    await page.mouse.up();

    await expect(chart.getByText("Dec 9").first()).toBeVisible();
    await expect(chart.getByText("Jan 14")).toHaveCount(0);
  });

  test("range selector handles resize the visible window", async ({ page }) => {
    await page.goto("/?story=v2-range-selector");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Portfolio range")).toBeVisible();
    const chart = page.getByTestId("range-selector-chart");
    await expect(chart.getByText("Dec 15").first()).toBeVisible();
    await expect(chart.getByText("Jan 14").first()).toBeVisible();

    const rangeSelector = page.getByTestId(
      "range-selector-chart-range-selector"
    );
    await expect(rangeSelector).toBeVisible();
    await rangeSelector.scrollIntoViewIfNeeded();

    const rangeBox = await rangeSelector.boundingBox();
    expect(rangeBox).not.toBeNull();

    if (!rangeBox) {
      return;
    }

    const y = rangeBox.y + rangeBox.height / 2;
    await page.mouse.move(rangeBox.x + rangeBox.width - 28, y);
    await page.mouse.down();
    await page.mouse.move(rangeBox.x + rangeBox.width - 150, y, { steps: 8 });
    await page.mouse.up();

    await expect(chart.getByText("Dec 15").first()).toBeVisible();
    await expect(chart.getByText("Jan 14")).toHaveCount(0);
  });

  test("range selector overview uses the dark mini-chart palette", async ({
    page
  }) => {
    await page.goto("/?story=v2-range-selector");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await page.getByRole("button", { name: "Show preview settings" }).click();
    await page.getByRole("button", { name: "Dark" }).click();

    const rangeSelector = page.getByTestId(
      "range-selector-chart-range-selector"
    );
    await rangeSelector.scrollIntoViewIfNeeded();

    const fills = await rangeSelector
      .locator("rect")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("fill")).filter(Boolean)
      );

    expect(fills).toContain("#0f172a");
    expect(fills).toContain("#111827");
    expect(fills).not.toContain("#F8FBFF");
    expect(fills).not.toContain("#EFF6FF");
  });

  test("portfolio range supports scrub tooltip and locks scroll during range gestures", async ({
    page
  }) => {
    await page.goto("/?story=v2-range-selector");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    const chart = page.getByTestId("range-selector-chart");
    await expect(chart).toBeVisible();
    await chart.scrollIntoViewIfNeeded();

    const chartBox = await chart.boundingBox();
    expect(chartBox).not.toBeNull();

    if (!chartBox) {
      return;
    }

    await page.mouse.move(chartBox.x + chartBox.width - 96, chartBox.y + 150);
    await page.mouse.down();
    await page.mouse.move(chartBox.x + chartBox.width - 160, chartBox.y + 150, {
      steps: 6
    });
    await expect(page.getByText("Portfolio:")).toBeVisible();
    await page.mouse.up();

    const rangeSelector = page.getByTestId(
      "range-selector-chart-range-selector"
    );
    await rangeSelector.scrollIntoViewIfNeeded();

    const scrollView = page.getByTestId("preview-scroll");
    const rangeBox = await rangeSelector.boundingBox();
    expect(rangeBox).not.toBeNull();

    if (!rangeBox) {
      return;
    }

    const scrollTopBefore = await scrollView.evaluate((node) => node.scrollTop);
    await page.mouse.move(
      rangeBox.x + rangeBox.width - 96,
      rangeBox.y + rangeBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.wheel(0, 420);
    const scrollTopDuring = await scrollView.evaluate((node) => node.scrollTop);
    await page.mouse.up();

    expect(scrollTopDuring).toBe(scrollTopBefore);
  });
});
