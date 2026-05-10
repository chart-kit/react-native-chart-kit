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
  RoundedRect: "RoundedRect",
  Text: "Text",
  rect: (x: number, y: number, width: number, height: number) => ({
    height,
    width,
    x,
    y
  }),
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
      maxSurfaceWidth: 2730,
      pathGradients: false,
      rectClips: false,
      shadows: false,
      symbols: false,
      testIds: true,
      text: false,
      textMeasurement: "unavailable",
      viewportWindowing: false
    });
  });

  it("creates preview descriptors with install guidance", () => {
    expect(skiaRendererPreview).toMatchObject({
      evidence: {
        localParity: "partial",
        nativeInstall: "partial",
        nativeParity: "partial"
      },
      packageName: "@chart-kit/skia-renderer",
      peerDependency: "@shopify/react-native-skia",
      status: "preview"
    });
    expect(
      createSkiaRendererDescriptor({
        capabilities: { textMeasurement: "skia" },
        evidence: { nativeInstall: "verified" },
        status: "available"
      })
    ).toMatchObject({
      capabilities: { textMeasurement: "skia" },
      evidence: {
        localParity: "partial",
        nativeInstall: "verified",
        nativeParity: "partial"
      },
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
      pathGradients: true,
      rectClips: true,
      text: true,
      textMeasurement: "skia",
      viewportWindowing: false
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

  it("wraps paths in Skia rect clips when requested", () => {
    const renderer = createSkiaRenderer({ skia: fakeSkia });
    const clippedPath = renderComponent(renderer.Path, {
      clipRect: { height: 16, width: 40, x: 4, y: 8 },
      d: "M 0 0 L 10 10",
      stroke: "#2563eb",
      strokeWidth: 2,
      testID: "threshold-line"
    });
    const clippedElement = isValidElement<{ children?: ReactNode }>(clippedPath)
      ? clippedPath
      : undefined;
    const path = Children.toArray(clippedElement?.props.children).find(
      isValidElement
    );

    expect(clippedElement?.type).toBe("Group");
    expect(clippedElement?.props).toMatchObject({
      clip: { height: 16, width: 40, x: 4, y: 8 },
      testID: "threshold-line-clip-group"
    });
    expect(path).toMatchObject({
      props: {
        color: "#2563eb",
        path: "M 0 0 L 10 10",
        strokeWidth: 2,
        style: "stroke"
      },
      type: "Path"
    });
  });

  it("honors textAnchor by offsetting measured Skia text", () => {
    const renderer = createSkiaRenderer({
      font: {
        measureText: (text) => ({ width: text.length * 10 })
      },
      skia: fakeSkia
    });
    const middleText = renderComponent(renderer.Text, {
      fill: "#0f172a",
      text: "Axis",
      textAnchor: "middle",
      x: 100,
      y: 20
    });
    const endText = renderComponent(renderer.Text, {
      fill: "#0f172a",
      text: "Axis",
      textAnchor: "end",
      x: 100,
      y: 20
    });

    expect(middleText).toMatchObject({
      props: {
        text: "Axis",
        x: 80
      },
      type: "Text"
    });
    expect(endText).toMatchObject({
      props: {
        text: "Axis",
        x: 60
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

  it("uses Skia RoundedRect for rounded chart rectangles", () => {
    const renderer = createSkiaRenderer({ skia: fakeSkia });
    const rect = renderComponent(renderer.Rect, {
      fill: "#2563eb",
      height: 40,
      rx: 8,
      ry: 6,
      width: 80,
      x: 4,
      y: 10
    });

    expect(rect).toMatchObject({
      props: {
        color: "#2563eb",
        height: 40,
        r: { x: 8, y: 6 },
        width: 80,
        x: 4,
        y: 10
      },
      type: "RoundedRect"
    });
  });

  it("renders path-local gradient fills when Skia gradient primitives exist", () => {
    const renderer = createSkiaRenderer({ skia: fakeSkia });
    const path = renderComponent(renderer.Path, {
      d: "M 0 10 L 10 0 L 10 20 Z",
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
    const pathElement = isValidElement<{ children?: ReactNode }>(path)
      ? path
      : undefined;
    const gradient = Children.toArray(pathElement?.props.children).find(
      isValidElement
    );
    const renderedGradient = isValidElement(gradient)
      ? renderComponent(
          gradient.type as ComponentType<typeof gradient.props>,
          gradient.props
        )
      : undefined;

    expect(pathElement?.type).toBe("Path");
    expect(pathElement?.props).toMatchObject({
      color: "#2563eb",
      path: "M 0 10 L 10 0 L 10 20 Z",
      style: "fill"
    });
    expect(renderedGradient).toMatchObject({
      props: {
        colors: ["rgba(37, 99, 235, 0.2)", "rgba(37, 99, 235, 0)"],
        positions: [0, 1],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 }
      },
      type: "LinearGradient"
    });
  });
});
