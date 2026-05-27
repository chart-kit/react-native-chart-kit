import { describe, expect, it } from "vitest";

import {
  buildContributionHeatmap,
  normalizeLegacyContributionData
} from "../src";

describe("contribution heatmap geometry", () => {
  it("maps dates into stable week and weekday cells", () => {
    const normalized = normalizeLegacyContributionData(
      [
        { date: "2024-01-01", count: 2 },
        { date: "2024-01-02", count: 4 },
        { date: "2024-01-07", count: 6 }
      ],
      {
        endDate: "2024-01-07",
        numDays: 7
      }
    );
    const model = buildContributionHeatmap({
      data: normalized,
      cellSize: 10,
      gutterSize: 2
    });

    expect(model.weekCount).toBe(2);
    expect(model.cells).toHaveLength(7);
    expect(model.cells[0]).toMatchObject({
      index: 0,
      value: 2,
      weekIndex: 0,
      weekdayIndex: 1,
      x: 28,
      y: 30
    });
    expect(model.cells[6]).toMatchObject({
      index: 6,
      value: 6,
      weekIndex: 1,
      weekdayIndex: 0
    });
  });

  it("supports Monday week starts", () => {
    const normalized = normalizeLegacyContributionData(
      [{ date: "2024-01-01", count: 2 }],
      {
        endDate: "2024-01-01",
        numDays: 1
      }
    );
    const model = buildContributionHeatmap({
      data: normalized,
      cellSize: 10,
      gutterSize: 2,
      weekStartsOn: 1
    });

    expect(model.weekCount).toBe(1);
    expect(model.cells[0]).toMatchObject({
      weekIndex: 0,
      weekdayIndex: 0,
      x: 28,
      y: 18
    });
  });

  it("keeps leap-day cells deterministic", () => {
    const normalized = normalizeLegacyContributionData(
      [{ date: "2024-02-29", count: 9 }],
      {
        endDate: "2024-03-01",
        numDays: 2
      }
    );
    const model = buildContributionHeatmap({
      data: normalized,
      cellSize: 12,
      gutterSize: 3
    });
    const leapCell = model.cells.find(
      (cell) => cell.date.toISOString().slice(0, 10) === "2024-02-29"
    );

    expect(leapCell).toMatchObject({
      index: 0,
      value: 9,
      weekdayIndex: 4
    });
  });
});
