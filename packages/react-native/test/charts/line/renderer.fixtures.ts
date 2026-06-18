import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode
} from "react";
import { expect } from "vitest";
import type { LayoutDebugModel } from "@chart-kit/core";

import { resolveCartesianChartThemeConfig } from "../../../src/theme/presets";
import type {
  LineChartLegendRenderProps,
  LineChartRenderer,
  LineChartTooltipRenderProps
} from "../../../src/charts/line/LineChart";
import type { ResolvedLineChartLegendConfig } from "../../../src/charts/line/types";
import type { LineChartModel } from "../../../src/charts/line/useChartModel";

export const Primitive = () => null;
export const ElementPrimitive = () => null;

export const getFragmentChildren = (node: ReactNode): ReactElement[] => {
  expect(isValidElement<{ children?: ReactNode }>(node)).toBe(true);

  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return [];
  }

  return Children.toArray(node.props.children).filter(isValidElement);
};

export const getRenderedChildren = (node: ReactNode): ReactElement[] =>
  Children.toArray(node).filter(isValidElement);

export const geometries = [
  {
    geometry: {
      area: { path: "M 0 12 L 10 8 L 20 14 L 20 20 L 0 20 Z" },
      key: "price",
      label: "Price",
      line: { path: "M 0 12 L 10 8 L 20 14" },
      points: []
    },
    style: {
      areaFill: {
        fromColor: "#2563eb",
        fromOpacity: 0.2,
        toColor: "#2563eb",
        toOpacity: 0
      },
      color: "#2563eb",
      dot: {
        fill: "background" as const,
        opacity: 1,
        radius: 3,
        shape: "circle" as const,
        stroke: "series" as const,
        strokeWidth: 2,
        visible: true
      },
      strokeStyle: {
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        strokeOpacity: 0.72
      },
      strokeWidth: 3,
      threshold: {
        aboveColor: "#16a34a",
        aboveOpacity: 1,
        areaAboveColor: "#16a34a",
        areaBelowColor: "#dc2626",
        areaOpacity: 0.18,
        belowColor: "#dc2626",
        belowOpacity: 1,
        y: 10
      }
    }
  }
] as unknown as LineChartModel<Record<string, unknown>>["geometries"];

export const primitiveRenderer: LineChartRenderer = {
  Circle: ElementPrimitive,
  Defs: ElementPrimitive,
  Group: ElementPrimitive,
  Line: ElementPrimitive,
  Path: ElementPrimitive,
  Rect: ElementPrimitive,
  Surface: ElementPrimitive,
  Text: ElementPrimitive,
  capabilities: {
    clipPaths: false,
    gradients: false,
    pathGradients: false,
    rectClips: false,
    text: true
  },
  name: "primitive-test"
};

export const defaultLegendConfig: ResolvedLineChartLegendConfig = {
  align: "start",
  fontFamily: undefined,
  fontSize: 12,
  itemGap: 20,
  itemPaddingHorizontal: 0,
  itemPaddingVertical: 0,
  labelColor: "#0f172a",
  labelGap: 6,
  marker: "square",
  markerSize: 8,
  padding: 0,
  position: "top",
  renderItem: undefined,
  renderLegend: undefined,
  rowGap: 8,
  visible: true,
  wrap: true
};

export const defaultLegendProps: LineChartLegendRenderProps = {
  align: "start",
  height: 24,
  items: [
    {
      color: "#2563eb",
      contentHeight: 24,
      contentWidth: 64,
      contentX: 8,
      contentY: 4,
      fontSize: 12,
      height: 24,
      index: 0,
      key: "price",
      label: "Price",
      labelColor: "#0f172a",
      labelGap: 6,
      marker: "square",
      markerSize: 8,
      paddingHorizontal: 0,
      paddingVertical: 0,
      strokeLinecap: "round",
      strokeOpacity: 0.82,
      strokeWidth: 3,
      width: 80,
      x: 0,
      y: 0
    }
  ],
  position: "top",
  theme: resolveCartesianChartThemeConfig({ mode: "light" }),
  width: 80,
  x: 0,
  y: 0
};

export const defaultTooltipProps: LineChartTooltipRenderProps<
  Record<string, unknown>
> = {
  config: {
    anchor: "point",
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderRadius: 8,
    edgePadding: 4,
    fontFamily: undefined,
    fontSize: 12,
    labelColor: "#64748b",
    labelFontSize: 12,
    offset: 12,
    padding: 10,
    placement: "auto",
    positionAnimationDuration: 220,
    shadowColor: "#020617",
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    shadowOpacity: 0.08,
    shared: true,
    textColor: "#0f172a",
    visible: true,
    width: undefined
  },
  height: 62,
  index: 0,
  series: [
    {
      color: "#2563eb",
      formattedValue: "$57k",
      key: "actual",
      label: "Actual",
      point: {
        dataIndex: 0,
        defined: true,
        index: 0,
        seriesKey: "actual",
        value: 57,
        x: 42,
        xValue: "Jan",
        y: 80
      },
      value: 57
    }
  ],
  theme: resolveCartesianChartThemeConfig({ mode: "light" }),
  width: 124,
  x: 16,
  xLabel: "Jan 2026",
  y: 20
};

export const debugLayoutModel: LayoutDebugModel = {
  rects: [
    {
      height: 120,
      id: "plot",
      kind: "plot",
      text: "plot",
      width: 240,
      x: 40,
      y: 20
    }
  ]
};
