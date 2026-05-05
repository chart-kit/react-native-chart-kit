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

import { renderDefaultCandlestickTooltip } from "../src/charts/candlestick/tooltip";
import type { CandlestickChartTooltipModel } from "../src/charts/candlestick/tooltipModel";
import type {
  CandlestickChartCandleModel,
  CandlestickChartRenderer,
  ResolvedCandlestickChartTooltipConfig
} from "../src/charts/candlestick/types";
import type { SkiaRenderer } from "../../skia-renderer/src/types";
import {
  getFragmentChildren,
  skiaLikeRenderer
} from "./line-renderer.fixtures";

type SkiaRendererAssignable = SkiaRenderer extends CandlestickChartRenderer
  ? true
  : false;

const skiaRendererAssignable: SkiaRendererAssignable = true;

const candle: CandlestickChartCandleModel<{ date: string }> = {
  bodyHeight: 36,
  bodyWidth: 12,
  bodyX: 64,
  bodyY: 58,
  close: 118,
  closeY: 58,
  color: "#16a34a",
  dataIndex: 0,
  defined: true,
  direction: "up",
  high: 126,
  highY: 42,
  key: "candle-0",
  low: 108,
  lowY: 104,
  open: 112,
  openY: 94,
  raw: { date: "2026-01-02" },
  wickX: 70,
  xValue: "2026-01-02"
};

const tooltipConfig: ResolvedCandlestickChartTooltipConfig = {
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
  width: 150
};

const tooltip: CandlestickChartTooltipModel<{ date: string }> & {
  config: ResolvedCandlestickChartTooltipConfig;
} = {
  candle,
  config: tooltipConfig,
  height: 92,
  lines: [
    { label: "O", value: "$112" },
    { label: "H", value: "$126" },
    { label: "L", value: "$108" },
    { label: "C", value: "$118" }
  ],
  width: 150,
  x: 24,
  xLabel: "Jan 2",
  y: 32
};

describe("CandlestickChart renderer parity contract", () => {
  it("accepts the shared Skia renderer primitive contract", () => {
    expect(skiaRendererAssignable).toBe(true);
  });

  it("renders the default tooltip through injected primitives", () => {
    const node = renderDefaultCandlestickTooltip(tooltip, skiaLikeRenderer);
    const children = getFragmentChildren(node);

    expect(children).toHaveLength(7);
    expect(children[1]?.props).toMatchObject({
      fill: "#ffffff",
      height: 92,
      rx: 8,
      width: 150,
      x: 24,
      y: 32
    });
    expect(children[2]?.props).toMatchObject({
      fill: "#64748b",
      text: "Jan 2"
    });
    expect(children[6]?.props).toMatchObject({
      fill: "#0f172a",
      text: "C $118"
    });
  });

  it("does not render text-dependent tooltip surfaces when renderer text is disabled", () => {
    expect(
      renderDefaultCandlestickTooltip(tooltip, {
        ...skiaLikeRenderer,
        capabilities: {
          ...skiaLikeRenderer.capabilities,
          text: false
        }
      })
    ).toBeNull();
  });
});
