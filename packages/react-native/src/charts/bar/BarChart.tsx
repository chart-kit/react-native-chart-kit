import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import type { GestureResponderEvent, ViewProps } from "react-native";

import {
  createSvgTestId,
  SvgLayer,
  SvgLine,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { useChartKitTheme } from "../../theme";
import { getFontFamilyProps } from "../line/text";
import {
  buildBarChartSelectEvent,
  getBarChartBarAtPoint,
  getBarChartBarKey,
  getBarChartInteractionConfig,
  isBarChartInteractionEnabled
} from "./interaction";
import { buildBarChartModel } from "./model";
import { getBarChartTooltipConfig } from "./options";
import {
  getBarChartTooltipModel,
  renderDefaultBarChartTooltip
} from "./tooltip";
import type { BarChartProps } from "./types";

export type * from "./types";

export const BarChart = <TData extends Record<string, unknown>>(
  props: BarChartProps<TData>
) => {
  const chartKitTheme = useChartKitTheme();
  const interactionConfig = useMemo(
    () => getBarChartInteractionConfig(props.interaction),
    [props.interaction]
  );
  const [gestureSelectedBarKey, setGestureSelectedBarKey] = useState<
    string | undefined
  >(() => getBarChartBarKey(props.defaultSelectedBar));
  const model = useMemo(
    () => buildBarChartModel({ ...props, chartKitTheme }),
    [chartKitTheme, props]
  );
  const {
    bars,
    boxes,
    legendItems,
    resolvedTheme,
    showHorizontalGridLines,
    valueLabels,
    xLabels,
    yLabels,
    yTicks
  } = model;
  const barRadius = Math.max(0, props.barRadius ?? 5);
  const fontProps = getFontFamilyProps(resolvedTheme.typography.fontFamily);
  const controlledSelectedBarKey = getBarChartBarKey(props.selectedBar);
  const selectedBarKey = controlledSelectedBarKey ?? gestureSelectedBarKey;
  const selectedBar = bars.find((bar) => bar.key === selectedBarKey);
  const hasSelectedBar = selectedBar !== undefined;
  const tooltipConfig = useMemo(
    () =>
      getBarChartTooltipConfig({
        themeTooltip: resolvedTheme.tooltip,
        tooltip: props.tooltip
      }),
    [props.tooltip, resolvedTheme.tooltip]
  );
  const tooltipModel = useMemo(
    () =>
      getBarChartTooltipModel({
        bar: selectedBar,
        boxes,
        config: tooltipConfig
      }),
    [boxes, selectedBar, tooltipConfig]
  );
  const isInteractionEnabled = isBarChartInteractionEnabled(interactionConfig);
  const handleResponderRelease = useCallback(
    (event: GestureResponderEvent) => {
      event.preventDefault();

      const { locationX, locationY } = event.nativeEvent;
      const tappedBar = getBarChartBarAtPoint({
        bars,
        locationX,
        locationY
      });

      if (!tappedBar) {
        if (interactionConfig.deselectOnOutsidePress) {
          if (props.selectedBar === undefined) {
            setGestureSelectedBarKey(undefined);
          }

          interactionConfig.onDeselect?.({ reason: "outsidePress" });
        }

        return;
      }

      if (props.selectedBar === undefined) {
        setGestureSelectedBarKey(tappedBar.key);
      }

      const selectEvent = buildBarChartSelectEvent(tappedBar);

      if (selectEvent) {
        interactionConfig.onSelect?.(selectEvent);
      }
    },
    [bars, interactionConfig, props.selectedBar]
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
  const accessibilityLabel =
    props.accessibilityLabel ??
    `Bar chart with ${bars.length} bars across ${xLabels.length} visible x-axis labels.`;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={{ width: props.width, height: props.height }}
      testID={props.testID}
      {...responderProps}
    >
      <SvgSurface width={props.width} height={props.height}>
        <SvgLayer name="background">
          <SvgRect
            x={0}
            y={0}
            width={props.width}
            height={props.height}
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
          {showHorizontalGridLines
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
                    strokeOpacity={0.78}
                    strokeWidth={1}
                  />
                ) : null;
              })
            : null}
        </SvgLayer>
        <SvgLayer name="data">
          {bars.map((bar) => {
            const isSelected = selectedBarKey === bar.key;

            return (
              <SvgRect
                key={bar.key}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={Math.min(barRadius, bar.width / 2, bar.height / 2)}
                fill={bar.color}
                opacity={hasSelectedBar && !isSelected ? 0.42 : 1}
                {...(isSelected
                  ? {
                      stroke: resolvedTheme.text,
                      strokeOpacity: 0.32,
                      strokeWidth: 1.5
                    }
                  : {})}
                testID={createSvgTestId(
                  "bar-chart-bar",
                  bar.seriesKey,
                  bar.dataIndex
                )}
              />
            );
          })}
        </SvgLayer>
        <SvgLayer name="axes">
          {yLabels.map((label) => (
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
          ))}
          {xLabels.map((label) => (
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
          ))}
          {valueLabels.map((label) => (
            <SvgText
              key={label.key}
              x={label.x}
              y={label.y}
              fill={label.color}
              fontSize={resolvedTheme.typography.axisLabelSize}
              textAnchor="middle"
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
        <SvgLayer name="interaction">
          {tooltipModel
            ? renderDefaultBarChartTooltip({
                ...tooltipModel,
                config: tooltipConfig
              })
            : null}
        </SvgLayer>
      </SvgSurface>
    </View>
  );
};
