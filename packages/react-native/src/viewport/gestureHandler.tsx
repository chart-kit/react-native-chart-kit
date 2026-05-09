/* eslint-disable react-hooks/refs -- RNGH stores callbacks during gesture construction; refs are read when native gesture callbacks run. */
import { useMemo, useRef, type ReactNode } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

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

type ViewportPanGestureState = {
  lastWindow: ResolvedChartViewportWindow;
  startWindow: ResolvedChartViewportWindow;
};

type ChartViewportTapEvent = {
  locationX: number;
  locationY: number;
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

export const useChartViewportGestureHandler = ({
  dataLength,
  enabled,
  onPress,
  onViewportChange,
  plotBounds,
  viewportInteraction,
  viewportWindow
}: {
  dataLength: number;
  enabled: boolean;
  onPress: ((event: ChartViewportTapEvent) => void) | undefined;
  onViewportChange: ((event: ChartViewportChangeEvent) => void) | undefined;
  plotBounds: ChartViewportBounds;
  viewportInteraction: boolean | ChartViewportInteractionConfig | undefined;
  viewportWindow: ResolvedChartViewportWindow;
}) => {
  const panStateRef = useRef<ViewportPanGestureState | undefined>(undefined);

  return useMemo(() => {
    const config = resolveChartViewportInteractionConfig(viewportInteraction);
    const canPan =
      enabled &&
      config.pan &&
      onViewportChange !== undefined &&
      dataLength > viewportWindow.visibleCount &&
      viewportWindow.visibleCount > 0 &&
      plotBounds.width > 0;

    if (!canPan && onPress === undefined) {
      return undefined;
    }

    const startPan = () => {
      panStateRef.current = {
        lastWindow: viewportWindow,
        startWindow: viewportWindow
      };
      config.onGestureStart?.({ interaction: "pan" });
    };
    const updatePan = (translationX: number) => {
      const panState = panStateRef.current;

      if (!canPan || !panState) {
        return;
      }

      if (Math.abs(translationX) < config.minPanDistance) {
        return;
      }

      const deltaPoints = getChartViewportPanDeltaPoints({
        currentLocationX: translationX,
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
        lastWindow: nextWindow
      };
      emitViewportChange({ nextWindow, onViewportChange });
    };
    const endPan = () => {
      if (!panStateRef.current) {
        return;
      }

      panStateRef.current = undefined;
      config.onGestureEnd?.({ interaction: "pan" });
    };

    const gestures = [];

    if (canPan) {
      gestures.push(
        Gesture.Pan()
          .minPointers(1)
          .maxPointers(1)
          .activeOffsetX([-config.minPanDistance, config.minPanDistance])
          .onStart(startPan)
          .onUpdate((event) => updatePan(event.translationX))
          .onEnd(endPan)
          .onFinalize(endPan)
      );
    }

    if (onPress) {
      gestures.push(
        Gesture.Tap()
          .maxDistance(config.minPanDistance)
          .maxDuration(320)
          .onEnd((event, success) => {
            if (success) {
              onPress({
                locationX: event.x,
                locationY: event.y
              });
            }
          })
      );
    }

    return gestures.length === 1 ? gestures[0] : Gesture.Race(...gestures);
  }, [
    dataLength,
    enabled,
    onPress,
    onViewportChange,
    plotBounds.width,
    viewportInteraction,
    viewportWindow
  ]);
};

export const ChartViewportGestureHandler = ({
  children,
  gesture
}: {
  children: ReactNode;
  gesture: ReturnType<typeof useChartViewportGestureHandler> | undefined;
}) =>
  gesture ? (
    <GestureDetector gesture={gesture}>{children}</GestureDetector>
  ) : (
    <>{children}</>
  );
