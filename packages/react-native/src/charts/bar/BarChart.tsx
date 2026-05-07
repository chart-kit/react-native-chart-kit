import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { GestureResponderEvent, ViewProps } from "react-native";

import { useChartKitTheme } from "../../theme";
import { useScopedChartSelection } from "../../selection/ChartSelectionProvider";
import { getBarChartAccessibilitySummary } from "./accessibility";
import {
  BarChartSurface,
  BarChartTooltipOverlay,
  StickyBarChartYAxis
} from "./BarChartSurface";
import {
  buildBarChartSelectEvent,
  getBarChartBarAtPoint,
  getBarChartBarKey,
  getBarChartInteractionConfig,
  isBarChartInteractionEnabled
} from "./interaction";
import { buildBarChartModel } from "./model";
import { getBarChartTooltipConfig } from "./options";
import {
  getSafeBarChartContentWidth,
  getSafeBarChartRenderer
} from "./rendererSafety";
import { getBarChartTooltipModel } from "./tooltip";
import {
  resolveBarChartViewport,
  resolveBarChartViewportInitialOffset
} from "./viewport";
import type { BarChartProps } from "./types";

export type * from "./types";
export {
  getBarChartAccessibilitySummary,
  getBarChartDataTable
} from "./accessibility";
export type {
  BarChartDataTable,
  BarChartDataTableColumn,
  BarChartDataTableRow
} from "./accessibility";

export const BarChart = <TData extends Record<string, unknown>>(
  props: BarChartProps<TData>
) => {
  const generatedChartId = useId().replace(/:/g, "");
  const scopedChartId = props.id ?? generatedChartId;
  const chartKitTheme = useChartKitTheme();
  const renderer = props.renderer ?? chartKitTheme.renderer;
  const scrollViewRef = useRef<ScrollView>(null);
  const interactionConfig = useMemo(
    () => getBarChartInteractionConfig(props.interaction),
    [props.interaction]
  );
  const [gestureSelectedBarKey, setGestureSelectedBarKey] = useState<
    string | undefined
  >(() => getBarChartBarKey(props.defaultSelectedBar));
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
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
  const safeContentWidth = getSafeBarChartContentWidth({
    contentWidth: viewport.contentWidth,
    renderer,
    scrollable: viewport.scrollable
  });
  const safeViewport = useMemo(
    () => ({
      ...viewport,
      contentWidth: safeContentWidth,
      maxOffset: Math.max(0, safeContentWidth - viewport.viewportWidth),
      scrollable:
        viewport.scrollable && safeContentWidth > viewport.viewportWidth
    }),
    [safeContentWidth, viewport]
  );
  const initialScrollOffset = useMemo(
    () =>
      resolveBarChartViewportInitialOffset({
        initialIndex: props.initialIndex,
        viewport: safeViewport
      }),
    [props.initialIndex, safeViewport]
  );
  const model = useMemo(
    () =>
      buildBarChartModel({
        ...props,
        chartKitTheme,
        width: safeViewport.contentWidth
      }),
    [chartKitTheme, props, safeViewport.contentWidth]
  );
  const { bars, boxes, resolvedTheme } = model;
  const safeRenderer = getSafeBarChartRenderer({
    contentWidth: viewport.contentWidth,
    renderer,
    scrollable: viewport.scrollable
  });
  const scrollInitialOffset =
    safeViewport.scrollable && props.initialIndex === "end"
      ? Math.max(0, initialScrollOffset - boxes.plot.x * 0.66)
      : initialScrollOffset;
  const barRadius = Math.max(0, props.barRadius ?? 5);
  const controlledSelectedBarKey = getBarChartBarKey(props.selectedBar);
  const selectedBarKey = controlledSelectedBarKey ?? gestureSelectedBarKey;
  const clearGestureSelection = useCallback(
    (reason: "outsidePress" | "programmatic") => {
      if (props.selectedBar === undefined) {
        setGestureSelectedBarKey(undefined);
      }

      interactionConfig.onDeselect?.({ reason });
    },
    [interactionConfig, props.selectedBar]
  );
  const clearSelectionFromScope = useCallback(
    (reason: "outsidePress" | "programmatic" | "scopeChange") => {
      if (reason === "scopeChange") {
        if (props.selectedBar === undefined) {
          setGestureSelectedBarKey(undefined);
        }

        return;
      }

      clearGestureSelection(reason);
    },
    [clearGestureSelection, props.selectedBar]
  );
  const scopedSelection = useScopedChartSelection({
    chartId: scopedChartId,
    controlled: props.selectedBar !== undefined,
    hasSelection: selectedBarKey !== undefined,
    onClear: clearSelectionFromScope
  });
  const clearScopedGestureSelection = useCallback(
    (reason: "outsidePress" | "programmatic") => {
      clearGestureSelection(reason);

      if (reason !== "programmatic") {
        scopedSelection.dismissSelection?.(reason);
      }
    },
    [clearGestureSelection, scopedSelection]
  );
  const selectedBar = bars.find((bar) => bar.key === selectedBarKey);
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
          clearScopedGestureSelection("outsidePress");
        }

        return;
      }

      if (props.selectedBar === undefined) {
        setGestureSelectedBarKey(tappedBar.key);
      }

      scopedSelection.selectChart();
      const selectEvent = buildBarChartSelectEvent(tappedBar);

      if (selectEvent) {
        interactionConfig.onSelect?.(selectEvent);
      }
    },
    [
      bars,
      clearScopedGestureSelection,
      interactionConfig,
      props.selectedBar,
      scopedSelection
    ]
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
    getBarChartAccessibilitySummary({
      data: props.data,
      formatXLabel: props.formatXLabel,
      formatYLabel: props.formatYLabel,
      series: props.series,
      xKey: props.xKey,
      yKey: props.yKey,
      yKeys: props.yKeys
    });
  const chartSurface = (
    <BarChartSurface
      barRadius={barRadius}
      height={props.height}
      model={model}
      responderProps={responderProps}
      renderBar={props.renderBar}
      renderer={safeRenderer}
      selectedBarKey={selectedBarKey}
      selectionAnimation={props.selectionAnimation}
      showYAxis={!safeViewport.scrollable}
      width={safeViewport.contentWidth}
    />
  );
  const tooltipOverlay = (
    <BarChartTooltipOverlay
      height={props.height}
      model={model}
      tooltipConfig={tooltipConfig}
      tooltipModel={tooltipModel}
      viewportOffsetX={safeViewport.scrollable ? scrollOffsetX : 0}
      width={props.width}
      renderer={safeRenderer}
    />
  );

  useEffect(() => {
    if (!safeViewport.scrollable) {
      const frame = requestAnimationFrame(() => {
        setScrollOffsetX(0);
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    const frame = requestAnimationFrame(() => {
      setScrollOffsetX(scrollInitialOffset);
      scrollViewRef.current?.scrollTo({
        animated: false,
        x: scrollInitialOffset
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [safeViewport.scrollable, scrollInitialOffset]);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={{ width: props.width, height: props.height }}
      testID={props.testID}
    >
      {safeViewport.scrollable ? (
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
              { width: safeViewport.contentWidth, height: props.height }
            ]}
            onScroll={(event) => {
              setScrollOffsetX(event.nativeEvent.contentOffset.x);
            }}
            scrollEventThrottle={16}
          >
            {chartSurface}
          </ScrollView>
          <StickyBarChartYAxis
            height={props.height}
            model={model}
            renderer={safeRenderer}
            width={props.width}
          />
          {tooltipOverlay}
        </>
      ) : (
        <>
          {chartSurface}
          {tooltipOverlay}
        </>
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
