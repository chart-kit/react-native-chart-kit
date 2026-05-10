/* eslint-disable react-hooks/refs -- RNGH stores callbacks during gesture construction; refs are read when native gesture callbacks run. */
import {
  Fragment,
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode
} from "react";
import type { GestureResponderEvent, ViewProps } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type {
  ComposedGesture,
  GestureType
} from "react-native-gesture-handler";

import type { ChartBoxes } from "@chart-kit/core";

import {
  buildCandlestickChartSelectEvent,
  getNearestCandlestickByX
} from "./interaction";
import {
  clampCandlestickCrosshairY,
  isNearCandlestickCrosshairIntersection,
  type CandlestickCrosshairIntersectionPoint
} from "./crosshairGeometry";
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

type CandlestickCrosshairGesture = ComposedGesture | GestureType;

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

export const useCandlestickCrosshairInspector = <TData>({
  activation,
  candles,
  deselectOnOutsidePress,
  enabled,
  formatXLabel,
  formatYLabel,
  hasSelection,
  longPressDelayMs,
  longPressMoveTolerance,
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
  longPressMoveTolerance: number;
  onDeselect: ((event: CandlestickChartDeselectEvent) => void) | undefined;
  onGestureEnd: (() => void) | undefined;
  onGestureStart: (() => void) | undefined;
  onSelect: ((event: CandlestickChartSelectEvent<TData>) => void) | undefined;
  plot: ChartBoxes["plot"];
  preventBrowserSelection: (event: GestureResponderEvent) => void;
  selectedIndexControlled: boolean;
  selectedIntersection: CandlestickCrosshairIntersectionPoint | undefined;
  setCrosshairY: (value: number | undefined) => void;
  setGestureSelectedIndex: (value: number | undefined) => void;
}): {
  gesture: CandlestickCrosshairGesture | undefined;
  viewProps: ViewProps;
} => {
  const gestureActiveRef = useRef(false);
  const inspectingRef = useRef(false);

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
      inspectingRef.current = false;
      setCrosshairY(undefined);
      endGesture();

      if (!selectedIndexControlled) {
        setGestureSelectedIndex(undefined);
      }

      onDeselect?.(event);
    },
    [
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

  const gesture = useMemo(() => {
    if (!enabled || activation !== "longPress") {
      return undefined;
    }

    const selectFromGesture = (event: { x: number; y: number }) => {
      const touchPoint = { locationX: event.x, locationY: event.y };

      if (!isInPlot({ ...touchPoint, plot })) {
        return;
      }

      inspectingRef.current = true;
      beginGesture();
      updateSelectionAt(touchPoint);
    };

    const longPressGesture = Gesture.LongPress()
      .minDuration(longPressDelayMs)
      .maxDistance(longPressMoveTolerance)
      .numberOfPointers(1)
      .onStart(selectFromGesture);
    const panGesture = Gesture.Pan()
      .minPointers(1)
      .maxPointers(1)
      .activateAfterLongPress(longPressDelayMs)
      .onStart(selectFromGesture)
      .onUpdate(selectFromGesture)
      .onEnd(endGesture)
      .onFinalize(endGesture);

    return Gesture.Simultaneous(longPressGesture, panGesture);
  }, [
    activation,
    beginGesture,
    enabled,
    endGesture,
    longPressDelayMs,
    longPressMoveTolerance,
    plot,
    updateSelectionAt
  ]);

  if (!enabled) {
    return { gesture: undefined, viewProps: {} };
  }

  return {
    gesture,
    viewProps: {
      onMoveShouldSetResponder: shouldSetResponder,
      onResponderGrant: (event) => {
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
      onTouchCancel: endGesture,
      onTouchEnd: endGesture,
      onTouchMove: (event) => {
        if (activation !== "longPress") {
          return;
        }

        if (event.nativeEvent.touches.length > 1 && hasSelection) {
          clearSelection({ reason: "outsidePress" });
        }
      },
      onTouchStart: undefined
    }
  };
};

export const CandlestickCrosshairGestureHandler = ({
  children,
  gesture
}: {
  children: ReactNode;
  gesture: CandlestickCrosshairGesture | undefined;
}): ReactElement =>
  gesture
    ? createElement(GestureDetector, { gesture }, children)
    : createElement(Fragment, null, children);
