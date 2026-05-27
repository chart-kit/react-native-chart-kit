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
    await page.getByRole("button", { name: "Dark", exact: true }).click();
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
      page.getByTestId("preview-scroll").getByText("Bar Charts", {
        exact: true
      })
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
    await expect(page.getByText("MSFT vs GOOG")).toBeVisible();
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

    const gridLines = page.getByTestId("chart-layer.grid").locator("line");
    await expect(gridLines).toHaveCount(0);
    await expect(
      page.getByTestId("bar-chart-selection-grid-cover")
    ).toBeVisible();

    await page.getByTestId("bar-chart-bar.organic.1").click();
    await expect(page.getByText("Organic: 48k")).toBeVisible();
    await expect(page.getByText("Paid: 28k")).toHaveCount(0);

    const inactiveBar = page.getByTestId("bar-chart-bar.paid.1");

    await expect(inactiveBar).not.toHaveAttribute("opacity", /0\./);
    await expect(inactiveBar).not.toHaveAttribute("fill", "#0891b2");

    const chart = page.getByTestId("selectable-bar-chart");
    const chartBox = await chart.boundingBox();
    expect(chartBox).not.toBeNull();

    if (!chartBox) {
      return;
    }

    await page.mouse.click(chartBox.x + 12, chartBox.y + 12);
    await expect(page.getByText("Organic: 48k")).toHaveCount(0);
    await expect(
      page.getByTestId("bar-chart-selection-grid-cover")
    ).toHaveCount(0);
    await expect(gridLines.first()).toHaveAttribute("stroke-opacity", "0.78");
  });

  test("scrollable bar chart supports tap selection", async ({ page }) => {
    await page.goto("/?story=v2-bar-scrollable-selection&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Spend inspection")).toBeVisible();
    await expect(page.getByText("Spend: $54k")).toBeVisible();
    await expect(
      page.getByTestId("bar-chart-selection-grid-cover")
    ).toBeVisible();

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

  test("stacked bar compatibility avoids legacy segment label collisions", async ({
    page
  }) => {
    await page.goto("/?story=stacked-bar-percentile&visual=1");
    await page.evaluate(async () => {
      await document.fonts?.ready;
    });

    await expect(page.getByText("Stacked Percentile")).toBeVisible();
    const svgText = await page
      .locator("svg text")
      .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ""));

    expect(svgText).not.toContain("63%");
    await expect(page.getByText("Active")).toBeVisible();
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
});
