import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import {
  SvgLayer,
  SvgLine,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { useChartKitTheme } from "../../theme";
import { getFontFamilyProps } from "../line/text";
import { getCandlestickChartAccessibilitySummary } from "./accessibility";
import { buildCandlestickChartModel } from "./model";
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
  const model = useMemo(
    () => buildCandlestickChartModel({ ...props, chartKitTheme }),
    [chartKitTheme, props]
  );
  const {
    boxes,
    candles,
    resolvedTheme,
    showHorizontalGridLines,
    showXAxisLabels,
    showYAxisLabels,
    xLabels,
    yLabels,
    yTicks
  } = model;
  const fontProps = getFontFamilyProps(resolvedTheme.typography.fontFamily);
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
      </SvgSurface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden"
  }
});
