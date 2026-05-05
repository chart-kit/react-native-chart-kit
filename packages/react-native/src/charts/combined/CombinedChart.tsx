import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import {
  SvgLayer,
  SvgLine,
  SvgPath,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { useChartKitTheme } from "../../theme";
import { getFontFamilyProps } from "../line/text";
import { buildCombinedChartModel } from "./model";
import type { CombinedChartProps } from "./types";

export type * from "./types";
export { buildCombinedChartModel } from "./model";

export const CombinedChart = <TData extends Record<string, unknown>>(
  props: CombinedChartProps<TData>
) => {
  const chartKitTheme = useChartKitTheme();
  const model = useMemo(
    () => buildCombinedChartModel({ ...props, chartKitTheme }),
    [chartKitTheme, props]
  );
  const {
    bars,
    boxes,
    legendItems,
    lines,
    leftTicks,
    resolvedTheme,
    showHorizontalGridLines,
    showXAxisLabels,
    showYAxisLabels,
    xLabels,
    yLabels
  } = model;
  const fontProps = getFontFamilyProps(resolvedTheme.typography.fontFamily);
  const barRadius = Math.max(0, props.barRadius ?? 5);
  const accessibilityLabel =
    props.accessibilityLabel ??
    `Combined chart with ${bars.length} bars and ${lines.length} line series.`;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
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
      <SvgSurface width={props.width} height={props.height}>
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
            ? leftTicks.map((tick) => {
                const label = yLabels.find(
                  (item) => item.key === `left-${tick}`
                );

                return label ? (
                  <SvgLine
                    key={`grid-y-${tick}`}
                    stroke={resolvedTheme.grid}
                    strokeOpacity={0.72}
                    strokeWidth={1}
                    x1={boxes.plot.x}
                    x2={boxes.plot.x + boxes.plot.width}
                    y1={
                      label.y - resolvedTheme.typography.axisLabelSize / 2 + 2
                    }
                    y2={
                      label.y - resolvedTheme.typography.axisLabelSize / 2 + 2
                    }
                  />
                ) : null;
              })
            : null}
        </SvgLayer>
        <SvgLayer name="data">
          {bars.map((bar) => {
            const radius = Math.min(barRadius, bar.width / 2, bar.height / 2);

            return (
              <SvgRect
                key={bar.key}
                fill={bar.color}
                height={bar.height}
                rx={radius}
                testID={`${props.testID ?? "combined-chart"}-bar.${
                  bar.seriesKey
                }.${bar.dataIndex}`}
                width={bar.width}
                x={bar.x}
                y={bar.y}
              />
            );
          })}
        </SvgLayer>
        <SvgLayer name="overlays">
          {lines.map((line) => (
            <SvgPath
              key={line.key}
              d={line.geometry.path}
              fill="none"
              stroke={line.color}
              strokeLinejoin="round"
              strokeWidth={line.strokeWidth}
              testID={`${props.testID ?? "combined-chart"}-line.${line.key}`}
              {...(line.strokeDasharray
                ? { strokeDasharray: line.strokeDasharray }
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
                  textAnchor={label.side === "left" ? "end" : "start"}
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
          {legendItems.map((item) =>
            item.kind === "line" ? (
              <SvgLine
                key={`legend-marker-${item.key}`}
                stroke={item.color}
                strokeWidth={3}
                x1={item.markerX}
                x2={item.markerX + 10}
                y1={item.markerY + 4}
                y2={item.markerY + 4}
                {...(item.strokeDasharray
                  ? { strokeDasharray: item.strokeDasharray }
                  : {})}
              />
            ) : (
              <SvgRect
                key={`legend-marker-${item.key}`}
                fill={item.color}
                height={8}
                rx={2}
                width={8}
                x={item.markerX}
                y={item.markerY}
              />
            )
          )}
          {legendItems.map((item) => (
            <SvgText
              key={`legend-label-${item.key}`}
              fill={resolvedTheme.mutedText}
              fontSize={resolvedTheme.typography.legendLabelSize}
              textAnchor="start"
              x={item.labelX}
              y={item.labelY}
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

const styles = StyleSheet.create({
  container: {
    overflow: "hidden"
  }
});
