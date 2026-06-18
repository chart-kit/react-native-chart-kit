import { describe, expect, it } from "vitest";

import {
  normalizeCartesianData,
  normalizeLegacyContributionData,
  normalizeLegacyLineData,
  normalizeLegacyPieData,
  normalizeLegacyProgressData,
  normalizeLegacyStackedBarData
} from "../../src";

describe("normalizeCartesianData", () => {
  it("normalizes object rows into multiple numeric series", () => {
    const rows = [
      { date: "2026-01-01", revenue: 120, target: 100 },
      { date: "2026-01-02", revenue: null, target: 105 },
      { date: "2026-01-03", revenue: 150, target: 110 }
    ];

    const result = normalizeCartesianData({
      data: rows,
      xKey: "date",
      series: [
        { yKey: "revenue", label: "Revenue", color: "#2563eb" },
        { yKey: "target", label: "Target" }
      ]
    });

    expect(result.kind).toBe("cartesian");
    expect(result.xKey).toBe("date");
    expect(result.series).toHaveLength(2);
    expect(result.series[0]).toMatchObject({
      key: "revenue",
      label: "Revenue",
      color: "#2563eb"
    });
    expect(result.series[0]?.points.map((point) => point.value)).toEqual([
      120,
      null,
      150
    ]);
    expect(result.series[0]?.points.map((point) => point.defined)).toEqual([
      true,
      false,
      true
    ]);
    expect(result.series[1]?.points.map((point) => point.value)).toEqual([
      100, 105, 110
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("warns for undefined, NaN, and invalid x values", () => {
    const warnings: string[] = [];

    const result = normalizeCartesianData(
      {
        data: [
          { date: "2026-01-01", value: 1 },
          { date: undefined, value: undefined },
          { date: {}, value: Number.NaN }
        ],
        xKey: "date",
        yKey: "value"
      },
      {
        onWarning: (warning) => warnings.push(warning.code)
      }
    );

    expect(result.series[0]?.points.map((point) => point.x)).toEqual([
      "2026-01-01",
      1,
      2
    ]);
    expect(result.series[0]?.points.map((point) => point.value)).toEqual([
      1,
      null,
      null
    ]);
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      "invalid-x-value",
      "missing-value",
      "invalid-x-value",
      "invalid-number"
    ]);
    expect(warnings).toEqual(result.warnings.map((warning) => warning.code));
  });
});

describe("normalizeLegacyLineData", () => {
  it("normalizes legacy line data and keeps nulls as gaps", () => {
    const result = normalizeLegacyLineData({
      labels: ["Jan", "Feb", "Mar"],
      legend: ["Actual", "Forecast"],
      datasets: [
        { data: [10, null, 30], strokeWidth: 3 },
        { data: [8, 16], key: "forecast" }
      ]
    });

    expect(result.kind).toBe("cartesian");
    expect(result.xKey).toBe("labels");
    expect(result.series.map((series) => series.label)).toEqual([
      "Actual",
      "Forecast"
    ]);
    expect(result.series[0]?.points.map((point) => point.x)).toEqual([
      "Jan",
      "Feb",
      "Mar"
    ]);
    expect(result.series[0]?.points.map((point) => point.value)).toEqual([
      10,
      null,
      30
    ]);
    expect(result.series[1]?.key).toBe("forecast");
    expect(result.series[1]?.points.map((point) => point.value)).toEqual([
      8,
      16,
      null
    ]);
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      "missing-value"
    ]);
  });

  it("supports legacy data without labels", () => {
    const result = normalizeLegacyLineData({
      datasets: [{ data: [4, 6, 8] }]
    });

    expect(result.series[0]?.points.map((point) => point.x)).toEqual([0, 1, 2]);
    expect(result.warnings).toEqual([]);
  });
});

describe("normalizeLegacyPieData", () => {
  it("normalizes legacy pie slices with accessor metadata", () => {
    const result = normalizeLegacyPieData(
      [
        { name: "Seoul", population: 21_500_000, color: "#83a7ea" },
        { name: "Toronto", population: 2_800_000, color: "#f00" },
        { name: "Empty", population: 0 }
      ],
      { accessor: "population" }
    );

    expect(result.kind).toBe("pie");
    expect(result.accessor).toBe("population");
    expect(result.slices.map((slice) => slice.label)).toEqual([
      "Seoul",
      "Toronto",
      "Empty"
    ]);
    expect(result.slices.map((slice) => slice.value)).toEqual([
      21_500_000, 2_800_000, 0
    ]);
    expect(result.slices[0]?.color).toBe("#83a7ea");
    expect(result.warnings).toEqual([]);
  });

  it("warns and drops invalid or negative pie values", () => {
    const result = normalizeLegacyPieData([
      { name: "Invalid", population: "many" },
      { name: "Negative", population: -10 }
    ]);

    expect(result.slices.map((slice) => slice.value)).toEqual([null, null]);
    expect(result.slices.map((slice) => slice.defined)).toEqual([false, false]);
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      "invalid-number",
      "negative-pie-value"
    ]);
  });
});

describe("normalizeLegacyProgressData", () => {
  it("normalizes progress object data with labels and colors", () => {
    const result = normalizeLegacyProgressData({
      labels: ["Swim", "Bike", "Run"],
      colors: ["#2563eb", "#16a34a", "#dc2626"],
      data: [0.4, 0.6, 0.8]
    });

    expect(result.kind).toBe("progress");
    expect(result.rings).toEqual([
      {
        index: 0,
        label: "Swim",
        value: 0.4,
        defined: true,
        color: "#2563eb"
      },
      {
        index: 1,
        label: "Bike",
        value: 0.6,
        defined: true,
        color: "#16a34a"
      },
      {
        index: 2,
        label: "Run",
        value: 0.8,
        defined: true,
        color: "#dc2626"
      }
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("supports array shorthand and warns for invalid progress values", () => {
    const result = normalizeLegacyProgressData([0.25, 1.5, undefined]);

    expect(result.rings.map((ring) => ring.value)).toEqual([0.25, 1.5, null]);
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      "progress-out-of-range",
      "missing-value"
    ]);
  });
});

describe("normalizeLegacyStackedBarData", () => {
  it("normalizes stacked bar groups, labels, colors, and totals", () => {
    const result = normalizeLegacyStackedBarData({
      labels: ["Test1", "Test2"],
      legend: ["L1", "L2", "L3"],
      data: [
        [60, 60, 60],
        [30, null, 60]
      ],
      barColors: ["#dfe4ea", "#ced6e0", "#a4b0be"]
    });

    expect(result.kind).toBe("stacked-bar");
    expect(result.legend).toEqual(["L1", "L2", "L3"]);
    expect(result.colors).toEqual(["#dfe4ea", "#ced6e0", "#a4b0be"]);
    expect(result.groups.map((group) => group.label)).toEqual([
      "Test1",
      "Test2"
    ]);
    expect(result.groups.map((group) => group.total)).toEqual([180, 90]);
    expect(
      result.groups[1]?.segments.map((segment) => ({
        label: segment.label,
        value: segment.value,
        color: segment.color
      }))
    ).toEqual([
      { label: "L1", value: 30, color: "#dfe4ea" },
      { label: "L2", value: null, color: "#ced6e0" },
      { label: "L3", value: 60, color: "#a4b0be" }
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("warns for missing stacked segment values", () => {
    const result = normalizeLegacyStackedBarData({
      labels: ["Only"],
      legend: ["A", "B"],
      data: [[10]],
      barColors: ["#111", "#222"]
    });

    expect(result.groups[0]?.segments.map((segment) => segment.value)).toEqual([
      10,
      null
    ]);
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      "missing-value"
    ]);
  });
});

describe("normalizeLegacyContributionData", () => {
  it("normalizes contribution values into an inclusive date range", () => {
    const result = normalizeLegacyContributionData(
      [
        { date: "2026-01-01", count: 1 },
        { date: "2026-01-03", count: 4 }
      ],
      {
        endDate: "2026-01-03",
        numDays: 3
      }
    );

    expect(result.kind).toBe("contribution");
    expect(result.accessor).toBe("count");
    expect(result.startDate).toEqual(new Date(2026, 0, 1));
    expect(result.endDate).toEqual(new Date(2026, 0, 3));
    expect(
      result.days.map((day) => ({
        date: day.date,
        value: day.value,
        defined: day.defined
      }))
    ).toEqual([
      { date: new Date(2026, 0, 1), value: 1, defined: true },
      { date: new Date(2026, 0, 2), value: 0, defined: true },
      { date: new Date(2026, 0, 3), value: 4, defined: true }
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("warns for invalid, out-of-range, and missing contribution values", () => {
    const result = normalizeLegacyContributionData(
      [
        { date: "bad-date", count: 1 },
        { date: "2025-12-31", count: 2 },
        { date: "2026-01-02" }
      ],
      {
        endDate: "2026-01-02",
        numDays: 2,
        emptyValue: null
      }
    );

    expect(result.days.map((day) => day.value)).toEqual([null, null]);
    expect(result.days.map((day) => day.defined)).toEqual([false, false]);
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      "invalid-date",
      "contribution-out-of-range",
      "missing-value"
    ]);
  });
});
