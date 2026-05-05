import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import type { ViewProps } from "react-native";

import {
  createSvgTestId,
  SvgLayer,
  SvgLine,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { getFontFamilyProps } from "../line/text";
import {
  getAnimatedBarSelectionFill,
  getAnimatedBarSelectionStrokeOpacity,
  getBarChartSelectionGridOpacity,
  useBarChartSelectionAnimation
} from "./selectionAnimation";
import { renderDefaultBarChartTooltip } from "./tooltip";
import { offsetBarChartTooltipForViewport } from "./tooltipPlacement";
import { useAnimatedBarChartTooltipModel } from "./useAnimatedTooltipModel";
import type { BarChartModel, ResolvedBarChartTooltipConfig } from "./types";
import type { BarChartTooltipModel } from "./tooltip";
import type { BarChartSelectionAnimationConfig } from "./types";

export type BarChartSurfaceProps<TData = unknown> = {
  barRadius: number;
  height: number;
  model: BarChartModel<TData>;
  responderProps: ViewProps;
  selectedBarKey: string | undefined;
  selectionAnimation: boolean | BarChartSelectionAnimationConfig | undefined;
  showYAxis: boolean;
  width: number;
};

export const BarChartSurface = <TData,>({
  barRadius,
  height,
  model,
  responderProps,
  selectedBarKey,
  selectionAnimation,
  showYAxis,
  width
}: BarChartSurfaceProps<TData>) => {
  const {
    bars,
    boxes,
    legendItems,
    orientation,
    resolvedTheme,
    showHorizontalGridLines,
    showXAxisLabels,
    showYAxisLabels,
    valueLabels,
    xLabels,
    yLabels,
    yTicks
  } = model;
  const fontProps = getFontFamilyProps(resolvedTheme.typography.fontFamily);
  const selectionAnimationState = useBarChartSelectionAnimation({
    animation: selectionAnimation,
    selectedBarKey
  });
  const gridStrokeOpacity = getBarChartSelectionGridOpacity({
    selectedBarKey,
    state: selectionAnimationState
  });

  return (
    <View collapsable={false} style={{ width, height }} {...responderProps}>
      <SvgSurface width={width} height={height}>
        <SvgLayer name="background">
          <SvgRect
            x={0}
            y={0}
            width={width}
            height={height}
            rx={8}
            fill={resolvedTheme.background}
          />
          <SvgRect
            x={boxes.plot.x}
            y={boxes.plot.y}
            width={boxes.plot.width}
            height={boxes.plot.height}
            rx={6}
            fill={resolvedTheme.plotBackground}
          />
        </SvgLayer>
        <SvgLayer name="grid">
          {showHorizontalGridLines && orientation === "horizontal"
            ? xLabels.map((label) => (
                <SvgLine
                  key={`grid-x-${label.index}`}
                  x1={label.x}
                  x2={label.x}
                  y1={boxes.plot.y}
                  y2={boxes.plot.y + boxes.plot.height}
                  stroke={resolvedTheme.grid}
                  strokeOpacity={gridStrokeOpacity}
                  strokeWidth={1}
                />
              ))
            : null}
          {showHorizontalGridLines && orientation === "vertical"
            ? yTicks.map((tick) => {
                const label = yLabels.find(
                  (item) => item.key === `tick-${tick}`
                );

                return label ? (
                  <SvgLine
                    key={`grid-y-${tick}`}
                    x1={boxes.plot.x}
                    x2={boxes.plot.x + boxes.plot.width}
                    y1={
                      label.y - resolvedTheme.typography.axisLabelSize / 2 + 2
                    }
                    y2={
                      label.y - resolvedTheme.typography.axisLabelSize / 2 + 2
                    }
                    stroke={resolvedTheme.grid}
                    strokeOpacity={gridStrokeOpacity}
                    strokeWidth={1}
                  />
                ) : null;
              })
            : null}
        </SvgLayer>
        <SvgLayer name="data">
          {bars.map((bar) => {
            const strokeOpacity = getAnimatedBarSelectionStrokeOpacity({
              barKey: bar.key,
              state: selectionAnimationState
            });
            const radius = Math.min(barRadius, bar.width / 2, bar.height / 2);

            return (
              <Fragment key={bar.key}>
                <SvgRect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  rx={0}
                  fill={resolvedTheme.plotBackground}
                />
                <SvgRect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  rx={radius}
                  fill={getAnimatedBarSelectionFill({
                    backgroundColor: resolvedTheme.plotBackground,
                    barKey: bar.key,
                    color: bar.color,
                    state: selectionAnimationState
                  })}
                  {...(strokeOpacity > 0
                    ? {
                        stroke: resolvedTheme.text,
                        strokeOpacity,
                        strokeWidth: 1.5
                      }
                    : {})}
                  testID={createSvgTestId(
                    "bar-chart-bar",
                    bar.seriesKey,
                    bar.dataIndex
                  )}
                />
              </Fragment>
            );
          })}
        </SvgLayer>
        <SvgLayer name="axes">
          {showYAxis && showYAxisLabels
            ? yLabels.map((label) => (
                <SvgText
                  key={`label-y-${label.key}`}
                  x={label.x}
                  y={label.y}
                  fill={resolvedTheme.mutedText}
                  fontSize={resolvedTheme.typography.axisLabelSize}
                  textAnchor="end"
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
                  x={label.x}
                  y={label.y}
                  fill={resolvedTheme.mutedText}
                  fontSize={resolvedTheme.typography.axisLabelSize}
                  textAnchor={label.textAnchor}
                  {...fontProps}
                >
                  {label.text}
                </SvgText>
              ))
            : null}
          {valueLabels.map((label) => (
            <SvgText
              key={label.key}
              x={label.x}
              y={label.y}
              fill={label.color}
              fontSize={resolvedTheme.typography.axisLabelSize}
              textAnchor={label.textAnchor ?? "middle"}
              {...fontProps}
            >
              {label.text}
            </SvgText>
          ))}
          {legendItems.map((item) => (
            <SvgRect
              key={`legend-marker-${item.key}`}
              x={item.markerX}
              y={item.markerY}
              width={8}
              height={8}
              rx={2}
              fill={item.color}
            />
          ))}
          {legendItems.map((item) => (
            <SvgText
              key={`legend-label-${item.key}`}
              x={item.labelX}
              y={item.labelY}
              fill={resolvedTheme.mutedText}
              fontSize={resolvedTheme.typography.legendLabelSize}
              textAnchor="start"
              {...fontProps}
            >
              {item.label}
            </SvgText>
          ))}
        </SvgLayer>
      </SvgSurface>
    </View>
  );
};

export type BarChartTooltipOverlayProps<TData = unknown> = {
  height: number;
  model: BarChartModel<TData>;
  tooltipConfig: ResolvedBarChartTooltipConfig;
  tooltipModel: BarChartTooltipModel<TData> | undefined;
  viewportOffsetX: number;
  width: number;
};

export const BarChartTooltipOverlay = <TData,>({
  height,
  model,
  tooltipConfig,
  tooltipModel,
  viewportOffsetX,
  width
}: BarChartTooltipOverlayProps<TData>) => {
  const animatedTooltipModel = useAnimatedBarChartTooltipModel(
    tooltipModel,
    tooltipConfig.positionAnimationDuration
  );
  const viewportTooltipModel = animatedTooltipModel
    ? offsetBarChartTooltipForViewport({
        leftInset: model.boxes.plot.x + 4,
        tooltip: animatedTooltipModel,
        viewportOffsetX,
        viewportWidth: width
      })
    : undefined;

  return (
    <View
      pointerEvents="none"
      style={[styles.tooltipOverlay, { width, height }]}
    >
      <SvgSurface width={width} height={height}>
        <SvgLayer name="interaction">
          {viewportTooltipModel
            ? renderDefaultBarChartTooltip({
                ...viewportTooltipModel,
                config: tooltipConfig
              })
            : null}
        </SvgLayer>
      </SvgSurface>
    </View>
  );
};

export type StickyBarChartYAxisProps<TData = unknown> = {
  height: number;
  model: BarChartModel<TData>;
  width: number;
};

export const StickyBarChartYAxis = <TData,>({
  height,
  model,
  width
}: StickyBarChartYAxisProps<TData>) => {
  const { boxes, resolvedTheme, showYAxisLabels, yLabels } = model;
  const fontProps = getFontFamilyProps(resolvedTheme.typography.fontFamily);

  return (
    <View pointerEvents="none" style={[styles.stickyYAxis, { width, height }]}>
      <SvgSurface width={width} height={height}>
        <SvgLayer name="axes">
          <SvgRect
            x={0}
            y={0}
            width={Math.max(0, boxes.plot.x)}
            height={boxes.plot.y + boxes.plot.height}
            fill={resolvedTheme.background}
          />
          <SvgRect
            x={0}
            y={boxes.plot.y + boxes.plot.height}
            width={Math.max(0, boxes.plot.x)}
            height={Math.max(0, height - (boxes.plot.y + boxes.plot.height))}
            fill={resolvedTheme.background}
          />
          {showYAxisLabels
            ? yLabels.map((label) => (
                <SvgText
                  key={`sticky-label-y-${label.key}`}
                  x={label.x}
                  y={label.y}
                  fill={resolvedTheme.mutedText}
                  fontSize={resolvedTheme.typography.axisLabelSize}
                  textAnchor="end"
                  {...fontProps}
                >
                  {label.text}
                </SvgText>
              ))
            : null}
        </SvgLayer>
      </SvgSurface>
    </View>
  );
};

const styles = StyleSheet.create({
  stickyYAxis: {
    left: 0,
    position: "absolute",
    top: 0,
    zIndex: 1
  },
  tooltipOverlay: {
    left: 0,
    position: "absolute",
    top: 0,
    zIndex: 2
  }
});
