import { describe, expect, it } from "vitest";

import {
  createChartPreset,
  resolveCartesianChartThemeConfig
} from "../src/theme/presets";

describe("Cartesian chart theme presets", () => {
  it("resolves built-in presets by mode", () => {
    expect(
      resolveCartesianChartThemeConfig({
        mode: "dark",
        preset: "fintech"
      })
    ).toMatchObject({
      background: "#020617",
      series: ["#38bdf8", "#a78bfa", "#2dd4bf", "#fb923c"]
    });

    expect(
      resolveCartesianChartThemeConfig({
        mode: "light",
        preset: "health"
      })
    ).toMatchObject({
      background: "#fbfefc",
      series: ["#059669", "#e11d48", "#0ea5e9", "#84cc16"]
    });
  });

  it("supports provider-registered custom preset names", () => {
    const acme = createChartPreset({
      light: {
        background: "#fff8f0",
        grid: "#f4d3b2",
        series: ["#c2410c", "#0f766e"]
      },
      dark: {
        background: "#1c0f08",
        grid: "#7c2d12",
        series: ["#fdba74", "#5eead4"]
      }
    });

    expect(
      resolveCartesianChartThemeConfig({
        mode: "dark",
        preset: "acme",
        presets: { acme }
      })
    ).toMatchObject({
      background: "#1c0f08",
      grid: "#7c2d12",
      series: ["#fdba74", "#5eead4"]
    });
  });

  it("layers chart overrides over presets", () => {
    expect(
      resolveCartesianChartThemeConfig({
        mode: "light",
        preset: "analytics",
        theme: {
          series: ["#111111"],
          typography: {
            fontFamily: "Acme Sans",
            axisLabelSize: 13
          }
        }
      })
    ).toMatchObject({
      series: ["#111111"],
      typography: {
        fontFamily: "Acme Sans",
        axisLabelSize: 13,
        legendLabelSize: 11
      }
    });
  });
});
