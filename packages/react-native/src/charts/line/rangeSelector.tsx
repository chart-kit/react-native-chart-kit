import { useCallback, useRef } from "react";
import { View } from "react-native";
import type { GestureResponderEvent } from "react-native";

import {
  resolveChartViewportWindowFromHandlePosition,
  resolveChartViewportWindowFromPosition,
  type ResolvedChartViewportWindow
} from "@chart-kit/core";
import {
  SvgLayer,
  SvgPath,
  SvgRect,
  SvgSurface
} from "@chart-kit/svg-renderer";

import type { LineChartModel } from "./useChartModel";
import type {
  LineChartProps,
  LineChartRangeSelectorHandleRenderProps,
  LineChartRangeSelectorInteraction,
  LineChartRangeSelectorWindowRenderProps
} from "./types";
import { clamp } from "./utils";

export const getRangeSelectorConfig = (
  rangeSelector: LineChartProps<Record<string, unknown>>["rangeSelector"]
) => {
  const config = typeof rangeSelector === "object" ? rangeSelector : {};
  const visible =
    typeof rangeSelector === "boolean"
      ? rangeSelector
      : rangeSelector !== undefined && config.visible !== false;

  return {
    visible,
    height: config.height ?? 54,
    gap: config.gap ?? 10,
    interactive: config.interactive ?? false,
    minVisiblePoints: config.minVisiblePoints ?? 2,
    backgroundFill: config.backgroundFill,
    plotFill: config.plotFill,
    plotRadius: config.plotRadius ?? 6,
    lineMinStrokeWidth: config.lineMinStrokeWidth ?? 1.5,
    lineStrokeWidth: config.lineStrokeWidth,
    lineStrokeWidthScale: config.lineStrokeWidthScale ?? 0.62,
    series: config.series,
    outsideFill: config.outsideFill,
    outsideOpacity: config.outsideOpacity ?? 0,
    windowFill: config.windowFill,
    windowOpacity: config.windowOpacity ?? 0.1,
    windowRadius: config.windowRadius ?? 6,
    windowStroke: config.windowStroke,
    windowStrokeOpacity: config.windowStrokeOpacity ?? 0.42,
    windowStrokeWidth: config.windowStrokeWidth ?? 1,
    lineOpacity: config.lineOpacity ?? 0.62,
    handleColor: config.handleColor,
    handleHeight: config.handleHeight,
    handleHitSlop: config.handleHitSlop ?? 18,
    handleInset: config.handleInset ?? 6,
    handleOpacity: config.handleOpacity ?? 0.9,
    handleRadius: config.handleRadius,
    handleWidth: config.handleWidth ?? 3,
    renderHandle: config.renderHandle,
    renderWindow: config.renderWindow,
    onGestureEnd: config.onGestureEnd,
    onGestureStart: config.onGestureStart
  };
};

type RangeSelectorConfig = ReturnType<typeof getRangeSelectorConfig>;

export const LineChartRangeSelector = <TData extends Record<string, unknown>>({
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
  config: RangeSelectorConfig;
  dataLength: number;
  isVisible: boolean;
  model: LineChartModel<TData>;
  onViewportChange: LineChartProps<TData>["onViewportChange"];
  preventBrowserSelection: (event: GestureResponderEvent) => void;
  testID?: string | undefined;
  viewportWindow: ResolvedChartViewportWindow;
  width: number;
}) => {
  const interactionRef = useRef<LineChartRangeSelectorInteraction>("move");
  const rangeStartPoint = model.interactionPoints.find(
    (point) => point.dataIndex === viewportWindow.startIndex
  );
  const rangeEndPoint = model.interactionPoints.find(
    (point) => point.dataIndex === Math.max(0, viewportWindow.endIndex - 1)
  );
  const windowX = rangeStartPoint?.x ?? model.boxes.plot.x;
  const windowEndX =
    rangeEndPoint?.x ?? model.boxes.plot.x + model.boxes.plot.width;
  const windowWidth = Math.max(10, windowEndX - windowX);
  const emitViewportChange = useCallback(
    (
      nextWindow: ResolvedChartViewportWindow,
      interaction: LineChartRangeSelectorInteraction
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
    (locationX: number): LineChartRangeSelectorInteraction => {
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
      interaction: LineChartRangeSelectorInteraction
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
              plotWidth: model.boxes.plot.width,
              plotX: model.boxes.plot.x,
              visibleCount: viewportWindow.visibleCount
            })
          : resolveChartViewportWindowFromHandlePosition({
              currentWindow: viewportWindow,
              handle: interaction === "resizeStart" ? "start" : "end",
              itemCount: dataLength,
              locationX: event.nativeEvent.locationX,
              minVisibleCount: config.minVisiblePoints,
              plotWidth: model.boxes.plot.width,
              plotX: model.boxes.plot.x
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
      model.boxes.plot.width,
      model.boxes.plot.x,
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

  const plotX = model.boxes.plot.x;
  const plotY = model.boxes.plot.y;
  const plotWidth = model.boxes.plot.width;
  const plotHeight = model.boxes.plot.height;
  const handleWidth = config.handleWidth;
  const handleColor =
    config.handleColor ?? config.windowStroke ?? model.resolvedTheme.axis;
  const handleMinX = model.boxes.plot.x;
  const handleMaxX = model.boxes.plot.x + model.boxes.plot.width - handleWidth;
  const startHandleX = clamp(windowX - handleWidth / 2, handleMinX, handleMaxX);
  const endHandleX = clamp(
    windowEndX - handleWidth / 2,
    handleMinX,
    handleMaxX
  );
  const handleHeight = Math.max(
    8,
    config.handleHeight ?? plotHeight - config.handleInset * 2
  );
  const handleY = plotY + (plotHeight - handleHeight) / 2;
  const handleRadius = config.handleRadius ?? handleWidth / 2;
  const windowProps: LineChartRangeSelectorWindowRenderProps = {
    x: windowX,
    y: plotY,
    width: windowWidth,
    height: plotHeight,
    radius: config.windowRadius,
    fill: config.windowFill ?? model.resolvedTheme.axis,
    opacity: config.windowOpacity,
    stroke: config.windowStroke ?? model.resolvedTheme.axis,
    strokeOpacity: config.windowStrokeOpacity,
    strokeWidth: config.windowStrokeWidth,
    theme: model.resolvedTheme
  };
  const renderWindow = () =>
    config.renderWindow ? (
      config.renderWindow(windowProps)
    ) : (
      <SvgRect
        x={windowProps.x}
        y={windowProps.y}
        width={windowProps.width}
        height={windowProps.height}
        rx={windowProps.radius}
        fill={windowProps.fill}
        opacity={windowProps.opacity}
        stroke={windowProps.stroke}
        strokeOpacity={windowProps.strokeOpacity}
        strokeWidth={windowProps.strokeWidth}
      />
    );
  const renderHandle = (
    side: LineChartRangeSelectorHandleRenderProps["side"],
    x: number
  ) => {
    const handleProps: LineChartRangeSelectorHandleRenderProps = {
      side,
      x,
      y: handleY,
      width: handleWidth,
      height: handleHeight,
      radius: handleRadius,
      color: handleColor,
      opacity: config.handleOpacity,
      theme: model.resolvedTheme,
      window: windowProps
    };

    return config.renderHandle ? (
      config.renderHandle(handleProps)
    ) : (
      <SvgRect
        x={handleProps.x}
        y={handleProps.y}
        width={handleProps.width}
        height={handleProps.height}
        rx={handleProps.radius}
        fill={handleProps.color}
        opacity={handleProps.opacity}
      />
    );
  };

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
          {model.geometries.map(({ geometry, style }) => {
            const seriesStyle = config.series?.[geometry.key];

            return (
              <SvgPath
                key={`range-line-${geometry.key}`}
                d={geometry.line.path}
                fill="none"
                stroke={seriesStyle?.color ?? style.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={seriesStyle?.opacity ?? config.lineOpacity}
                strokeWidth={
                  seriesStyle?.strokeWidth ??
                  config.lineStrokeWidth ??
                  Math.max(
                    config.lineMinStrokeWidth,
                    style.strokeWidth * config.lineStrokeWidthScale
                  )
                }
                {...(seriesStyle?.strokeDasharray
                  ? { strokeDasharray: seriesStyle.strokeDasharray }
                  : {})}
              />
            );
          })}
        </SvgLayer>
        <SvgLayer name="overlays">
          {config.outsideOpacity > 0 ? (
            <>
              <SvgRect
                x={plotX}
                y={plotY}
                width={Math.max(0, windowX - plotX)}
                height={plotHeight}
                fill={config.outsideFill ?? model.resolvedTheme.background}
                opacity={config.outsideOpacity}
              />
              <SvgRect
                x={windowEndX}
                y={plotY}
                width={Math.max(0, plotX + plotWidth - windowEndX)}
                height={plotHeight}
                fill={config.outsideFill ?? model.resolvedTheme.background}
                opacity={config.outsideOpacity}
              />
            </>
          ) : null}
          {renderWindow()}
          {isInteractive ? (
            <>
              {renderHandle("start", startHandleX)}
              {renderHandle("end", endHandleX)}
            </>
          ) : null}
        </SvgLayer>
      </SvgSurface>
    </View>
  );
};
