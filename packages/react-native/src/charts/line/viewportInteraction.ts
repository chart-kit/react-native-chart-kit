import { useCallback, useMemo, useRef } from "react";
import type { GestureResponderEvent } from "react-native";

import {
  resolveChartViewportWindowFromPanDelta,
  type ResolvedChartViewportWindow
} from "@chart-kit/core";

import { isLineChartInteractionInBounds } from "./interaction";
import {
  getLineChartViewportPanDeltaPoints,
  resolveLineChartViewportInteractionConfig
} from "./viewportInteractionConfig";
import type {
  LineChartViewportChangeEvent,
  LineChartViewportInteractionConfig
} from "./types";

type ChartBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ViewportPanState = {
  lastWindow: ResolvedChartViewportWindow;
  startLocationX: number;
  startWindow: ResolvedChartViewportWindow;
};

const isSameViewportWindow = (
  first: ResolvedChartViewportWindow,
  second: ResolvedChartViewportWindow
) =>
  first.startIndex === second.startIndex && first.endIndex === second.endIndex;

export const useLineChartViewportPan = ({
  dataLength,
  enabled,
  onViewportChange,
  plotBounds,
  preventBrowserSelection,
  viewportInteraction,
  viewportWindow
}: {
  dataLength: number;
  enabled: boolean;
  onViewportChange: ((event: LineChartViewportChangeEvent) => void) | undefined;
  plotBounds: ChartBounds;
  preventBrowserSelection: (event: GestureResponderEvent) => void;
  viewportInteraction: boolean | LineChartViewportInteractionConfig | undefined;
  viewportWindow: ResolvedChartViewportWindow;
}) => {
  const config = useMemo(
    () => resolveLineChartViewportInteractionConfig(viewportInteraction),
    [viewportInteraction]
  );
  const panStateRef = useRef<ViewportPanState | undefined>(undefined);
  const canPan =
    enabled &&
    config.pan &&
    onViewportChange !== undefined &&
    dataLength > viewportWindow.visibleCount &&
    viewportWindow.visibleCount > 0 &&
    plotBounds.width > 0;

  const emitViewportChange = useCallback(
    (nextWindow: ResolvedChartViewportWindow) => {
      onViewportChange?.({
        viewport: {
          startIndex: nextWindow.startIndex,
          endIndex: nextWindow.endIndex
        },
        startIndex: nextWindow.startIndex,
        endIndex: nextWindow.endIndex,
        visibleCount: nextWindow.visibleCount,
        itemCount: nextWindow.itemCount,
        isWindowed: nextWindow.isWindowed,
        source: "mainPlot",
        interaction: "pan"
      });
    },
    [onViewportChange]
  );
  const isEventInPlot = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;

      return isLineChartInteractionInBounds({
        bounds: plotBounds,
        locationX,
        locationY
      });
    },
    [plotBounds]
  );
  const shouldSetResponder = useCallback(
    (event: GestureResponderEvent) => canPan && isEventInPlot(event),
    [canPan, isEventInPlot]
  );
  const handleGrant = useCallback(
    (event: GestureResponderEvent) => {
      if (!canPan) {
        return false;
      }

      preventBrowserSelection(event);

      panStateRef.current = {
        lastWindow: viewportWindow,
        startLocationX: event.nativeEvent.locationX,
        startWindow: viewportWindow
      };
      config.onGestureStart?.({ interaction: "pan" });

      return true;
    },
    [canPan, config, preventBrowserSelection, viewportWindow]
  );
  const handleMove = useCallback(
    (event: GestureResponderEvent) => {
      const panState = panStateRef.current;

      if (!canPan || !panState) {
        return false;
      }

      preventBrowserSelection(event);

      const deltaX = Math.abs(
        event.nativeEvent.locationX - panState.startLocationX
      );

      if (deltaX < config.minPanDistance) {
        return true;
      }

      const deltaPoints = getLineChartViewportPanDeltaPoints({
        currentLocationX: event.nativeEvent.locationX,
        plotWidth: plotBounds.width,
        startLocationX: panState.startLocationX,
        visibleCount: panState.startWindow.visibleCount
      });

      if (deltaPoints === 0) {
        return true;
      }

      const nextWindow = resolveChartViewportWindowFromPanDelta({
        currentWindow: panState.startWindow,
        deltaPoints,
        itemCount: dataLength
      });

      if (isSameViewportWindow(nextWindow, panState.lastWindow)) {
        return true;
      }

      panStateRef.current = {
        ...panState,
        lastWindow: nextWindow
      };
      emitViewportChange(nextWindow);

      return true;
    },
    [
      canPan,
      config.minPanDistance,
      dataLength,
      emitViewportChange,
      plotBounds.width,
      preventBrowserSelection
    ]
  );
  const handleEnd = useCallback(() => {
    if (!panStateRef.current) {
      return false;
    }

    panStateRef.current = undefined;
    config.onGestureEnd?.({ interaction: "pan" });

    return true;
  }, [config]);
  const isActive = useCallback(() => panStateRef.current !== undefined, []);

  return {
    handleEnd,
    handleGrant,
    handleMove,
    isActive,
    isEnabled: canPan,
    shouldBlockTermination: canPan && config.lockParentScroll,
    shouldSetResponder
  };
};

export type LineChartViewportPanHandlers = ReturnType<
  typeof useLineChartViewportPan
>;
