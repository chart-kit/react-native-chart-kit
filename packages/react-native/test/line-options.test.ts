import { describe, expect, it } from "vitest";

import {
  defaultLineChartTooltipPositionAnimationDuration,
  getLineChartActiveDotConfig,
  getLineChartCrosshairConfig,
  getLineChartDotConfig,
  getLineChartStrokeStyle,
  getLineChartTooltipConfig
} from "../src/charts/line/options";

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
});
