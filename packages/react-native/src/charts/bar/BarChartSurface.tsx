import { Fragment } from "react";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { ViewProps } from "react-native";

import { createSvgTestId } from "@chart-kit/svg-renderer";

import { getLineChartRenderer as getBarChartRenderer } from "../line/renderer";
import { getFontFamilyProps } from "../line/text";
import {
  getAnimatedBarSelectionFill,
  getAnimatedBarSelectionStrokeOpacity,
  getBarChartSelectionGridOpacity,
  shouldRenderBarChartGridLines,
  useBarChartSelectionAnimation
} from "./selectionAnimation";
import { renderDefaultBarChartTooltip } from "./tooltip";
import { offsetBarChartTooltipForViewport } from "./tooltipPlacement";
import { useAnimatedBarChartTooltipModel } from "./useAnimatedTooltipModel";
import type {
  BarChartModel,
  BarChartRenderer,
  BarChartRenderBarProps,
  ResolvedBarChartTooltipConfig
} from "./types";
import type { BarChartTooltipModel } from "./tooltip";
import type { BarChartSelectionAnimationConfig } from "./types";

export type BarChartSurfaceProps<TData = unknown> = {
  barRadius: number;
  height: number;
  model: BarChartModel<TData>;
  responderProps: ViewProps;
  renderBar?: ((props: BarChartRenderBarProps<TData>) => ReactNode) | undefined;
  renderer?: BarChartRenderer | undefined;
  selectedBarKey: string | undefined;
  selectionAnimation: boolean | BarChartSelectionAnimationConfig | undefined;
  showYAxis: boolean;
  width: number;
};

const RendererLayer = ({
  children
}: {
  children?: ReactNode;
  name?: string;
}) => <>{children}</>;

export const BarChartSurface = <TData,>({
  barRadius,
  height,
  model,
  responderProps,
  renderBar,
  selectedBarKey,
  selectionAnimation,
  showYAxis,
  width,
  renderer: rendererProp
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
  const shouldRenderGridLines = shouldRenderBarChartGridLines({
    selectedBarKey,
    state: selectionAnimationState
  });
  const shouldCoverSelectionGrid = !shouldRenderGridLines;
  const renderer = getBarChartRenderer(rendererProp);
  const Layer = renderer.Layer ?? RendererLayer;
  const Line = renderer.Line;
  const Rect = renderer.Rect;
  const Surface = renderer.Surface;
  const Text = renderer.Text;

  return (
    <View collapsable={false} style={{ width, height }} {...responderProps}>
      <Surface width={width} height={height}>
        <Layer name="background">
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            rx={8}
            fill={resolvedTheme.background}
          />
          <Rect
            x={boxes.plot.x}
            y={boxes.plot.y}
            width={boxes.plot.width}
            height={boxes.plot.height}
            rx={6}
            fill={resolvedTheme.plotBackground}
          />
        </Layer>
        <Layer name="grid">
          {shouldRenderGridLines &&
          showHorizontalGridLines &&
          orientation === "horizontal"
            ? xLabels.map((label) => (
                <Line
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
          {shouldRenderGridLines &&
          showHorizontalGridLines &&
          orientation === "vertical"
            ? yTicks.map((tick) => {
                const label = yLabels.find(
                  (item) => item.key === `tick-${tick}`
                );

                return label ? (
                  <Line
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
        </Layer>
        <Layer name="data">
          {shouldCoverSelectionGrid ? (
            <Rect
              x={boxes.plot.x}
              y={boxes.plot.y}
              width={boxes.plot.width}
              height={boxes.plot.height}
              rx={6}
              fill={resolvedTheme.plotBackground}
              testID={createSvgTestId("bar-chart-selection-grid-cover")}
            />
          ) : null}
          {bars.map((bar) => {
            const fill = getAnimatedBarSelectionFill({
              backgroundColor: resolvedTheme.plotBackground,
              barKey: bar.key,
              color: bar.color,
              state: selectionAnimationState
            });
            const strokeOpacity = getAnimatedBarSelectionStrokeOpacity({
              barKey: bar.key,
              state: selectionAnimationState
            });
            const radius = Math.min(barRadius, bar.width / 2, bar.height / 2);
            const barNode = renderBar?.({
              bar,
              fill,
              radius,
              selected: selectedBarKey === bar.key,
              strokeColor: resolvedTheme.text,
              strokeOpacity,
              strokeWidth: 1.5,
              theme: resolvedTheme
            });

            return (
              <Fragment key={bar.key}>
                <Rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  rx={0}
                  fill={resolvedTheme.plotBackground}
                />
                {barNode ?? (
                  <Rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    rx={radius}
                    fill={fill}
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
                )}
              </Fragment>
            );
          })}
        </Layer>
        <Layer name="axes">
          {showYAxis && showYAxisLabels
            ? yLabels.map((label) => (
                <Text
                  key={`label-y-${label.key}`}
                  x={label.x}
                  y={label.y}
                  fill={resolvedTheme.mutedText}
                  fontSize={resolvedTheme.typography.axisLabelSize}
                  textAnchor="end"
                  {...fontProps}
                >
                  {label.text}
                </Text>
              ))
            : null}
          {showXAxisLabels
            ? xLabels.map((label) => (
                <Text
                  key={`label-x-${label.index}`}
                  x={label.x}
                  y={label.y}
                  fill={resolvedTheme.mutedText}
                  fontSize={resolvedTheme.typography.axisLabelSize}
                  textAnchor={label.textAnchor}
                  {...fontProps}
                >
                  {label.text}
                </Text>
              ))
            : null}
          {valueLabels.map((label) => (
            <Text
              key={label.key}
              x={label.x}
              y={label.y}
              fill={label.color}
              fontSize={resolvedTheme.typography.axisLabelSize}
              textAnchor={label.textAnchor ?? "middle"}
              {...fontProps}
            >
              {label.text}
            </Text>
          ))}
          {legendItems.map((item) => (
            <Rect
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
            <Text
              key={`legend-label-${item.key}`}
              x={item.labelX}
              y={item.labelY}
              fill={resolvedTheme.mutedText}
              fontSize={resolvedTheme.typography.legendLabelSize}
              textAnchor="start"
              {...fontProps}
            >
              {item.label}
            </Text>
          ))}
        </Layer>
      </Surface>
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
  renderer?: BarChartRenderer | undefined;
};

export const BarChartTooltipOverlay = <TData,>({
  height,
  model,
  tooltipConfig,
  tooltipModel,
  viewportOffsetX,
  width,
  renderer: rendererProp
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
  const renderer = getBarChartRenderer(rendererProp);
  const Layer = renderer.Layer ?? RendererLayer;
  const Surface = renderer.Surface;

  return (
    <View
      pointerEvents="none"
      style={[styles.tooltipOverlay, { width, height }]}
    >
      <Surface width={width} height={height}>
        <Layer name="interaction">
          {viewportTooltipModel
            ? renderDefaultBarChartTooltip(
                {
                  ...viewportTooltipModel,
                  config: tooltipConfig
                },
                renderer
              )
            : null}
        </Layer>
      </Surface>
    </View>
  );
};

export type StickyBarChartYAxisProps<TData = unknown> = {
  height: number;
  model: BarChartModel<TData>;
  width: number;
  renderer?: BarChartRenderer | undefined;
};

export const StickyBarChartYAxis = <TData,>({
  height,
  model,
  width,
  renderer: rendererProp
}: StickyBarChartYAxisProps<TData>) => {
  const { boxes, resolvedTheme, showYAxisLabels, yLabels } = model;
  const fontProps = getFontFamilyProps(resolvedTheme.typography.fontFamily);
  const renderer = getBarChartRenderer(rendererProp);
  const Layer = renderer.Layer ?? RendererLayer;
  const Rect = renderer.Rect;
  const Surface = renderer.Surface;
  const Text = renderer.Text;

  return (
    <View pointerEvents="none" style={[styles.stickyYAxis, { width, height }]}>
      <Surface width={width} height={height}>
        <Layer name="axes">
          <Rect
            x={0}
            y={0}
            width={Math.max(0, boxes.plot.x)}
            height={boxes.plot.y + boxes.plot.height}
            fill={resolvedTheme.background}
          />
          <Rect
            x={0}
            y={boxes.plot.y + boxes.plot.height}
            width={Math.max(0, boxes.plot.x)}
            height={Math.max(0, height - (boxes.plot.y + boxes.plot.height))}
            fill={resolvedTheme.background}
          />
          {showYAxisLabels
            ? yLabels.map((label) => (
                <Text
                  key={`sticky-label-y-${label.key}`}
                  x={label.x}
                  y={label.y}
                  fill={resolvedTheme.mutedText}
                  fontSize={resolvedTheme.typography.axisLabelSize}
                  textAnchor="end"
                  {...fontProps}
                >
                  {label.text}
                </Text>
              ))
            : null}
        </Layer>
      </Surface>
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
