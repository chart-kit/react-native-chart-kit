import { describe, expect, it } from "vitest";

import {
  normalizeLegacyContributionData,
  normalizeLegacyLineData,
  normalizeLegacyPieData,
  normalizeLegacyProgressData,
  normalizeLegacyStackedBarData
} from "../../src";

describe("legacy data compatibility fixtures", () => {
  it("normalizes the README-style LineChart shape", () => {
    const result = normalizeLegacyLineData({
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43],
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Rainy Days"]
    });

    expect(result.series).toHaveLength(1);
    expect(result.series[0]?.label).toBe("Rainy Days");
    expect(result.series[0]?.points.map((point) => point.value)).toEqual([
      20, 45, 28, 80, 99, 43
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("normalizes the README-style StackedBarChart shape", () => {
    const result = normalizeLegacyStackedBarData({
      labels: ["Test1", "Test2"],
      legend: ["L1", "L2", "L3"],
      data: [
        [60, 60, 60],
        [30, 30, 60]
      ],
      barColors: ["#dfe4ea", "#ced6e0", "#a4b0be"]
    });

    expect(result.groups.map((group) => group.total)).toEqual([180, 120]);
    expect(result.groups[0]?.segments.map((segment) => segment.label)).toEqual([
      "L1",
      "L2",
      "L3"
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("normalizes the README-style PieChart shape", () => {
    const result = normalizeLegacyPieData(
      [
        {
          name: "Seoul",
          population: 21_500_000,
          color: "rgba(131, 167, 234, 1)",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        },
        {
          name: "Toronto",
          population: 2_800_000,
          color: "#F00"
        }
      ],
      { accessor: "population" }
    );

    expect(result.slices.map((slice) => slice.label)).toEqual([
      "Seoul",
      "Toronto"
    ]);
    expect(result.slices.map((slice) => slice.value)).toEqual([
      21_500_000, 2_800_000
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("normalizes the README-style ProgressChart shape", () => {
    const result = normalizeLegacyProgressData({
      labels: ["Swim", "Bike", "Run"],
      data: [0.4, 0.6, 0.8]
    });

    expect(result.rings.map((ring) => ring.label)).toEqual([
      "Swim",
      "Bike",
      "Run"
    ]);
    expect(result.rings.map((ring) => ring.value)).toEqual([0.4, 0.6, 0.8]);
    expect(result.warnings).toEqual([]);
  });

  it("normalizes the README-style ContributionGraph shape", () => {
    const result = normalizeLegacyContributionData(
      [
        { date: "2017-01-02", count: 1 },
        { date: "2017-01-03", count: 2 },
        { date: "2017-01-04", count: 3 }
      ],
      {
        endDate: new Date("2017-01-04"),
        numDays: 3
      }
    );

    expect(result.days.map((day) => day.value)).toEqual([1, 2, 3]);
    expect(result.warnings).toEqual([]);
  });
});
