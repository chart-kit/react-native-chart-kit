import { expect, test } from "@playwright/test";

test.describe("Expo showcase chart interactions", () => {
  test("showcase menu opens a chart page picker", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Line Charts")).toBeVisible();
    await expect(page.getByText("Showpieces")).toBeVisible();
    await expect(page.getByText("Portfolio growth")).toBeVisible();
    await expect(page.getByText("High Contrast")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "QA" })).toHaveCount(0);

    await page.getByRole("button", { name: "Open chart page menu" }).click();
    await expect(page.getByText("Chart pages")).toBeVisible();
    await expect(page.getByText("Appearance")).toBeVisible();
    await expect(page.getByText("Theme preset")).toBeVisible();
    await page.getByRole("button", { name: "Dark" }).click();
    await expect(page).toHaveURL(/theme=dark/);

    await page.getByRole("button", { name: "Open chart page menu" }).click();
    await page.getByRole("button", { name: "Studio" }).click();
    await expect(page).toHaveURL(/preset=studio/);

    await page.getByRole("button", { name: "Open chart page menu" }).click();
    await expect(
      page.getByRole("button", { name: "Bar Charts" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Line Charts" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Bar Charts" }).click();
    await expect(
      page.getByTestId("preview-scroll").getByText("Bar Charts")
    ).toBeVisible();
    await expect(page).toHaveURL(/theme=dark/);
    await expect(page).toHaveURL(/preset=studio/);
    await expect(page.getByText("Grouped bars").first()).toBeVisible();
    await expect(page.getByText("Acquisition mix").first()).toBeVisible();
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

  test("bar chart tap selection moves and clears tooltip", async ({ page }) => {
    await page.goto("/?story=v2-bar-selection&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Paid acquisition")).toBeVisible();
    await expect(page.getByText("Paid: 28k")).toBeVisible();

    await page.getByTestId("bar-chart-bar.organic.1").click();
    await expect(page.getByText("Organic: 48k")).toBeVisible();
    await expect(page.getByText("Paid: 28k")).toHaveCount(0);

    const chart = page.getByTestId("selectable-bar-chart");
    const chartBox = await chart.boundingBox();
    expect(chartBox).not.toBeNull();

    if (!chartBox) {
      return;
    }

    await page.mouse.click(chartBox.x + 12, chartBox.y + 12);
    await expect(page.getByText("Organic: 48k")).toHaveCount(0);
  });

  test("scrollable bar chart supports tap selection", async ({ page }) => {
    await page.goto("/?story=v2-bar-scrollable-selection&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Spend inspection")).toBeVisible();
    await expect(page.getByText("Spend: $54k")).toBeVisible();

    await page.getByTestId("bar-chart-bar.spend.16").click();
    await expect(page.getByText("Spend: $61k")).toBeVisible();
    await expect(page.getByText("Spend: $54k")).toHaveCount(0);
  });

  test("bar chart stories inherit the app-level theme preset", async ({
    page
  }) => {
    await page.goto("/?story=v2-bar-grouped&visual=1&preset=minimal");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Acquisition mix")).toBeVisible();
    await expect(page.getByTestId("bar-chart-bar.organic.0")).toHaveAttribute(
      "fill",
      "#111827"
    );
    await expect(page.getByTestId("bar-chart-bar.paid.0")).toHaveAttribute(
      "fill",
      "#64748b"
    );
  });

  test("slice, progress, and heatmap stories inherit app-level theme presets", async ({
    page
  }) => {
    await page.goto("/?story=v2-pie-acquisition&visual=1&preset=minimal");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Acquisition share")).toBeVisible();
    await expect(page.getByTestId("pie-chart-slice.0")).toHaveAttribute(
      "fill",
      "#111827"
    );
    await expect(page.getByTestId("pie-chart-slice.1")).toHaveAttribute(
      "fill",
      "#64748b"
    );

    await page.goto("/?story=v2-progress-activity&visual=1&preset=minimal");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Activity rings")).toBeVisible();
    await expect(
      page.getByTestId("activity-progress-chart-ring.0")
    ).toHaveAttribute("stroke", "#111827");
    await expect(
      page.getByTestId("activity-progress-chart-ring.1")
    ).toHaveAttribute("stroke", "#64748b");

    await page.goto("/?story=v2-contribution-usage&visual=1&preset=minimal");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Product usage")).toBeVisible();
    const themedHeatmapCellCount = await page
      .locator('[data-testid^="product-usage-heatmap-cell."][fill="#111827"]')
      .count();
    expect(themedHeatmapCellCount).toBeGreaterThan(0);
  });

  test("horizontal bar chart shows every category label", async ({ page }) => {
    await page.goto("/?story=v2-bar-horizontal&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Chat")).toBeVisible();
    await expect(page.getByText("Email")).toBeVisible();
    await expect(page.getByText("Phone")).toBeVisible();
    await expect(page.getByText("Social")).toBeVisible();
    await expect(page.getByText("Community")).toBeVisible();
  });

  test("donut chart tap selection updates the active center label", async ({
    page
  }) => {
    await page.goto("/?story=v2-donut-selection&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    const centerLabel = page.getByTestId("chart-layer.overlays");

    await expect(centerLabel.getByText("Business")).toBeVisible();
    await page.getByTestId("selectable-donut-chart-slice.3").click();
    await expect(centerLabel.getByText("Starter")).toBeVisible();
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

  test("range selector custom line renderer has stable keys", async ({
    page
  }) => {
    const messages: string[] = [];
    page.on("console", (message) => {
      messages.push(message.text());
    });

    await page.goto("/?story=v2-range-selector&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Portfolio range")).toBeVisible();
    expect(messages.join("\n")).not.toContain(
      'Each child in a list should have a unique "key" prop'
    );
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
    await page.goto("/?story=v2-range-selector&theme=dark");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

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
