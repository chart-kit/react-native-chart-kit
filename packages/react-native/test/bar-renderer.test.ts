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

import {
  getSafeBarChartContentWidth,
  getSafeBarChartRenderer
} from "../src/charts/bar/rendererSafety";
import { renderDefaultBarChartTooltip } from "../src/charts/bar/tooltip";
import { lineChartSvgRenderer } from "../src/charts/line/renderer";
import type {
  BarChartBarModel,
  BarChartRenderer,
  ResolvedBarChartTooltipConfig
} from "../src/charts/bar/types";
import {
  getFragmentChildren,
  getRenderedChildren,
  primitiveRenderer
} from "./line-renderer.fixtures";

const bar: BarChartBarModel<{ month: string; paid: number }> = {
  color: "#2563eb",
  dataIndex: 0,
  formattedValue: "$42k",
  height: 88,
  key: "paid-0",
  raw: { month: "Jan", paid: 42 },
  seriesIndex: 0,
  seriesKey: "paid",
  seriesLabel: "Paid",
  value: 42,
  width: 24,
  x: 40,
  xLabel: "Jan",
  xValue: "Jan",
  y: 56,
  baselineY: 144
};

const tooltipConfig: ResolvedBarChartTooltipConfig = {
  anchor: "bar",
  backgroundColor: "#ffffff",
  borderColor: "#cbd5e1",
  borderRadius: 8,
  edgePadding: 4,
  fontFamily: undefined,
  fontSize: 12,
  labelColor: "#64748b",
  labelFontSize: 12,
  offset: 8,
  padding: 10,
  placement: "auto",
  positionAnimationDuration: 220,
  shadowColor: "#020617",
  shadowOffsetX: 0,
  shadowOffsetY: 2,
  shadowOpacity: 0.08,
  textColor: "#0f172a",
  visible: true,
  width: 120
};

describe("BarChart renderer parity contract", () => {
  it("renders the default tooltip through injected primitives", () => {
    const tooltip = renderDefaultBarChartTooltip(
      {
        bar,
        config: tooltipConfig,
        height: 54,
        width: 120,
        x: 24,
        y: 32
      },
      primitiveRenderer
    );
    const children = getFragmentChildren(tooltip);

    expect(children).toHaveLength(5);
    expect(children[1]?.props).toMatchObject({
      fill: "#ffffff",
      height: 54,
      rx: 8,
      width: 120,
      x: 24,
      y: 32
    });
    expect(children[2]?.props).toMatchObject({
      fill: "#64748b",
      text: "Jan"
    });
    expect(children[4]?.props).toMatchObject({
      fill: "#0f172a",
      text: "Paid: $42k"
    });
  });

  it("does not render text-dependent tooltip surfaces when renderer text is disabled", () => {
    const tooltip = renderDefaultBarChartTooltip(
      {
        bar,
        config: tooltipConfig,
        height: 54,
        width: 120,
        x: 24,
        y: 32
      },
      {
        ...primitiveRenderer,
        capabilities: {
          ...primitiveRenderer.capabilities,
          text: false
        }
      }
    );

    expect(getRenderedChildren(tooltip)).toEqual([]);
  });

  it("falls back to SVG for oversized scrollable surfaces without windowing", () => {
    const renderer: BarChartRenderer = {
      ...primitiveRenderer,
      capabilities: {
        ...primitiveRenderer.capabilities,
        maxSurfaceWidth: 8192,
        viewportWindowing: false
      }
    };

    expect(
      getSafeBarChartRenderer({
        contentWidth: 22623,
        renderer,
        scrollable: true
      })
    ).toBe(lineChartSvgRenderer);
  });

  it("keeps the injected renderer when its surface is safe", () => {
    const renderer: BarChartRenderer = {
      ...primitiveRenderer,
      capabilities: {
        ...primitiveRenderer.capabilities,
        maxSurfaceWidth: 8192,
        viewportWindowing: false
      }
    };

    expect(
      getSafeBarChartRenderer({
        contentWidth: 4096,
        renderer,
        scrollable: true
      })
    ).toBe(renderer);
  });

  it("keeps the injected renderer when it supports viewport windowing", () => {
    const renderer: BarChartRenderer = {
      ...primitiveRenderer,
      capabilities: {
        ...primitiveRenderer.capabilities,
        maxSurfaceWidth: 8192,
        viewportWindowing: true
      }
    };

    expect(
      getSafeBarChartRenderer({
        contentWidth: 22623,
        renderer,
        scrollable: true
      })
    ).toBe(renderer);
  });

  it("uses a conservative native cap for injected renderers without metadata", () => {
    const { maxSurfaceWidth: _maxSurfaceWidth, ...capabilitiesWithoutMax } =
      primitiveRenderer.capabilities ?? {};
    const renderer: BarChartRenderer = {
      ...primitiveRenderer,
      capabilities: {
        ...capabilitiesWithoutMax,
        viewportWindowing: false
      }
    };

    expect(
      getSafeBarChartRenderer({
        contentWidth: 22623,
        renderer,
        scrollable: true
      })
    ).toBe(lineChartSvgRenderer);
  });

  it("caps oversized scrollable content width for native renderers", () => {
    const renderer: BarChartRenderer = {
      ...primitiveRenderer,
      capabilities: {
        ...primitiveRenderer.capabilities,
        maxSurfaceWidth: 2730,
        viewportWindowing: false
      }
    };

    expect(
      getSafeBarChartContentWidth({
        contentWidth: 7541,
        renderer,
        scrollable: true
      })
    ).toBe(2730);
  });

  it("does not cap content width when renderer supports windowing", () => {
    const renderer: BarChartRenderer = {
      ...primitiveRenderer,
      capabilities: {
        ...primitiveRenderer.capabilities,
        maxSurfaceWidth: 2730,
        viewportWindowing: true
      }
    };

    expect(
      getSafeBarChartContentWidth({
        contentWidth: 7541,
        renderer,
        scrollable: true
      })
    ).toBe(7541);
  });
});
