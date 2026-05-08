import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@chart-kit/svg-renderer", () => ({
  createSvgTextMeasurer: () => (text: string) => ({
    height: 14,
    width: text.length * 7
  })
}));

import { renderDefaultCombinedChartTooltip } from "../src/charts/combined/tooltip";
import { resolveCartesianChartThemeConfig } from "../src/theme/presets";
import type {
  CombinedChartRenderer,
  CombinedChartTooltipRenderProps
} from "../src/charts/combined/types";
import type { SkiaRenderer } from "../../skia-renderer/src/types";

type SkiaRendererAssignable = SkiaRenderer extends CombinedChartRenderer
  ? true
  : false;

const skiaRendererAssignable: SkiaRendererAssignable = true;
const Primitive = () => null;
const renderer: CombinedChartRenderer = {
  Circle: Primitive,
  Defs: Primitive,
  Group: Primitive,
  Line: Primitive,
  Path: Primitive,
  Rect: Primitive,
  Surface: Primitive,
  Text: Primitive,
  capabilities: {
    text: true
  },
  name: "test-renderer"
};

const getElementChildren = (node: ReactNode): ReactElement[] => {
  expect(isValidElement<{ children?: ReactNode }>(node)).toBe(true);

  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return [];
  }

  return Children.toArray(node.props.children).filter(isValidElement);
};

const tooltip: CombinedChartTooltipRenderProps<Record<string, unknown>> = {
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
      formattedValue: "$80k",
      key: "revenue",
      label: "Revenue",
      point: {
        dataIndex: 0,
        kind: "bar",
        seriesKey: "revenue",
        value: 80,
        x: 44,
        xValue: "Jan",
        y: 70
      },
      value: 80
    }
  ],
  theme: resolveCartesianChartThemeConfig({ mode: "light" }),
  width: 124,
  x: 16,
  xLabel: "Jan 2026",
  y: 20
};

describe("CombinedChart renderer parity contract", () => {
  it("accepts the shared Skia renderer primitive contract", () => {
    expect(skiaRendererAssignable).toBe(true);
  });

  it("renders the default tooltip through injected primitives", () => {
    const node = renderDefaultCombinedChartTooltip(tooltip, renderer);
    const children = getElementChildren(node);

    expect(children[1]?.props).toMatchObject({
      fill: "#ffffff",
      rx: 8,
      x: 16,
      y: 20
    });
    expect(children[2]?.props).toMatchObject({
      fill: "#64748b",
      text: "Jan 2026"
    });
    expect(getElementChildren(children[3])[1]?.props).toMatchObject({
      fill: "#0f172a",
      text: "Revenue: $80k"
    });
  });

  it("does not render text-dependent tooltip surfaces when renderer text is disabled", () => {
    expect(
      renderDefaultCombinedChartTooltip(tooltip, {
        ...renderer,
        capabilities: { text: false }
      })
    ).toBeNull();
  });
});
