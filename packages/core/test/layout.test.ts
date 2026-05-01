import { describe, expect, it } from "vitest";

import {
  buildLayoutDebugModel,
  calculateAutoPadding,
  layoutLegend,
  placeTooltip,
  solveChartBoxes,
  solveLabelCollision
} from "../src";
import type { LabelBox } from "../src";

const labelBoxes = (widths: number[], slot = 40): LabelBox[] => {
  return widths.map((width, index) => ({
    id: String(index),
    x: index * slot,
    y: 0,
    width,
    height: 12
  }));
};

describe("chart boxes", () => {
  it("solves outer and plot boxes from padding", () => {
    expect(
      solveChartBoxes(
        { width: 320, height: 200 },
        { top: 10, right: 20, bottom: 30, left: 40 }
      )
    ).toEqual({
      outer: { x: 0, y: 0, width: 320, height: 200 },
      plot: { x: 40, y: 10, width: 260, height: 160 },
      padding: { top: 10, right: 20, bottom: 30, left: 40 }
    });
  });

  it("clamps over-padded plot dimensions to zero", () => {
    expect(
      solveChartBoxes(
        { width: 100, height: 80 },
        { left: 70, right: 70, top: 50, bottom: 50 }
      ).plot
    ).toEqual({ x: 70, y: 50, width: 0, height: 0 });
  });
});

describe("auto padding", () => {
  it("adds label and legend reservations to base padding", () => {
    expect(
      calculateAutoPadding({
        base: { top: 4, right: 4, bottom: 4, left: 4 },
        leftLabels: [
          { width: 28, height: 12 },
          { width: 36, height: 12 }
        ],
        bottomLabels: [{ width: 40, height: 14 }],
        legend: { width: 120, height: 24, position: "top" },
        gap: 6
      })
    ).toEqual({
      top: 34,
      right: 4,
      bottom: 24,
      left: 46
    });
  });
});

describe("label collision", () => {
  it("shows all labels when boxes do not overlap", () => {
    expect(
      solveLabelCollision({
        labels: labelBoxes([20, 20, 20], 60),
        availableWidth: 180
      })
    ).toEqual({
      strategy: "show",
      visibleIndexes: [0, 1, 2],
      interval: 1,
      rotation: 0,
      rows: 1
    });
  });

  it("uses stagger when labels fit on two rows", () => {
    expect(
      solveLabelCollision({
        labels: labelBoxes([70, 70, 70], 40),
        availableWidth: 140,
        allowRotate: false
      }).strategy
    ).toBe("stagger");
  });

  it("uses rotation when stagger is disabled and rotated labels fit", () => {
    const result = solveLabelCollision({
      labels: labelBoxes([50, 50, 50], 36),
      availableWidth: 120,
      allowStagger: false,
      maxRotation: 60
    });

    expect(result.strategy).toBe("rotate");
    expect(result.visibleIndexes).toEqual([0, 1, 2]);
    expect(result.rotation).toBe(60);
  });

  it("skips labels when stagger and rotate cannot fit", () => {
    const result = solveLabelCollision({
      labels: labelBoxes([90, 90, 90, 90, 90], 30),
      availableWidth: 150,
      allowRotate: false,
      allowStagger: false
    });

    expect(result.strategy).toBe("skip");
    expect(result.visibleIndexes).toEqual([0, 4]);
    expect(result.interval).toBe(4);
  });
});

describe("legend layout", () => {
  it("wraps legend items within max width", () => {
    const result = layoutLegend({
      maxWidth: 130,
      padding: 4,
      items: [
        { id: "a", label: "Alpha", labelWidth: 40, labelHeight: 12 },
        { id: "b", label: "Beta", labelWidth: 38, labelHeight: 12 },
        { id: "c", label: "Gamma", labelWidth: 44, labelHeight: 12 }
      ]
    });

    expect(result.width).toBe(126);
    expect(result.height).toBe(40);
    expect(
      result.items.map((item) => ({ id: item.id, x: item.x, y: item.y }))
    ).toEqual([
      { id: "a", x: 4, y: 4 },
      { id: "b", x: 70, y: 4 },
      { id: "c", x: 4, y: 24 }
    ]);
  });

  it("reserves custom item padding around legend content", () => {
    const result = layoutLegend({
      maxWidth: 200,
      itemGap: 8,
      itemPaddingHorizontal: 8,
      itemPaddingVertical: 4,
      labelGap: 6,
      items: [
        { id: "a", label: "Alpha", labelWidth: 40, labelHeight: 12 },
        { id: "b", label: "Beta", labelWidth: 38, labelHeight: 12 }
      ]
    });

    expect(result.items[0]).toMatchObject({
      id: "a",
      x: 0,
      y: 0,
      width: 72,
      height: 20,
      contentX: 8,
      contentY: 4,
      contentWidth: 56,
      contentHeight: 12
    });
    expect(result.items[1]).toMatchObject({
      id: "b",
      x: 80,
      y: 0
    });
  });
});

describe("tooltip placement", () => {
  it("places tooltip above when there is room", () => {
    expect(
      placeTooltip({
        anchor: { x: 100, y: 100 },
        tooltip: { width: 80, height: 30 },
        bounds: { x: 0, y: 0, width: 200, height: 200 }
      })
    ).toEqual({
      placement: "top",
      rect: { x: 60, y: 62, width: 80, height: 30 }
    });
  });

  it("flips below when top placement would overflow", () => {
    expect(
      placeTooltip({
        anchor: { x: 100, y: 20 },
        tooltip: { width: 80, height: 30 },
        bounds: { x: 0, y: 0, width: 200, height: 200 }
      })
    ).toEqual({
      placement: "bottom",
      rect: { x: 60, y: 28, width: 80, height: 30 }
    });
  });

  it("shifts tooltip inside horizontal bounds", () => {
    expect(
      placeTooltip({
        anchor: { x: 10, y: 100 },
        tooltip: { width: 80, height: 30 },
        bounds: { x: 0, y: 0, width: 200, height: 200 }
      }).rect
    ).toEqual({ x: 0, y: 62, width: 80, height: 30 });
  });

  it("keeps oversized tooltips anchored inside the bounds", () => {
    expect(
      placeTooltip({
        anchor: { x: 20, y: 80 },
        tooltip: { width: 240, height: 30 },
        bounds: { x: 0, y: 0, width: 200, height: 200 }
      }).rect
    ).toEqual({ x: 0, y: 42, width: 240, height: 30 });
  });
});

describe("layout debug model", () => {
  it("collects chart, label, legend, and tooltip rectangles", () => {
    const boxes = solveChartBoxes(
      { width: 120, height: 80 },
      { top: 10, right: 10, bottom: 20, left: 30 }
    );
    const legend = layoutLegend({
      maxWidth: 120,
      items: [
        { id: "series", label: "Series", labelWidth: 40, labelHeight: 12 }
      ]
    });
    const tooltip = placeTooltip({
      anchor: { x: 80, y: 50 },
      tooltip: { width: 40, height: 20 },
      bounds: boxes.outer
    });

    expect(
      buildLayoutDebugModel({
        boxes,
        labels: [
          { id: "x-0", x: 30, y: 60, width: 20, height: 12, text: "Jan" }
        ],
        legend,
        tooltip
      }).rects.map((rect) => ({ id: rect.id, kind: rect.kind }))
    ).toEqual([
      { id: "outer", kind: "outer" },
      { id: "plot", kind: "plot" },
      { id: "x-0", kind: "label" },
      { id: "series", kind: "legend" },
      { id: "tooltip", kind: "tooltip" }
    ]);
  });
});
