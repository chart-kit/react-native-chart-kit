import { useMemo } from "react";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { useChartKitTheme } from "../../theme";
import { getLineChartRenderer as getContributionGraphRenderer } from "../line/renderer";
import {
  buildContributionGraphModel,
  getContributionGraphMonthLabel,
  getContributionGraphWeekdayLabel
} from "./model";
import { getContributionGraphAccessibilitySummary } from "./accessibility";
import type { ContributionGraphProps } from "./types";

export type * from "./types";
export {
  getContributionGraphAccessibilitySummary,
  getContributionGraphDataTable
} from "./accessibility";
export type {
  ContributionGraphDataTable,
  ContributionGraphDataTableRow
} from "./accessibility";

const RendererLayer = ({
  children
}: {
  children?: ReactNode;
  name?: string;
}) => <>{children}</>;

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
    getContributionGraphAccessibilitySummary({
      accessor: props.accessor,
      endDate: props.endDate,
      numDays: props.numDays,
      values: props.values
    });
  const renderer = getContributionGraphRenderer(
    props.renderer ?? chartKitTheme.renderer
  );
  const Layer = renderer.Layer ?? RendererLayer;
  const Rect = renderer.Rect;
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
      <Surface width={props.width} height={props.height}>
        <Layer name="axes">
          {showMonthLabels && canRenderText
            ? monthLabels.map((label) => {
                const text = getContributionGraphMonthLabel(
                  label.monthIndex,
                  label.date,
                  props.getMonthLabel
                );

                return (
                  <SvgText
                    key={label.key}
                    fill={resolvedTheme.mutedText}
                    fontSize={10}
                    fontWeight="700"
                    text={text}
                    x={label.x}
                    y={label.y}
                    {...(resolvedTheme.typography.fontFamily
                      ? { fontFamily: resolvedTheme.typography.fontFamily }
                      : {})}
                  >
                    {text}
                  </SvgText>
                );
              })
            : null}
          {showWeekdayLabels && canRenderText
            ? weekdayLabels.map((label) => {
                const text = getContributionGraphWeekdayLabel(
                  label.dayIndex,
                  props.getWeekdayLabel
                );

                return (
                  <SvgText
                    key={label.key}
                    fill={resolvedTheme.mutedText}
                    fontSize={9}
                    fontWeight="700"
                    text={text}
                    x={label.x}
                    y={label.y}
                    {...(resolvedTheme.typography.fontFamily
                      ? { fontFamily: resolvedTheme.typography.fontFamily }
                      : {})}
                  >
                    {text}
                  </SvgText>
                );
              })
            : null}
        </Layer>
        <Layer name="data">
          {cells.map((cell) => (
            <Rect
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
        </Layer>
      </Surface>
    </View>
  );
};

export const CalendarHeatmap = ContributionGraph;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden"
  }
});
