import { describe, expect, it } from "vitest";

import {
  defaultLineChartTooltipPositionAnimationDuration,
  getLineChartActiveDotConfig,
  getLineChartAreaFillConfig,
  getLineChartCrosshairConfig,
  getLineChartDotConfig,
  getLineChartStrokeStyle,
  getLineChartThresholdStyle,
  getLineChartTooltipConfig,
  resolveLineChartDecimationConfig
} from "../../../src/charts/line/options";

const baseDot = {
  visible: true,
  shape: "circle" as const,
  radius: 3,
  fill: "background" as const,
  stroke: "series" as const,
  strokeWidth: 2,
  opacity: 1
};

const themeTooltip = {
  background: "#ffffff",
  border: "#dddddd",
  text: "#111827",
  mutedText: "#64748b",
  shadowColor: "#020617",
  shadowOpacity: 0.07,
  shadowOffsetX: 0,
  shadowOffsetY: 1,
  borderRadius: 12,
  padding: 14,
  fontSize: 12,
  labelFontSize: 13
};

describe("LineChart marker and interaction options", () => {
  it("lets series marker config override global marker config", () => {
    expect(
      getLineChartDotConfig({
        dots: { shape: "circle", radius: 4, fill: "#fff" },
        seriesDot: { shape: "diamond", radius: 6, stroke: "#123" },
        showDots: true
      })
    ).toEqual({
      visible: true,
      shape: "diamond",
      radius: 6,
      fill: "#fff",
      stroke: "#123",
      strokeWidth: 2,
      opacity: 1
    });
  });

  it("respects explicit marker visibility over showDots", () => {
    expect(
      getLineChartDotConfig({
        dots: false,
        seriesDot: { visible: true },
        showDots: false
      }).visible
    ).toBe(true);
    expect(
      getLineChartDotConfig({
        dots: true,
        seriesDot: false,
        showDots: true
      }).visible
    ).toBe(false);
  });

  it("enlarges active markers by default and allows disabling them", () => {
    expect(
      getLineChartActiveDotConfig({ activeDot: undefined, baseDot })
    ).toMatchObject({
      visible: true,
      radius: 5,
      strokeWidth: 2.5
    });

    expect(
      getLineChartActiveDotConfig({ activeDot: false, baseDot }).visible
    ).toBe(false);
  });

  it("treats object crosshair config as opt-in visible", () => {
    expect(
      getLineChartCrosshairConfig({
        crosshair: { strokeDasharray: [4, 4] },
        themeAxisColor: "#aaa"
      })
    ).toEqual({
      visible: true,
      color: "#aaa",
      strokeWidth: 1,
      opacity: 0.95,
      strokeDasharray: [4, 4]
    });
  });

  it("resolves per-series stroke styling for dashed and muted lines", () => {
    expect(
      getLineChartStrokeStyle({
        strokeDasharray: [6, 4],
        strokeLinecap: "butt",
        strokeLinejoin: "bevel",
        strokeOpacity: 0.62
      })
    ).toEqual({
      strokeDasharray: [6, 4],
      strokeLinecap: "butt",
      strokeLinejoin: "bevel",
      strokeOpacity: 0.62
    });

    expect(getLineChartStrokeStyle({ strokeOpacity: 2 }).strokeOpacity).toBe(1);
    expect(getLineChartStrokeStyle({ strokeOpacity: -1 }).strokeOpacity).toBe(
      0
    );
  });

  it("resolves threshold line and area colors", () => {
    expect(
      getLineChartThresholdStyle({
        seriesColor: "#2563eb",
        threshold: {
          y: 100,
          aboveColor: "#16a34a",
          belowColor: "#dc2626",
          aboveOpacity: 1.4,
          belowOpacity: -0.5,
          areaOpacity: 0.18
        }
      })
    ).toEqual({
      y: 100,
      aboveColor: "#16a34a",
      belowColor: "#dc2626",
      aboveOpacity: 1,
      belowOpacity: 0,
      areaAboveColor: "#16a34a",
      areaBelowColor: "#dc2626",
      areaOpacity: 0.18
    });

    expect(
      getLineChartThresholdStyle({
        seriesColor: "#2563eb",
        threshold: { y: Number.NaN }
      })
    ).toBeUndefined();
  });

  it("resolves area fill gradients with clamped opacities", () => {
    expect(
      getLineChartAreaFillConfig({
        areaFill: undefined,
        seriesColor: "#2563eb"
      })
    ).toEqual({
      fromColor: "#2563eb",
      toColor: "#2563eb",
      fromOpacity: 0.22,
      toOpacity: 0.02
    });

    expect(
      getLineChartAreaFillConfig({
        areaFill: {
          fromColor: "#22c55e",
          fromOpacity: 1.4,
          toColor: "#ffffff",
          toOpacity: -0.2
        },
        seriesColor: "#2563eb"
      })
    ).toEqual({
      fromColor: "#22c55e",
      toColor: "#ffffff",
      fromOpacity: 1,
      toOpacity: 0
    });
  });

  it("resolves automatic and fixed path decimation configs", () => {
    expect(
      resolveLineChartDecimationConfig({
        decimation: "auto",
        plotWidth: 180
      })
    ).toEqual({
      maxPoints: 360,
      strategy: "min-max"
    });

    expect(
      resolveLineChartDecimationConfig({
        decimation: 200.8,
        plotWidth: 180
      })
    ).toEqual({
      maxPoints: 200,
      strategy: "min-max"
    });

    expect(
      resolveLineChartDecimationConfig({
        decimation: { maxPoints: 50 },
        plotWidth: 180
      })
    ).toEqual({
      maxPoints: 50,
      strategy: "min-max"
    });

    expect(
      resolveLineChartDecimationConfig({
        decimation: false,
        plotWidth: 180
      })
    ).toBeUndefined();
  });

  it("treats object tooltip config as opt-in visible", () => {
    expect(
      getLineChartTooltipConfig({
        tooltip: { shared: false, width: 120 },
        themeTooltip
      })
    ).toMatchObject({
      visible: true,
      shared: false,
      width: 120,
      borderColor: "#dddddd",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      labelColor: "#64748b",
      shadowColor: "#020617",
      shadowOpacity: 0.07,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
      borderRadius: 12,
      padding: 14,
      fontSize: 12,
      labelFontSize: 13,
      positionAnimationDuration:
        defaultLineChartTooltipPositionAnimationDuration
    });
  });

  it("lets chart tooltip config override theme tooltip tokens", () => {
    expect(
      getLineChartTooltipConfig({
        tooltip: {
          backgroundColor: "#0f172a",
          borderColor: "#334155",
          textColor: "#f8fafc",
          labelColor: "#cbd5e1",
          shadowColor: "#000000",
          shadowOpacity: 0.12,
          shadowOffsetX: 1,
          shadowOffsetY: 2,
          borderRadius: 6,
          padding: 8,
          fontFamily: "Acme Sans",
          fontSize: 10,
          labelFontSize: 9
        },
        themeFontFamily: "Theme Sans",
        themeTooltip
      })
    ).toMatchObject({
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      textColor: "#f8fafc",
      labelColor: "#cbd5e1",
      shadowColor: "#000000",
      shadowOpacity: 0.12,
      shadowOffsetX: 1,
      shadowOffsetY: 2,
      borderRadius: 6,
      padding: 8,
      fontFamily: "Acme Sans",
      fontSize: 10,
      labelFontSize: 9
    });
  });

  it("allows tooltip position animation duration to be configured or disabled", () => {
    expect(
      getLineChartTooltipConfig({
        tooltip: { positionAnimationDuration: 220 },
        themeTooltip
      }).positionAnimationDuration
    ).toBe(220);

    expect(
      getLineChartTooltipConfig({
        tooltip: { positionAnimationDuration: 0 },
        themeTooltip
      }).positionAnimationDuration
    ).toBe(0);

    expect(
      getLineChartTooltipConfig({
        tooltip: { positionAnimationDuration: -25 },
        themeTooltip
      }).positionAnimationDuration
    ).toBe(0);
  });

  it("resolves configurable tooltip anchor and placement", () => {
    expect(
      getLineChartTooltipConfig({
        tooltip: {
          anchor: "pointer",
          placement: "above",
          offset: 18,
          edgePadding: 8
        },
        themeTooltip
      })
    ).toMatchObject({
      anchor: "pointer",
      placement: "above",
      offset: 18,
      edgePadding: 8
    });
  });
});
