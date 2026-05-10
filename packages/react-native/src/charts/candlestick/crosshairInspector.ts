import { useCallback, useEffect, useRef } from "react";
import type { GestureResponderEvent, ViewProps } from "react-native";

import type { ChartBoxes } from "@chart-kit/core";

import {
  buildCandlestickChartSelectEvent,
  getNearestCandlestickByX
} from "./interaction";
import type {
  CandlestickChartCandleModel,
  CandlestickChartDeselectEvent,
  CandlestickChartInteractionActivation,
  CandlestickChartSelectEvent
} from "./types";

type CrosshairTouchPoint = {
  locationX: number;
  locationY: number;
};

type CrosshairIntersectionPoint = {
  x: number;
  y: number;
};

const longPressMoveTolerance = 8;
const intersectionHitRadius = 24;

export const clampCandlestickCrosshairY = ({
  locationY,
  plot
}: {
  locationY: number;
  plot: ChartBoxes["plot"];
}) => Math.max(plot.y, Math.min(plot.y + plot.height, locationY));

const isInPlot = ({
  locationX,
  locationY,
  plot,
  touchSlop = 12
}: {
  locationX: number;
  locationY: number;
  plot: ChartBoxes["plot"];
  touchSlop?: number;
}) =>
  locationX >= plot.x - touchSlop &&
  locationX <= plot.x + plot.width + touchSlop &&
  locationY >= plot.y - touchSlop &&
  locationY <= plot.y + plot.height + touchSlop;

export const isNearCandlestickCrosshairIntersection = ({
  intersection,
  locationX,
  locationY,
  radius = intersectionHitRadius
}: CrosshairTouchPoint & {
  intersection: CrosshairIntersectionPoint | undefined;
  radius?: number;
}) =>
  intersection !== undefined &&
  Math.hypot(locationX - intersection.x, locationY - intersection.y) <= radius;

export const useCandlestickCrosshairInspector = <TData>({
  activation,
  activationCancelKey,
  candles,
  deselectOnOutsidePress,
  enabled,
  formatXLabel,
  formatYLabel,
  hasSelection,
  longPressDelayMs,
  onDeselect,
  onGestureEnd,
  onGestureStart,
  onSelect,
  plot,
  preventBrowserSelection,
  selectedIndexControlled,
  selectedIntersection,
  setCrosshairY,
  setGestureSelectedIndex
}: {
  activation: CandlestickChartInteractionActivation;
  activationCancelKey?: number;
  candles: Array<CandlestickChartCandleModel<TData>>;
  deselectOnOutsidePress: boolean;
  enabled: boolean;
  formatXLabel: (
    value: CandlestickChartCandleModel<TData>["xValue"],
    index: number
  ) => string;
  formatYLabel: (value: number) => string;
  hasSelection: boolean;
  longPressDelayMs: number;
  onDeselect: ((event: CandlestickChartDeselectEvent) => void) | undefined;
  onGestureEnd: (() => void) | undefined;
  onGestureStart: (() => void) | undefined;
  onSelect: ((event: CandlestickChartSelectEvent<TData>) => void) | undefined;
  plot: ChartBoxes["plot"];
  preventBrowserSelection: (event: GestureResponderEvent) => void;
  selectedIndexControlled: boolean;
  selectedIntersection: CrosshairIntersectionPoint | undefined;
  setCrosshairY: (value: number | undefined) => void;
  setGestureSelectedIndex: (value: number | undefined) => void;
}): ViewProps => {
  const gestureActiveRef = useRef(false);
  const inspectingRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const touchStartRef = useRef<CrosshairTouchPoint | undefined>(undefined);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }
  }, []);

  const beginGesture = useCallback(() => {
    if (gestureActiveRef.current) {
      return;
    }

    gestureActiveRef.current = true;
    onGestureStart?.();
  }, [onGestureStart]);

  const endGesture = useCallback(() => {
    if (!gestureActiveRef.current) {
      return;
    }

    gestureActiveRef.current = false;
    onGestureEnd?.();
  }, [onGestureEnd]);

  const clearSelection = useCallback(
    (event: CandlestickChartDeselectEvent) => {
      clearLongPressTimer();
      inspectingRef.current = false;
      setCrosshairY(undefined);
      endGesture();

      if (!selectedIndexControlled) {
        setGestureSelectedIndex(undefined);
      }

      onDeselect?.(event);
    },
    [
      clearLongPressTimer,
      endGesture,
      onDeselect,
      selectedIndexControlled,
      setCrosshairY,
      setGestureSelectedIndex
    ]
  );
  const updateSelectionAt = useCallback(
    ({ locationX, locationY }: CrosshairTouchPoint) => {
      const candle = getNearestCandlestickByX({ candles, locationX });

      if (!candle) {
        return;
      }

      if (!selectedIndexControlled) {
        setGestureSelectedIndex(candle.dataIndex);
      }

      setCrosshairY(clampCandlestickCrosshairY({ locationY, plot }));

      const selectEvent = buildCandlestickChartSelectEvent({
        candle,
        formatXLabel,
        formatYLabel
      });

      if (selectEvent) {
        onSelect?.(selectEvent);
      }
    },
    [
      candles,
      formatXLabel,
      formatYLabel,
      onSelect,
      plot,
      selectedIndexControlled,
      setCrosshairY,
      setGestureSelectedIndex
    ]
  );
  const updateSelection = useCallback(
    (event: GestureResponderEvent) => {
      preventBrowserSelection(event);
      updateSelectionAt(event.nativeEvent);
    },
    [preventBrowserSelection, updateSelectionAt]
  );

  const activateLongPressInspection = useCallback(() => {
    longPressTimerRef.current = undefined;

    const touchStart = touchStartRef.current;

    if (!touchStart) {
      return;
    }

    inspectingRef.current = true;
    beginGesture();
    updateSelectionAt(touchStart);
  }, [beginGesture, updateSelectionAt]);

  const shouldSetResponder = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      const insidePlot = isInPlot({ locationX, locationY, plot });

      if (!enabled) {
        return false;
      }

      const isInspecting = hasSelection || inspectingRef.current;

      if (activation === "press") {
        return insidePlot || (deselectOnOutsidePress && hasSelection);
      }

      return (
        (isInspecting && insidePlot) ||
        (deselectOnOutsidePress && isInspecting && !insidePlot)
      );
    },
    [activation, deselectOnOutsidePress, enabled, hasSelection, plot]
  );

  useEffect(() => {
    if (!hasSelection) {
      inspectingRef.current = false;
    }
  }, [hasSelection]);

  useEffect(
    () => () => {
      clearLongPressTimer();
    },
    [clearLongPressTimer]
  );
  useEffect(() => {
    clearLongPressTimer();
  }, [activationCancelKey, clearLongPressTimer]);

  if (!enabled) {
    return {};
  }

  return {
    onMoveShouldSetResponder: shouldSetResponder,
    onResponderGrant: (event) => {
      clearLongPressTimer();

      const { locationX, locationY } = event.nativeEvent;

      if (!isInPlot({ locationX, locationY, plot })) {
        clearSelection({ reason: "outsidePress" });

        return;
      }

      if (
        activation === "longPress" &&
        hasSelection &&
        !isNearCandlestickCrosshairIntersection({
          intersection: selectedIntersection,
          locationX,
          locationY
        })
      ) {
        clearSelection({ reason: "outsidePress" });

        return;
      }

      inspectingRef.current = true;
      beginGesture();
      updateSelection(event);
    },
    onResponderMove: updateSelection,
    onResponderRelease: endGesture,
    onResponderTerminate: endGesture,
    onResponderTerminationRequest: () => false,
    onStartShouldSetResponder: shouldSetResponder,
    onTouchCancel: () => {
      clearLongPressTimer();
      endGesture();
    },
    onTouchEnd: () => {
      clearLongPressTimer();
      endGesture();
    },
    onTouchMove: (event) => {
      if (activation !== "longPress" || !longPressTimerRef.current) {
        return;
      }

      if (event.nativeEvent.touches.length > 1) {
        clearLongPressTimer();
        return;
      }

      const touchStart = touchStartRef.current;

      if (!touchStart) {
        clearLongPressTimer();
        return;
      }

      const { locationX, locationY } = event.nativeEvent;
      const distance = Math.hypot(
        locationX - touchStart.locationX,
        locationY - touchStart.locationY
      );

      if (distance > longPressMoveTolerance) {
        clearLongPressTimer();
      }
    },
    onTouchStart: (event) => {
      if (activation !== "longPress") {
        return;
      }

      clearLongPressTimer();

      const { locationX, locationY } = event.nativeEvent;

      if (
        event.nativeEvent.touches.length > 1 ||
        !isInPlot({ locationX, locationY, plot })
      ) {
        return;
      }

      touchStartRef.current = { locationX, locationY };
      longPressTimerRef.current = setTimeout(
        activateLongPressInspection,
        longPressDelayMs
      );
    }
  };
};
