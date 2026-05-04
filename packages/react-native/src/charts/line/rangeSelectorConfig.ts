import type { LineChartProps } from "./types";

export const getRangeSelectorConfig = (
  rangeSelector: LineChartProps<Record<string, unknown>>["rangeSelector"]
) => {
  const config = typeof rangeSelector === "object" ? rangeSelector : {};
  const visible =
    typeof rangeSelector === "boolean"
      ? rangeSelector
      : rangeSelector !== undefined && config.visible !== false;

  return {
    visible,
    height: config.height ?? 54,
    gap: config.gap ?? 10,
    interactive: config.interactive ?? false,
    minVisiblePoints: config.minVisiblePoints ?? 2,
    backgroundFill: config.backgroundFill,
    plotFill: config.plotFill,
    plotRadius: config.plotRadius ?? 6,
    lineMinStrokeWidth: config.lineMinStrokeWidth ?? 1.5,
    lineStrokeWidth: config.lineStrokeWidth,
    lineStrokeWidthScale: config.lineStrokeWidthScale ?? 0.62,
    series: config.series,
    outsideFill: config.outsideFill,
    outsideOpacity: config.outsideOpacity ?? 0,
    windowFill: config.windowFill,
    windowOpacity: config.windowOpacity ?? 0.1,
    windowRadius: config.windowRadius ?? 6,
    windowStroke: config.windowStroke,
    windowStrokeOpacity: config.windowStrokeOpacity ?? 0.42,
    windowStrokeWidth: config.windowStrokeWidth ?? 1,
    lineOpacity: config.lineOpacity ?? 0.62,
    handleColor: config.handleColor,
    handleHeight: config.handleHeight,
    handleHitSlop: config.handleHitSlop ?? 18,
    handleInset: config.handleInset ?? 6,
    handleOpacity: config.handleOpacity ?? 0.9,
    handleRadius: config.handleRadius,
    handleWidth: config.handleWidth ?? 3,
    renderHandle: config.renderHandle,
    renderLine: config.renderLine,
    renderWindow: config.renderWindow,
    onGestureEnd: config.onGestureEnd,
    onGestureStart: config.onGestureStart
  };
};

export type LineChartRangeSelectorResolvedConfig = ReturnType<
  typeof getRangeSelectorConfig
>;
