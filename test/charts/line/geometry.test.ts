import { describe, expect, it } from "vitest";

import {
  getLegacyLineChartPointX,
  getLegacyLineChartXMax
} from "../../../src/charts/line/geometry";

describe("legacy LineChart x geometry", () => {
  it("preserves the v6 point positions from issue #771", () => {
    const data = [{ data: [10, 20, 15, 30, 25, 40] }];
    const xMax = getLegacyLineChartXMax(data);
    const positions = data[0].data.map((_, index) =>
      getLegacyLineChartPointX({
        index,
        width: 400,
        paddingRight: 10,
        xMax
      })
    );

    expect(xMax).toBe(6);
    expect(positions).toEqual([10, 75, 140, 205, 270, 335]);
  });

  it("uses the longest dataset while keeping empty and single-point data safe", () => {
    expect(getLegacyLineChartXMax([])).toBe(1);
    expect(getLegacyLineChartXMax([{ data: [] }])).toBe(1);
    expect(getLegacyLineChartXMax([{ data: [4] }])).toBe(1);
    expect(
      getLegacyLineChartXMax([
        { data: [1, 2] },
        { data: [1, 2, 3, 4] },
        { data: [1, 2, 3] }
      ])
    ).toBe(4);
  });

  it("guards point calculations against a zero divisor", () => {
    expect(
      getLegacyLineChartPointX({
        index: 1,
        width: 400,
        paddingRight: 10,
        xMax: 0
      })
    ).toBe(400);
  });
});
