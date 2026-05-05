import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode
} from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@chart-kit/svg-renderer", () => {
  const MockPrimitive = () => null;

  return {
    SvgClipRect: MockPrimitive,
    SvgCircle: MockPrimitive,
    SvgDefs: MockPrimitive,
    SvgGroup: MockPrimitive,
    SvgLayer: MockPrimitive,
    SvgLine: MockPrimitive,
    SvgLinearGradientDef: MockPrimitive,
    SvgPath: MockPrimitive,
    SvgRect: MockPrimitive,
    SvgSurface: MockPrimitive,
    SvgText: MockPrimitive,
    createSvgTestId: (...parts: Array<string | number>) =>
      parts.map(String).join(".")
  };
});

import {
  getLineChartRenderer,
  lineChartSvgRenderer
} from "../src/charts/line/renderer";
import { renderDefaultDot } from "../src/charts/line/markers";
import { resolveCartesianChartThemeConfig } from "../src/theme/presets";
import {
  LineChartAreaPaths,
  LineChartLinePaths,
  LineChartThresholdClipDefs
} from "../src/charts/line/thresholdRendering";
import type {
  LineChartDotRenderProps,
  LineChartRenderer
} from "../src/charts/line/LineChart";
import type { LineChartModel } from "../src/charts/line/useChartModel";
import type { SkiaRenderer } from "../../skia-renderer/src/types";

type SkiaRendererAssignable = SkiaRenderer extends LineChartRenderer
  ? true
  : false;

const skiaRendererAssignable: SkiaRendererAssignable = true;

const Primitive = () => null;
const ElementPrimitive = () => null;

const getFragmentChildren = (node: ReactNode): ReactElement[] => {
  expect(isValidElement<{ children?: ReactNode }>(node)).toBe(true);

  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return [];
  }

  return Children.toArray(node.props.children).filter(isValidElement);
};

const geometries = [
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

const skiaLikeRenderer: LineChartRenderer = {
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
    text: true
  },
  name: "skia-test"
};

describe("LineChart renderer adapter", () => {
  it("uses the SVG renderer when no renderer is injected", () => {
    expect(getLineChartRenderer(undefined)).toBe(lineChartSvgRenderer);
    expect(lineChartSvgRenderer.capabilities).toMatchObject({
      clipPaths: true,
      gradients: true,
      text: true
    });
  });

  it("keeps an injected renderer object intact", () => {
    const injectedRenderer: LineChartRenderer = {
      Circle: Primitive,
      Defs: Primitive,
      Group: Primitive,
      Line: Primitive,
      Path: Primitive,
      Rect: Primitive,
      Surface: Primitive,
      Text: Primitive,
      capabilities: {
        clipPaths: false,
        gradients: false,
        text: false
      },
      name: "test-renderer"
    };

    expect(getLineChartRenderer(injectedRenderer)).toBe(injectedRenderer);
    expect(skiaRendererAssignable).toBe(true);
  });

  it("falls back to solid area and single-color lines when renderer capabilities are limited", () => {
    const areaChildren = getFragmentChildren(
      LineChartAreaPaths({
        chartId: "chart",
        geometries,
        renderer: skiaLikeRenderer
      })
    );
    const lineChildren = getFragmentChildren(
      LineChartLinePaths({
        chartId: "chart",
        geometries,
        renderer: skiaLikeRenderer
      })
    );
    const clipDefs = LineChartThresholdClipDefs({
      chartId: "chart",
      geometries,
      plot: { height: 100, width: 200, x: 0, y: 0 },
      renderer: skiaLikeRenderer,
      yScale: { scale: (value: number) => value } as LineChartModel<
        Record<string, unknown>
      >["yScale"]
    });

    expect(areaChildren).toHaveLength(1);
    expect(areaChildren[0]?.props).toMatchObject({
      d: "M 0 12 L 10 8 L 20 14 L 20 20 L 0 20 Z",
      fill: "#2563eb",
      opacity: 0.2
    });
    expect(lineChildren).toHaveLength(1);
    expect(lineChildren[0]?.props).toMatchObject({
      d: "M 0 12 L 10 8 L 20 14",
      stroke: "#2563eb",
      strokeOpacity: 0.72,
      strokeWidth: 3
    });
    expect(clipDefs).toBeNull();
  });

  it("renders default markers through injected primitives", () => {
    const markerProps: LineChartDotRenderProps<Record<string, unknown>> = {
      color: "#2563eb",
      config: geometries[0]!.style.dot,
      dataIndex: 0,
      point: {
        dataIndex: 0,
        defined: true,
        index: 0,
        seriesKey: "price",
        value: 42,
        x: 24,
        xValue: "Jan",
        y: 36
      },
      seriesKey: "price",
      seriesLabel: "Price",
      theme: resolveCartesianChartThemeConfig({ mode: "light" }),
      value: 42,
      x: 24,
      y: 36
    };
    const marker = renderDefaultDot(markerProps, skiaLikeRenderer);

    expect(marker).toMatchObject({
      props: {
        cx: 24,
        cy: 36,
        fill: "#ffffff",
        r: 3,
        stroke: "#2563eb"
      },
      type: ElementPrimitive
    });
  });
});
