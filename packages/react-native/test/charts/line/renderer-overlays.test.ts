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

import { renderLineChartDebugLayout } from "../../../src/charts/line/debugOverlay";
import { StickyYAxis } from "../../../src/charts/line/StickyYAxis";
import type { LineChartModel } from "../../../src/charts/line/useChartModel";
import { resolveCartesianChartThemeConfig } from "../../../src/theme/presets";
import {
  debugLayoutModel,
  getFragmentChildren,
  getRenderedChildren,
  primitiveRenderer
} from "./renderer.fixtures";

describe("LineChart renderer overlay contract", () => {
  it("renders the debug overlay through injected primitives", () => {
    const debugNodes = getRenderedChildren(
      renderLineChartDebugLayout({
        fontFamily: undefined,
        model: debugLayoutModel,
        renderer: primitiveRenderer
      })
    );
    const debugChildren = getFragmentChildren(debugNodes[0]);

    expect(debugNodes).toHaveLength(1);
    expect(debugChildren).toHaveLength(2);
    expect(debugChildren[0]?.props).toMatchObject({
      fill: "none",
      height: 120,
      stroke: "#22c55e",
      width: 240,
      x: 40,
      y: 20
    });
    expect(debugChildren[1]?.props).toMatchObject({
      fill: "#22c55e",
      fontSize: 9,
      text: "plot",
      x: 42,
      y: 17
    });
  });

  it("renders sticky Y-axis labels through injected primitives", () => {
    const resolvedTheme = resolveCartesianChartThemeConfig({ mode: "light" });
    const node = StickyYAxis({
      fadeHeight: 120,
      fadeOpacity: 1,
      fadeWidth: 16,
      fadeY: 0,
      gradientId: "sticky-y-axis-fade",
      mainHeight: 180,
      model: {
        boxes: {
          plot: {
            height: 120,
            width: 220,
            x: 48,
            y: 20
          }
        },
        resolvedTheme
      } as LineChartModel<Record<string, unknown>>,
      renderer: primitiveRenderer,
      width: 72,
      yAxisLabels: [
        {
          key: "tick-120000",
          opacity: 1,
          text: "$120k",
          y: 44
        }
      ]
    });

    expect(isValidElement<{ children?: ReactNode }>(node)).toBe(true);

    if (!isValidElement<{ children?: ReactNode }>(node)) return;

    const surface = Children.only(node.props.children);

    expect(isValidElement<{ children?: ReactNode }>(surface)).toBe(true);

    if (!isValidElement<{ children?: ReactNode }>(surface)) return;

    const surfaceChildren = Children.toArray(surface.props.children).filter(
      isValidElement
    );
    const axesLayer = surfaceChildren[2];
    const labels = Children.toArray(
      isValidElement<{ children?: ReactNode }>(axesLayer)
        ? axesLayer.props.children
        : undefined
    ).filter(isValidElement);
    const firstLabel = labels[0] as
      | ReactElement<{ children?: ReactNode } & Record<string, unknown>>
      | undefined;

    expect(labels).toHaveLength(1);
    expect(firstLabel?.props).toMatchObject({
      fill: resolvedTheme.mutedText,
      fontSize: resolvedTheme.typography.axisLabelSize,
      opacity: 1,
      textAnchor: "end",
      x: 40,
      y: 44
    });
    expect(firstLabel?.props.children).toBe("$120k");
  });

  it("keeps debug rectangles when renderer text is unavailable", () => {
    const debugNodes = getRenderedChildren(
      renderLineChartDebugLayout({
        fontFamily: undefined,
        model: debugLayoutModel,
        renderer: {
          ...primitiveRenderer,
          capabilities: {
            ...primitiveRenderer.capabilities,
            text: false
          }
        }
      })
    );
    const debugChildren = getFragmentChildren(debugNodes[0]);

    expect(debugChildren).toHaveLength(1);
    expect(debugChildren[0]?.props).toMatchObject({
      height: 120,
      stroke: "#22c55e",
      width: 240
    });
  });
});
