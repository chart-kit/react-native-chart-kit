import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { GestureResponderEvent, ViewProps } from "react-native";

import { useChartKitTheme } from "../../theme";
import { BarChartSurface, StickyBarChartYAxis } from "./BarChartSurface";
import {
  buildBarChartSelectEvent,
  getBarChartBarAtPoint,
  getBarChartBarKey,
  getBarChartInteractionConfig,
  isBarChartInteractionEnabled
} from "./interaction";
import { buildBarChartModel } from "./model";
import { getBarChartTooltipConfig } from "./options";
import { getBarChartTooltipModel } from "./tooltip";
import {
  resolveBarChartViewport,
  resolveBarChartViewportInitialOffset
} from "./viewport";
import type { BarChartProps } from "./types";

export type * from "./types";

export const BarChart = <TData extends Record<string, unknown>>(
  props: BarChartProps<TData>
) => {
  const chartKitTheme = useChartKitTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const interactionConfig = useMemo(
    () => getBarChartInteractionConfig(props.interaction),
    [props.interaction]
  );
  const [gestureSelectedBarKey, setGestureSelectedBarKey] = useState<
    string | undefined
  >(() => getBarChartBarKey(props.defaultSelectedBar));
  const viewport = useMemo(
    () =>
      resolveBarChartViewport({
        itemCount: props.data.length,
        scrollable: props.scrollable,
        viewportWidth: props.width,
        visiblePoints: props.visiblePoints
      }),
    [props.data.length, props.scrollable, props.visiblePoints, props.width]
  );
  const initialScrollOffset = useMemo(
    () =>
      resolveBarChartViewportInitialOffset({
        initialIndex: props.initialIndex,
        viewport
      }),
    [props.initialIndex, viewport]
  );
  const model = useMemo(
    () =>
      buildBarChartModel({
        ...props,
        chartKitTheme,
        width: viewport.contentWidth
      }),
    [chartKitTheme, props, viewport.contentWidth]
  );
  const { bars, boxes, resolvedTheme, xLabels } = model;
  const barRadius = Math.max(0, props.barRadius ?? 5);
  const controlledSelectedBarKey = getBarChartBarKey(props.selectedBar);
  const selectedBarKey = controlledSelectedBarKey ?? gestureSelectedBarKey;
  const selectedBar = bars.find((bar) => bar.key === selectedBarKey);
  const hasSelectedBar = selectedBar !== undefined;
  const tooltipConfig = useMemo(
    () =>
      getBarChartTooltipConfig({
        themeTooltip: resolvedTheme.tooltip,
        tooltip: props.tooltip
      }),
    [props.tooltip, resolvedTheme.tooltip]
  );
  const tooltipModel = useMemo(
    () =>
      getBarChartTooltipModel({
        bar: selectedBar,
        boxes,
        config: tooltipConfig
      }),
    [boxes, selectedBar, tooltipConfig]
  );
  const isInteractionEnabled = isBarChartInteractionEnabled(interactionConfig);
  const handleResponderRelease = useCallback(
    (event: GestureResponderEvent) => {
      event.preventDefault();

      const { locationX, locationY } = event.nativeEvent;
      const tappedBar = getBarChartBarAtPoint({
        bars,
        locationX,
        locationY
      });

      if (!tappedBar) {
        if (interactionConfig.deselectOnOutsidePress) {
          if (props.selectedBar === undefined) {
            setGestureSelectedBarKey(undefined);
          }

          interactionConfig.onDeselect?.({ reason: "outsidePress" });
        }

        return;
      }

      if (props.selectedBar === undefined) {
        setGestureSelectedBarKey(tappedBar.key);
      }

      const selectEvent = buildBarChartSelectEvent(tappedBar);

      if (selectEvent) {
        interactionConfig.onSelect?.(selectEvent);
      }
    },
    [bars, interactionConfig, props.selectedBar]
  );
  const responderProps: ViewProps = isInteractionEnabled
    ? {
        onStartShouldSetResponder: () => true,
        onResponderGrant: (event: GestureResponderEvent) => {
          event.preventDefault();
        },
        onResponderRelease: handleResponderRelease,
        onResponderTerminationRequest: () => true
      }
    : {};
  const accessibilityLabel =
    props.accessibilityLabel ??
    `Bar chart with ${bars.length} bars across ${xLabels.length} visible x-axis labels.`;
  const chartSurface = (
    <BarChartSurface
      barRadius={barRadius}
      height={props.height}
      hasSelectedBar={hasSelectedBar}
      model={model}
      responderProps={responderProps}
      selectedBarKey={selectedBarKey}
      showYAxis={!viewport.scrollable}
      tooltipConfig={tooltipConfig}
      tooltipModel={tooltipModel}
      width={viewport.contentWidth}
    />
  );

  useEffect(() => {
    if (!viewport.scrollable) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        animated: false,
        x: initialScrollOffset
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [initialScrollOffset, viewport.scrollable]);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={{ width: props.width, height: props.height }}
      testID={props.testID}
    >
      {viewport.scrollable ? (
        <>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator
            style={[
              styles.scroller,
              { width: props.width, height: props.height }
            ]}
            contentContainerStyle={[
              styles.scrollerContent,
              { width: viewport.contentWidth, height: props.height }
            ]}
          >
            {chartSurface}
          </ScrollView>
          <StickyBarChartYAxis
            height={props.height}
            model={model}
            width={props.width}
          />
        </>
      ) : (
        chartSurface
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scroller: {
    overflow: "hidden"
  },
  scrollerContent: {
    flexGrow: 0
  }
});
