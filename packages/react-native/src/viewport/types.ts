import type {
  ChartViewportInitialIndex,
  ResolvedChartViewportWindow
} from "@chart-kit/core";

export type ChartViewportConfig = {
  endIndex?: number;
  initialIndex?: ChartViewportInitialIndex;
  startIndex?: number;
  visiblePoints?: number;
};

export type ChartViewportBounds = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type ChartViewportInteractionType = "pan" | "pinchZoom";

export type ChartViewportInteractionGestureEvent = {
  interaction: ChartViewportInteractionType;
};

export type ChartViewportInteractionConfig = {
  lockParentScroll?: boolean;
  maxVisiblePoints?: number;
  minPanDistance?: number;
  minVisiblePoints?: number;
  onGestureEnd?: (event: ChartViewportInteractionGestureEvent) => void;
  onGestureStart?: (event: ChartViewportInteractionGestureEvent) => void;
  pan?: boolean;
  pinchSensitivity?: number;
  pinchZoom?: boolean;
  smoothPan?: boolean;
};

export type ChartViewportChangeEvent = {
  endIndex: number;
  interaction: ChartViewportInteractionType;
  isWindowed: boolean;
  itemCount: number;
  source: "mainPlot";
  startIndex: number;
  viewport: ChartViewportConfig;
  visibleCount: number;
};

export type ResolvedChartViewportInteractionConfig = {
  lockParentScroll: boolean;
  maxVisiblePoints: number | undefined;
  minPanDistance: number;
  minVisiblePoints: number;
  onGestureEnd: ChartViewportInteractionConfig["onGestureEnd"] | undefined;
  onGestureStart: ChartViewportInteractionConfig["onGestureStart"] | undefined;
  pan: boolean;
  pinchSensitivity: number;
  pinchZoom: boolean;
  smoothPan: boolean;
};

export type ChartViewportPanState = {
  lastWindow: ResolvedChartViewportWindow;
  lastOffsetX: number;
  startLocationX: number;
  startWindow: ResolvedChartViewportWindow;
};
