import { describe, expect, it } from "vitest";

import { isChartViewportEventInBounds } from "../../src/viewport/bounds";
import {
  getChartViewportPanDeltaPoints,
  getChartViewportPinchZoomFactor,
  resolveChartViewportInteractionConfig
} from "../../src/viewport/config";

const eventAt = (locationX: number, locationY: number) =>
  ({ nativeEvent: { locationX, locationY } }) as never;

describe("React Native chart viewport helpers", () => {
  it("checks responder events against plot bounds inclusively", () => {
    const bounds = { height: 80, width: 120, x: 10, y: 20 };

    expect(
      isChartViewportEventInBounds({ bounds, event: eventAt(10, 20) })
    ).toBe(true);
    expect(
      isChartViewportEventInBounds({ bounds, event: eventAt(130, 100) })
    ).toBe(true);
    expect(
      isChartViewportEventInBounds({ bounds, event: eventAt(9, 40) })
    ).toBe(false);
    expect(
      isChartViewportEventInBounds({ bounds, event: eventAt(40, 101) })
    ).toBe(false);
  });

  it("normalizes disabled, enabled, and custom interaction config", () => {
    expect(resolveChartViewportInteractionConfig()).toMatchObject({
      lockParentScroll: true,
      minPanDistance: 6,
      minVisiblePoints: 6,
      pan: false,
      pinchSensitivity: 1,
      pinchZoom: false
    });
    expect(resolveChartViewportInteractionConfig(true)).toMatchObject({
      pan: true,
      pinchZoom: false
    });
    expect(
      resolveChartViewportInteractionConfig({
        lockParentScroll: false,
        maxVisiblePoints: 1,
        minPanDistance: -4,
        minVisiblePoints: 1,
        pan: false,
        pinchSensitivity: 0,
        pinchZoom: true
      })
    ).toMatchObject({
      lockParentScroll: false,
      maxVisiblePoints: 2,
      minPanDistance: 0,
      minVisiblePoints: 2,
      pan: false,
      pinchSensitivity: 0.1,
      pinchZoom: true
    });
  });

  it("maps pan distance and pinch scale to viewport changes", () => {
    expect(
      getChartViewportPanDeltaPoints({
        currentLocationX: 120,
        plotWidth: 300,
        startLocationX: 220,
        visibleCount: 16
      })
    ).toBe(5);
    expect(
      getChartViewportPanDeltaPoints({
        currentLocationX: 230,
        plotWidth: 0,
        startLocationX: 220,
        visibleCount: 1
      })
    ).toBe(-10);
    expect(
      getChartViewportPinchZoomFactor({ scale: 1.44, sensitivity: 0.5 })
    ).toBeCloseTo(1.2);
    expect(
      getChartViewportPinchZoomFactor({ scale: Number.NaN, sensitivity: 0 })
    ).toBe(1);
  });
});
