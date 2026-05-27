import { useCallback } from "react";
import type { GestureResponderEvent, ViewProps } from "react-native";

import type {
  LineChartDeselectEvent,
  ResolvedLineChartInteractionConfig
} from "./interaction";
import type { LineChartViewportPanHandlers } from "./viewportInteraction";

export const useLineChartResponderProps = <TData>({
  clearGestureSelection,
  handleInteractionEvent,
  interactionConfig,
  isInteractionEnabled,
  isResponderEventInPlot,
  preventBrowserSelection,
  viewportPan
}: {
  clearGestureSelection: (event: LineChartDeselectEvent) => void;
  handleInteractionEvent: (event: GestureResponderEvent) => void;
  interactionConfig: ResolvedLineChartInteractionConfig<TData>;
  isInteractionEnabled: boolean;
  isResponderEventInPlot: (event: GestureResponderEvent) => boolean;
  preventBrowserSelection: (event: GestureResponderEvent) => void;
  viewportPan: LineChartViewportPanHandlers;
}): ViewProps => {
  const handleResponderGrant = useCallback(
    (event: GestureResponderEvent) => {
      preventBrowserSelection(event);

      if (!isResponderEventInPlot(event)) {
        if (interactionConfig.deselectOnOutsidePress) {
          clearGestureSelection({ reason: "outsidePress" });
        }

        return;
      }

      if (viewportPan.isEnabled) {
        viewportPan.handleGrant(event);

        return;
      }

      interactionConfig.onGestureStart?.();
      handleInteractionEvent(event);
    },
    [
      clearGestureSelection,
      handleInteractionEvent,
      interactionConfig,
      isResponderEventInPlot,
      preventBrowserSelection,
      viewportPan
    ]
  );
  const handleResponderMove = useCallback(
    (event: GestureResponderEvent) => {
      if (viewportPan.isActive()) {
        viewportPan.handleMove(event);

        return;
      }

      if (interactionConfig.mode === "scrub") {
        handleInteractionEvent(event);
      }
    },
    [handleInteractionEvent, interactionConfig.mode, viewportPan]
  );
  const handleResponderEnd = useCallback(() => {
    if (viewportPan.isActive()) {
      viewportPan.handleEnd();

      return;
    }

    if (interactionConfig.selectionPersistence === "whileActive") {
      clearGestureSelection({ reason: "gestureEnd" });
    }

    interactionConfig.onGestureEnd?.();
  }, [clearGestureSelection, interactionConfig, viewportPan]);
  const isResponderEnabled = isInteractionEnabled || viewportPan.isEnabled;

  return isResponderEnabled
    ? {
        onStartShouldSetResponder: (event) =>
          viewportPan.shouldSetResponder(event) || isInteractionEnabled,
        onMoveShouldSetResponder: (event) =>
          viewportPan.shouldSetResponder(event) ||
          (interactionConfig.mode === "scrub" && isResponderEventInPlot(event)),
        onResponderTerminationRequest: () =>
          viewportPan.isActive()
            ? !viewportPan.shouldBlockTermination
            : interactionConfig.mode !== "scrub",
        onResponderGrant: handleResponderGrant,
        onResponderMove: handleResponderMove,
        onResponderRelease: handleResponderEnd,
        onResponderTerminate: handleResponderEnd
      }
    : {};
};
