import { describe, expect, it } from "vitest";

import { buildContributionGraphModel } from "../src/charts/contribution/model";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

describe("ContributionGraph model", () => {
  it("builds themed heatmap cells from legacy contribution values", () => {
    const model = buildContributionGraphModel({
      chartKitTheme,
      props: {
        values: [
          { date: "2026-04-01", count: 4 },
          { date: "2026-04-02", count: 8 }
        ],
        endDate: "2026-04-07",
        numDays: 7,
        width: 320,
        height: 150,
        preset: "spectrum"
      }
    });

    expect(model.cells).toHaveLength(7);
    expect(model.cells.find((cell) => cell.value === 8)).toMatchObject({
      fill: "#2563eb",
      opacity: 1
    });
    expect(model.monthLabels[0]).toMatchObject({
      monthIndex: 3,
      x: 28
    });
  });

  it("inherits heatmap colors from the app-level chart preset", () => {
    const model = buildContributionGraphModel({
      chartKitTheme: {
        ...chartKitTheme,
        preset: "graphite"
      },
      props: {
        values: [
          { date: "2026-04-01", count: 4 },
          { date: "2026-04-02", count: 8 }
        ],
        endDate: "2026-04-07",
        numDays: 7,
        width: 320,
        height: 150
      }
    });

    expect(model.cells.find((cell) => cell.value === 8)).toMatchObject({
      fill: "#111827",
      opacity: 1
    });
    expect(model.cells.find((cell) => cell.value === 0)?.fill).toBe("#eceff3");
  });

  it("supports custom color scales and Monday week starts", () => {
    const model = buildContributionGraphModel({
      chartKitTheme,
      props: {
        values: [{ date: "2026-05-04", count: 10 }],
        endDate: "2026-05-04",
        numDays: 1,
        weekStartsOn: 1,
        colors: ["#dcfce7", "#16a34a"],
        width: 320,
        height: 150
      }
    });

    expect(model.cells[0]).toMatchObject({
      fill: "#16a34a",
      opacity: 1,
      weekdayIndex: 0
    });
  });

  it("renders empty contribution ranges as deterministic zero cells", () => {
    const model = buildContributionGraphModel({
      chartKitTheme,
      props: {
        values: [],
        endDate: "2026-05-04",
        numDays: 14,
        weekStartsOn: 1,
        width: 320,
        height: 150
      }
    });

    expect(model.cells).toHaveLength(14);
    expect(model.valueMax).toBe(0);
    expect(model.cells.every((cell) => cell.value === 0)).toBe(true);
    expect(
      model.cells.every((cell) => cell.fill === model.resolvedTheme.grid)
    ).toBe(true);
    expect(
      model.cells.every((cell) => Math.abs(cell.opacity - 0.22) < 0.0001)
    ).toBe(true);
    expect(model.cells[0]).toMatchObject({
      defined: true,
      weekdayIndex: 1
    });
  });
});
