import type { ChartBoxes } from "@chart-kit/core";

type CandlestickCrosshairActivation = "longPress" | "press";

export type CandlestickCrosshairTouchPoint = {
  locationX: number;
  locationY: number;
};

export type CandlestickCrosshairIntersectionPoint = {
  x: number;
  y: number;
};

const intersectionHitRadius = 24;

export const isInCandlestickCrosshairPlot = ({
  locationX,
  locationY,
  plot,
  touchSlop = 12
}: CandlestickCrosshairTouchPoint & {
  plot: ChartBoxes["plot"];
  touchSlop?: number;
}) =>
  locationX >= plot.x - touchSlop &&
  locationX <= plot.x + plot.width + touchSlop &&
  locationY >= plot.y - touchSlop &&
  locationY <= plot.y + plot.height + touchSlop;

export const clampCandlestickCrosshairY = ({
  locationY,
  plot
}: {
  locationY: number;
  plot: ChartBoxes["plot"];
}) => Math.max(plot.y, Math.min(plot.y + plot.height, locationY));

export const isNearCandlestickCrosshairIntersection = ({
  intersection,
  locationX,
  locationY,
  radius = intersectionHitRadius
}: CandlestickCrosshairTouchPoint & {
  intersection: CandlestickCrosshairIntersectionPoint | undefined;
  radius?: number;
}) =>
  intersection !== undefined &&
  Math.hypot(locationX - intersection.x, locationY - intersection.y) <= radius;

export const shouldCaptureCandlestickCrosshairResponder = ({
  activation,
  crosshairActive,
  deselectOnOutsidePress,
  hasSelection,
  inspecting,
  intersection,
  locationX,
  locationY,
  plot
}: CandlestickCrosshairTouchPoint & {
  activation: CandlestickCrosshairActivation;
  crosshairActive: boolean;
  deselectOnOutsidePress: boolean;
  hasSelection: boolean;
  inspecting: boolean;
  intersection: CandlestickCrosshairIntersectionPoint | undefined;
  plot: ChartBoxes["plot"];
}) => {
  const insidePlot = isInCandlestickCrosshairPlot({
    locationX,
    locationY,
    plot
  });

  if (activation === "press") {
    return insidePlot || (deselectOnOutsidePress && hasSelection);
  }

  const isInspecting = crosshairActive || inspecting;

  if (!isInspecting) {
    return false;
  }

  if (!insidePlot) {
    return deselectOnOutsidePress;
  }

  return isNearCandlestickCrosshairIntersection({
    intersection,
    locationX,
    locationY
  });
};
