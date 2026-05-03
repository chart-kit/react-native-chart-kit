import { describe, expect, it, vi } from "vitest";

import {
  getLineChartViewportPanDeltaPoints,
  getLineChartViewportPinchZoomFactor,
  resolveLineChartViewportInteractionConfig
} from "../src/charts/line/viewportInteractionConfig";

describe("LineChart viewport interaction helpers", () => {
  it("keeps main-plot viewport pan opt-in", () => {
    expect(resolveLineChartViewportInteractionConfig()).toMatchObject({
      pan: false,
      pinchZoom: false,
      minPanDistance: 6,
      minVisiblePoints: 6,
      lockParentScroll: true
    });
    expect(resolveLineChartViewportInteractionConfig(true)).toMatchObject({
      pan: true,
      pinchZoom: false,
      minPanDistance: 6,
      minVisiblePoints: 6,
      lockParentScroll: true
    });
  });

  it("resolves custom viewport pan options", () => {
    const onGestureStart = vi.fn();
    const onGestureEnd = vi.fn();

    expect(
      resolveLineChartViewportInteractionConfig({
        pan: false,
        pinchZoom: true,
        minPanDistance: 12,
        minVisiblePoints: 8,
        maxVisiblePoints: 42,
        pinchSensitivity: 0.7,
        lockParentScroll: false,
        onGestureEnd,
        onGestureStart
      })
    ).toEqual({
      pan: false,
      pinchZoom: true,
      minPanDistance: 12,
      minVisiblePoints: 8,
      maxVisiblePoints: 42,
      pinchSensitivity: 0.7,
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

  it("maps pinch scale to zoom factors with configurable sensitivity", () => {
    expect(
      getLineChartViewportPinchZoomFactor({ scale: 1.4, sensitivity: 1 })
    ).toBeCloseTo(1.4);
    expect(
      getLineChartViewportPinchZoomFactor({ scale: 1.4, sensitivity: 0.5 })
    ).toBeCloseTo(Math.sqrt(1.4));
    expect(
      getLineChartViewportPinchZoomFactor({ scale: 0.5, sensitivity: 1 })
    ).toBeCloseTo(0.5);
  });
});
