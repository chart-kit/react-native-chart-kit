import { describe, expect, it } from "vitest";

import {
  createChartPreset,
  resolveCartesianChartThemeConfig
} from "../../src/theme/presets";

describe("Cartesian chart theme presets", () => {
  it("resolves built-in presets by mode", () => {
    expect(
      resolveCartesianChartThemeConfig({
        mode: "dark",
        preset: "aurora"
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
        preset: "verdant"
      })
    ).toMatchObject({
      background: "#f1fbf5",
      tooltip: {
        background: "#fbfffd",
        border: "#b4dbc4",
        text: "#0d2618",
        mutedText: "#557064"
      },
      series: ["#059669", "#65a30d", "#0e7490", "#dc2626"]
    });

    expect(
      resolveCartesianChartThemeConfig({
        mode: "light",
        preset: "cupertino"
      })
    ).toMatchObject({
      background: "#f2f7ff",
      axis: "#c5d8ed",
      series: ["#007aff", "#ff2d55", "#34c759", "#ff9500"]
    });

    expect(
      resolveCartesianChartThemeConfig({
        mode: "dark",
        preset: "material"
      })
    ).toMatchObject({
      background: "#141218",
      axis: "#5d5668",
      series: ["#d0bcff", "#4fd8d8", "#ffb4ab", "#efb8c8"]
    });
  });

  it("resolves spec-style built-in preset aliases", () => {
    expect(
      resolveCartesianChartThemeConfig({
        mode: "dark",
        preset: "midnight"
      })
    ).toMatchObject({
      background: "#020617",
      plotBackground: "#07111f",
      series: ["#22d3ee", "#34d399", "#f59e0b", "#f472b6"]
    });

    expect(
      resolveCartesianChartThemeConfig({
        mode: "light",
        preset: "contrast"
      })
    ).toMatchObject({
      background: "#ffffff",
      grid: "#111827",
      text: "#000000"
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

  it("uses a visible default tooltip shadow in light and dark modes", () => {
    expect(
      resolveCartesianChartThemeConfig({
        mode: "light"
      }).tooltip
    ).toMatchObject({
      shadowColor: "#020617",
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      shadowOpacity: 0.16
    });

    expect(
      resolveCartesianChartThemeConfig({
        mode: "dark"
      }).tooltip
    ).toMatchObject({
      shadowColor: "#020617",
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      shadowOpacity: 0.16
    });
  });

  it("layers chart overrides over presets", () => {
    expect(
      resolveCartesianChartThemeConfig({
        mode: "light",
        preset: "spectrum",
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
        mutedText: "#566482",
        borderRadius: 14
      },
      typography: {
        fontFamily: "Acme Sans",
        axisLabelSize: 13,
        legendLabelSize: 11
      }
    });
  });

  it("falls back to default for removed alpha preset names", () => {
    for (const preset of ["analytics", "dark-fintech", "high-contrast"]) {
      expect(
        resolveCartesianChartThemeConfig({
          mode: "light",
          preset
        })
      ).toMatchObject({
        background: "#ffffff",
        series: ["#2563eb", "#0891b2", "#7c3aed", "#16a34a"]
      });
    }
  });
});
