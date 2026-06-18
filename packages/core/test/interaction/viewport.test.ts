import { describe, expect, it } from "vitest";

import {
  resolveChartViewport,
  resolveChartViewportIndexFromPosition,
  resolveChartViewportInitialOffset,
  resolveChartViewportPresetWindow,
  resolveChartViewportWindow,
  resolveChartViewportWindowFromPanDelta,
  resolveChartViewportWindowFromHandlePosition,
  resolveChartViewportWindowFromPosition,
  resolveChartViewportWindowFromZoom,
  sliceChartViewportData
} from "../../src";

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

  it("resolves date-based preset windows from x values", () => {
    const xValues = [
      new Date(2025, 10, 3),
      new Date(2025, 10, 20),
      new Date(2025, 11, 20),
      new Date(2026, 0, 4),
      new Date(2026, 0, 14)
    ];

    expect(
      resolveChartViewportPresetWindow({
        preset: "1M",
        xValues
      })
    ).toMatchObject({
      startIndex: 2,
      endIndex: 5,
      visibleCount: 3
    });
    expect(
      resolveChartViewportPresetWindow({
        preset: "YTD",
        xValues
      })
    ).toMatchObject({
      startIndex: 3,
      endIndex: 5,
      visibleCount: 2
    });
    expect(
      resolveChartViewportPresetWindow({
        preset: "ALL",
        xValues
      })
    ).toMatchObject({
      isWindowed: false,
      startIndex: 0,
      endIndex: 5
    });
  });

  it("falls back to point counts for non-date preset windows", () => {
    expect(
      resolveChartViewportPresetWindow({
        preset: "1W",
        xValues: Array.from({ length: 20 }, (_, index) => `W${index + 1}`)
      })
    ).toMatchObject({
      startIndex: 13,
      endIndex: 20,
      visibleCount: 7
    });
  });

  it("resolves a fixed-width window from an overview position", () => {
    expect(
      resolveChartViewportWindowFromPosition({
        itemCount: 20,
        locationX: 60,
        plotX: 40,
        plotWidth: 200,
        visibleCount: 6
      })
    ).toMatchObject({
      startIndex: 0,
      endIndex: 6
    });
    expect(
      resolveChartViewportWindowFromPosition({
        itemCount: 20,
        locationX: 140,
        plotX: 40,
        plotWidth: 200,
        visibleCount: 6
      })
    ).toMatchObject({
      startIndex: 7,
      endIndex: 13
    });
    expect(
      resolveChartViewportWindowFromPosition({
        itemCount: 20,
        locationX: 260,
        plotX: 40,
        plotWidth: 200,
        visibleCount: 6
      })
    ).toMatchObject({
      startIndex: 14,
      endIndex: 20
    });
  });

  it("resolves an index from an overview position", () => {
    expect(
      resolveChartViewportIndexFromPosition({
        itemCount: 20,
        locationX: 40,
        plotX: 40,
        plotWidth: 200
      })
    ).toBe(0);
    expect(
      resolveChartViewportIndexFromPosition({
        itemCount: 20,
        locationX: 140,
        plotX: 40,
        plotWidth: 200
      })
    ).toBe(10);
    expect(
      resolveChartViewportIndexFromPosition({
        itemCount: 20,
        locationX: 260,
        plotX: 40,
        plotWidth: 200
      })
    ).toBe(19);
  });

  it("resizes a viewport window from handle positions", () => {
    const currentWindow = resolveChartViewportWindow({
      itemCount: 20,
      startIndex: 8,
      endIndex: 16
    });

    expect(
      resolveChartViewportWindowFromHandlePosition({
        currentWindow,
        handle: "start",
        itemCount: 20,
        locationX: 60,
        plotX: 40,
        plotWidth: 200
      })
    ).toMatchObject({
      startIndex: 2,
      endIndex: 16
    });
    expect(
      resolveChartViewportWindowFromHandlePosition({
        currentWindow,
        handle: "end",
        itemCount: 20,
        locationX: 250,
        plotX: 40,
        plotWidth: 200
      })
    ).toMatchObject({
      startIndex: 8,
      endIndex: 20
    });
    expect(
      resolveChartViewportWindowFromHandlePosition({
        currentWindow,
        handle: "start",
        itemCount: 20,
        locationX: 190,
        minVisibleCount: 4,
        plotX: 40,
        plotWidth: 200
      })
    ).toMatchObject({
      startIndex: 12,
      endIndex: 16,
      visibleCount: 4
    });
  });

  it("zooms viewport windows around the current center by default", () => {
    const currentWindow = resolveChartViewportWindow({
      itemCount: 40,
      startIndex: 10,
      endIndex: 22
    });

    expect(
      resolveChartViewportWindowFromZoom({
        currentWindow,
        itemCount: 40,
        zoomFactor: 2
      })
    ).toMatchObject({
      startIndex: 13,
      endIndex: 19,
      visibleCount: 6
    });

    expect(
      resolveChartViewportWindowFromZoom({
        currentWindow,
        itemCount: 40,
        zoomFactor: 0.5
      })
    ).toMatchObject({
      startIndex: 4,
      endIndex: 28,
      visibleCount: 24
    });
  });

  it("zooms viewport windows around an explicit anchor", () => {
    const currentWindow = resolveChartViewportWindow({
      itemCount: 40,
      startIndex: 10,
      endIndex: 22
    });

    expect(
      resolveChartViewportWindowFromZoom({
        anchorIndex: 10,
        currentWindow,
        itemCount: 40,
        zoomFactor: 2
      })
    ).toMatchObject({
      startIndex: 10,
      endIndex: 16,
      visibleCount: 6
    });

    expect(
      resolveChartViewportWindowFromZoom({
        anchorIndex: 21,
        currentWindow,
        itemCount: 40,
        maxVisibleCount: 18,
        minVisibleCount: 4,
        zoomFactor: 0.25
      })
    ).toMatchObject({
      startIndex: 4,
      endIndex: 22,
      visibleCount: 18
    });
  });

  it("pans viewport windows by point deltas and clamps to data edges", () => {
    const currentWindow = resolveChartViewportWindow({
      itemCount: 30,
      startIndex: 8,
      endIndex: 18
    });

    expect(
      resolveChartViewportWindowFromPanDelta({
        currentWindow,
        deltaPoints: 4,
        itemCount: 30
      })
    ).toMatchObject({
      startIndex: 12,
      endIndex: 22,
      visibleCount: 10
    });

    expect(
      resolveChartViewportWindowFromPanDelta({
        currentWindow,
        deltaPoints: -99,
        itemCount: 30
      })
    ).toMatchObject({
      startIndex: 0,
      endIndex: 10
    });

    expect(
      resolveChartViewportWindowFromPanDelta({
        currentWindow,
        deltaPoints: 99,
        itemCount: 30
      })
    ).toMatchObject({
      startIndex: 20,
      endIndex: 30
    });
  });
});
