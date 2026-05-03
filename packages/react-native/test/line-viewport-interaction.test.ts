import { describe, expect, it, vi } from "vitest";

import {
  getLineChartViewportPanDeltaPoints,
  resolveLineChartViewportInteractionConfig
} from "../src/charts/line/viewportInteractionConfig";

describe("LineChart viewport interaction helpers", () => {
  it("keeps main-plot viewport pan opt-in", () => {
    expect(resolveLineChartViewportInteractionConfig()).toMatchObject({
      pan: false,
      minPanDistance: 6,
      lockParentScroll: true
    });
    expect(resolveLineChartViewportInteractionConfig(true)).toMatchObject({
      pan: true,
      minPanDistance: 6,
      lockParentScroll: true
    });
  });

  it("resolves custom viewport pan options", () => {
    const onGestureStart = vi.fn();
    const onGestureEnd = vi.fn();

    expect(
      resolveLineChartViewportInteractionConfig({
        pan: false,
        minPanDistance: 12,
        lockParentScroll: false,
        onGestureEnd,
        onGestureStart
      })
    ).toEqual({
      pan: false,
      minPanDistance: 12,
      lockParentScroll: false,
      onGestureEnd,
      onGestureStart
    });
  });

  it("maps main-plot drag distance to viewport point deltas", () => {
    expect(
      getLineChartViewportPanDeltaPoints({
        currentLocationX: 120,
        plotWidth: 300,
        startLocationX: 220,
        visibleCount: 16
      })
    ).toBe(5);
    expect(
      getLineChartViewportPanDeltaPoints({
        currentLocationX: 240,
        plotWidth: 300,
        startLocationX: 220,
        visibleCount: 16
      })
    ).toBe(-1);
  });
});
