import { useCallback, useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { GestureResponderEvent, ViewProps } from "react-native";

import { useChartKitTheme } from "../../theme";
import { useScopedChartSelection } from "../../selection/ChartSelectionProvider";
import { getLineChartRenderer as getPieChartRenderer } from "../line/renderer";
import { getPieChartAccessibilitySummary } from "./accessibility";
import { resolvePieChartActiveSliceConfig } from "./activeSlice";
import {
  buildPieChartSelectEvent,
  getPieChartInteractionConfig,
  getPieChartSliceAtPoint,
  isPieChartInteractionEnabled,
  normalizePieChartSelectedIndex
} from "./interaction";
import { buildPieChartModel } from "./model";
import { usePieChartSelectionAnimation } from "./selectionAnimation";
import { PieChartSlices } from "./slices";
import type { PieChartCenterLabelRenderProps, PieChartProps } from "./types";

export type * from "./types";
export {
  getPieChartAccessibilitySummary,
  getPieChartDataTable
} from "./accessibility";
export type { PieChartDataTable, PieChartDataTableRow } from "./accessibility";

const defaultDonutInnerRadiusRatio = 0.58;
const defaultPieLegendGap = 8;

const RendererLayer = ({
  children
}: {
  children?: ReactNode;
  name?: string;
}) => <>{children}</>;

export const PieChart = <TData extends Record<string, unknown>>(
  props: PieChartProps<TData>
) => {
  const generatedChartId = useId().replace(/:/g, "");
  const scopedChartId = props.id ?? generatedChartId;
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
    () => buildPieChartModel({ chartKitTheme, props, selectedIndex }),
    [chartKitTheme, props, selectedIndex]
  );
  const {
    arcLabels,
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
  const legendConfig = typeof props.legend === "object" ? props.legend : {};
  const activeSlice = resolvePieChartActiveSliceConfig({
    activeSlice: props.activeSlice,
    backgroundColor: resolvedTheme.background
  });
  const selectionAnimationState = usePieChartSelectionAnimation({
    animation: props.selectionAnimation,
    selectedIndex
  });
  const isInteractionEnabled = isPieChartInteractionEnabled(interactionConfig);
  const hasSelectedSlice = selectedIndex !== undefined;
  const clearGestureSelection = useCallback(
    (reason: "outsidePress" | "programmatic") => {
      if (props.selectedIndex === undefined) {
        setGestureSelectedIndex(undefined);
      }

      interactionConfig.onDeselect?.({ reason });
    },
    [interactionConfig, props.selectedIndex]
  );
  const clearSelectionFromScope = useCallback(
    (reason: "outsidePress" | "programmatic" | "scopeChange") => {
      if (reason === "scopeChange") {
        if (props.selectedIndex === undefined) {
          setGestureSelectedIndex(undefined);
        }

        return;
      }

      clearGestureSelection(reason);
    },
    [clearGestureSelection, props.selectedIndex]
  );
  const scopedSelection = useScopedChartSelection({
    chartId: scopedChartId,
    controlled: props.selectedIndex !== undefined,
    hasSelection: hasSelectedSlice,
    onClear: clearSelectionFromScope
  });
  const clearScopedGestureSelection = useCallback(
    (reason: "outsidePress" | "programmatic") => {
      clearGestureSelection(reason);

      if (reason !== "programmatic") {
        scopedSelection.dismissSelection?.(reason);
      }
    },
    [clearGestureSelection, scopedSelection]
  );
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
          clearScopedGestureSelection("outsidePress");
        }

        return;
      }

      if (props.selectedIndex === undefined) {
        setGestureSelectedIndex(tappedSlice.index);
      }

      scopedSelection.selectChart();
      const selectEvent = buildPieChartSelectEvent(tappedSlice);

      if (selectEvent) {
        interactionConfig.onSelect?.(selectEvent);
      }
    },
    [
      arcs,
      centerX,
      centerY,
      clearScopedGestureSelection,
      interactionConfig,
      model.innerRadius,
      props.selectedIndex,
      radius,
      scopedSelection
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
  const centerLabelProps: PieChartCenterLabelRenderProps<TData> = {
    arcs,
    theme: resolvedTheme,
    total
  };

  if (selectedIndex !== undefined) {
    centerLabelProps.selectedIndex = selectedIndex;

    const selectedArc = arcs[selectedIndex];

    if (selectedArc) {
      centerLabelProps.selectedArc = selectedArc;
    }
  }

  const centerLabel =
    typeof props.centerLabel === "function"
      ? props.centerLabel(centerLabelProps)
      : props.centerLabel;
  const isTextCenterLabel =
    typeof centerLabel === "string" && centerLabel.length > 0;
  const customCenterLabel =
    centerLabel !== undefined && centerLabel !== null && !isTextCenterLabel
      ? centerLabel
      : null;
  const accessibilityLabel =
    props.accessibilityLabel ??
    getPieChartAccessibilitySummary({
      colorKey: props.colorKey,
      colors: props.colors,
      data: props.data,
      formatPercentage: props.formatPercentage,
      formatValue: props.formatValue,
      labelKey: props.labelKey,
      valueKey: props.valueKey
    });
  const renderer = getPieChartRenderer(
    props.renderer ?? chartKitTheme.renderer
  );
  const Layer = renderer.Layer ?? RendererLayer;
  const Line = renderer.Line;
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
      {...responderProps}
    >
      <Surface width={props.width} height={chartHeight}>
        <Layer name="background">
          <PieChartSlices
            activeSlice={activeSlice}
            arcs={arcs}
            centerX={centerX}
            centerY={centerY}
            innerRadius={model.innerRadius}
            radius={radius}
            renderer={renderer}
            resolvedTheme={resolvedTheme}
            selectedIndex={selectedIndex}
            selectionAnimationState={selectionAnimationState}
            testID={props.testID}
          />
        </Layer>
        {isTextCenterLabel && canRenderText ? (
          <Layer name="overlays">
            <SvgText
              fill={resolvedTheme.text}
              fontSize={16}
              fontWeight="800"
              text={centerLabel}
              textAnchor="middle"
              x={centerX}
              y={centerY + 5}
              {...(resolvedTheme.typography.fontFamily
                ? { fontFamily: resolvedTheme.typography.fontFamily }
                : {})}
            >
              {centerLabel}
            </SvgText>
          </Layer>
        ) : null}
        {arcLabels.length > 0 ? (
          <Layer name="interaction">
            {arcLabels.map((label) =>
              label.connectorVisible ? (
                <Line
                  key={`${label.key}-connector-a`}
                  x1={label.connectorStartX}
                  x2={label.connectorBendX}
                  y1={label.connectorStartY}
                  y2={label.connectorBendY}
                  stroke={label.connectorColor}
                  strokeOpacity={label.connectorOpacity}
                  strokeWidth={label.connectorWidth}
                />
              ) : null
            )}
            {arcLabels.map((label) =>
              label.connectorVisible ? (
                <Line
                  key={`${label.key}-connector-b`}
                  x1={label.connectorBendX}
                  x2={label.connectorEndX}
                  y1={label.connectorBendY}
                  y2={label.connectorEndY}
                  stroke={label.connectorColor}
                  strokeOpacity={label.connectorOpacity}
                  strokeWidth={label.connectorWidth}
                />
              ) : null
            )}
            {canRenderText
              ? arcLabels.map((label) => (
                  <SvgText
                    key={label.key}
                    fill={resolvedTheme.text}
                    fontSize={label.fontSize}
                    fontWeight="800"
                    text={label.text}
                    textAnchor={label.textAnchor}
                    x={label.x}
                    y={label.y + label.fontSize / 3}
                    {...(resolvedTheme.typography.fontFamily
                      ? { fontFamily: resolvedTheme.typography.fontFamily }
                      : {})}
                  >
                    {label.text}
                  </SvgText>
                ))
              : null}
          </Layer>
        ) : null}
      </Surface>
      {customCenterLabel ? (
        <View
          pointerEvents="none"
          style={[
            styles.centerLabelOverlay,
            {
              height: Math.max(44, Math.min(76, radius * 0.82)),
              top: centerY - Math.max(22, Math.min(38, radius * 0.41)),
              width: props.width
            }
          ]}
        >
          {customCenterLabel}
        </View>
      ) : null}
      {legendVisible && legendItems.length > 0 ? (
        <View
          style={[
            styles.legend,
            {
              gap: legendConfig.itemGap ?? defaultPieLegendGap
            }
          ]}
        >
          {legendItems.map((item, index) => {
            const selected = selectedIndex === item.index;
            const renderedItem = legendConfig.renderItem?.({
              index,
              item,
              selected,
              theme: resolvedTheme
            });

            return (
              <View
                key={item.key}
                style={[
                  styles.legendItem,
                  {
                    maxWidth: legendConfig.maxItemWidth ?? "48%"
                  }
                ]}
              >
                {renderedItem ?? (
                  <>
                    <View
                      style={[
                        styles.legendSwatch,
                        { backgroundColor: item.color }
                      ]}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.legendText, { color: resolvedTheme.text }]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.legendValue,
                        { color: resolvedTheme.mutedText }
                      ]}
                    >
                      {item.percentageLabel}
                    </Text>
                  </>
                )}
              </View>
            );
          })}
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
  centerLabelOverlay: {
    alignItems: "center",
    justifyContent: "center",
    left: 0,
    position: "absolute"
  },
  legend: {
    alignContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: defaultPieLegendGap,
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
