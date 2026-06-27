import { useCallback, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { GestureResponderEvent, ViewProps } from "react-native";

import { useChartKitTheme } from "../../theme";
import { getLineChartRenderer as getContributionGraphRenderer } from "../line/renderer";
import {
  buildContributionGraphModel,
  getContributionGraphMonthLabel,
  getContributionGraphWeekdayLabel
} from "./model";
import { getContributionGraphAccessibilitySummary } from "./accessibility";
import {
  buildContributionGraphDayPressEvent,
  getContributionGraphCellAtPoint,
  getContributionGraphCellKey,
  getContributionGraphInteractionConfig
} from "./interaction";
import type {
  ContributionGraphActiveCellConfig,
  ContributionGraphCellModel,
  ContributionGraphProps
} from "./types";

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

const activeCellDefaultScale = 1.8;

const getDateKey = (input: string | number | Date | undefined) => {
  if (input === undefined) {
    return undefined;
  }

  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const date = input instanceof Date ? input : new Date(input);

  if (Number.isNaN(date.valueOf())) {
    return undefined;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeActiveCellScale = (scale: number | undefined) =>
  typeof scale === "number" && Number.isFinite(scale) && scale >= 1
    ? scale
    : activeCellDefaultScale;

const getActiveCellGeometry = <TData extends Record<string, unknown>>({
  activeCell,
  cell
}: {
  activeCell: ContributionGraphActiveCellConfig | undefined;
  cell: ContributionGraphCellModel<TData>;
}) => {
  const scale = normalizeActiveCellScale(activeCell?.scale);
  const size = cell.size * scale;
  const offset = (size - cell.size) / 2;

  return {
    rx: Math.max(3, cell.size * 0.42),
    size,
    x: cell.x - offset,
    y: cell.y - offset
  };
};

export const ContributionGraph = <
  TData extends { date?: string | number | Date; [key: string]: unknown }
>(
  props: ContributionGraphProps<TData>
) => {
  const chartKitTheme = useChartKitTheme();
  const interactionConfig = useMemo(
    () => getContributionGraphInteractionConfig(props.interaction),
    [props.interaction]
  );
  const lastSelectedCellKeyRef = useRef<string | undefined>(undefined);
  const model = useMemo(
    () => buildContributionGraphModel({ chartKitTheme, props }),
    [chartKitTheme, props]
  );
  const { cells, monthLabels, resolvedTheme, weekdayLabels } = model;
  const activeCell = props.activeCell === false ? undefined : props.activeCell;
  const activeCellDateKey = getDateKey(activeCell?.date);
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
  const hasSelectionHandler =
    props.onDayPress !== undefined || interactionConfig.onSelect !== undefined;
  const isTapEnabled = interactionConfig.mode === "tap" && hasSelectionHandler;
  const isPressAndDragEnabled =
    interactionConfig.mode === "pressAndDrag" && hasSelectionHandler;
  const isActiveCell = useCallback(
    (cell: ContributionGraphCellModel<TData>) => {
      if (!activeCell) {
        return false;
      }

      if (activeCell.index !== undefined && cell.index === activeCell.index) {
        return true;
      }

      return (
        activeCellDateKey !== undefined &&
        getDateKey(cell.date) === activeCellDateKey
      );
    },
    [activeCell, activeCellDateKey]
  );
  const activeCells = useMemo(
    () => (activeCell ? cells.filter(isActiveCell) : []),
    [activeCell, cells, isActiveCell]
  );
  const emitCellSelection = useCallback(
    (
      cell: ContributionGraphCellModel<TData>,
      options: { dedupe?: boolean } = {}
    ) => {
      const cellKey = getContributionGraphCellKey(cell);

      if (options.dedupe && lastSelectedCellKeyRef.current === cellKey) {
        return;
      }

      lastSelectedCellKeyRef.current = cellKey;
      const selectEvent = buildContributionGraphDayPressEvent(cell);

      props.onDayPress?.(selectEvent);
      interactionConfig.onSelect?.(selectEvent);
    },
    [interactionConfig, props.onDayPress]
  );
  const selectCellAtEventLocation = useCallback(
    (event: GestureResponderEvent) => {
      event.preventDefault();

      const { locationX, locationY } = event.nativeEvent;
      const cell = getContributionGraphCellAtPoint({
        cells,
        hitSlop: interactionConfig.hitSlop,
        locationX: locationX + interactionConfig.pointerOffset.x,
        locationY: locationY + interactionConfig.pointerOffset.y
      });

      if (cell) {
        emitCellSelection(cell, { dedupe: true });
      }
    },
    [
      cells,
      emitCellSelection,
      interactionConfig.hitSlop,
      interactionConfig.pointerOffset.x,
      interactionConfig.pointerOffset.y
    ]
  );
  const resetDraggedCell = useCallback(() => {
    lastSelectedCellKeyRef.current = undefined;
  }, []);
  const responderProps: ViewProps = isPressAndDragEnabled
    ? {
        onStartShouldSetResponderCapture: () => true,
        onMoveShouldSetResponderCapture: () => true,
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onResponderGrant: (event: GestureResponderEvent) => {
          resetDraggedCell();
          selectCellAtEventLocation(event);
        },
        onResponderMove: selectCellAtEventLocation,
        onResponderRelease: resetDraggedCell,
        onResponderTerminate: resetDraggedCell,
        onResponderTerminationRequest: () => false
      }
    : {};

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
              onPress={isTapEnabled ? () => emitCellSelection(cell) : undefined}
            />
          ))}
          {activeCells.map((cell) => {
            const geometry = getActiveCellGeometry({ activeCell, cell });

            return (
              <Rect
                key={`${cell.date.toISOString()}-${cell.weekIndex}-${cell.weekdayIndex}-active`}
                fill={cell.fill}
                height={geometry.size}
                opacity={activeCell?.opacity ?? cell.opacity}
                rx={geometry.rx}
                ry={geometry.rx}
                stroke={activeCell?.strokeColor}
                strokeWidth={activeCell?.strokeWidth}
                testID={`${props.testID ?? "contribution-graph"}-cell.${
                  cell.index
                }.active`}
                width={geometry.size}
                x={geometry.x}
                y={geometry.y}
                onPress={
                  isTapEnabled ? () => emitCellSelection(cell) : undefined
                }
              />
            );
          })}
        </Layer>
      </Surface>
    </View>
  );
};

export const CalendarHeatmap = ContributionGraph;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden"
  }
});
