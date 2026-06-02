import type { PieArcModel } from "@chart-kit/core";

import type { ResolvedCartesianChartTheme } from "../../theme";
import {
  getAnimatedPieSliceOpacity,
  getAnimatedPieSlicePath,
  type PieChartSelectionAnimationState
} from "./selectionAnimation";
import type { ResolvedPieChartActiveSliceConfig } from "./activeSlice";
import type {
  PieChartRenderer,
  ResolvedPieChartSliceSeparatorConfig
} from "./types";

export const PieChartSlices = <TData,>({
  activeSlice,
  arcs,
  centerX,
  centerY,
  innerRadius,
  radius,
  renderer,
  resolvedTheme,
  selectedIndex,
  selectionAnimationState,
  sliceSeparator,
  testID
}: {
  activeSlice: ResolvedPieChartActiveSliceConfig;
  arcs: Array<PieArcModel<TData>>;
  centerX: number;
  centerY: number;
  innerRadius: number;
  radius: number;
  renderer: PieChartRenderer;
  resolvedTheme: ResolvedCartesianChartTheme;
  selectedIndex: number | undefined;
  selectionAnimationState: PieChartSelectionAnimationState;
  sliceSeparator: ResolvedPieChartSliceSeparatorConfig;
  testID: string | undefined;
}) => {
  const Group = renderer.Group;
  const Path = renderer.Path;
  const renderedArcs =
    selectedIndex === undefined
      ? arcs
      : [
          ...arcs.filter((arc) => arc.index !== selectedIndex),
          ...arcs.filter((arc) => arc.index === selectedIndex)
        ];

  return (
    <>
      {renderedArcs.map((arc) => {
        if (!arc.defined) {
          return null;
        }

        const isSelected = selectedIndex === arc.index;
        const opacity = getAnimatedPieSliceOpacity({
          activeOpacity: activeSlice.activeOpacity,
          inactiveOpacity: activeSlice.inactiveOpacity,
          index: arc.index,
          state: selectionAnimationState
        });
        const path = getAnimatedPieSlicePath({
          activeOffset: activeSlice.activeOffset,
          activeScale: activeSlice.activeScale,
          arc,
          centerX,
          centerY,
          innerRadius,
          radius,
          state: selectionAnimationState
        });
        const separatorStrokeProps = sliceSeparator.visible
          ? {
              stroke: sliceSeparator.color,
              strokeLinejoin: "round",
              strokeOpacity: sliceSeparator.opacity,
              strokeWidth: sliceSeparator.width
            }
          : {};
        const activeStrokeProps =
          isSelected && activeSlice.strokeWidth > 0
            ? {
                stroke: activeSlice.strokeColor,
                strokeLinejoin: "round",
                strokeOpacity: 1,
                strokeWidth: activeSlice.strokeWidth
              }
            : {};
        const strokeProps = isSelected
          ? { ...separatorStrokeProps, ...activeStrokeProps }
          : separatorStrokeProps;

        return (
          <Group key={`pie-slice-${arc.index}`} opacity={opacity}>
            <Path
              d={path}
              fill={arc.color ?? resolvedTheme.text}
              testID={`${testID ?? "pie-chart"}-slice.${arc.index}`}
              {...strokeProps}
            />
          </Group>
        );
      })}
    </>
  );
};
