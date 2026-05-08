import type {
  ChartViewportInteractionConfig,
  ResolvedChartViewportInteractionConfig
} from "./types";

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

const getChartViewportPointSpacing = ({
  plotWidth,
  visibleCount
}: {
  plotWidth: number;
  visibleCount: number;
}) => {
  const safePlotWidth =
    Number.isFinite(plotWidth) && plotWidth > 0 ? plotWidth : 1;

  return safePlotWidth / Math.max(1, visibleCount - 1);
};

export const resolveChartViewportInteractionConfig = (
  viewportInteraction?: boolean | ChartViewportInteractionConfig
): ResolvedChartViewportInteractionConfig => {
  if (!viewportInteraction) {
    return {
      lockParentScroll: true,
      maxVisiblePoints: undefined,
      minPanDistance: defaultMinPanDistance,
      minVisiblePoints: defaultMinVisiblePoints,
      onGestureEnd: undefined,
      onGestureStart: undefined,
      pan: false,
      pinchSensitivity: defaultPinchSensitivity,
      pinchZoom: false
    };
  }

  if (viewportInteraction === true) {
    return {
      lockParentScroll: true,
      maxVisiblePoints: undefined,
      minPanDistance: defaultMinPanDistance,
      minVisiblePoints: defaultMinVisiblePoints,
      onGestureEnd: undefined,
      onGestureStart: undefined,
      pan: true,
      pinchSensitivity: defaultPinchSensitivity,
      pinchZoom: false
    };
  }

  return {
    lockParentScroll: viewportInteraction.lockParentScroll !== false,
    maxVisiblePoints:
      typeof viewportInteraction.maxVisiblePoints === "number" &&
      Number.isFinite(viewportInteraction.maxVisiblePoints)
        ? Math.max(2, Math.floor(viewportInteraction.maxVisiblePoints))
        : undefined,
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
    onGestureEnd: viewportInteraction.onGestureEnd,
    onGestureStart: viewportInteraction.onGestureStart,
    pan: viewportInteraction.pan !== false,
    pinchSensitivity: normalizeFiniteNumber(
      viewportInteraction.pinchSensitivity,
      defaultPinchSensitivity,
      0.1
    ),
    pinchZoom: viewportInteraction.pinchZoom === true
  };
};

export const getChartViewportEffectiveMinPanDistance = ({
  minPanDistance,
  plotWidth,
  visibleCount
}: {
  minPanDistance: number;
  plotWidth: number;
  visibleCount: number;
}) => {
  const pointSpacing = getChartViewportPointSpacing({
    plotWidth,
    visibleCount
  });

  return Math.min(minPanDistance, Math.max(1, pointSpacing / 2));
};

export const getChartViewportPanDeltaPoints = ({
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
  const pointSpacing = getChartViewportPointSpacing({
    plotWidth,
    visibleCount
  });

  return Math.round((startLocationX - currentLocationX) / pointSpacing);
};

export const getChartViewportPinchZoomFactor = ({
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
