import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { GestureResponderEvent, ViewProps } from "react-native";

import {
  SvgLayer,
  SvgPath,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { useChartKitTheme } from "../../theme";
import {
  buildPieChartSelectEvent,
  getPieChartInteractionConfig,
  getPieChartSliceAtPoint,
  isPieChartInteractionEnabled,
  normalizePieChartSelectedIndex
} from "./interaction";
import { buildPieChartModel } from "./model";
import type { PieChartProps } from "./types";

export type * from "./types";

const defaultDonutInnerRadiusRatio = 0.58;

export const PieChart = <TData extends Record<string, unknown>>(
  props: PieChartProps<TData>
) => {
  const chartKitTheme = useChartKitTheme();
  const interactionConfig = useMemo(
    () => getPieChartInteractionConfig(props.interaction),
    [props.interaction]
  );
  const [gestureSelectedIndex, setGestureSelectedIndex] = useState<
    number | undefined
  >(() => normalizePieChartSelectedIndex(props.defaultSelectedIndex));
  const selectedIndex =
    normalizePieChartSelectedIndex(props.selectedIndex) ?? gestureSelectedIndex;
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
    radius,
    total
  } = model;
  const activeSlice = {
    activeOpacity: props.activeSlice?.activeOpacity ?? 1,
    inactiveOpacity: props.activeSlice?.inactiveOpacity ?? 0.42,
    strokeColor: props.activeSlice?.strokeColor ?? resolvedTheme.background,
    strokeWidth: props.activeSlice?.strokeWidth ?? 3
  };
  const isInteractionEnabled = isPieChartInteractionEnabled(interactionConfig);
  const hasSelectedSlice = selectedIndex !== undefined;
  const handleResponderRelease = useCallback(
    (event: GestureResponderEvent) => {
      event.preventDefault();

      const { locationX, locationY } = event.nativeEvent;
      const tappedSlice = getPieChartSliceAtPoint({
        arcs,
        centerX,
        centerY,
        innerRadius: model.innerRadius,
        locationX,
        locationY,
        radius
      });

      if (!tappedSlice) {
        if (interactionConfig.deselectOnOutsidePress) {
          if (props.selectedIndex === undefined) {
            setGestureSelectedIndex(undefined);
          }

          interactionConfig.onDeselect?.({ reason: "outsidePress" });
        }

        return;
      }

      if (props.selectedIndex === undefined) {
        setGestureSelectedIndex(tappedSlice.index);
      }

      const selectEvent = buildPieChartSelectEvent(tappedSlice);

      if (selectEvent) {
        interactionConfig.onSelect?.(selectEvent);
      }
    },
    [
      arcs,
      centerX,
      centerY,
      interactionConfig,
      model.innerRadius,
      props.selectedIndex,
      radius
    ]
  );
  const responderProps: ViewProps = isInteractionEnabled
    ? {
        onStartShouldSetResponder: () => true,
        onResponderGrant: (event: GestureResponderEvent) => {
          event.preventDefault();
        },
        onResponderRelease: handleResponderRelease,
        onResponderTerminationRequest: () => true
      }
    : {};
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
      {...responderProps}
    >
      <SvgSurface width={props.width} height={chartHeight}>
        <SvgLayer name="background">
          {arcs.map((arc) => {
            if (!arc.defined) {
              return null;
            }

            const isSelected = selectedIndex === arc.index;
            const opacity = hasSelectedSlice
              ? isSelected
                ? activeSlice.activeOpacity
                : activeSlice.inactiveOpacity
              : 1;

            return (
              <SvgPath
                key={`pie-slice-${arc.index}`}
                d={arc.path}
                fill={arc.color ?? resolvedTheme.text}
                opacity={opacity}
                testID={`${props.testID ?? "pie-chart"}-slice.${arc.index}`}
                {...(isSelected
                  ? {
                      stroke: activeSlice.strokeColor,
                      strokeWidth: activeSlice.strokeWidth
                    }
                  : {})}
              />
            );
          })}
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
