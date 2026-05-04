import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  SvgLayer,
  SvgPath,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { useChartKitTheme } from "../../theme";
import { buildPieChartModel } from "./model";
import type { PieChartProps } from "./types";

export type * from "./types";

const defaultDonutInnerRadiusRatio = 0.58;

export const PieChart = <TData extends Record<string, unknown>>(
  props: PieChartProps<TData>
) => {
  const chartKitTheme = useChartKitTheme();
  const model = useMemo(
    () => buildPieChartModel({ chartKitTheme, props }),
    [chartKitTheme, props]
  );
  const {
    arcs,
    centerX,
    centerY,
    chartHeight,
    legendItems,
    legendVisible,
    resolvedTheme,
    total
  } = model;
  const centerLabel =
    typeof props.centerLabel === "function"
      ? props.centerLabel({ arcs, theme: resolvedTheme, total })
      : props.centerLabel;
  const accessibilityLabel =
    props.accessibilityLabel ??
    `Pie chart with ${legendItems.length} slices. Total ${total}.`;

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
          {arcs.map((arc) =>
            arc.defined ? (
              <SvgPath
                key={`pie-slice-${arc.index}`}
                d={arc.path}
                fill={arc.color ?? resolvedTheme.text}
                testID={`${props.testID ?? "pie-chart"}-slice.${arc.index}`}
              />
            ) : null
          )}
        </SvgLayer>
        {typeof centerLabel === "string" && centerLabel.length > 0 ? (
          <SvgLayer name="overlays">
            <SvgText
              fill={resolvedTheme.text}
              fontSize={16}
              fontWeight="800"
              textAnchor="middle"
              x={centerX}
              y={centerY + 5}
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

export const DonutChart = <TData extends Record<string, unknown>>(
  props: PieChartProps<TData>
) => (
  <PieChart
    {...props}
    innerRadiusRatio={props.innerRadiusRatio ?? defaultDonutInnerRadiusRatio}
  />
);

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
