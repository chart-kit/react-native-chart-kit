import type { LineChartViewportInteractionConfig } from "./types";

export type ResolvedLineChartViewportInteractionConfig = {
  pan: boolean;
  pinchZoom: boolean;
  minPanDistance: number;
  minVisiblePoints: number;
  maxVisiblePoints: number | undefined;
  pinchSensitivity: number;
  lockParentScroll: boolean;
  onGestureEnd: LineChartViewportInteractionConfig["onGestureEnd"] | undefined;
  onGestureStart:
    | LineChartViewportInteractionConfig["onGestureStart"]
    | undefined;
};

const defaultMinPanDistance = 6;
const defaultMinVisiblePoints = 6;
const defaultPinchSensitivity = 1;

const normalizeFiniteNumber = (
  value: number | undefined,
  fallback: number,
  min: number
) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(min, value)
    : fallback;

const normalizePositiveInteger = (
  value: number | undefined,
  fallback: number,
  min: number
) => Math.floor(normalizeFiniteNumber(value, fallback, min));

export const resolveLineChartViewportInteractionConfig = (
  viewportInteraction?: boolean | LineChartViewportInteractionConfig
): ResolvedLineChartViewportInteractionConfig => {
  if (!viewportInteraction) {
    return {
      pan: false,
      pinchZoom: false,
      minPanDistance: defaultMinPanDistance,
      minVisiblePoints: defaultMinVisiblePoints,
      maxVisiblePoints: undefined,
      pinchSensitivity: defaultPinchSensitivity,
      lockParentScroll: true,
      onGestureEnd: undefined,
      onGestureStart: undefined
    };
  }

  if (viewportInteraction === true) {
    return {
      pan: true,
      pinchZoom: false,
      minPanDistance: defaultMinPanDistance,
      minVisiblePoints: defaultMinVisiblePoints,
      maxVisiblePoints: undefined,
      pinchSensitivity: defaultPinchSensitivity,
      lockParentScroll: true,
      onGestureEnd: undefined,
      onGestureStart: undefined
    };
  }

  return {
    pan: viewportInteraction.pan !== false,
    pinchZoom: viewportInteraction.pinchZoom === true,
    minPanDistance:
      typeof viewportInteraction.minPanDistance === "number" &&
      Number.isFinite(viewportInteraction.minPanDistance)
        ? Math.max(0, viewportInteraction.minPanDistance)
        : defaultMinPanDistance,
    minVisiblePoints: normalizePositiveInteger(
      viewportInteraction.minVisiblePoints,
      defaultMinVisiblePoints,
      2
    ),
    maxVisiblePoints:
      typeof viewportInteraction.maxVisiblePoints === "number" &&
      Number.isFinite(viewportInteraction.maxVisiblePoints)
        ? Math.max(2, Math.floor(viewportInteraction.maxVisiblePoints))
        : undefined,
    pinchSensitivity: normalizeFiniteNumber(
      viewportInteraction.pinchSensitivity,
      defaultPinchSensitivity,
      0.1
    ),
    lockParentScroll: viewportInteraction.lockParentScroll !== false,
    onGestureEnd: viewportInteraction.onGestureEnd,
    onGestureStart: viewportInteraction.onGestureStart
  };
};

export const getLineChartViewportPanDeltaPoints = ({
  currentLocationX,
  plotWidth,
  startLocationX,
  visibleCount
}: {
  currentLocationX: number;
  plotWidth: number;
  startLocationX: number;
  visibleCount: number;
}) => {
  const safePlotWidth =
    Number.isFinite(plotWidth) && plotWidth > 0 ? plotWidth : 1;
  const pointSpacing = safePlotWidth / Math.max(1, visibleCount - 1);

  return Math.round((startLocationX - currentLocationX) / pointSpacing);
};

export const getLineChartViewportPinchZoomFactor = ({
  scale,
  sensitivity
}: {
  scale: number;
  sensitivity: number;
}) => {
  const safeScale =
    typeof scale === "number" && Number.isFinite(scale)
      ? Math.max(0.05, scale)
      : 1;
  const safeSensitivity = normalizeFiniteNumber(
    sensitivity,
    defaultPinchSensitivity,
    0.1
  );

  return Math.pow(safeScale, safeSensitivity);
};
