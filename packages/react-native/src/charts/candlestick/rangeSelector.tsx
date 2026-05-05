import { useCallback, useRef } from "react";
import { View } from "react-native";
import type { GestureResponderEvent } from "react-native";

import {
  resolveChartViewportWindowFromHandlePosition,
  resolveChartViewportWindowFromPosition,
  type ResolvedChartViewportWindow
} from "@chart-kit/core";
import {
  SvgGroup,
  SvgLayer,
  SvgLine,
  SvgRect,
  SvgSurface
} from "@chart-kit/svg-renderer";

import { clamp } from "../line/utils";
import type {
  CandlestickChartModel,
  CandlestickChartProps,
  CandlestickChartRangeSelectorInteraction
} from "./types";
import type { CandlestickChartRangeSelectorResolvedConfig } from "./rangeSelectorConfig";

export const CandlestickChartRangeSelector = <
  TData extends Record<string, unknown>
>({
  config,
  dataLength,
  isVisible,
  model,
  onViewportChange,
  preventBrowserSelection,
  testID,
  viewportWindow,
  width
}: {
  config: CandlestickChartRangeSelectorResolvedConfig;
  dataLength: number;
  isVisible: boolean;
  model: CandlestickChartModel<TData>;
  onViewportChange: CandlestickChartProps<TData>["onViewportChange"];
  preventBrowserSelection: (event: GestureResponderEvent) => void;
  testID?: string | undefined;
  viewportWindow: ResolvedChartViewportWindow;
  width: number;
}) => {
  const interactionRef =
    useRef<CandlestickChartRangeSelectorInteraction>("move");
  const firstCandle = model.candles[0];
  const lastCandle = model.candles[model.candles.length - 1];
  const rangeStartCandle =
    model.candles.find(
      (candle) => candle.dataIndex === viewportWindow.startIndex
    ) ?? firstCandle;
  const rangeEndCandle =
    model.candles.find(
      (candle) => candle.dataIndex === Math.max(0, viewportWindow.endIndex - 1)
    ) ?? lastCandle;
  const plotX = model.boxes.plot.x;
  const plotY = model.boxes.plot.y;
  const plotWidth = model.boxes.plot.width;
  const plotHeight = model.boxes.plot.height;
  const windowX = rangeStartCandle?.bodyX ?? plotX;
  const windowEndX = rangeEndCandle
    ? rangeEndCandle.bodyX + rangeEndCandle.bodyWidth
    : plotX + plotWidth;
  const windowWidth = Math.max(10, windowEndX - windowX);
  const emitViewportChange = useCallback(
    (
      nextWindow: ResolvedChartViewportWindow,
      interaction: CandlestickChartRangeSelectorInteraction
    ) => {
      onViewportChange?.({
        viewport: {
          startIndex: nextWindow.startIndex,
          endIndex: nextWindow.endIndex
        },
        startIndex: nextWindow.startIndex,
        endIndex: nextWindow.endIndex,
        visibleCount: nextWindow.visibleCount,
        itemCount: nextWindow.itemCount,
        isWindowed: nextWindow.isWindowed,
        source: "rangeSelector",
        interaction
      });
    },
    [onViewportChange]
  );
  const isInteractive =
    isVisible && config.interactive && onViewportChange !== undefined;
  const getInteraction = useCallback(
    (locationX: number): CandlestickChartRangeSelectorInteraction => {
      const handleHitSlop = Math.max(
        config.handleHitSlop,
        config.handleWidth * 2
      );
      const startDistance = Math.abs(locationX - windowX);
      const endDistance = Math.abs(locationX - windowEndX);

      if (startDistance <= handleHitSlop && startDistance <= endDistance) {
        return "resizeStart";
      }

      if (endDistance <= handleHitSlop) {
        return "resizeEnd";
      }

      return "move";
    },
    [config.handleHitSlop, config.handleWidth, windowEndX, windowX]
  );
  const handleInteraction = useCallback(
    (
      event: GestureResponderEvent,
      interaction: CandlestickChartRangeSelectorInteraction
    ) => {
      preventBrowserSelection(event);

      if (!isInteractive) {
        return;
      }

      const nextWindow =
        interaction === "move"
          ? resolveChartViewportWindowFromPosition({
              itemCount: dataLength,
              locationX: event.nativeEvent.locationX,
              plotWidth,
              plotX,
              visibleCount: viewportWindow.visibleCount
            })
          : resolveChartViewportWindowFromHandlePosition({
              currentWindow: viewportWindow,
              handle: interaction === "resizeStart" ? "start" : "end",
              itemCount: dataLength,
              locationX: event.nativeEvent.locationX,
              minVisibleCount: config.minVisiblePoints,
              plotWidth,
              plotX
            });

      if (
        nextWindow.startIndex === viewportWindow.startIndex &&
        nextWindow.endIndex === viewportWindow.endIndex
      ) {
        return;
      }

      emitViewportChange(nextWindow, interaction);
    },
    [
      config.minVisiblePoints,
      dataLength,
      emitViewportChange,
      isInteractive,
      plotWidth,
      plotX,
      preventBrowserSelection,
      viewportWindow
    ]
  );
  const responderProps = isInteractive
    ? {
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onResponderGrant: (event: GestureResponderEvent) => {
          const interaction = getInteraction(event.nativeEvent.locationX);

          interactionRef.current = interaction;
          config.onGestureStart?.({ interaction });
          handleInteraction(event, interaction);
        },
        onResponderMove: (event: GestureResponderEvent) => {
          handleInteraction(event, interactionRef.current);
        },
        onResponderRelease: () => {
          config.onGestureEnd?.({ interaction: interactionRef.current });
          interactionRef.current = "move";
        },
        onResponderTerminate: () => {
          config.onGestureEnd?.({ interaction: interactionRef.current });
          interactionRef.current = "move";
        },
        onResponderTerminationRequest: () => false
      }
    : {};

  if (!isVisible) {
    return null;
  }

  const handleWidth = config.handleWidth;
  const handleColor =
    config.handleColor ?? config.windowStroke ?? model.resolvedTheme.axis;
  const handleMinX = plotX;
  const handleMaxX = plotX + plotWidth - handleWidth;
  const startHandleX = clamp(windowX - handleWidth / 2, handleMinX, handleMaxX);
  const endHandleX = clamp(
    windowEndX - handleWidth / 2,
    handleMinX,
    handleMaxX
  );
  const handleHeight = Math.max(8, config.handleHeight);
  const handleY = plotY + (plotHeight - handleHeight) / 2;
  const renderHandle = (
    side: CandlestickChartRangeSelectorInteraction,
    x: number
  ) => (
    <SvgRect
      key={`handle-${side}`}
      x={x}
      y={handleY}
      width={handleWidth}
      height={handleHeight}
      rx={config.handleRadius}
      fill={handleColor}
      opacity={config.handleOpacity}
    />
  );

  return (
    <View
      pointerEvents={isInteractive ? "auto" : "none"}
      style={{
        height: config.height,
        marginTop: config.gap,
        overflow: "hidden",
        width
      }}
      testID={testID ? `${testID}-range-selector` : undefined}
      {...responderProps}
    >
      <SvgSurface width={width} height={config.height}>
        <SvgLayer name="background">
          <SvgRect
            x={0}
            y={0}
            width={width}
            height={config.height}
            rx={8}
            fill={config.backgroundFill ?? model.resolvedTheme.background}
          />
          <SvgRect
            x={plotX}
            y={plotY}
            width={plotWidth}
            height={plotHeight}
            rx={config.plotRadius}
            fill={config.plotFill ?? model.resolvedTheme.plotBackground}
          />
        </SvgLayer>
        <SvgLayer name="data">
          {model.volumeBars.map((bar) => (
            <SvgRect
              key={bar.key}
              fill={bar.color}
              height={bar.height}
              opacity={config.volumeOpacity}
              width={bar.width}
              x={bar.x}
              y={bar.y}
            />
          ))}
          {model.candles.map((candle) => (
            <SvgGroup key={candle.key}>
              <SvgLine
                stroke={candle.color}
                strokeLinecap="round"
                strokeOpacity={0.62}
                strokeWidth={1}
                x1={candle.wickX}
                x2={candle.wickX}
                y1={candle.highY}
                y2={candle.lowY}
              />
              <SvgRect
                fill={candle.color}
                height={candle.bodyHeight}
                opacity={0.82}
                rx={Math.min(1.5, candle.bodyWidth / 4)}
                width={candle.bodyWidth}
                x={candle.bodyX}
                y={candle.bodyY}
              />
            </SvgGroup>
          ))}
        </SvgLayer>
        <SvgLayer name="overlays">
          {config.outsideOpacity > 0 ? (
            <SvgGroup key="candlestick-range-selector-outside">
              <SvgRect
                key="outside-start"
                x={plotX}
                y={plotY}
                width={Math.max(0, windowX - plotX)}
                height={plotHeight}
                fill={config.outsideFill ?? model.resolvedTheme.background}
                opacity={config.outsideOpacity}
              />
              <SvgRect
                key="outside-end"
                x={windowEndX}
                y={plotY}
                width={Math.max(0, plotX + plotWidth - windowEndX)}
                height={plotHeight}
                fill={config.outsideFill ?? model.resolvedTheme.background}
                opacity={config.outsideOpacity}
              />
            </SvgGroup>
          ) : null}
          <SvgRect
            x={windowX}
            y={plotY}
            width={windowWidth}
            height={plotHeight}
            rx={config.windowRadius}
            fill={config.windowFill ?? model.resolvedTheme.axis}
            opacity={config.windowOpacity}
            stroke={config.windowStroke ?? model.resolvedTheme.axis}
            strokeOpacity={config.windowStrokeOpacity}
            strokeWidth={config.windowStrokeWidth}
          />
          {isInteractive ? (
            <SvgGroup key="candlestick-range-selector-handles">
              {renderHandle("resizeStart", startHandleX)}
              {renderHandle("resizeEnd", endHandleX)}
            </SvgGroup>
          ) : null}
        </SvgLayer>
      </SvgSurface>
    </View>
  );
};
