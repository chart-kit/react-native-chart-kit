import { describe, expect, it } from "vitest";

import {
  resolveChartViewport,
  resolveChartViewportInitialOffset
} from "../src";

describe("chart viewport", () => {
  it("keeps content at viewport width when scrolling is disabled", () => {
    expect(
      resolveChartViewport({
        itemCount: 40,
        scrollable: false,
        viewportWidth: 320,
        visiblePoints: 10
      })
    ).toMatchObject({
      contentWidth: 320,
      maxOffset: 0,
      scrollable: false,
      visiblePoints: 10
    });
  });

  it("expands content width from visible point count", () => {
    const viewport = resolveChartViewport({
      itemCount: 22,
      scrollable: true,
      viewportWidth: 420,
      visiblePoints: 8
    });

    expect(viewport.scrollable).toBe(true);
    expect(viewport.visiblePoints).toBe(8);
    expect(viewport.pointSpacing).toBe(60);
    expect(viewport.contentWidth).toBe(1260);
    expect(viewport.maxOffset).toBe(840);
  });

  it("does not scroll when there are fewer points than requested", () => {
    expect(
      resolveChartViewport({
        itemCount: 6,
        scrollable: true,
        viewportWidth: 360,
        visiblePoints: 12
      })
    ).toMatchObject({
      contentWidth: 360,
      maxOffset: 0,
      scrollable: false,
      visiblePoints: 6
    });
  });

  it("handles empty datasets without inventing a point", () => {
    expect(
      resolveChartViewport({
        itemCount: 0,
        scrollable: true,
        viewportWidth: 360,
        visiblePoints: 8
      })
    ).toMatchObject({
      contentWidth: 360,
      itemCount: 0,
      maxOffset: 0,
      scrollable: false,
      visiblePoints: 2
    });
  });

  it("resolves initial offsets for start, end, and explicit indexes", () => {
    const viewport = resolveChartViewport({
      itemCount: 22,
      scrollable: true,
      viewportWidth: 420,
      visiblePoints: 8
    });

    expect(resolveChartViewportInitialOffset({ viewport })).toBe(0);
    expect(
      resolveChartViewportInitialOffset({ initialIndex: "end", viewport })
    ).toBe(840);
    expect(
      resolveChartViewportInitialOffset({ initialIndex: 4, viewport })
    ).toBe(240);
    expect(
      resolveChartViewportInitialOffset({ initialIndex: 99, viewport })
    ).toBe(840);
  });
});
