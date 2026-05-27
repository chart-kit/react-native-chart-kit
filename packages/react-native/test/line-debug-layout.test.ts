import { describe, expect, it } from "vitest";

import { buildLineChartDebugLayoutModel } from "../src/charts/line/debugLayout";

describe("LineChart debug layout helpers", () => {
  it("collects plot, label, legend, and tooltip rectangles", () => {
    const model = buildLineChartDebugLayoutModel({
      boxes: {
        outer: { x: 0, y: 0, width: 320, height: 220 },
        plot: { x: 48, y: 20, width: 250, height: 150 },
        padding: { top: 20, right: 22, bottom: 50, left: 48 }
      },
      legendItems: [
        {
          color: "#2563eb",
          contentHeight: 12,
          contentWidth: 64,
          contentX: 114,
          contentY: 188,
          fontSize: 12,
          height: 22,
          index: 0,
          key: "actual",
          label: "Actual",
          labelColor: "#475569",
          labelGap: 6,
          marker: "line",
          markerSize: 8,
          paddingHorizontal: 6,
          paddingVertical: 5,
          strokeLinecap: "round",
          strokeOpacity: 1,
          strokeWidth: 3,
          width: 76,
          x: 108,
          y: 183
        }
      ],
      tooltip: {
        height: 58,
        width: 126,
        x: 120,
        y: 48
      },
      xLabels: [
        {
          gridX: 80,
          index: 1,
          rotation: 0,
          row: 0,
          size: { width: 24, height: 12 },
          text: "Feb",
          textAnchor: "middle",
          value: "Feb",
          x: 80,
          y: 190
        }
      ],
      yAxisLabelFontSize: 12,
      yLabels: [{ key: "0:$0", opacity: 1, text: "$0", y: 170 }]
    });

    expect(model.rects.map((rect) => [rect.id, rect.kind])).toEqual([
      ["outer", "outer"],
      ["plot", "plot"],
      ["x-label-1", "label"],
      ["y-label-0:$0", "label"],
      ["tooltip", "tooltip"],
      ["legend-actual", "legend"]
    ]);
    expect(model.rects.find((rect) => rect.id === "x-label-1")).toMatchObject({
      height: 12,
      text: "Feb",
      width: 24,
      x: 68
    });
  });
});
