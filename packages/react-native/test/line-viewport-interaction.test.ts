import { describe, expect, it, vi } from "vitest";

import {
  getChartViewportPanOffsetX,
  getLineChartViewportPanDeltaPoints,
  getLineChartViewportPinchZoomFactor,
  resolveLineChartViewportInteractionConfig
} from "../src/charts/line/viewportInteractionConfig";
import { getRangeSelectorConfig } from "../src/charts/line/rangeSelectorConfig";

describe("LineChart viewport interaction helpers", () => {
  it("preserves range selector custom render hooks", () => {
    const renderHandle = vi.fn();
    const renderLine = vi.fn();
    const renderWindow = vi.fn();

    expect(
      getRangeSelectorConfig({
        renderHandle,
        renderLine,
        renderWindow,
        visible: true
      })
    ).toMatchObject({
      renderHandle,
      renderLine,
      renderWindow,
      visible: true
    });
  });

  it("keeps main-plot viewport pan opt-in", () => {
    expect(resolveLineChartViewportInteractionConfig()).toMatchObject({
      pan: false,
      pinchZoom: false,
      minPanDistance: 6,
      minVisiblePoints: 6,
      lockParentScroll: true,
      smoothPan: false
    });
    expect(resolveLineChartViewportInteractionConfig(true)).toMatchObject({
      pan: true,
      pinchZoom: false,
      minPanDistance: 6,
      minVisiblePoints: 6,
      lockParentScroll: true,
      smoothPan: false
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
        smoothPan: true,
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
      smoothPan: true,
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

  it("maps smooth pan residuals to pixel offsets", () => {
    expect(
      getChartViewportPanOffsetX({
        deltaPoints: 1.25,
        plotWidth: 300,
        visibleCount: 16,
        wholeDeltaPoints: 1
      })
    ).toBeCloseTo(-5);
    expect(
      getChartViewportPanOffsetX({
        deltaPoints: -1.5,
        plotWidth: 300,
        visibleCount: 16,
        wholeDeltaPoints: -1
      })
    ).toBeCloseTo(10);
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
