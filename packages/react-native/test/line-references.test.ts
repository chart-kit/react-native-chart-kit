import { describe, expect, it } from "vitest";

import {
  buildLineChartReferenceBandModels,
  buildLineChartReferenceLineModels
} from "../src/charts/line/references";
import { resolveCartesianChartThemeConfig } from "../src/theme/presets";

const plot = { x: 40, y: 20, width: 240, height: 160 };
const theme = resolveCartesianChartThemeConfig({ mode: "light" });
const yScale = {
  domain: [0, 100] as [number, number],
  range: [180, 20] as [number, number],
  scale: (value: number) => 180 - value * 1.6,
  invert: (value: number) => (180 - value) / 1.6
};

describe("LineChart reference overlays", () => {
  it("builds visible reference lines with theme defaults and labels", () => {
    expect(
      buildLineChartReferenceLineModels({
        lines: [
          {
            y: 75,
            label: "Target",
            strokeDasharray: [5, 4]
          },
          { y: 120, label: "Outside" }
        ],
        plot,
        theme,
        yScale
      })
    ).toEqual([
      {
        key: "reference-line-0-75",
        x1: 40,
        x2: 280,
        y: 60,
        color: theme.mutedText,
        opacity: 0.86,
        strokeDasharray: [5, 4],
        strokeWidth: 1,
        label: {
          text: "Target",
          x: 272,
          y: 54,
          color: theme.mutedText,
          fontSize: theme.typography.axisLabelSize,
          textAnchor: "end"
        }
      }
    ]);
  });

  it("clamps reference bands to the plot bounds", () => {
    expect(
      buildLineChartReferenceBandModels({
        bands: [
          {
            y1: 20,
            y2: 40,
            label: "Goal range"
          },
          {
            y1: 90,
            y2: 130
          }
        ],
        plot,
        theme,
        yScale
      })
    ).toMatchObject([
      {
        x: 40,
        y: 116,
        width: 240,
        height: 32,
        color: theme.series[0],
        opacity: 0.1,
        label: {
          text: "Goal range",
          x: 48,
          textAnchor: "start"
        }
      },
      {
        x: 40,
        y: 20,
        width: 240,
        height: 16
      }
    ]);
  });
});
