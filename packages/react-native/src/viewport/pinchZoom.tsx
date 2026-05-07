/* eslint-disable react-hooks/refs -- PanResponder stores callbacks during creation; refs keep active pinch state stable across controlled viewport rerenders. */
import { useMemo, useRef, type ReactNode } from "react";
import { PanResponder, View } from "react-native";
import type { GestureResponderEvent, PanResponderInstance } from "react-native";

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
  ChartViewportInteractionConfig
} from "./types";

type TouchPoint = {
  locationX: number;
  locationY: number;
};

type ViewportPinchZoomState = {
  lastWindow: ResolvedChartViewportWindow;
  startDistance: number;
  startFocalX: number;
  startWindow: ResolvedChartViewportWindow;
};

const minPinchDistance = 4;

const isSameViewportWindow = (
  first: ResolvedChartViewportWindow,
  second: ResolvedChartViewportWindow
) =>
  first.startIndex === second.startIndex && first.endIndex === second.endIndex;

const getTouches = (event: GestureResponderEvent): TouchPoint[] =>
  event.nativeEvent.touches
    .map((touch) => ({
      locationX: touch.locationX,
      locationY: touch.locationY
    }))
    .filter(
      (touch) =>
        Number.isFinite(touch.locationX) && Number.isFinite(touch.locationY)
    );

const getPinchMetrics = (event: GestureResponderEvent) => {
  const [first, second] = getTouches(event);

  if (!first || !second) return undefined;

  const dx = second.locationX - first.locationX;
  const dy = second.locationY - first.locationY;

  return {
    distance: Math.hypot(dx, dy),
    focalX: (first.locationX + second.locationX) / 2
  };
};

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
    interaction: "pinchZoom"
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
}): PanResponderInstance | undefined => {
  const pinchStateRef = useRef<ViewportPinchZoomState | undefined>(undefined);

  return useMemo(() => {
    const config = resolveChartViewportInteractionConfig(viewportInteraction);
    const canPinch =
      enabled &&
      config.pinchZoom &&
      onViewportChange !== undefined &&
      dataLength > 1 &&
      viewportWindow.visibleCount > 0 &&
      plotBounds.width > 0;

    if (!canPinch) return undefined;

    const startPinch = (event: GestureResponderEvent) => {
      const metrics = getPinchMetrics(event);

      if (!metrics || metrics.distance < minPinchDistance) return;

      pinchStateRef.current = {
        lastWindow: viewportWindow,
        startDistance: metrics.distance,
        startFocalX: metrics.focalX,
        startWindow: viewportWindow
      };
      config.onGestureStart?.({ interaction: "pinchZoom" });
    };
    const updatePinch = (event: GestureResponderEvent) => {
      if (!pinchStateRef.current) startPinch(event);

      const pinchState = pinchStateRef.current;
      const metrics = getPinchMetrics(event);

      if (!pinchState || !metrics || metrics.distance < minPinchDistance) {
        return;
      }

      const nextWindow = resolveChartViewportWindowFromZoom({
        anchorIndex: getAnchorIndex({
          focalX: pinchState.startFocalX,
          plotBounds,
          viewportWindow: pinchState.startWindow
        }),
        currentWindow: pinchState.startWindow,
        itemCount: dataLength,
        maxVisibleCount: config.maxVisiblePoints,
        minVisibleCount: config.minVisiblePoints,
        zoomFactor: getChartViewportPinchZoomFactor({
          scale: metrics.distance / pinchState.startDistance,
          sensitivity: config.pinchSensitivity
        })
      });

      if (isSameViewportWindow(nextWindow, pinchState.lastWindow)) return;

      pinchStateRef.current = {
        ...pinchState,
        lastWindow: nextWindow
      };
      emitViewportChange({ nextWindow, onViewportChange });
    };
    const endPinch = () => {
      if (!pinchStateRef.current) return;

      pinchStateRef.current = undefined;
      config.onGestureEnd?.({ interaction: "pinchZoom" });
    };
    const hasTwoTouches = (event: GestureResponderEvent) =>
      getTouches(event).length >= 2;

    return PanResponder.create({
      onMoveShouldSetPanResponderCapture: (event) =>
        canPinch && hasTwoTouches(event),
      onPanResponderGrant: startPinch,
      onPanResponderMove: updatePinch,
      onPanResponderRelease: endPinch,
      onPanResponderTerminate: endPinch,
      onPanResponderTerminationRequest: () => !pinchStateRef.current,
      onShouldBlockNativeResponder: () => config.lockParentScroll,
      onStartShouldSetPanResponderCapture: (event) =>
        canPinch && hasTwoTouches(event)
    });
  }, [
    dataLength,
    enabled,
    onViewportChange,
    plotBounds,
    viewportInteraction,
    viewportWindow
  ]);
};

export const ChartViewportGesture = ({
  children,
  gesture
}: {
  children: ReactNode;
  gesture: PanResponderInstance | undefined;
}) =>
  gesture ? (
    <View collapsable={false} {...gesture.panHandlers}>
      {children}
    </View>
  ) : (
    <>{children}</>
  );
