import { useEffect, useMemo } from "react";

import type { LayoutDebugModel } from "@chart-kit/core";

import { buildLineChartDebugLayoutModel } from "./debugLayout";
import { getFontFamilyProps, measureLineChartText } from "./text";
import type { LineChartLegendRenderItem } from "./types";
import type { LineChartYAxisLabelModel } from "./axisLabels";
import type { LineChartModel } from "./useChartModel";

export const useLineChartDebugLayout = <TData extends Record<string, unknown>>({
  enabled,
  model,
  onLayoutDebug,
  tooltip,
  yAxisLabels
}: {
  enabled: boolean;
  model: LineChartModel<TData>;
  onLayoutDebug?: ((model: LayoutDebugModel) => void) | undefined;
  tooltip?: { height: number; width: number; x: number; y: number } | undefined;
  yAxisLabels: LineChartYAxisLabelModel[];
}) => {
  const {
    boxes,
    legendModel,
    resolvedTheme,
    xLabelLayout
  }: {
    boxes: LineChartModel<TData>["boxes"];
    legendModel: LineChartModel<TData>["legendModel"];
    resolvedTheme: LineChartModel<TData>["resolvedTheme"];
    xLabelLayout: LineChartModel<TData>["xLabelLayout"];
  } = model;
  const debugLayoutModel = useMemo(
    () =>
      enabled
        ? buildLineChartDebugLayoutModel({
            boxes,
            legendItems: legendModel?.renderProps.items as
              | LineChartLegendRenderItem[]
              | undefined,
            measureYLabel: (text) =>
              measureLineChartText(text, {
                fontSize: resolvedTheme.typography.axisLabelSize,
                ...getFontFamilyProps(resolvedTheme.typography.fontFamily)
              }),
            tooltip,
            xLabels: xLabelLayout.items,
            yAxisLabelFontSize: resolvedTheme.typography.axisLabelSize,
            yLabels: yAxisLabels
          })
        : undefined,
    [
      boxes,
      enabled,
      legendModel,
      resolvedTheme.typography.axisLabelSize,
      resolvedTheme.typography.fontFamily,
      tooltip,
      xLabelLayout.items,
      yAxisLabels
    ]
  );

  useEffect(() => {
    if (debugLayoutModel) {
      onLayoutDebug?.(debugLayoutModel);
    }
  }, [debugLayoutModel, onLayoutDebug]);

  return debugLayoutModel;
};
