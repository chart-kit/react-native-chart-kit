import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { GestureResponderEvent, ViewProps } from "react-native";

import {
  resolveChartViewportWindow,
  sliceChartViewportData
} from "@chart-kit/core";
import {
  SvgLayer,
  SvgLine,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { useChartKitTheme } from "../../theme";
import { useChartViewportPanResponder } from "../../viewport/panResponder";
import {
  ChartViewportGesture,
  useChartViewportPinchZoom
} from "../../viewport/pinchZoom";
import {
  defaultFormatBarChartXLabel,
  defaultFormatBarChartYLabel
} from "../bar/modelUtils";
import { getFontFamilyProps } from "../line/text";
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
import { renderDefaultCandlestickTooltip } from "./tooltip";
import type { CandlestickChartProps } from "./types";

export type * from "./types";
export { buildCandlestickChartModel } from "./model";
export {
  getCandlestickChartAccessibilitySummary,
  getCandlestickChartDataTable
} from "./accessibility";
export type {
  CandlestickChartDataTable,
  CandlestickChartDataTableRow
} from "./accessibility";

export const CandlestickChart = <TData extends Record<string, unknown>>(
  props: CandlestickChartProps<TData>
) => {
  const chartKitTheme = useChartKitTheme();
  const [gestureSelectedIndex, setGestureSelectedIndex] = useState<
    number | undefined
  >(props.defaultSelectedIndex);
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
  const model = useMemo(
    () =>
      buildCandlestickChartModel({
        ...props,
        chartKitTheme,
        data: visibleData,
        dataIndexOffset: viewportWindow.startIndex
      }),
    [chartKitTheme, props, viewportWindow.startIndex, visibleData]
  );
  const {
    boxes,
    candles,
    resolvedTheme,
    showHorizontalGridLines,
    showXAxisLabels,
    showYAxisLabels,
    volumeBars,
    xLabels,
    yLabels,
    yTicks
  } = model;
  const fontProps = getFontFamilyProps(resolvedTheme.typography.fontFamily);
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
    enabled: true,
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
  const handleResponderRelease = useCallback(
    (event: GestureResponderEvent) => {
      preventBrowserSelection(event);

      const { locationX, locationY } = event.nativeEvent;
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
      preventBrowserSelection,
      props.selectedIndex
    ]
  );
  const isInteractionEnabled =
    isCandlestickChartInteractionEnabled(interactionConfig);
  const viewportPanResponder = useChartViewportPanResponder({
    dataLength: props.data.length,
    enabled: true,
    onPress: isInteractionEnabled ? handleResponderRelease : undefined,
    onViewportChange: props.onViewportChange,
    plotBounds: boxes.plot,
    preventBrowserSelection,
    viewportInteraction: props.viewportInteraction,
    viewportWindow
  });
  const responderProps: ViewProps = viewportPanResponder.panHandlers;
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
      <View
        collapsable={false}
        style={{ height: props.height, width: props.width }}
        {...responderProps}
      >
        <ChartViewportGesture gesture={viewportPinchZoom}>
          <SvgSurface height={props.height} width={props.width}>
            <SvgLayer name="background">
              <SvgRect
                fill={resolvedTheme.background}
                height={props.height}
                rx={8}
                width={props.width}
                x={0}
                y={0}
              />
              <SvgRect
                fill={resolvedTheme.plotBackground}
                height={boxes.plot.height}
                rx={6}
                width={boxes.plot.width}
                x={boxes.plot.x}
                y={boxes.plot.y}
              />
            </SvgLayer>
            <SvgLayer name="grid">
              {showHorizontalGridLines
                ? yTicks.map((tick) => {
                    const label = yLabels.find(
                      (item) => item.key === `tick-${tick}`
                    );

                    return label ? (
                      <SvgLine
                        key={`grid-y-${tick}`}
                        stroke={resolvedTheme.grid}
                        strokeOpacity={0.64}
                        strokeWidth={1}
                        x1={boxes.plot.x}
                        x2={boxes.plot.x + boxes.plot.width}
                        y1={
                          label.y -
                          resolvedTheme.typography.axisLabelSize / 2 +
                          2
                        }
                        y2={
                          label.y -
                          resolvedTheme.typography.axisLabelSize / 2 +
                          2
                        }
                      />
                    ) : null;
                  })
                : null}
            </SvgLayer>
            <SvgLayer name="data">
              {volumeBars.map((bar) => (
                <SvgRect
                  key={bar.key}
                  fill={bar.color}
                  height={bar.height}
                  opacity={bar.opacity}
                  width={bar.width}
                  x={bar.x}
                  y={bar.y}
                />
              ))}
              {candles.map((candle) => (
                <SvgLine
                  key={`wick-${candle.key}`}
                  stroke={candle.color}
                  strokeLinecap="round"
                  strokeWidth={1.5}
                  testID={`${props.testID ?? "candlestick-chart"}-wick.${
                    candle.dataIndex
                  }`}
                  x1={candle.wickX}
                  x2={candle.wickX}
                  y1={candle.highY}
                  y2={candle.lowY}
                />
              ))}
              {candles.map((candle) => (
                <SvgRect
                  key={`body-${candle.key}`}
                  fill={candle.color}
                  height={candle.bodyHeight}
                  rx={Math.min(2, candle.bodyWidth / 4)}
                  testID={`${props.testID ?? "candlestick-chart"}-candle.${
                    candle.dataIndex
                  }`}
                  width={candle.bodyWidth}
                  x={candle.bodyX}
                  y={candle.bodyY}
                  {...(selectedCandle?.dataIndex === candle.dataIndex
                    ? {
                        stroke: resolvedTheme.text,
                        strokeOpacity: 0.36,
                        strokeWidth: 1.5
                      }
                    : {})}
                />
              ))}
            </SvgLayer>
            <SvgLayer name="axes">
              {showYAxisLabels
                ? yLabels.map((label) => (
                    <SvgText
                      key={`label-y-${label.key}`}
                      fill={resolvedTheme.mutedText}
                      fontSize={resolvedTheme.typography.axisLabelSize}
                      textAnchor="end"
                      x={label.x}
                      y={label.y}
                      {...fontProps}
                    >
                      {label.text}
                    </SvgText>
                  ))
                : null}
              {showXAxisLabels
                ? xLabels.map((label) => (
                    <SvgText
                      key={`label-x-${label.index}`}
                      fill={resolvedTheme.mutedText}
                      fontSize={resolvedTheme.typography.axisLabelSize}
                      textAnchor="middle"
                      x={label.x}
                      y={label.y}
                      {...fontProps}
                    >
                      {label.text}
                    </SvgText>
                  ))
                : null}
            </SvgLayer>
            <SvgLayer name="interaction">
              {selectedCandle ? (
                <>
                  <SvgLine
                    key="candlestick-selection-line"
                    stroke={resolvedTheme.axis}
                    strokeDasharray={[4, 4]}
                    strokeOpacity={0.42}
                    strokeWidth={1}
                    x1={selectedCandle.wickX}
                    x2={selectedCandle.wickX}
                    y1={boxes.plot.y}
                    y2={boxes.plot.y + boxes.plot.height}
                  />
                  <SvgRect
                    fill={selectedCandle.color}
                    height={20}
                    rx={5}
                    width={58}
                    x={boxes.plot.x + boxes.plot.width - 58}
                    y={Math.max(
                      boxes.plot.y + 2,
                      Math.min(
                        boxes.plot.y + boxes.plot.height - 22,
                        selectedCandle.closeY - 10
                      )
                    )}
                  />
                  <SvgText
                    fill={resolvedTheme.background}
                    fontSize={resolvedTheme.typography.axisLabelSize}
                    fontWeight="600"
                    textAnchor="middle"
                    x={boxes.plot.x + boxes.plot.width - 29}
                    y={Math.max(
                      boxes.plot.y + 16,
                      Math.min(
                        boxes.plot.y + boxes.plot.height - 8,
                        selectedCandle.closeY + 4
                      )
                    )}
                    {...fontProps}
                  >
                    {formatYLabel(selectedCandle.close)}
                  </SvgText>
                </>
              ) : null}
              {tooltipModel
                ? renderDefaultCandlestickTooltip({
                    ...tooltipModel,
                    config: tooltipConfig
                  })
                : null}
            </SvgLayer>
          </SvgSurface>
        </ChartViewportGesture>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    userSelect: "none"
  }
});
