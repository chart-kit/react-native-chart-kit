import { describe, expect, it } from "vitest";

import {
  resolveBarChartViewport,
  resolveBarChartViewportInitialOffset
} from "../src/charts/bar/viewport";

describe("BarChart viewport helpers", () => {
  it("keeps content at viewport width when scrolling is disabled", () => {
    expect(
      resolveBarChartViewport({
        itemCount: 24,
        viewportWidth: 360,
        visiblePoints: 8
      })
    ).toMatchObject({
      contentWidth: 360,
      maxOffset: 0,
      scrollable: false,
      visiblePoints: 8
    });
  });

  it("expands content so visiblePoints maps to visible bar bands", () => {
    const viewport = resolveBarChartViewport({
      itemCount: 24,
      scrollable: true,
      viewportWidth: 360,
      visiblePoints: 8
    });

    expect(viewport.scrollable).toBe(true);
    expect(viewport.contentWidth).toBe(1080);
    expect(viewport.maxOffset).toBe(720);
  });

  it("resolves initial offsets from start, end, and indexes", () => {
    const viewport = resolveBarChartViewport({
      itemCount: 12,
      scrollable: true,
      viewportWidth: 360,
      visiblePoints: 6
    });

    expect(resolveBarChartViewportInitialOffset({ viewport })).toBe(0);
    expect(
      resolveBarChartViewportInitialOffset({ initialIndex: "end", viewport })
    ).toBe(360);
    expect(
      resolveBarChartViewportInitialOffset({ initialIndex: 3, viewport })
    ).toBe(180);
  });
});
