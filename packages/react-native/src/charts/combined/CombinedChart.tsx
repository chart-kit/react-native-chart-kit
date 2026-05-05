import { useCallback, useId, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { GestureResponderEvent, ViewProps } from "react-native";

import {
  SvgCircle,
  SvgLayer,
  SvgLine,
  SvgPath,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { useChartKitTheme } from "../../theme";
import { useScopedChartSelection } from "../../selection/ChartSelectionProvider";
import { getLineChartTooltipConfig } from "../line/options";
import { getLineChartTooltipModel } from "../line/tooltip";
import { getFontFamilyProps } from "../line/text";
import { measureBarChartText } from "../bar/modelUtils";
import {
  buildCombinedChartSelectEvent,
  getCombinedChartInteractionConfig,
  getNearestCombinedChartInteractionIndex,
  getSelectedCombinedSeries,
  isCombinedChartInteractionEnabled,
  isCombinedChartInteractionInBounds,
  normalizeCombinedChartSelectedIndex
} from "./interaction";
import { buildCombinedChartModel } from "./model";
import {
  renderDefaultCombinedChartTooltip,
  useAnimatedCombinedChartTooltipModel
} from "./tooltip";
import type {
  CombinedChartProps,
  CombinedChartTooltipPoint,
  CombinedChartTooltipRenderProps
} from "./types";

export type * from "./types";
export { buildCombinedChartModel } from "./model";
export {
  buildCombinedChartSelectEvent,
  getNearestCombinedChartInteractionIndex,
  getSelectedCombinedSeries
} from "./interaction";

export const CombinedChart = <TData extends Record<string, unknown>>(
  props: CombinedChartProps<TData>
) => {
  const generatedChartId = useId().replace(/:/g, "");
  const scopedChartId = props.id ?? generatedChartId;
  const chartKitTheme = useChartKitTheme();
  const model = useMemo(
    () => buildCombinedChartModel({ ...props, chartKitTheme }),
    [chartKitTheme, props]
  );
  const interactionConfig = useMemo(
    () => getCombinedChartInteractionConfig(props.interaction),
    [props.interaction]
  );
  const [gestureSelectedIndex, setGestureSelectedIndex] = useState<
    number | undefined
  >(() => normalizeCombinedChartSelectedIndex(props.defaultSelectedIndex));
  const selectedIndex =
    normalizeCombinedChartSelectedIndex(props.selectedIndex) ??
    gestureSelectedIndex;
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
    hasSelection: selectedIndex !== undefined,
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
  const {
    bars,
    boxes,
    interactionPoints,
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
  const selectedPoint = interactionPoints.find(
    (point) => point.dataIndex === selectedIndex
  );
  const selectedSeries = useMemo(
    () => getSelectedCombinedSeries({ model, selectedIndex }),
    [model, selectedIndex]
  );
  const tooltipConfig = useMemo(
    () =>
      getLineChartTooltipConfig({
        themeFontFamily: resolvedTheme.typography.fontFamily,
        themeTooltip: resolvedTheme.tooltip,
        tooltip: props.tooltip
      }),
    [props.tooltip, resolvedTheme.tooltip, resolvedTheme.typography.fontFamily]
  );
  const tooltipModel: CombinedChartTooltipRenderProps<TData> | undefined =
    selectedPoint && selectedSeries.length > 0
      ? getLineChartTooltipModel<
          CombinedChartTooltipPoint<TData>,
          typeof resolvedTheme
        >({
          chartHeight: props.height,
          chartWidth: props.width,
          config: tooltipConfig,
          measureText: measureBarChartText,
          plotX: boxes.plot.x,
          plotY: boxes.plot.y,
          selection: {
            index: selectedPoint.dataIndex,
            x: selectedPoint.x,
            y: Math.min(...selectedSeries.map((item) => item.point.y)),
            xLabel: selectedPoint.xLabel,
            series: selectedSeries
          },
          theme: resolvedTheme
        })
      : undefined;
  const animatedTooltip = useAnimatedCombinedChartTooltipModel(tooltipModel);
  const handleResponderRelease = useCallback(
    (event: GestureResponderEvent) => {
      event.preventDefault();

      const { locationX, locationY } = event.nativeEvent;

      if (
        !isCombinedChartInteractionInBounds({
          bounds: boxes.plot,
          locationX,
          locationY
        })
      ) {
        if (interactionConfig.deselectOnOutsidePress) {
          clearScopedGestureSelection("outsidePress");
        }

        return;
      }

      const nextSelectedIndex = getNearestCombinedChartInteractionIndex({
        locationX,
        points: interactionPoints
      });

      if (nextSelectedIndex === undefined) {
        return;
      }

      if (props.selectedIndex === undefined) {
        setGestureSelectedIndex(nextSelectedIndex);
      }

      scopedSelection.selectChart();
      const eventModel = buildCombinedChartSelectEvent({
        interactionPoints,
        selectedIndex: nextSelectedIndex,
        selectedSeries: getSelectedCombinedSeries({
          model,
          selectedIndex: nextSelectedIndex
        })
      });

      if (eventModel) {
        interactionConfig.onSelect?.(eventModel);
      }
    },
    [
      boxes.plot,
      clearScopedGestureSelection,
      interactionConfig,
      interactionPoints,
      model,
      props.selectedIndex,
      scopedSelection
    ]
  );
  const responderProps: ViewProps = isCombinedChartInteractionEnabled(
    interactionConfig
  )
    ? {
        onStartShouldSetResponder: () => true,
        onResponderGrant: (event: GestureResponderEvent) => {
          event.preventDefault();
        },
        onResponderRelease: handleResponderRelease,
        onResponderTerminationRequest: () => true
      }
    : {};
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
      {...responderProps}
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
                opacity={item.active ? 1 : 0.36}
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
                opacity={item.active ? 1 : 0.36}
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
              opacity={item.active ? 1 : 0.45}
              textAnchor="start"
              x={item.labelX}
              y={item.labelY}
              {...fontProps}
            >
              {item.label}
            </SvgText>
          ))}
        </SvgLayer>
        <SvgLayer name="interaction">
          {selectedPoint && selectedSeries.length > 0 ? (
            <SvgLine
              key="combined-selection-line"
              stroke={resolvedTheme.axis}
              strokeOpacity={0.72}
              strokeWidth={1}
              x1={selectedPoint.x}
              x2={selectedPoint.x}
              y1={boxes.plot.y}
              y2={boxes.plot.y + boxes.plot.height}
            />
          ) : null}
          {selectedSeries.map((item) =>
            item.point.kind === "line" ? (
              <SvgCircle
                key={`combined-selection-dot-${item.key}`}
                cx={item.point.x}
                cy={item.point.y}
                fill={resolvedTheme.plotBackground}
                r={4.5}
                stroke={item.color}
                strokeWidth={2}
              />
            ) : null
          )}
          {animatedTooltip
            ? props.renderTooltip
              ? props.renderTooltip(animatedTooltip)
              : renderDefaultCombinedChartTooltip(animatedTooltip)
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
