/* eslint-disable react-hooks/refs -- Gesture Handler stores callbacks outside React; refs keep active pinch state stable across controlled viewport rerenders. */
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  Gesture,
  GestureDetector,
  type GestureType
} from "react-native-gesture-handler";

import {
  resolveChartViewportWindowFromZoom,
  type ResolvedChartViewportWindow
} from "@chart-kit/core";

import {
  getChartViewportPinchZoomFactor,
  resolveChartViewportInteractionConfig
} from "./config";
import type {
  ChartViewportBounds,
  ChartViewportChangeEvent,
  ChartViewportInteractionConfig,
  ResolvedChartViewportInteractionConfig
} from "./types";

type ViewportPinchZoomState = {
  lastWindow: ResolvedChartViewportWindow;
  startWindow: ResolvedChartViewportWindow;
};

const isSameViewportWindow = (
  first: ResolvedChartViewportWindow,
  second: ResolvedChartViewportWindow
) =>
  first.startIndex === second.startIndex && first.endIndex === second.endIndex;

const getAnchorIndex = ({
  focalX,
  plotBounds,
  viewportWindow
}: {
  focalX: number;
  plotBounds: ChartViewportBounds;
  viewportWindow: ResolvedChartViewportWindow;
}) => {
  if (!Number.isFinite(focalX) || plotBounds.width <= 0) {
    return undefined;
  }

  const plotX = Math.min(Math.max(focalX - plotBounds.x, 0), plotBounds.width);
  const ratio = plotX / plotBounds.width;

  return (
    viewportWindow.startIndex +
    Math.max(0, viewportWindow.visibleCount - 1) * ratio
  );
};

const emitViewportChange = ({
  interaction,
  nextWindow,
  onViewportChange
}: {
  interaction: "pinchZoom";
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
    interaction
  });
};

export const useChartViewportPinchZoom = ({
  dataLength,
  enabled,
  onViewportChange,
  plotBounds,
  viewportInteraction,
  viewportWindow
}: {
  dataLength: number;
  enabled: boolean;
  onViewportChange: ((event: ChartViewportChangeEvent) => void) | undefined;
  plotBounds: ChartViewportBounds;
  viewportInteraction: boolean | ChartViewportInteractionConfig | undefined;
  viewportWindow: ResolvedChartViewportWindow;
}) => {
  const config = useMemo(
    () => resolveChartViewportInteractionConfig(viewportInteraction),
    [viewportInteraction]
  );
  const configRef = useRef<ResolvedChartViewportInteractionConfig>(config);
  const onViewportChangeRef = useRef(onViewportChange);
  const plotBoundsRef = useRef(plotBounds);
  const pinchStateRef = useRef<ViewportPinchZoomState | undefined>(undefined);
  const viewportWindowRef = useRef(viewportWindow);

  useEffect(() => {
    configRef.current = config;
    onViewportChangeRef.current = onViewportChange;
    plotBoundsRef.current = plotBounds;
    viewportWindowRef.current = viewportWindow;
  }, [config, onViewportChange, plotBounds, viewportWindow]);

  const canPinch =
    enabled &&
    config.pinchZoom &&
    onViewportChange !== undefined &&
    dataLength > 1 &&
    viewportWindow.visibleCount > 0 &&
    plotBounds.width > 0;

  const handleStart = useCallback(() => {
    const startWindow = viewportWindowRef.current;

    pinchStateRef.current = {
      lastWindow: startWindow,
      startWindow
    };
    configRef.current.onGestureStart?.({ interaction: "pinchZoom" });
  }, []);
  const handleUpdate = useCallback(
    (event: { focalX: number; scale: number }) => {
      const pinchState = pinchStateRef.current;

      if (!pinchState) {
        return;
      }

      const currentConfig = configRef.current;
      const nextWindow = resolveChartViewportWindowFromZoom({
        anchorIndex: getAnchorIndex({
          focalX: event.focalX,
          plotBounds: plotBoundsRef.current,
          viewportWindow: pinchState.startWindow
        }),
        currentWindow: pinchState.startWindow,
        itemCount: dataLength,
        maxVisibleCount: currentConfig.maxVisiblePoints,
        minVisibleCount: currentConfig.minVisiblePoints,
        zoomFactor: getChartViewportPinchZoomFactor({
          scale: event.scale,
          sensitivity: currentConfig.pinchSensitivity
        })
      });

      if (isSameViewportWindow(nextWindow, pinchState.lastWindow)) {
        return;
      }

      pinchStateRef.current = {
        ...pinchState,
        lastWindow: nextWindow
      };
      emitViewportChange({
        interaction: "pinchZoom",
        nextWindow,
        onViewportChange: onViewportChangeRef.current
      });
    },
    [dataLength]
  );
  const handleFinalize = useCallback(() => {
    if (!pinchStateRef.current) {
      return;
    }

    pinchStateRef.current = undefined;
    configRef.current.onGestureEnd?.({ interaction: "pinchZoom" });
  }, []);

  return useMemo(() => {
    if (!canPinch) {
      return undefined;
    }

    return Gesture.Pinch()
      .runOnJS(true)
      .onStart(handleStart)
      .onUpdate(handleUpdate)
      .onFinalize(handleFinalize);
  }, [canPinch, handleFinalize, handleStart, handleUpdate]);
};

export const ChartViewportGesture = ({
  children,
  gesture
}: {
  children: ReactNode;
  gesture: GestureType | undefined;
}) =>
  gesture ? (
    <GestureDetector gesture={gesture} touchAction="none" userSelect="none">
      {children}
    </GestureDetector>
  ) : (
    <>{children}</>
  );
