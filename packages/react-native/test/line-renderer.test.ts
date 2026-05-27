import type { ReactNode } from "react";
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
    createSvgTextMeasurer: () => (text: string) => ({
      height: 14,
      width: text.length * 7
    }),
    createSvgTestId: (...parts: Array<string | number>) =>
      parts.map(String).join(".")
  };
});

vi.mock("react-native", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    View: ({
      children,
      ...props
    }: {
      children?: ReactNode;
      [key: string]: unknown;
    }) => React.createElement("View", props, children)
  };
});

import {
  getLineChartRenderer,
  lineChartSvgRenderer
} from "../src/charts/line/renderer";
import { renderDefaultTooltip } from "../src/charts/line/defaultTooltip";
import { renderConfiguredLegend } from "../src/charts/line/legend";
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
import {
  ElementPrimitive,
  Primitive,
  defaultLegendConfig,
  defaultLegendProps,
  defaultTooltipProps,
  geometries,
  getFragmentChildren,
  primitiveRenderer
} from "./line-renderer.fixtures";

describe("LineChart renderer parity contract", () => {
  it("uses the SVG renderer when no renderer is injected", () => {
    expect(getLineChartRenderer(undefined)).toBe(lineChartSvgRenderer);
    expect(lineChartSvgRenderer.capabilities).toMatchObject({
      clipPaths: true,
      gradients: true,
      pathGradients: false,
      rectClips: false,
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
        pathGradients: false,
        rectClips: false,
        text: false
      },
      name: "test-renderer"
    };

    expect(getLineChartRenderer(injectedRenderer)).toBe(injectedRenderer);
  });

  it("falls back to solid area and single-color lines when renderer capabilities are limited", () => {
    const areaChildren = getFragmentChildren(
      LineChartAreaPaths({
        chartId: "chart",
        geometries,
        renderer: primitiveRenderer
      })
    );
    const lineChildren = getFragmentChildren(
      LineChartLinePaths({
        chartId: "chart",
        geometries,
        renderer: primitiveRenderer
      })
    );
    const clipDefs = LineChartThresholdClipDefs({
      chartId: "chart",
      geometries,
      plot: { height: 100, width: 200, x: 0, y: 0 },
      renderer: primitiveRenderer,
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

  it("passes area fills as path-local gradients when the renderer supports them", () => {
    const areaChildren = getFragmentChildren(
      LineChartAreaPaths({
        chartId: "chart",
        geometries,
        renderer: {
          ...primitiveRenderer,
          capabilities: {
            ...primitiveRenderer.capabilities,
            pathGradients: true
          }
        }
      })
    );

    expect(areaChildren).toHaveLength(1);
    expect(areaChildren[0]?.props).toMatchObject({
      d: "M 0 12 L 10 8 L 20 14 L 20 20 L 0 20 Z",
      fill: "#2563eb",
      fillGradient: {
        stops: [
          { color: "#2563eb", offset: "0%", opacity: 0.2 },
          { color: "#2563eb", offset: "100%", opacity: 0 }
        ],
        x1: "0%",
        x2: "0%",
        y1: "0%",
        y2: "100%"
      }
    });
    expect(
      (areaChildren[0]?.props as { opacity?: number }).opacity
    ).toBeUndefined();
  });

  it("passes threshold paths as rect-clipped overlays when the renderer supports rect clips", () => {
    const rectClipRenderer: LineChartRenderer = {
      ...primitiveRenderer,
      capabilities: {
        ...primitiveRenderer.capabilities,
        rectClips: true
      }
    };
    const plot = { height: 100, width: 200, x: 4, y: 8 };
    const yScale = { scale: (value: number) => 18 + value } as LineChartModel<
      Record<string, unknown>
    >["yScale"];
    const areaChildren = getFragmentChildren(
      LineChartAreaPaths({
        chartId: "chart",
        geometries,
        plot,
        renderer: rectClipRenderer,
        yScale
      })
    );
    const lineChildren = getFragmentChildren(
      LineChartLinePaths({
        chartId: "chart",
        geometries,
        plot,
        renderer: rectClipRenderer,
        yScale
      })
    );

    expect(areaChildren).toHaveLength(3);
    expect(areaChildren[1]?.props).toMatchObject({
      clipRect: { height: 20, width: 200, x: 4, y: 8 },
      fill: "#16a34a",
      opacity: 0.18
    });
    expect(areaChildren[2]?.props).toMatchObject({
      clipRect: { height: 80, width: 200, x: 4, y: 28 },
      fill: "#dc2626",
      opacity: 0.18
    });
    expect(lineChildren).toHaveLength(2);
    expect(lineChildren[0]?.props).toMatchObject({
      clipRect: { height: 20, width: 200, x: 4, y: 8 },
      stroke: "#16a34a"
    });
    expect(lineChildren[1]?.props).toMatchObject({
      clipRect: { height: 80, width: 200, x: 4, y: 28 },
      stroke: "#dc2626"
    });
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
    const marker = renderDefaultDot(markerProps, primitiveRenderer);

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

  it("renders the default legend through injected primitives", () => {
    const legend = renderConfiguredLegend({
      config: defaultLegendConfig,
      legend: defaultLegendProps,
      renderer: primitiveRenderer
    });
    const legendItems = getFragmentChildren(legend);
    const itemChildren = getFragmentChildren(legendItems[0]);

    expect(legendItems).toHaveLength(1);
    expect(itemChildren).toHaveLength(2);
    expect(itemChildren[0]?.props).toMatchObject({
      fill: "#2563eb",
      height: 8,
      opacity: 0.82,
      stroke: "#2563eb",
      width: 8,
      x: 8,
      y: 12
    });
    expect(itemChildren[1]?.props).toMatchObject({
      fill: "#0f172a",
      fontSize: 12,
      text: "Price",
      x: 22,
      y: 20.32
    });
  });

  it("skips the default legend for renderers without text support", () => {
    expect(
      renderConfiguredLegend({
        config: defaultLegendConfig,
        legend: defaultLegendProps,
        renderer: {
          ...primitiveRenderer,
          capabilities: {
            ...primitiveRenderer.capabilities,
            text: false
          }
        }
      })
    ).toBeNull();
  });

  it("renders the default tooltip through injected primitives", () => {
    const tooltip = renderDefaultTooltip(
      defaultTooltipProps,
      primitiveRenderer
    );
    const tooltipChildren = getFragmentChildren(tooltip);
    const seriesChildren = getFragmentChildren(tooltipChildren[3]);

    expect(tooltipChildren).toHaveLength(4);
    expect(tooltipChildren[0]?.props).toMatchObject({
      fill: "#020617",
      height: 62,
      opacity: 0.08,
      width: 124,
      x: 16,
      y: 22
    });
    expect(tooltipChildren[1]?.props).toMatchObject({
      fill: "#ffffff",
      height: 62,
      rx: 8,
      stroke: "#cbd5e1",
      width: 124,
      x: 16,
      y: 20
    });
    expect(tooltipChildren[2]?.props).toMatchObject({
      fill: "#64748b",
      fontSize: 12,
      text: "Jan 2026",
      x: 26,
      y: 42
    });
    expect(seriesChildren).toHaveLength(2);
    expect(seriesChildren[0]?.props).toMatchObject({
      cx: 29,
      fill: "#2563eb",
      r: 3
    });
    expect(seriesChildren[1]?.props).toMatchObject({
      fill: "#0f172a",
      fontSize: 12,
      text: "Actual: $57k",
      x: 38
    });
  });

  it("skips the default tooltip for renderers without text support", () => {
    expect(
      renderDefaultTooltip(defaultTooltipProps, {
        ...primitiveRenderer,
        capabilities: {
          ...primitiveRenderer.capabilities,
          text: false
        }
      })
    ).toBeNull();
  });
});
