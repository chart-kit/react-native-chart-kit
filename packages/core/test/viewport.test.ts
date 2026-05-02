import { describe, expect, it } from "vitest";

import {
  resolveChartViewport,
  resolveChartViewportInitialOffset,
  resolveChartViewportWindow,
  sliceChartViewportData
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

  it("resolves visible windows from visible point count", () => {
    expect(
      resolveChartViewportWindow({
        itemCount: 52,
        visiblePoints: 12,
        initialIndex: "end"
      })
    ).toEqual({
      endIndex: 52,
      isWindowed: true,
      itemCount: 52,
      startIndex: 40,
      visibleCount: 12
    });
    expect(
      resolveChartViewportWindow({
        itemCount: 52,
        visiblePoints: 12,
        initialIndex: 8
      })
    ).toMatchObject({
      endIndex: 20,
      startIndex: 8,
      visibleCount: 12
    });
  });

  it("resolves explicit visible windows with clamped indexes", () => {
    expect(
      resolveChartViewportWindow({
        itemCount: 20,
        startIndex: 16,
        endIndex: 50
      })
    ).toEqual({
      endIndex: 20,
      isWindowed: true,
      itemCount: 20,
      startIndex: 16,
      visibleCount: 4
    });
  });

  it("does not window when visible points cover all data", () => {
    expect(
      resolveChartViewportWindow({
        itemCount: 8,
        visiblePoints: 20
      })
    ).toEqual({
      endIndex: 8,
      isWindowed: false,
      itemCount: 8,
      startIndex: 0,
      visibleCount: 8
    });
  });

  it("slices data with a resolved visible window", () => {
    const window = resolveChartViewportWindow({
      itemCount: 5,
      startIndex: 1,
      endIndex: 4
    });

    expect(sliceChartViewportData(["a", "b", "c", "d", "e"], window)).toEqual([
      "b",
      "c",
      "d"
    ]);
  });
});
