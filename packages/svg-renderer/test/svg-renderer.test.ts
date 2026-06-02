import { describe, expect, it } from "vitest";

import { createSvgRendererCapabilities } from "../src/capabilities";
import { createClipPathRef, resolveSvgClipPolicy } from "../src/clipPath";
import { ensureRuntimeConsole } from "../src/ensureConsole";
import { createSvgHitRegionProps } from "../src/hitRegions";
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
  it("installs a minimal console before SVG primitives load", () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "console"
    );

    try {
      Object.defineProperty(globalThis, "console", {
        configurable: true,
        value: undefined,
        writable: true
      });

      const runtimeConsole = ensureRuntimeConsole();

      expect(typeof runtimeConsole.error).toBe("function");
      expect(typeof runtimeConsole.warn).toBe("function");
      expect(typeof runtimeConsole.assert).toBe("function");
      const nodeGlobal = (
        globalThis as unknown as {
          global?: { console?: unknown };
        }
      ).global;
      if (nodeGlobal && typeof nodeGlobal === "object") {
        expect(nodeGlobal.console).toBe(runtimeConsole);
      }
      expect(() => {
        (runtimeConsole.error as (...args: unknown[]) => void)("ignored");
      }).not.toThrow();
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, "console", originalDescriptor);
      }
    }
  });

  it("creates stable test ids", () => {
    expect(createSvgTestId("Line Chart", "Series 1", 4)).toBe(
      "line-chart.series-1.4"
    );
  });

  it("creates clip path references", () => {
    expect(createClipPathRef("plot-area")).toBe("url(#plot-area)");
  });

  it("resolves clip policy models for renderer consumers", () => {
    expect(
      resolveSvgClipPolicy({
        height: 120,
        id: "plot-area",
        inset: { bottom: 8, left: 4, right: 6, top: 2 },
        width: 200,
        x: 10,
        y: 20
      })
    ).toEqual({
      clipPath: "url(#plot-area)",
      clipRect: {
        height: 110,
        id: "plot-area",
        width: 190,
        x: 14,
        y: 22
      },
      enabled: true
    });
    expect(
      resolveSvgClipPolicy({
        enabled: false,
        height: 120,
        id: "plot-area",
        width: 200,
        x: 10,
        y: 20
      })
    ).toEqual({ enabled: false });
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
      "referenceLabels",
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

  it("exposes renderer capability flags", () => {
    expect(createSvgRendererCapabilities()).toEqual({
      animation: "reactNative",
      clipPaths: true,
      gradients: true,
      hitRegions: true,
      layers: true,
      shadows: false,
      symbols: true,
      testIds: true,
      textMeasurement: "fallback"
    });
    expect(
      createSvgRendererCapabilities({
        capabilities: { hitRegions: true },
        measureText: () => ({ height: 10, width: 20 })
      })
    ).toMatchObject({
      hitRegions: true,
      textMeasurement: "custom"
    });
  });

  it("creates invisible hit-region props without changing layout bounds", () => {
    expect(
      createSvgHitRegionProps({
        height: 44,
        testID: "point-hit-region",
        width: 44,
        x: 10,
        y: 12
      })
    ).toMatchObject({
      fill: "#000",
      fillOpacity: 0.001,
      height: 44,
      pointerEvents: "auto",
      testID: "point-hit-region",
      width: 44,
      x: 10,
      y: 12
    });
    expect(
      createSvgHitRegionProps({
        disabled: true,
        height: 44,
        width: 44,
        x: 10,
        y: 12
      }).pointerEvents
    ).toBe("none");
  });
});
