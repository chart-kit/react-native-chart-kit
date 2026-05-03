import { describe, expect, it } from "vitest";

import { createClipPathRef } from "../src/clipPath";
import {
  chartRenderLayerOrder,
  chartRenderLayers,
  getChartRenderLayerTestId
} from "../src/layerOrder";
import { createSvgSymbolDiamondPath } from "../src/symbolGeometry";
import { createSvgTestId } from "../src/testIds";
import {
  createSvgTextMeasurer,
  measureSvgTextFallback
} from "../src/textMeasurement";

describe("SVG text measurement fallback", () => {
  it("estimates text width and height deterministically", () => {
    expect(measureSvgTextFallback("Revenue", { fontSize: 10 })).toEqual({
      width: 39.2,
      height: 12
    });
  });

  it("uses maxWidth as a cap and supports multiline labels", () => {
    const measured = createSvgTextMeasurer({ fontSize: 12 })("Jan\nFebruary", {
      maxWidth: 30
    });

    expect(measured.width).toBe(30);
    expect(measured.height).toBeCloseTo(28.8);
  });

  it("widens bold labels", () => {
    expect(
      measureSvgTextFallback("100", { fontSize: 10, fontWeight: "bold" }).width
    ).toBe(18);
  });
});

describe("SVG renderer helpers", () => {
  it("creates stable test ids", () => {
    expect(createSvgTestId("Line Chart", "Series 1", 4)).toBe(
      "line-chart.series-1.4"
    );
  });

  it("creates clip path references", () => {
    expect(createClipPathRef("plot-area")).toBe("url(#plot-area)");
  });

  it("defines stable render layer ordering", () => {
    expect(chartRenderLayerOrder).toEqual([
      "background",
      "plot",
      "grid",
      "axes",
      "referenceBands",
      "dataArea",
      "data",
      "referenceLines",
      "markers",
      "overlays",
      "interaction",
      "debug"
    ]);
    expect(chartRenderLayers.markers).toBeGreaterThan(chartRenderLayers.data);
    expect(chartRenderLayers.interaction).toBeGreaterThan(
      chartRenderLayers.overlays
    );
    expect(getChartRenderLayerTestId("interaction")).toBe(
      "chart-layer.interaction"
    );
  });

  it("creates deterministic diamond marker paths", () => {
    expect(createSvgSymbolDiamondPath({ x: 10, y: 20, size: 8 })).toBe(
      "M 10 16 L 14 20 L 10 24 L 6 20 Z"
    );
  });
});
