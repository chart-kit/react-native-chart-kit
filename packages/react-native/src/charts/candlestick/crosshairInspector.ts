import { useCallback } from "react";
import type { GestureResponderEvent, ViewProps } from "react-native";

import type { ChartBoxes } from "@chart-kit/core";

import {
  buildCandlestickChartSelectEvent,
  getNearestCandlestickByX
} from "./interaction";
import type {
  CandlestickChartCandleModel,
  CandlestickChartDeselectEvent,
  CandlestickChartSelectEvent
} from "./types";

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

export const useCandlestickCrosshairInspector = <TData>({
  candles,
  deselectOnOutsidePress,
  enabled,
  formatXLabel,
  formatYLabel,
  hasSelection,
  onDeselect,
  onGestureEnd,
  onGestureStart,
  onSelect,
  plot,
  preventBrowserSelection,
  selectedIndexControlled,
  setCrosshairY,
  setGestureSelectedIndex
}: {
  candles: Array<CandlestickChartCandleModel<TData>>;
  deselectOnOutsidePress: boolean;
  enabled: boolean;
  formatXLabel: (
    value: CandlestickChartCandleModel<TData>["xValue"],
    index: number
  ) => string;
  formatYLabel: (value: number) => string;
  hasSelection: boolean;
  onDeselect: ((event: CandlestickChartDeselectEvent) => void) | undefined;
  onGestureEnd: (() => void) | undefined;
  onGestureStart: (() => void) | undefined;
  onSelect: ((event: CandlestickChartSelectEvent<TData>) => void) | undefined;
  plot: ChartBoxes["plot"];
  preventBrowserSelection: (event: GestureResponderEvent) => void;
  selectedIndexControlled: boolean;
  setCrosshairY: (value: number | undefined) => void;
  setGestureSelectedIndex: (value: number | undefined) => void;
}): ViewProps => {
  const clearSelection = useCallback(
    (event: CandlestickChartDeselectEvent) => {
      setCrosshairY(undefined);

      if (!selectedIndexControlled) {
        setGestureSelectedIndex(undefined);
      }

      onDeselect?.(event);
    },
    [
      onDeselect,
      selectedIndexControlled,
      setCrosshairY,
      setGestureSelectedIndex
    ]
  );
  const updateSelection = useCallback(
    (event: GestureResponderEvent) => {
      preventBrowserSelection(event);

      const { locationX, locationY } = event.nativeEvent;
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
      preventBrowserSelection,
      selectedIndexControlled,
      setCrosshairY,
      setGestureSelectedIndex
    ]
  );

  const shouldSetResponder = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;

      return (
        enabled &&
        (isInPlot({ locationX, locationY, plot }) ||
          (deselectOnOutsidePress && hasSelection))
      );
    },
    [deselectOnOutsidePress, enabled, hasSelection, plot]
  );

  if (!enabled) {
    return {};
  }

  return {
    onMoveShouldSetResponder: shouldSetResponder,
    onResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;

      if (!isInPlot({ locationX, locationY, plot })) {
        clearSelection({ reason: "outsidePress" });

        return;
      }

      onGestureStart?.();
      updateSelection(event);
    },
    onResponderMove: updateSelection,
    onResponderRelease: () => onGestureEnd?.(),
    onResponderTerminate: () => onGestureEnd?.(),
    onResponderTerminationRequest: () => false,
    onStartShouldSetResponder: shouldSetResponder
  };
};
