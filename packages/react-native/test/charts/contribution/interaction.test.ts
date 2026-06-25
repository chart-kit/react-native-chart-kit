import { describe, expect, it, vi } from "vitest";

import {
  buildContributionGraphDayPressEvent,
  getContributionGraphCellAtPoint,
  getContributionGraphInteractionConfig
} from "../../../src/charts/contribution/interaction";
import type { ContributionGraphCellModel } from "../../../src/charts/contribution/types";

const cells: Array<
  ContributionGraphCellModel<{ date: string; count: number }>
> = [
  {
    index: 0,
    date: new Date("2026-01-01T00:00:00.000Z"),
    value: 2,
    defined: true,
    outOfRange: false,
    weekIndex: 0,
    weekdayIndex: 0,
    x: 28,
    y: 18,
    size: 10,
    fill: "#2563eb",
    opacity: 1,
    raw: { date: "2026-01-01", count: 2 }
  },
  {
    index: 1,
    date: new Date("2026-01-02T00:00:00.000Z"),
    value: 6,
    defined: true,
    outOfRange: false,
    weekIndex: 1,
    weekdayIndex: 0,
    x: 41,
    y: 18,
    size: 10,
    fill: "#16a34a",
    opacity: 1,
    raw: { date: "2026-01-02", count: 6 }
  }
];

describe("ContributionGraph interaction helpers", () => {
  it("keeps tap selection as the default interaction mode", () => {
    expect(getContributionGraphInteractionConfig(undefined)).toEqual({
      mode: "tap",
      hitSlop: 3,
      pointerOffset: { x: 0, y: 0 },
      onSelect: undefined
    });
    expect(getContributionGraphInteractionConfig("none")).toMatchObject({
      mode: "none"
    });

    const onSelect = vi.fn();

    expect(
      getContributionGraphInteractionConfig({
        mode: "pressAndDrag",
        hitSlop: 5,
        pointerOffset: { x: -6, y: -4 },
        onSelect
      })
    ).toMatchObject({
      mode: "pressAndDrag",
      hitSlop: 5,
      pointerOffset: { x: -6, y: -4 },
      onSelect
    });
    expect(getContributionGraphInteractionConfig({ hitSlop: -1 }).hitSlop).toBe(
      3
    );
    expect(
      getContributionGraphInteractionConfig({
        pointerOffset: { x: Number.NaN, y: -4 }
      }).pointerOffset
    ).toEqual({ x: 0, y: -4 });
  });

  it("hit-tests cells with expanded touch slop and picks the nearest cell", () => {
    expect(
      getContributionGraphCellAtPoint({
        cells,
        hitSlop: 0,
        locationX: 30,
        locationY: 20
      })?.index
    ).toBe(0);
    expect(
      getContributionGraphCellAtPoint({
        cells,
        hitSlop: 3,
        locationX: 40,
        locationY: 23
      })?.index
    ).toBe(1);
    expect(
      getContributionGraphCellAtPoint({
        cells,
        hitSlop: 3,
        locationX: 4,
        locationY: 4
      })
    ).toBeUndefined();
  });

  it("builds public day selection events from cells", () => {
    expect(buildContributionGraphDayPressEvent(cells[0]!)).toMatchObject({
      index: 0,
      value: 2,
      raw: { date: "2026-01-01", count: 2 }
    });
  });
});
