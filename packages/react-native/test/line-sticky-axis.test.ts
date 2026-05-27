import { describe, expect, it } from "vitest";

import {
  getStickyYAxisBackgroundHeight,
  getStickyYAxisFadeOpacity
} from "../src/charts/line/stickyYAxisLayout";

describe("LineChart sticky Y axis", () => {
  it("keeps the sticky background clear of the x-axis label row", () => {
    expect(
      getStickyYAxisBackgroundHeight({
        fadeY: 184,
        mainHeight: 240
      })
    ).toBe(188);
  });

  it("only fades scrollable x-axis labels after the chart is scrolled", () => {
    expect(getStickyYAxisFadeOpacity(0)).toBe(0);
    expect(getStickyYAxisFadeOpacity(0.5)).toBe(0);
    expect(getStickyYAxisFadeOpacity(1)).toBe(1);
  });
});
