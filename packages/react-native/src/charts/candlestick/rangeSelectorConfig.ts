import type { CandlestickChartProps } from "./types";

export const getCandlestickChartRangeSelectorConfig = (
  rangeSelector: CandlestickChartProps<Record<string, unknown>>["rangeSelector"]
) => {
  const config = typeof rangeSelector === "object" ? rangeSelector : {};
  const visible =
    typeof rangeSelector === "boolean"
      ? rangeSelector
      : rangeSelector !== undefined && config.visible !== false;

  return {
    backgroundFill: config.backgroundFill,
    gap: config.gap ?? 10,
    handleColor: config.handleColor,
    handleHeight: config.handleHeight ?? 26,
    handleHitSlop: config.handleHitSlop ?? 24,
    handleOpacity: config.handleOpacity ?? 1,
    handleRadius: config.handleRadius ?? 5,
    handleWidth: config.handleWidth ?? 6,
    height: config.height ?? 60,
    interactive: config.interactive !== false,
    minVisiblePoints: Math.max(2, Math.floor(config.minVisiblePoints ?? 4)),
    outsideFill: config.outsideFill,
    outsideOpacity: config.outsideOpacity ?? 0.42,
    plotFill: config.plotFill,
    plotRadius: config.plotRadius ?? 8,
    visible,
    volumeOpacity: config.volumeOpacity ?? 0.16,
    windowFill: config.windowFill,
    windowOpacity: config.windowOpacity ?? 0.1,
    windowRadius: config.windowRadius ?? 8,
    windowStroke: config.windowStroke,
    windowStrokeOpacity: config.windowStrokeOpacity ?? 0.7,
    windowStrokeWidth: config.windowStrokeWidth ?? 1.4,
    onGestureEnd: config.onGestureEnd,
    onGestureStart: config.onGestureStart
  };
};

export type CandlestickChartRangeSelectorResolvedConfig = ReturnType<
  typeof getCandlestickChartRangeSelectorConfig
>;
