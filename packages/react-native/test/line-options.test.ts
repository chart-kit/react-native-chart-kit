import { describe, expect, it } from "vitest";

import {
  getLineChartActiveDotConfig,
  getLineChartCrosshairConfig,
  getLineChartDotConfig,
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

  it("treats object tooltip config as opt-in visible", () => {
    expect(
      getLineChartTooltipConfig({
        tooltip: { shared: false, width: 120 },
        themeAxisColor: "#ddd"
      })
    ).toMatchObject({
      visible: true,
      shared: false,
      width: 120,
      borderColor: "#ddd"
    });
  });
});
