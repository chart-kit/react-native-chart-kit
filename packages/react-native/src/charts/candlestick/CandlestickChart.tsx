import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type {
  GestureResponderEvent,
  NativeSyntheticEvent,
  NativeTouchEvent
} from "react-native";

import {
  resolveChartViewport,
  resolveChartViewportInitialOffset,
  resolveChartViewportWindow,
  sliceChartViewportData
} from "@chart-kit/core";

import { useChartKitTheme } from "../../theme";
import {
  ChartViewportGestureHandler,
  useChartViewportGestureHandler
} from "../../viewport/gestureHandler";
import {
  ChartViewportGesture,
  useChartViewportPinchZoom
} from "../../viewport/pinchZoom";
import {
  defaultFormatBarChartXLabel,
  defaultFormatBarChartYLabel
} from "../bar/modelUtils";
import { getCandlestickChartAccessibilitySummary } from "./accessibility";
import {
  buildCandlestickChartSelectEvent,
  getCandlestickAtPoint,
  getCandlestickChartInteractionConfig,
  isCandlestickChartScrollableTap,
  isCandlestickChartInteractionEnabled
} from "./interaction";
import { buildCandlestickChartModel } from "./model";
import {
  getCandlestickChartTooltipConfig,
  getCandlestickChartTooltipModel
} from "./tooltipModel";
import { CandlestickChartRangeSelector } from "./rangeSelector";
import { getCandlestickChartRangeSelectorConfig } from "./rangeSelectorConfig";
import { CandlestickChartSurface } from "./surface";
import type { CandlestickChartProps } from "./types";

export type * from "./types";
export { buildCandlestickChartModel } from "./model";
export {
  getCandlestickChartAccessibilitySummary,
  getCandlestickChartDataTable,
  getCandlestickChartFinancialNarrative
} from "./accessibility";
export { getCandlestickEmergencyClosureSessions } from "./emergencyClosures";
export type {
  CandlestickChartAccessibilityInput,
  CandlestickChartDataTable,
  CandlestickChartDataTableRow,
  CandlestickChartFinancialNarrative,
  CandlestickChartFinancialNarrativeInput
} from "./accessibility";
export type {
  CandlestickChartEmergencyClosureInput,
  CandlestickChartEmergencyClosureOptions
} from "./emergencyClosures";

export const CandlestickChart = <TData extends Record<string, unknown>>(
  props: CandlestickChartProps<TData>
) => {
  const chartKitTheme = useChartKitTheme();
  const renderer = props.renderer ?? chartKitTheme.renderer;
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollableTapRef = useRef<
    | {
        maxDistance: number;
        startTime: number;
        startX: number;
        startY: number;
      }
    | undefined
  >(undefined);
  const [gestureSelectedIndex, setGestureSelectedIndex] = useState<
    number | undefined
  >(props.defaultSelectedIndex);
  const rangeSelectorConfig = useMemo(
    () => getCandlestickChartRangeSelectorConfig(props.rangeSelector),
    [props.rangeSelector]
  );
  const isRangeSelectorVisible =
    rangeSelectorConfig.visible && props.data.length > 1;
  const mainHeight = isRangeSelectorVisible
    ? Math.max(
        120,
        props.height - rangeSelectorConfig.height - rangeSelectorConfig.gap
      )
    : props.height;
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
  const visibleData = useMemo(
    () => sliceChartViewportData(props.data, viewportWindow),
    [props.data, viewportWindow]
  );
  const isMainScrollable = props.scrollable === true && !isRangeSelectorVisible;
  const scrollViewport = useMemo(
    () =>
      resolveChartViewport({
        itemCount: visibleData.length,
        scrollable: isMainScrollable,
        viewportWidth: props.width,
        visiblePoints: props.visiblePoints
      }),
    [isMainScrollable, props.visiblePoints, props.width, visibleData.length]
  );
  const initialScrollOffset = useMemo(
    () =>
      resolveChartViewportInitialOffset({
        initialIndex: props.initialIndex,
        viewport: scrollViewport
      }),
    [props.initialIndex, scrollViewport]
  );
  const chartWidth = scrollViewport.contentWidth;
  const model = useMemo(
    () =>
      buildCandlestickChartModel({
        ...props,
        chartKitTheme,
        data: visibleData,
        height: mainHeight,
        dataIndexOffset: viewportWindow.startIndex,
        width: chartWidth
      }),
    [
      chartKitTheme,
      chartWidth,
      mainHeight,
      props,
      viewportWindow.startIndex,
      visibleData
    ]
  );
  const overviewModel = useMemo(
    () =>
      buildCandlestickChartModel({
        ...props,
        chartKitTheme,
        data: props.data,
        height: rangeSelectorConfig.height,
        showXAxisLabels: false,
        showYAxisLabels: false,
        yTickCount: 2
      }),
    [chartKitTheme, props, rangeSelectorConfig.height]
  );
  const { boxes, candles, resolvedTheme } = model;
  const formatXLabel = props.formatXLabel ?? defaultFormatBarChartXLabel;
  const formatYLabel = props.formatYLabel ?? defaultFormatBarChartYLabel;
  const preventBrowserSelection = useCallback(
    (event: GestureResponderEvent) => {
      event.preventDefault();
    },
    []
  );
  const viewportPinchZoom = useChartViewportPinchZoom({
    dataLength: props.data.length,
    enabled: !scrollViewport.scrollable,
    onViewportChange: props.onViewportChange,
    plotBounds: boxes.plot,
    viewportInteraction: props.viewportInteraction,
    viewportWindow
  });
  const interactionConfig = useMemo(
    () => getCandlestickChartInteractionConfig(props.interaction),
    [props.interaction]
  );
  const selectedIndex = props.selectedIndex ?? gestureSelectedIndex;
  const selectedCandle = candles.find(
    (candle) => candle.dataIndex === selectedIndex
  );
  const tooltipConfig = useMemo(
    () =>
      getCandlestickChartTooltipConfig({
        themeTooltip: resolvedTheme.tooltip,
        tooltip: props.tooltip
      }),
    [props.tooltip, resolvedTheme.tooltip]
  );
  const tooltipModel = useMemo(
    () =>
      getCandlestickChartTooltipModel({
        boxes,
        candle: selectedCandle,
        config: tooltipConfig,
        formatXLabel,
        formatYLabel
      }),
    [boxes, formatXLabel, formatYLabel, selectedCandle, tooltipConfig]
  );
  const handleSurfacePress = useCallback(
    ({ locationX, locationY }: { locationX: number; locationY: number }) => {
      const tappedCandle = getCandlestickAtPoint({
        candles,
        locationX,
        locationY
      });

      if (!tappedCandle) {
        if (
          props.selectedIndex === undefined &&
          interactionConfig.deselectOnOutsidePress
        ) {
          setGestureSelectedIndex(undefined);
        }

        return;
      }

      if (props.selectedIndex === undefined) {
        setGestureSelectedIndex(tappedCandle.dataIndex);
      }

      const selectEvent = buildCandlestickChartSelectEvent({
        candle: tappedCandle,
        formatXLabel,
        formatYLabel
      });

      if (selectEvent) {
        interactionConfig.onSelect?.(selectEvent);
      }
    },
    [
      candles,
      formatXLabel,
      formatYLabel,
      interactionConfig,
      props.selectedIndex
    ]
  );
  const isInteractionEnabled =
    isCandlestickChartInteractionEnabled(interactionConfig);
  const viewportGesture = useChartViewportGestureHandler({
    dataLength: props.data.length,
    enabled: !scrollViewport.scrollable,
    onPress:
      !scrollViewport.scrollable && isInteractionEnabled
        ? handleSurfacePress
        : undefined,
    onViewportChange: props.onViewportChange,
    plotBounds: boxes.plot,
    viewportInteraction: props.viewportInteraction,
    viewportWindow
  });
  const handleScrollableTouchStart = useCallback(
    (event: NativeSyntheticEvent<NativeTouchEvent>) => {
      if (!scrollViewport.scrollable || !isInteractionEnabled) {
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
    [isInteractionEnabled, scrollViewport.scrollable]
  );
  const handleScrollableTouchMove = useCallback(
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
  const handleScrollableTouchEnd = useCallback(
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

      handleSurfacePress({ locationX, locationY });
    },
    [handleSurfacePress]
  );
  const handleScrollableTouchCancel = useCallback(() => {
    scrollableTapRef.current = undefined;
  }, []);
  const scrollableTouchProps =
    scrollViewport.scrollable && isInteractionEnabled
      ? {
          onTouchCancel: handleScrollableTouchCancel,
          onTouchEnd: handleScrollableTouchEnd,
          onTouchMove: handleScrollableTouchMove,
          onTouchStart: handleScrollableTouchStart
        }
      : {};
  const accessibilityLabel =
    props.accessibilityLabel ??
    getCandlestickChartAccessibilitySummary({
      closeKey: props.closeKey,
      data: props.data,
      formatXLabel: props.formatXLabel,
      formatYLabel: props.formatYLabel,
      highKey: props.highKey,
      lowKey: props.lowKey,
      openKey: props.openKey,
      xKey: props.xKey
    });
  const mainSurface = (
    <View
      collapsable={false}
      style={{ height: mainHeight, width: chartWidth }}
      {...scrollableTouchProps}
    >
      <ChartViewportGestureHandler gesture={viewportGesture}>
        <ChartViewportGesture gesture={viewportPinchZoom}>
          <CandlestickChartSurface
            chartHeight={mainHeight}
            chartWidth={chartWidth}
            formatYLabel={formatYLabel}
            model={model}
            renderer={renderer}
            selectedCandle={selectedCandle}
            selectionPriceLabel={props.selectionPriceLabel !== false}
            testID={props.testID}
            tooltipConfig={tooltipConfig}
            tooltipModel={tooltipModel}
          />
        </ChartViewportGesture>
      </ChartViewportGestureHandler>
    </View>
  );

  useEffect(() => {
    if (!scrollViewport.scrollable) {
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
  }, [initialScrollOffset, scrollViewport.scrollable]);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      collapsable={false}
      style={[
        styles.container,
        {
          backgroundColor: resolvedTheme.background,
          height: props.height,
          width: props.width
        }
      ]}
      testID={props.testID}
    >
      {scrollViewport.scrollable ? (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator
          style={[styles.scroller, { height: mainHeight, width: props.width }]}
          contentContainerStyle={[
            styles.scrollerContent,
            { height: mainHeight, width: chartWidth }
          ]}
          scrollEventThrottle={16}
        >
          {mainSurface}
        </ScrollView>
      ) : (
        mainSurface
      )}
      <CandlestickChartRangeSelector
        config={rangeSelectorConfig}
        dataLength={props.data.length}
        isVisible={isRangeSelectorVisible}
        model={overviewModel}
        onViewportChange={props.onViewportChange}
        preventBrowserSelection={preventBrowserSelection}
        renderer={renderer}
        testID={props.testID}
        viewportWindow={viewportWindow}
        width={props.width}
      />
    </View>
  );
};

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
  }
});
