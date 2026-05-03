import type { LineChartViewportInteractionConfig } from "./types";

export type ResolvedLineChartViewportInteractionConfig = {
  pan: boolean;
  minPanDistance: number;
  lockParentScroll: boolean;
  onGestureEnd: LineChartViewportInteractionConfig["onGestureEnd"] | undefined;
  onGestureStart:
    | LineChartViewportInteractionConfig["onGestureStart"]
    | undefined;
};

const defaultMinPanDistance = 6;

export const resolveLineChartViewportInteractionConfig = (
  viewportInteraction?: boolean | LineChartViewportInteractionConfig
): ResolvedLineChartViewportInteractionConfig => {
  if (!viewportInteraction) {
    return {
      pan: false,
      minPanDistance: defaultMinPanDistance,
      lockParentScroll: true,
      onGestureEnd: undefined,
      onGestureStart: undefined
    };
  }

  if (viewportInteraction === true) {
    return {
      pan: true,
      minPanDistance: defaultMinPanDistance,
      lockParentScroll: true,
      onGestureEnd: undefined,
      onGestureStart: undefined
    };
  }

  return {
    pan: viewportInteraction.pan !== false,
    minPanDistance:
      typeof viewportInteraction.minPanDistance === "number" &&
      Number.isFinite(viewportInteraction.minPanDistance)
        ? Math.max(0, viewportInteraction.minPanDistance)
        : defaultMinPanDistance,
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
