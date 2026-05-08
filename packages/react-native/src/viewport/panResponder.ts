/* eslint-disable react-hooks/refs -- PanResponder stores callbacks during creation; refs keep gesture state outside render. */
import { useMemo, useRef } from "react";
import { PanResponder } from "react-native";
import type {
  GestureResponderEvent,
  PanResponderGestureState
} from "react-native";

import {
  resolveChartViewportWindowFromPanDelta,
  type ResolvedChartViewportWindow
} from "@chart-kit/core";

import {
  getChartViewportPanDeltaPoints,
  resolveChartViewportInteractionConfig
} from "./config";
import type {
  ChartViewportBounds,
  ChartViewportChangeEvent,
  ChartViewportInteractionConfig
} from "./types";

type PanResponderState = {
  didPan: boolean;
  lastWindow: ResolvedChartViewportWindow;
  startWindow: ResolvedChartViewportWindow;
};

const isSameViewportWindow = (
  first: ResolvedChartViewportWindow,
  second: ResolvedChartViewportWindow
) =>
  first.startIndex === second.startIndex && first.endIndex === second.endIndex;

const emitViewportChange = ({
  nextWindow,
  onViewportChange
}: {
  nextWindow: ResolvedChartViewportWindow;
  onViewportChange: ((event: ChartViewportChangeEvent) => void) | undefined;
}) => {
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
};

export const useChartViewportPanResponder = ({
  dataLength,
  enabled,
  onPress,
  onViewportChange,
  plotBounds,
  preventBrowserSelection,
  viewportInteraction,
  viewportWindow
}: {
  dataLength: number;
  enabled: boolean;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
  onViewportChange: ((event: ChartViewportChangeEvent) => void) | undefined;
  plotBounds: ChartViewportBounds;
  preventBrowserSelection: (event: GestureResponderEvent) => void;
  viewportInteraction: boolean | ChartViewportInteractionConfig | undefined;
  viewportWindow: ResolvedChartViewportWindow;
}) => {
  const panStateRef = useRef<PanResponderState | undefined>(undefined);

  return useMemo(() => {
    const config = resolveChartViewportInteractionConfig(viewportInteraction);
    const canPan =
      enabled &&
      config.pan &&
      onViewportChange !== undefined &&
      dataLength > viewportWindow.visibleCount &&
      viewportWindow.visibleCount > 0 &&
      plotBounds.width > 0;
    const isEnabled = canPan || onPress !== undefined;
    const startPan = () => {
      panStateRef.current = {
        didPan: false,
        lastWindow: viewportWindow,
        startWindow: viewportWindow
      };
      config.onGestureStart?.({ interaction: "pan" });
    };
    const updatePan = (gestureState: PanResponderGestureState) => {
      const panState = panStateRef.current;

      if (!canPan || !panState) {
        return;
      }

      if (Math.abs(gestureState.dx) < config.minPanDistance) {
        return;
      }

      const deltaPoints = getChartViewportPanDeltaPoints({
        currentLocationX: gestureState.dx,
        plotWidth: plotBounds.width,
        startLocationX: 0,
        visibleCount: panState.startWindow.visibleCount
      });

      if (deltaPoints === 0) {
        return;
      }

      const nextWindow = resolveChartViewportWindowFromPanDelta({
        currentWindow: panState.startWindow,
        deltaPoints,
        itemCount: dataLength
      });

      if (isSameViewportWindow(nextWindow, panState.lastWindow)) {
        return;
      }

      panStateRef.current = {
        ...panState,
        didPan: true,
        lastWindow: nextWindow
      };
      emitViewportChange({ nextWindow, onViewportChange });
    };
    const endPan = (event: GestureResponderEvent) => {
      const panState = panStateRef.current;
      const didPan = panState?.didPan ?? false;

      if (panState) {
        panStateRef.current = undefined;
        config.onGestureEnd?.({ interaction: "pan" });
      }

      if (!didPan) {
        onPress?.(event);
      }
    };

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gestureState) =>
        canPan && Math.abs(gestureState.dx) >= config.minPanDistance,
      onPanResponderGrant: (event) => {
        preventBrowserSelection(event);

        if (canPan) {
          startPan();
        }
      },
      onPanResponderMove: (event, gestureState) => {
        preventBrowserSelection(event);
        updatePan(gestureState);
      },
      onPanResponderRelease: endPan,
      onPanResponderTerminate: () => {
        if (panStateRef.current) {
          panStateRef.current = undefined;
          config.onGestureEnd?.({ interaction: "pan" });
        }
      },
      onShouldBlockNativeResponder: () => canPan && config.lockParentScroll,
      onStartShouldSetPanResponder: () => isEnabled
    });
  }, [
    dataLength,
    enabled,
    onPress,
    onViewportChange,
    plotBounds.width,
    preventBrowserSelection,
    viewportInteraction,
    viewportWindow
  ]);
};
