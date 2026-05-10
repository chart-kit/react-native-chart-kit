import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { GestureResponderEvent } from "react-native";

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
import {
  CandlestickCrosshairGestureHandler,
  useCandlestickCrosshairInspector
} from "./crosshairInspector";
import { getCandlestickChartAccessibilitySummary } from "./accessibility";
import {
  buildCandlestickChartSelectEvent,
  getCandlestickAtPoint,
  getCandlestickChartInteractionConfig,
  isCandlestickChartInteractionEnabled
} from "./interaction";
import { buildCandlestickChartModel } from "./model";
import {
  getCandlestickChartTooltipConfig,
  getCandlestickChartTooltipModel
} from "./tooltipModel";
import { CandlestickChartRangeSelector } from "./rangeSelector";
import { getCandlestickChartRangeSelectorConfig } from "./rangeSelectorConfig";
import { useCandlestickScrollableTap } from "./scrollableTap";
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
  const [gestureSelectedIndex, setGestureSelectedIndex] = useState<
    number | undefined
  >(props.defaultSelectedIndex);
  const [crosshairY, setCrosshairY] = useState<number | undefined>();
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
  const interactionConfig = useMemo(
    () => getCandlestickChartInteractionConfig(props.interaction),
    [props.interaction]
  );
  const selectedIndex = props.selectedIndex ?? gestureSelectedIndex;
  const selectedCandle = candles.find(
    (candle) => candle.dataIndex === selectedIndex
  );
  const isInteractionEnabled =
    isCandlestickChartInteractionEnabled(interactionConfig);
  const isTapInteraction = interactionConfig.mode === "tap";
  const isCrosshairInteraction = interactionConfig.mode === "crosshair";
  const isCrosshairLocked = isCrosshairInteraction && crosshairY !== undefined;
  const visibleSelectedCandle =
    isCrosshairInteraction && crosshairY === undefined
      ? undefined
      : selectedCandle;
  const effectiveRangeSelectorConfig = useMemo(
    () =>
      isCrosshairLocked
        ? { ...rangeSelectorConfig, interactive: false }
        : rangeSelectorConfig,
    [isCrosshairLocked, rangeSelectorConfig]
  );
  const viewportPinchZoom = useChartViewportPinchZoom({
    dataLength: props.data.length,
    enabled: !scrollViewport.scrollable,
    onViewportChange: props.onViewportChange,
    plotBounds: boxes.plot,
    viewportInteraction: props.viewportInteraction,
    viewportWindow
  });
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
        candle: visibleSelectedCandle,
        config: tooltipConfig,
        formatXLabel,
        formatYLabel
      }),
    [boxes, formatXLabel, formatYLabel, tooltipConfig, visibleSelectedCandle]
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

        if (interactionConfig.deselectOnOutsidePress) {
          interactionConfig.onDeselect?.({ reason: "outsidePress" });
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
  const viewportGesture = useChartViewportGestureHandler({
    dataLength: props.data.length,
    enabled: !scrollViewport.scrollable,
    onPress:
      !scrollViewport.scrollable && isTapInteraction
        ? handleSurfacePress
        : undefined,
    onViewportChange: props.onViewportChange,
    plotBounds: boxes.plot,
    viewportInteraction: props.viewportInteraction,
    viewportWindow
  });
  const crosshairInteraction = useCandlestickCrosshairInspector({
    activation: interactionConfig.activation,
    candles,
    deselectOnOutsidePress: interactionConfig.deselectOnOutsidePress,
    enabled: !scrollViewport.scrollable && isCrosshairInteraction,
    formatXLabel,
    formatYLabel,
    hasSelection: selectedCandle !== undefined,
    longPressDelayMs: interactionConfig.longPressDelayMs,
    longPressMoveTolerance: interactionConfig.longPressMoveTolerance,
    onDeselect: interactionConfig.onDeselect,
    onGestureEnd: interactionConfig.onGestureEnd,
    onGestureStart: interactionConfig.onGestureStart,
    onSelect: interactionConfig.onSelect,
    plot: boxes.plot,
    preventBrowserSelection,
    selectedIndexControlled: props.selectedIndex !== undefined,
    selectedIntersection:
      selectedCandle && crosshairY !== undefined
        ? { x: selectedCandle.wickX, y: crosshairY }
        : undefined,
    setCrosshairY,
    setGestureSelectedIndex
  });
  const scrollableTouchProps = useCandlestickScrollableTap({
    enabled: isInteractionEnabled && isTapInteraction,
    onPress: handleSurfacePress,
    scrollable: scrollViewport.scrollable
  });
  const mainSurfaceInteractionProps = isCrosshairInteraction
    ? crosshairInteraction.viewProps
    : scrollableTouchProps;
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
      {...mainSurfaceInteractionProps}
    >
      <ChartViewportGestureHandler gesture={viewportGesture}>
        <ChartViewportGesture gesture={viewportPinchZoom}>
          <CandlestickCrosshairGestureHandler
            gesture={crosshairInteraction.gesture}
          >
            <CandlestickChartSurface
              chartHeight={mainHeight}
              chartWidth={chartWidth}
              crosshairY={isCrosshairInteraction ? crosshairY : undefined}
              formatYLabel={formatYLabel}
              model={model}
              renderer={renderer}
              selectedCandle={visibleSelectedCandle}
              selectionPriceLabel={props.selectionPriceLabel !== false}
              testID={props.testID}
              tooltipConfig={tooltipConfig}
              tooltipModel={tooltipModel}
            />
          </CandlestickCrosshairGestureHandler>
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
        config={effectiveRangeSelectorConfig}
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
