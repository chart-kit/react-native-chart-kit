import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import {
  SvgLayer,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { useChartKitTheme } from "../../theme";
import {
  buildContributionGraphModel,
  getContributionGraphMonthLabel,
  getContributionGraphWeekdayLabel
} from "./model";
import type { ContributionGraphProps } from "./types";

export type * from "./types";

export const ContributionGraph = <
  TData extends { date?: string | number | Date; [key: string]: unknown }
>(
  props: ContributionGraphProps<TData>
) => {
  const chartKitTheme = useChartKitTheme();
  const model = useMemo(
    () => buildContributionGraphModel({ chartKitTheme, props }),
    [chartKitTheme, props]
  );
  const { cells, monthLabels, resolvedTheme, weekdayLabels } = model;
  const showMonthLabels = props.showMonthLabels !== false;
  const showWeekdayLabels = props.showWeekdayLabels !== false;
  const accessibilityLabel =
    props.accessibilityLabel ??
    `Contribution graph with ${cells.length} visible days.`;

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
        <SvgLayer name="axes">
          {showMonthLabels
            ? monthLabels.map((label) => (
                <SvgText
                  key={label.key}
                  fill={resolvedTheme.mutedText}
                  fontSize={10}
                  fontWeight="700"
                  x={label.x}
                  y={label.y}
                  {...(resolvedTheme.typography.fontFamily
                    ? { fontFamily: resolvedTheme.typography.fontFamily }
                    : {})}
                >
                  {getContributionGraphMonthLabel(
                    label.monthIndex,
                    label.date,
                    props.getMonthLabel
                  )}
                </SvgText>
              ))
            : null}
          {showWeekdayLabels
            ? weekdayLabels.map((label) => (
                <SvgText
                  key={label.key}
                  fill={resolvedTheme.mutedText}
                  fontSize={9}
                  fontWeight="700"
                  x={label.x}
                  y={label.y}
                  {...(resolvedTheme.typography.fontFamily
                    ? { fontFamily: resolvedTheme.typography.fontFamily }
                    : {})}
                >
                  {getContributionGraphWeekdayLabel(
                    label.dayIndex,
                    props.getWeekdayLabel
                  )}
                </SvgText>
              ))
            : null}
        </SvgLayer>
        <SvgLayer name="data">
          {cells.map((cell) => (
            <SvgRect
              key={`${cell.date.toISOString()}-${cell.weekIndex}-${cell.weekdayIndex}`}
              fill={cell.fill}
              height={cell.size}
              opacity={cell.opacity}
              rx={3}
              ry={3}
              testID={`${props.testID ?? "contribution-graph"}-cell.${
                cell.index
              }`}
              width={cell.size}
              x={cell.x}
              y={cell.y}
              onPress={() => {
                props.onDayPress?.({
                  index: cell.index,
                  date: cell.date,
                  value: cell.value,
                  ...(cell.raw !== undefined ? { raw: cell.raw } : {})
                });
              }}
            />
          ))}
        </SvgLayer>
      </SvgSurface>
    </View>
  );
};

export const CalendarHeatmap = ContributionGraph;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden"
  }
});
