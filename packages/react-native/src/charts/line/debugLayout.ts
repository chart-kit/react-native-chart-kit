import {
  buildLayoutDebugModel,
  type BuildLayoutDebugModelOptions,
  type ChartBoxes,
  type LabelBox,
  type LayoutDebugModel,
  type LayoutDebugRect
} from "@chart-kit/core";

import type { LineChartYAxisLabelModel } from "./axisLabels";
import type { LineChartLegendRenderItem } from "./types";
import type { XLabelLayoutItem } from "./xLabels";

type TextMeasurer = (text: string) => { height: number; width: number };
type LineChartDebugTooltipRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type BuildLineChartDebugLayoutModelOptions = {
  boxes: ChartBoxes;
  legendItems?: LineChartLegendRenderItem[] | undefined;
  measureYLabel?: TextMeasurer | undefined;
  tooltip?: LineChartDebugTooltipRect | undefined;
  xLabels: XLabelLayoutItem[];
  yAxisLabelFontSize: number;
  yLabels: LineChartYAxisLabelModel[];
};

const getXLabelRect = (label: XLabelLayoutItem) => {
  const left =
    label.textAnchor === "start"
      ? label.x
      : label.textAnchor === "end"
        ? label.x - label.size.width
        : label.x - label.size.width / 2;

  return {
    id: `x-label-${label.index}`,
    text: label.text,
    x: left,
    y: label.y - label.size.height,
    width: label.size.width,
    height: label.size.height
  };
};

const getYLabelRect = ({
  label,
  measureYLabel,
  plotX
}: {
  label: LineChartYAxisLabelModel;
  measureYLabel: TextMeasurer;
  plotX: number;
}) => {
  const size = measureYLabel(label.text);

  return {
    id: `y-label-${label.key}`,
    text: label.text,
    x: plotX - 8 - size.width,
    y: label.y - size.height,
    width: size.width,
    height: size.height
  };
};

const defaultMeasureYLabel = (fontSize: number): TextMeasurer => {
  return (text) => ({
    height: fontSize + 2,
    width: text.length * fontSize * 0.58
  });
};

const getBaseDebugLayout = ({
  boxes,
  labels,
  tooltip
}: {
  boxes: ChartBoxes;
  labels: LabelBox[];
  tooltip?: LineChartDebugTooltipRect | undefined;
}) => {
  const options = {
    boxes,
    labels
  } satisfies BuildLayoutDebugModelOptions;

  return buildLayoutDebugModel(
    tooltip
      ? {
          ...options,
          tooltip: {
            placement: "top",
            rect: {
              x: tooltip.x,
              y: tooltip.y,
              width: tooltip.width,
              height: tooltip.height
            }
          }
        }
      : options
  );
};

export const buildLineChartDebugLayoutModel = ({
  boxes,
  legendItems,
  measureYLabel,
  tooltip,
  xLabels,
  yAxisLabelFontSize,
  yLabels
}: BuildLineChartDebugLayoutModelOptions): LayoutDebugModel => {
  const resolvedMeasureYLabel =
    measureYLabel ?? defaultMeasureYLabel(yAxisLabelFontSize);
  const labels = [
    ...xLabels.map(getXLabelRect),
    ...yLabels.map((label) =>
      getYLabelRect({
        label,
        measureYLabel: resolvedMeasureYLabel,
        plotX: boxes.plot.x
      })
    )
  ];
  const base = getBaseDebugLayout({ boxes, labels, tooltip });
  const legendRects: LayoutDebugRect[] =
    legendItems?.map((item) => ({
      id: `legend-${item.key}`,
      kind: "legend",
      text: item.label,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height
    })) ?? [];

  return {
    rects: [...base.rects, ...legendRects]
  };
};
