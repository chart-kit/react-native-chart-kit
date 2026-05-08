import { useCallback, useMemo, useRef } from "react";
import type { GestureResponderEvent } from "react-native";

import {
  resolveChartViewportWindowFromPanDelta,
  type ResolvedChartViewportWindow
} from "@chart-kit/core";

import { isChartViewportEventInBounds } from "./bounds";
import {
  getChartViewportPanDeltaPoints,
  resolveChartViewportInteractionConfig
} from "./config";
import type {
  ChartViewportBounds,
  ChartViewportChangeEvent,
  ChartViewportInteractionConfig,
  ChartViewportPanState
} from "./types";

const isSameViewportWindow = (
  first: ResolvedChartViewportWindow,
  second: ResolvedChartViewportWindow
) =>
  first.startIndex === second.startIndex && first.endIndex === second.endIndex;

export const useChartViewportPan = ({
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
  onViewportChange: ((event: ChartViewportChangeEvent) => void) | undefined;
  plotBounds: ChartViewportBounds;
  preventBrowserSelection: (event: GestureResponderEvent) => void;
  viewportInteraction: boolean | ChartViewportInteractionConfig | undefined;
  viewportWindow: ResolvedChartViewportWindow;
}) => {
  const config = useMemo(
    () => resolveChartViewportInteractionConfig(viewportInteraction),
    [viewportInteraction]
  );
  const panStateRef = useRef<ChartViewportPanState | undefined>(undefined);
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
  const shouldSetResponder = useCallback(
    (event: GestureResponderEvent) =>
      canPan && isChartViewportEventInBounds({ bounds: plotBounds, event }),
    [canPan, plotBounds]
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

      const deltaPoints = getChartViewportPanDeltaPoints({
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
  const hasChanged = useCallback(() => {
    const panState = panStateRef.current;

    return panState
      ? !isSameViewportWindow(panState.startWindow, panState.lastWindow)
      : false;
  }, []);

  return {
    hasChanged,
    handleEnd,
    handleGrant,
    handleMove,
    isActive,
    isEnabled: canPan,
    shouldBlockTermination: canPan && config.lockParentScroll,
    shouldSetResponder
  };
};

export type ChartViewportPanHandlers = ReturnType<typeof useChartViewportPan>;
