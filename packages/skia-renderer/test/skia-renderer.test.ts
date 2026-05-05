import {
  Children,
  isValidElement,
  type ComponentType,
  type ReactNode
} from "react";
import { describe, expect, it } from "vitest";

import {
  createSkiaRenderer,
  createSkiaRendererCapabilities,
  createSkiaRendererDescriptor,
  skiaRendererPreview,
  type SkiaComponentModule
} from "../src";

const fakeSkia = {
  Canvas: "Canvas",
  Circle: "Circle",
  DashPathEffect: "DashPathEffect",
  Group: "Group",
  Line: "Line",
  LinearGradient: "LinearGradient",
  Path: "Path",
  Rect: "Rect",
  Text: "Text",
  vec: (x: number, y: number) => ({ x, y })
} as unknown as SkiaComponentModule;

const renderComponent = <TProps>(
  Component: ComponentType<TProps>,
  props: TProps
): ReactNode => (Component as (props: TProps) => ReactNode)(props);

describe("Skia renderer preview boundary", () => {
  it("exposes default capability metadata without loading Skia", () => {
    expect(createSkiaRendererCapabilities()).toEqual({
      animation: "uiThread",
      clipPaths: false,
      decimation: true,
      gradients: true,
      hitRegions: false,
      layers: true,
      shadows: false,
      symbols: false,
      testIds: true,
      text: false,
      textMeasurement: "unavailable",
      viewportWindowing: true
    });
  });

  it("creates preview descriptors with install guidance", () => {
    expect(skiaRendererPreview).toMatchObject({
      packageName: "@chart-kit/skia-renderer",
      peerDependency: "@shopify/react-native-skia",
      status: "preview"
    });
    expect(
      createSkiaRendererDescriptor({
        capabilities: { textMeasurement: "skia" },
        status: "available"
      })
    ).toMatchObject({
      capabilities: { textMeasurement: "skia" },
      status: "available"
    });
  });

  it("creates injected Skia renderer primitives", () => {
    const renderer = createSkiaRenderer({
      font: {
        getSize: () => 14,
        measureText: (text) => ({ width: text.length * 7 })
      },
      skia: fakeSkia
    });
    const path = renderComponent(renderer.Path, {
      d: "M 0 0 L 10 10",
      stroke: "#2563eb",
      strokeWidth: 2
    });
    const text = renderComponent(renderer.Text, {
      children: "Price",
      fill: "#0f172a",
      x: 4,
      y: 12
    });

    expect(renderer.capabilities).toMatchObject({
      gradients: false,
      text: true,
      textMeasurement: "skia"
    });
    expect(renderer.measureText("ABC")).toEqual({ height: 16.8, width: 21 });
    expect(path).toMatchObject({
      props: {
        color: "#2563eb",
        path: "M 0 0 L 10 10",
        strokeWidth: 2,
        style: "stroke"
      },
      type: "Path"
    });
    expect(text).toMatchObject({
      props: {
        color: "#0f172a",
        text: "Price",
        x: 4,
        y: 12
      },
      type: "Text"
    });
  });

  it("renders fill and stroke pairs without losing either paint", () => {
    const renderer = createSkiaRenderer({ skia: fakeSkia });
    const rect = renderComponent(renderer.Rect, {
      fill: "#f8fafc",
      height: 24,
      stroke: "#0f172a",
      strokeWidth: 1,
      width: 80,
      x: 2,
      y: 4
    });
    const rectElement = isValidElement<{ children?: ReactNode }>(rect)
      ? rect
      : undefined;

    expect(isValidElement(rect)).toBe(true);
    expect(rectElement?.type).toBe("Group");
    expect(Children.count(rectElement?.props.children)).toBe(2);
  });
});
