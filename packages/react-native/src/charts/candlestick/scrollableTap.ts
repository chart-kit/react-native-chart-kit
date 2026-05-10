import { useCallback, useRef } from "react";
import type { NativeSyntheticEvent, NativeTouchEvent } from "react-native";

import { isCandlestickChartScrollableTap } from "./interaction";

type CandlestickScrollableTapState = {
  maxDistance: number;
  startTime: number;
  startX: number;
  startY: number;
};

type CandlestickScrollableTapEvent = {
  locationX: number;
  locationY: number;
};

export const useCandlestickScrollableTap = ({
  enabled,
  onPress,
  scrollable
}: {
  enabled: boolean;
  onPress: (event: CandlestickScrollableTapEvent) => void;
  scrollable: boolean;
}) => {
  const scrollableTapRef = useRef<CandlestickScrollableTapState | undefined>(
    undefined
  );
  const handleTouchStart = useCallback(
    (event: NativeSyntheticEvent<NativeTouchEvent>) => {
      if (!scrollable || !enabled) {
        scrollableTapRef.current = undefined;
        return;
      }

      const { locationX, locationY } = event.nativeEvent;

      scrollableTapRef.current = {
        maxDistance: 0,
        startTime: Date.now(),
        startX: locationX,
        startY: locationY
      };
    },
    [enabled, scrollable]
  );
  const handleTouchMove = useCallback(
    (event: NativeSyntheticEvent<NativeTouchEvent>) => {
      const tapState = scrollableTapRef.current;

      if (!tapState) {
        return;
      }

      const { locationX, locationY } = event.nativeEvent;
      const distance = Math.hypot(
        locationX - tapState.startX,
        locationY - tapState.startY
      );

      scrollableTapRef.current = {
        ...tapState,
        maxDistance: Math.max(tapState.maxDistance, distance)
      };
    },
    []
  );
  const handleTouchEnd = useCallback(
    (event: NativeSyntheticEvent<NativeTouchEvent>) => {
      const tapState = scrollableTapRef.current;

      scrollableTapRef.current = undefined;

      if (!tapState) {
        return;
      }

      const { locationX, locationY } = event.nativeEvent;
      const endDistance = Math.hypot(
        locationX - tapState.startX,
        locationY - tapState.startY
      );

      if (
        !isCandlestickChartScrollableTap({
          endTime: Date.now(),
          maxDistance: Math.max(tapState.maxDistance, endDistance),
          startTime: tapState.startTime
        })
      ) {
        return;
      }

      onPress({ locationX, locationY });
    },
    [onPress]
  );
  const handleTouchCancel = useCallback(() => {
    scrollableTapRef.current = undefined;
  }, []);

  return scrollable && enabled
    ? {
        onTouchCancel: handleTouchCancel,
        onTouchEnd: handleTouchEnd,
        onTouchMove: handleTouchMove,
        onTouchStart: handleTouchStart
      }
    : {};
};
