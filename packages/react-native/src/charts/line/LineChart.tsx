import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type {
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent
} from "react-native";

import {
  resolveChartViewport,
  resolveChartViewportInitialOffset,
  resolveChartViewportWindow,
  sliceChartViewportData
} from "@chart-kit/core";
import type { ProjectedLinePoint } from "@chart-kit/core";

import { useChartKitTheme } from "../../theme";
import { useLineChartAccessibilityLabel } from "./accessibility";
import { LineChartSurface, StickyYAxis } from "./ChartSurface";
import {
  buildLineChartSelectEvent,
  getLineChartInteractionConfig,
  getLineChartVisibleInteractionBounds,
  getNearestLineChartInteractionIndex,
  isLineChartInteractionEnabled,
  isLineChartInteractionInBounds,
  normalizeLineChartSelectedIndex,
  type LineChartDeselectEvent
} from "./interaction";
import { getSelectedLineSeries } from "./selection";
import { useLineChartResponderProps } from "./responders";
import {
  getRangeSelectorConfig,
  LineChartRangeSelector
} from "./rangeSelector";
import { useAnimatedTooltipModel } from "./useAnimatedTooltipModel";
import { useLineChartYAxisLabels } from "./useAnimatedYAxisLabels";
import { useChartModel } from "./useChartModel";
import { useLineChartViewportPan } from "./viewportInteraction";
import {
  LineChartViewportGesture,
  useLineChartViewportPinchZoom
} from "./viewportPinchZoom";
import { clampLineChartTooltipToViewport } from "./tooltip";
import type { LineChartProps } from "./types";

export type * from "./types";
export {
  getLineChartAccessibilitySummary,
  getLineChartDataTable
} from "./accessibility";
export type {
  LineChartDataTable,
  LineChartDataTableColumn,
  LineChartDataTableRow
} from "./accessibility";

export const LineChart = <TData extends Record<string, unknown>>(
  props: LineChartProps<TData>
) => {
  const chartId = useId().replace(/:/g, "");
  const chartKitTheme = useChartKitTheme();
  const { onViewportChange } = props;
  const dataLength = props.data.length;
  const accessibilityLabel = useLineChartAccessibilityLabel(props);
  const scrollViewRef = useRef<ScrollView>(null);
  const interactionConfig = useMemo(
    () => getLineChartInteractionConfig(props.interaction),
    [props.interaction]
  );
  const [gestureSelectedIndex, setGestureSelectedIndex] = useState<
    number | undefined
  >(() => normalizeLineChartSelectedIndex(props.defaultSelectedIndex));
  const effectiveSelectedIndex = props.selectedIndex ?? gestureSelectedIndex;
  const rangeSelectorConfig = useMemo(
    () => getRangeSelectorConfig(props.rangeSelector),
    [props.rangeSelector]
  );
  const viewportWindow = useMemo(
    () =>
      resolveChartViewportWindow({
        itemCount: props.data.length,
        startIndex: props.viewport?.startIndex,
        endIndex: props.viewport?.endIndex,
        visiblePoints: props.viewport?.visiblePoints,
        initialIndex: props.viewport?.initialIndex
      }),
    [
      props.data.length,
      props.viewport?.endIndex,
      props.viewport?.initialIndex,
      props.viewport?.startIndex,
      props.viewport?.visiblePoints
    ]
  );
  const mainData = useMemo(
    () => sliceChartViewportData(props.data, viewportWindow),
    [props.data, viewportWindow]
  );
  const isRangeSelectorVisible =
    rangeSelectorConfig.visible && props.data.length > 1;
  const mainHeight = isRangeSelectorVisible
    ? Math.max(
        120,
        props.height - rangeSelectorConfig.height - rangeSelectorConfig.gap
      )
    : props.height;
  const viewport = useMemo(
    () =>
      resolveChartViewport({
        itemCount: mainData.length,
        scrollable: props.scrollable,
        viewportWidth: props.width,
        visiblePoints: props.visiblePoints
      }),
    [mainData.length, props.scrollable, props.visiblePoints, props.width]
  );
  const initialScrollOffset = useMemo(
    () =>
      resolveChartViewportInitialOffset({
        initialIndex: props.initialIndex,
        viewport
      }),
    [props.initialIndex, viewport]
  );
  const [scrollOffset, setScrollOffset] = useState(initialScrollOffset);
  const chartProps =
    effectiveSelectedIndex !== undefined
      ? {
          ...props,
          data: mainData,
          height: mainHeight,
          width: viewport.contentWidth,
          selectedIndex: effectiveSelectedIndex
        }
      : {
          ...props,
          data: mainData,
          height: mainHeight,
          width: viewport.contentWidth
        };
  const model = useChartModel({
    ...chartProps,
    chartKitTheme,
    dataIndexOffset: viewportWindow.startIndex,
    stableYAxisData: props.data
  });
  const {
    activeDot: _overviewActiveDot,
    crosshair: _overviewCrosshair,
    defaultSelectedIndex: _overviewDefaultSelectedIndex,
    initialIndex: _overviewInitialIndex,
    interaction: _overviewInteraction,
    legend: _overviewLegend,
    rangeSelector: _overviewRangeSelector,
    selectedIndex: _overviewSelectedIndex,
    scrollable: _overviewScrollable,
    tooltip: _overviewTooltip,
    viewport: _overviewViewport,
    visiblePoints: _overviewVisiblePoints,
    ...overviewBaseProps
  } = props;
  const overviewModel = useChartModel({
    ...overviewBaseProps,
    activeDot: false,
    chartKitTheme,
    crosshair: false,
    height: rangeSelectorConfig.height,
    labelStrategy: "hide",
    legend: false,
    showDots: false,
    tooltip: false,
    width: props.width
  });
  const { boxes, geometries, interactionPoints, selectionModel, formatYLabel } =
    model;
  const isInteractionEnabled = isLineChartInteractionEnabled(interactionConfig);
  const animatedYAxisLabels = useLineChartYAxisLabels(
    model,
    props.axisLabelAnimation
  );

  useEffect(() => {
    if (!viewport.scrollable) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setScrollOffset(initialScrollOffset);
      scrollViewRef.current?.scrollTo({
        animated: false,
        x: initialScrollOffset
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [initialScrollOffset, viewport.scrollable]);
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollOffset(event.nativeEvent.contentOffset.x);
    },
    []
  );

  const preventBrowserSelection = useCallback(
    (event: GestureResponderEvent) => {
      event.preventDefault();
    },
    []
  );
  const viewportPan = useLineChartViewportPan({
    dataLength,
    enabled: !viewport.scrollable,
    onViewportChange,
    plotBounds: boxes.plot,
    preventBrowserSelection,
    viewportInteraction: props.viewportInteraction,
    viewportWindow
  });
  const viewportPinchZoom = useLineChartViewportPinchZoom({
    dataLength,
    enabled: !viewport.scrollable,
    onViewportChange,
    plotBounds: boxes.plot,
    viewportInteraction: props.viewportInteraction,
    viewportWindow
  });
  const isResponderEventInPlot = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;

      return isLineChartInteractionInBounds({
        bounds: boxes.plot,
        locationX,
        locationY
      });
    },
    [boxes.plot]
  );
  const visibleInteractionBounds = useMemo(
    () =>
      getLineChartVisibleInteractionBounds({
        bounds: boxes.plot,
        scrollable: viewport.scrollable,
        viewportWidth: props.width
      }),
    [boxes.plot, props.width, viewport.scrollable]
  );
  const clearGestureSelection = useCallback(
    (event: LineChartDeselectEvent) => {
      if (props.selectedIndex === undefined) {
        setGestureSelectedIndex(undefined);
      }

      interactionConfig.onDeselect?.(event);
    },
    [interactionConfig, props.selectedIndex]
  );
  const handleInteractionEvent = useCallback(
    (event: GestureResponderEvent) => {
      preventBrowserSelection(event);

      const { locationX } = event.nativeEvent;
      const selectedDataIndex = getNearestLineChartInteractionIndex({
        locationX,
        points: interactionPoints
      });

      if (selectedDataIndex === undefined) {
        return;
      }

      const selectedSeries = getSelectedLineSeries({
        activeDot: props.activeDot,
        formatYLabel,
        geometries,
        selectedDataIndex
      });
      const selectEvent = buildLineChartSelectEvent<
        TData,
        ProjectedLinePoint<TData>
      >({
        interactionPoints,
        selectedDataIndex,
        selectedSeries
      });

      if (!selectEvent) {
        return;
      }

      if (
        props.selectedIndex === undefined &&
        interactionConfig.selectionPersistence !== "none"
      ) {
        setGestureSelectedIndex(selectedDataIndex);
      }

      interactionConfig.onSelect?.(selectEvent);
    },
    [
      formatYLabel,
      geometries,
      interactionConfig,
      interactionPoints,
      props.activeDot,
      props.selectedIndex,
      preventBrowserSelection
    ]
  );
  const responderProps = useLineChartResponderProps({
    clearGestureSelection,
    handleInteractionEvent,
    interactionConfig,
    isInteractionEnabled,
    isResponderEventInPlot,
    preventBrowserSelection,
    viewportPan
  });
  const outsidePressSurfaceResponderProps =
    isInteractionEnabled && interactionConfig.deselectOnOutsidePress
      ? {
          onStartShouldSetResponder: () => true,
          onResponderGrant: (event: GestureResponderEvent) => {
            preventBrowserSelection(event);
            clearGestureSelection({ reason: "outsidePress" });
          }
        }
      : {};
  const outsidePressSurfaces =
    isInteractionEnabled && interactionConfig.deselectOnOutsidePress
      ? [
          {
            key: "top",
            height: visibleInteractionBounds.y,
            left: 0,
            top: 0,
            width: props.width
          },
          {
            key: "left",
            height: visibleInteractionBounds.height,
            left: 0,
            top: visibleInteractionBounds.y,
            width: visibleInteractionBounds.x
          },
          {
            key: "right",
            height: visibleInteractionBounds.height,
            left: visibleInteractionBounds.x + visibleInteractionBounds.width,
            top: visibleInteractionBounds.y,
            width:
              props.width -
              (visibleInteractionBounds.x + visibleInteractionBounds.width)
          },
          {
            key: "bottom",
            height:
              mainHeight -
              (visibleInteractionBounds.y + visibleInteractionBounds.height),
            left: 0,
            top: visibleInteractionBounds.y + visibleInteractionBounds.height,
            width: props.width
          }
        ].filter((surface) => surface.width > 0 && surface.height > 0)
      : [];
  const animatedTooltip = useAnimatedTooltipModel(selectionModel?.tooltip);
  const displayTooltip =
    animatedTooltip && viewport.scrollable
      ? clampLineChartTooltipToViewport(animatedTooltip, {
          leftInset: boxes.plot.x + 4,
          scrollOffset,
          viewportWidth: props.width
        })
      : animatedTooltip;
  const chartWidth = viewport.contentWidth;
  const xAxisLabelFadeY = boxes.plot.y + boxes.plot.height;
  const scrollStartFadeId = `${chartId}-scroll-start-fade`;
  const mainSurface = (
    <LineChartSurface
      animatedTooltip={displayTooltip}
      chartWidth={chartWidth}
      isScrollable={viewport.scrollable}
      mainHeight={mainHeight}
      model={model}
      props={props}
      responderProps={responderProps}
      yAxisLabels={animatedYAxisLabels}
    />
  );

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      testID={props.testID}
      style={[styles.container, { width: props.width, height: props.height }]}
    >
      <View style={{ width: props.width, height: mainHeight }}>
        {viewport.scrollable ? (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator
            style={[
              styles.scroller,
              { width: props.width, height: mainHeight }
            ]}
            contentContainerStyle={[
              styles.scrollerContent,
              { width: chartWidth, height: mainHeight }
            ]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {mainSurface}
          </ScrollView>
        ) : (
          <LineChartViewportGesture gesture={viewportPinchZoom}>
            {mainSurface}
          </LineChartViewportGesture>
        )}
        {viewport.scrollable ? (
          <StickyYAxis
            fadeHeight={Math.max(0, mainHeight - xAxisLabelFadeY)}
            fadeWidth={Math.min(12, Math.max(0, props.width - boxes.plot.x))}
            fadeY={xAxisLabelFadeY}
            gradientId={scrollStartFadeId}
            mainHeight={mainHeight}
            model={model}
            width={props.width}
            yAxisLabels={animatedYAxisLabels}
          />
        ) : null}
        {outsidePressSurfaces.map((surface) => (
          <View
            key={`outside-press-${surface.key}`}
            style={[
              styles.outsidePressSurface,
              {
                height: surface.height,
                left: surface.left,
                top: surface.top,
                width: surface.width
              }
            ]}
            {...outsidePressSurfaceResponderProps}
          />
        ))}
      </View>
      <LineChartRangeSelector
        config={rangeSelectorConfig}
        dataLength={dataLength}
        isVisible={isRangeSelectorVisible}
        model={overviewModel}
        onViewportChange={onViewportChange}
        preventBrowserSelection={preventBrowserSelection}
        testID={props.testID}
        viewportWindow={viewportWindow}
        width={props.width}
      />
    </View>
  );
};

export const AreaChart = <TData extends Record<string, unknown>>(
  props: LineChartProps<TData>
) => <LineChart {...props} area />;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    userSelect: "none"
  },
  scroller: {
    overflow: "hidden"
  },
  scrollerContent: {
    flexGrow: 0
  },
  outsidePressSurface: {
    position: "absolute"
  }
});
