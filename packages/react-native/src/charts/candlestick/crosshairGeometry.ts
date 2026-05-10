import type { ChartBoxes } from "@chart-kit/core";

export type CandlestickCrosshairTouchPoint = {
  locationX: number;
  locationY: number;
};

export type CandlestickCrosshairIntersectionPoint = {
  x: number;
  y: number;
};

const intersectionHitRadius = 24;

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
