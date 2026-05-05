import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  SvgLayer,
  SvgPath,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { useChartKitTheme } from "../../theme";
import { getProgressChartAccessibilitySummary } from "./accessibility";
import { buildProgressChartModel } from "./model";
import type {
  ProgressChartProps,
  ProgressRingDatum,
  ProgressRingProps
} from "./types";

export type * from "./types";
export {
  getProgressChartAccessibilitySummary,
  getProgressChartDataTable
} from "./accessibility";
export type {
  ProgressChartDataTable,
  ProgressChartDataTableRow
} from "./accessibility";

const defaultStrokeLinecap = "round";

export const ProgressChart = <
  TData extends Record<string, unknown> = ProgressRingDatum
>(
  props: ProgressChartProps<TData>
) => {
  const chartKitTheme = useChartKitTheme();
  const model = useMemo(
    () => buildProgressChartModel({ chartKitTheme, props }),
    [chartKitTheme, props]
  );
  const {
    average,
    centerX,
    centerY,
    chartHeight,
    legendItems,
    legendVisible,
    resolvedTheme,
    rings
  } = model;
  const strokeLinecap = props.strokeLinecap ?? defaultStrokeLinecap;
  const centerLabel =
    typeof props.centerLabel === "function"
      ? props.centerLabel({ average, rings, theme: resolvedTheme })
      : props.centerLabel;
  const accessibilityLabel =
    props.accessibilityLabel ??
    getProgressChartAccessibilitySummary({
      colorKey: props.colorKey,
      colors: props.colors,
      data: props.data,
      formatPercentage: props.formatPercentage,
      labelKey: props.labelKey,
      labels: props.labels,
      valueKey: props.valueKey
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
      <SvgSurface width={props.width} height={chartHeight}>
        <SvgLayer name="background">
          {rings.map((ring) =>
            ring.backgroundPath.length > 0 ? (
              <SvgPath
                key={`progress-background-${ring.index}`}
                d={ring.backgroundPath}
                fill="none"
                stroke={resolvedTheme.grid}
                strokeLinecap={strokeLinecap}
                strokeWidth={ring.strokeWidth}
                testID={`${props.testID ?? "progress-chart"}-background.${
                  ring.index
                }`}
              />
            ) : null
          )}
        </SvgLayer>
        <SvgLayer name="data">
          {rings.map((ring) =>
            ring.defined ? (
              <SvgPath
                key={`progress-ring-${ring.index}`}
                d={ring.path}
                fill="none"
                stroke={ring.color ?? resolvedTheme.text}
                strokeLinecap={strokeLinecap}
                strokeLinejoin="round"
                strokeWidth={ring.strokeWidth}
                testID={`${props.testID ?? "progress-chart"}-ring.${
                  ring.index
                }`}
              />
            ) : null
          )}
        </SvgLayer>
        {typeof centerLabel === "string" && centerLabel.length > 0 ? (
          <SvgLayer name="overlays">
            <SvgText
              fill={resolvedTheme.text}
              fontSize={18}
              fontWeight="800"
              textAnchor="middle"
              x={centerX}
              y={centerY + 6}
              {...(resolvedTheme.typography.fontFamily
                ? { fontFamily: resolvedTheme.typography.fontFamily }
                : {})}
            >
              {centerLabel}
            </SvgText>
          </SvgLayer>
        ) : null}
      </SvgSurface>
      {legendVisible && legendItems.length > 0 ? (
        <View style={styles.legend}>
          {legendItems.map((item) => (
            <View key={item.key} style={styles.legendItem}>
              <View
                style={[styles.legendSwatch, { backgroundColor: item.color }]}
              />
              <Text
                numberOfLines={1}
                style={[styles.legendText, { color: resolvedTheme.text }]}
              >
                {item.label}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.legendValue, { color: resolvedTheme.mutedText }]}
              >
                {item.percentageLabel}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export const ProgressRing = ({
  color,
  label,
  value,
  ...props
}: ProgressRingProps) => {
  const row: ProgressRingDatum = {
    value,
    ...(label !== undefined ? { label } : {}),
    ...(color !== undefined ? { color } : {})
  };

  return (
    <ProgressChart
      {...props}
      data={[row]}
      labelKey="label"
      valueKey="value"
      colorKey="color"
      legend={props.legend ?? false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden"
  },
  legend: {
    alignContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingTop: 4
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    maxWidth: "48%",
    minHeight: 18
  },
  legendSwatch: {
    borderRadius: 4,
    height: 8,
    width: 8
  },
  legendText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "700"
  },
  legendValue: {
    fontSize: 10,
    fontWeight: "700"
  }
});
