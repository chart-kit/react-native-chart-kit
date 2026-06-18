import { describe, expect, it } from "vitest";

import type { ChartBoxes } from "@chart-kit/core";

import { getLineChartOverviewProps } from "../../../src/charts/line/overviewProps";
import { buildLineChartSeriesStyleMap } from "../../../src/charts/line/seriesStyles";
import { buildLineChartXScale } from "../../../src/charts/line/xScale";
import { resolveLineChartYAxisModel } from "../../../src/charts/line/yAxisModel";
import { buildXLabelCandidates } from "../../../src/charts/line/xLabelCandidates";
import {
  getMaxSize,
  resolveXLabelLayout
} from "../../../src/charts/line/xLabels";
import {
  clamp,
  defaultFormatXLabel,
  defaultFormatYLabel,
  getSeriesColor,
  getXKey,
  getXScaleType,
  unique
} from "../../../src/charts/line/utils";
import { resolveCartesianChartThemeConfig } from "../../../src/theme/presets";

const boxes = {
  plot: {
    height: 100,
    width: 200,
    x: 20,
    y: 10
  }
} as ChartBoxes;

describe("LineChart pure helpers", () => {
  it("removes interaction-only props for overview charts", () => {
    const props = getLineChartOverviewProps({
      activeDot: true,
      crosshair: true,
      data: [{ month: "Jan", value: 10 }],
      defaultSelectedIndex: 0,
      height: 200,
      interaction: "tap",
      rangeSelector: true,
      selectedIndex: 1,
      tooltip: true,
      viewport: { startIndex: 0, endIndex: 1 },
      width: 300,
      xKey: "month",
      yKey: "value"
    });

    expect(props).toEqual({
      data: [{ month: "Jan", value: 10 }],
      height: 200,
      width: 300,
      xKey: "month",
      yKey: "value"
    });
  });

  it("resolves utility formatting, color, and scale type helpers", () => {
    const theme = resolveCartesianChartThemeConfig({ mode: "light" });

    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(12, 10, 0)).toBe(10);
    expect(unique(["Jan", "Jan", "Feb"])).toEqual(["Jan", "Feb"]);
    expect(getSeriesColor(theme, 5)).toBe("#0891b2");
    expect(defaultFormatXLabel(new Date(2026, 0, 5))).toBe("Jan 5");
    expect(defaultFormatYLabel(1234)).toBe("1.2k");
    expect(defaultFormatYLabel(12.345)).toBe("12.35");
    expect(getXKey(new Date(2026, 0, 5))).toBe(new Date(2026, 0, 5).valueOf());
    expect(getXScaleType([new Date(2026, 0, 1)])).toBe("time");
    expect(getXScaleType([1, 2, 3])).toBe("linear");
    expect(getXScaleType(["Jan", 2])).toBe("point");
  });

  it("builds style maps from series and chart defaults", () => {
    const theme = resolveCartesianChartThemeConfig({ mode: "light" });
    const styles = buildLineChartSeriesStyleMap({
      areaFill: { fromOpacity: 0.2 },
      dots: { radius: 5 },
      resolvedTheme: theme,
      seriesInput: [
        {
          area: true,
          key: "revenue",
          strokeDasharray: [4, 2],
          threshold: { y: 20 },
          yKey: "value"
        },
        { color: "#ef4444", dot: false, yKey: "margin" }
      ],
      showDots: true
    });

    expect(styles.get("revenue")).toMatchObject({
      area: true,
      color: "#2563eb",
      dot: { radius: 5, visible: true },
      strokeStyle: { strokeDasharray: [4, 2] },
      strokeWidth: 3,
      threshold: { aboveColor: "#2563eb", belowColor: "#2563eb", y: 20 }
    });
    expect(styles.get("margin")).toMatchObject({
      color: "#ef4444",
      dot: { visible: false }
    });
  });

  it("builds point, linear, and time x scales", () => {
    const pointScale = buildLineChartXScale({
      boxes,
      xValues: ["Jan", "Feb", "Mar"]
    });
    const linearScale = buildLineChartXScale({
      boxes,
      xValues: [0, 50, 100]
    });
    const timeScale = buildLineChartXScale({
      boxes,
      xValues: [new Date(2026, 0, 1), new Date(2026, 0, 2)]
    });
    const point = {
      defined: true,
      index: 0,
      raw: {},
      value: 0,
      x: "Jan"
    };

    expect(pointScale("Jan", point)).toBe(20);
    expect(pointScale("Mar", point)).toBe(220);
    expect(linearScale(50, point)).toBe(120);
    expect(linearScale("bad" as never, point)).toBeUndefined();
    expect(timeScale(new Date(2026, 0, 2), point)).toBe(220);
    expect(timeScale(2 as never, point)).toBeUndefined();
  });

  it("resolves y-axis ticks and stable label sizes", () => {
    const model = resolveLineChartYAxisModel({
      data: [
        { month: "Jan", value: 10 },
        { month: "Feb", value: 30 }
      ],
      formatYLabel: (value) => `${value}k`,
      measureText: (text) => ({ height: 10, width: text.length * 6 }),
      series: [{ yKey: "value" }],
      stableData: [
        { month: "Jan", value: 10 },
        { month: "Feb", value: 3000 }
      ],
      textOptions: {},
      xKey: "month",
      yAxisLabelWidth: "stable",
      yDomain: { max: "dataMax", min: "dataMin", nice: true }
    });

    expect(model.normalized.series[0]?.points).toHaveLength(2);
    expect(model.yTicks.length).toBeGreaterThan(1);
    expect(model.yDomainResolved[0]).toBeLessThanOrEqual(10);
    expect(Math.max(...model.yLabelSizes.map((size) => size.width))).toBe(30);
  });

  it("builds and lays out x-label candidates", () => {
    const series = {
      key: "value",
      label: "Value",
      points: [
        { defined: true, index: 0, raw: {}, value: 1, x: "Jan" },
        { defined: true, index: 1, raw: {}, value: 2, x: "Jan" },
        { defined: true, index: 2, raw: {}, value: 3, x: "Mar" }
      ]
    };
    const candidates = buildXLabelCandidates({
      dataIndexOffset: 4,
      labelStrategy: "auto",
      series,
      xLabelSizes: [
        { height: 10, width: 30 },
        { height: 10, width: 30 },
        { height: 10, width: 30 }
      ],
      xLabelTexts: ["Jan", "Jan", "Mar"],
      xScale: (value, _point) => ({ Jan: 10, Mar: 90 })[String(value)],
      xValues: ["Jan", "Jan", "Mar"]
    });

    expect(candidates.map((candidate) => candidate.text)).toEqual([
      "Jan",
      "Mar"
    ]);
    expect(getMaxSize(candidates.map((candidate) => candidate.size))).toEqual({
      height: 10,
      width: 30
    });

    const hidden = resolveXLabelLayout({
      baseY: 120,
      candidates,
      chartWidth: 100,
      edgeLabelPolicy: "hide",
      minGap: 4,
      plotWidth: 80,
      rotation: -35,
      strategy: "hide"
    });
    const rotated = resolveXLabelLayout({
      baseY: 120,
      candidates,
      chartWidth: 100,
      edgeLabelPolicy: "shift",
      minGap: 4,
      plotWidth: 80,
      rotation: 35,
      strategy: "rotate"
    });
    const staggered = resolveXLabelLayout({
      baseY: 120,
      candidates,
      chartWidth: 100,
      edgeLabelPolicy: "show",
      minGap: 4,
      plotWidth: 80,
      rotation: -35,
      strategy: "stagger"
    });

    expect(hidden).toMatchObject({
      height: 0,
      items: [],
      rotation: 0,
      strategy: "hide"
    });
    expect(rotated.rotation).toBe(-35);
    expect(rotated.items[0]).toMatchObject({
      row: 0,
      textAnchor: "start"
    });
    expect(staggered.rows).toBe(2);
    expect(staggered.items.map((item) => item.row)).toEqual([0, 0]);
  });
});
