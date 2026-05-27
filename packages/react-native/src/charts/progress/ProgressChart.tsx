import { useMemo } from "react";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useChartKitTheme } from "../../theme";
import { getLineChartRenderer as getProgressChartRenderer } from "../line/renderer";
import { getProgressChartAccessibilitySummary } from "./accessibility";
import {
  getAnimatedProgressRings,
  getAverageProgress,
  getProgressChartAnimationTargetKey,
  useProgressChartAnimation
} from "./animation";
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

const RendererLayer = ({
  children
}: {
  children?: ReactNode;
  name?: string;
}) => <>{children}</>;

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
  const animationTargetKey = useMemo(
    () => getProgressChartAnimationTargetKey(rings),
    [rings]
  );
  const progressAnimation = useProgressChartAnimation({
    animation: props.animation,
    targetKey: animationTargetKey
  });
  const { progress: animationProgress, stagger: animationStagger } =
    progressAnimation;
  const animatedRings = useMemo(
    () =>
      getAnimatedProgressRings({
        centerX,
        centerY,
        progress: animationProgress,
        rings,
        stagger: animationStagger
      }),
    [animationProgress, animationStagger, centerX, centerY, rings]
  );
  const displayRings = props.animation ? animatedRings : rings;
  const animatedAverage = useMemo(
    () => getAverageProgress(displayRings),
    [displayRings]
  );
  const strokeLinecap = props.strokeLinecap ?? defaultStrokeLinecap;
  const centerLabel =
    typeof props.centerLabel === "function"
      ? props.centerLabel({
          average: props.animation ? animatedAverage : average,
          rings: displayRings,
          theme: resolvedTheme
        })
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
  const renderer = getProgressChartRenderer(
    props.renderer ?? chartKitTheme.renderer
  );
  const Layer = renderer.Layer ?? RendererLayer;
  const Path = renderer.Path;
  const Surface = renderer.Surface;
  const SvgText = renderer.Text;
  const canRenderText = renderer.capabilities?.text !== false;

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
      <Surface width={props.width} height={chartHeight}>
        <Layer name="background">
          {rings.map((ring) =>
            ring.backgroundPath.length > 0 ? (
              <Path
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
        </Layer>
        <Layer name="data">
          {displayRings.map((ring) =>
            ring.defined ? (
              <Path
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
        </Layer>
        {typeof centerLabel === "string" &&
        centerLabel.length > 0 &&
        canRenderText ? (
          <Layer name="overlays">
            <SvgText
              fill={resolvedTheme.text}
              fontSize={18}
              fontWeight="800"
              text={centerLabel}
              textAnchor="middle"
              x={centerX}
              y={centerY + 6}
              {...(resolvedTheme.typography.fontFamily
                ? { fontFamily: resolvedTheme.typography.fontFamily }
                : {})}
            >
              {centerLabel}
            </SvgText>
          </Layer>
        ) : null}
      </Surface>
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
