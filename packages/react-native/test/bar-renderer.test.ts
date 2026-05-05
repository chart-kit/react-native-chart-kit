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

import { renderDefaultBarChartTooltip } from "../src/charts/bar/tooltip";
import type {
  BarChartBarModel,
  BarChartRenderer,
  ResolvedBarChartTooltipConfig
} from "../src/charts/bar/types";
import type { SkiaRenderer } from "../../skia-renderer/src/types";
import {
  getFragmentChildren,
  getRenderedChildren,
  skiaLikeRenderer
} from "./line-renderer.fixtures";

type SkiaRendererAssignable = SkiaRenderer extends BarChartRenderer
  ? true
  : false;

const skiaRendererAssignable: SkiaRendererAssignable = true;

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
  backgroundColor: "#ffffff",
  borderColor: "#cbd5e1",
  borderRadius: 8,
  fontFamily: undefined,
  fontSize: 12,
  labelColor: "#64748b",
  labelFontSize: 12,
  padding: 10,
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
  it("accepts the shared Skia renderer primitive contract", () => {
    expect(skiaRendererAssignable).toBe(true);
  });

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
      skiaLikeRenderer
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
        ...skiaLikeRenderer,
        capabilities: {
          ...skiaLikeRenderer.capabilities,
          text: false
        }
      }
    );

    expect(getRenderedChildren(tooltip)).toEqual([]);
  });
});
