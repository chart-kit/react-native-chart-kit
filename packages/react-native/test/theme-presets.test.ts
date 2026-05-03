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
      tooltip: {
        background: "#0c1424",
        border: "#2c5078",
        text: "#f8fafc",
        mutedText: "#9fb6d1"
      },
      series: ["#38bdf8", "#a78bfa", "#2dd4bf", "#fb923c"]
    });

    expect(
      resolveCartesianChartThemeConfig({
        mode: "light",
        preset: "health"
      })
    ).toMatchObject({
      background: "#fbfefc",
      tooltip: {
        background: "#ffffff",
        border: "#c9dfd4",
        text: "#10221a",
        mutedText: "#5f776b"
      },
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
        plotBackground: "#22130b",
        grid: "#7c2d12",
        axis: "#9a3412",
        text: "#ffedd5",
        mutedText: "#fdba74",
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
      tooltip: {
        background: "#22130b",
        border: "#9a3412",
        text: "#ffedd5",
        mutedText: "#fdba74"
      },
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
          tooltip: {
            background: "#111111",
            border: "#222222",
            text: "#ffffff",
            borderRadius: 14
          },
          typography: {
            fontFamily: "Acme Sans",
            axisLabelSize: 13
          }
        }
      })
    ).toMatchObject({
      series: ["#111111"],
      tooltip: {
        background: "#111111",
        border: "#222222",
        text: "#ffffff",
        mutedText: "#55708d",
        borderRadius: 14
      },
      typography: {
        fontFamily: "Acme Sans",
        axisLabelSize: 13,
        legendLabelSize: 11
      }
    });
  });
});
