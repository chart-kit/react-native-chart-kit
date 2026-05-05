import type { ComponentType, ElementType, ReactNode } from "react";

export type SkiaRendererStatus = "preview" | "available";

export type SkiaRendererCapabilities = {
  animation: "none" | "uiThread";
  clipPaths: boolean;
  decimation: boolean;
  gradients: boolean;
  hitRegions: boolean;
  layers: boolean;
  pathGradients: boolean;
  rectClips: boolean;
  shadows: boolean;
  symbols: boolean;
  testIds: boolean;
  text: boolean;
  textMeasurement: "skia" | "unavailable";
  viewportWindowing: boolean;
};

export type SkiaRendererDescriptor = {
  capabilities: SkiaRendererCapabilities;
  installHint: string;
  packageName: "@chart-kit/skia-renderer";
  peerDependency: "@shopify/react-native-skia";
  status: SkiaRendererStatus;
};

export type SkiaRendererDescriptorOptions = {
  capabilities?: Partial<SkiaRendererCapabilities>;
  installHint?: string;
  status?: SkiaRendererStatus;
};

export type SkiaComponentModule = {
  Canvas: ElementType;
  Circle: ElementType;
  Group: ElementType;
  Path: ElementType;
  Rect: ElementType;
  Text: ElementType;
  DashPathEffect?: ElementType | undefined;
  Line?: ElementType | undefined;
  LinearGradient?: ElementType | undefined;
  rect?:
    | ((x: number, y: number, width: number, height: number) => unknown)
    | undefined;
  vec?: ((x: number, y: number) => unknown) | undefined;
};

export type SkiaFontLike = {
  getSize?: (() => number) | undefined;
  measureText?:
    | ((text: string) => { height?: number; width: number })
    | undefined;
};

export type SkiaTextMeasurementOptions = {
  fontSize?: number;
  lineHeight?: number;
  maxWidth?: number;
};

export type SkiaMeasuredText = {
  height: number;
  width: number;
};

export type SkiaTextMeasurer = (
  text: string,
  options?: SkiaTextMeasurementOptions
) => SkiaMeasuredText;

export type SkiaTestableProps = {
  testID?: string;
};

export type SkiaSurfaceProps = SkiaTestableProps & {
  children?: ReactNode;
  height: number;
  style?: unknown;
  width: number;
};

export type SkiaGroupProps = SkiaTestableProps & {
  children?: ReactNode;
  opacity?: number;
};

export type SkiaPaintProps = SkiaTestableProps & {
  fill?: string;
  fillOpacity?: number;
  opacity?: number;
  stroke?: string;
  strokeDasharray?: readonly number[];
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
};

export type SkiaPathProps = SkiaPaintProps & {
  clipRect?: SkiaClipRectShape;
  d?: string;
  fillGradient?: SkiaLinearGradientProps;
  path?: string;
};

export type SkiaClipRectShape = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type SkiaRectProps = SkiaPaintProps & {
  height: number;
  rx?: number;
  ry?: number;
  width: number;
  x: number;
  y: number;
};

export type SkiaCircleProps = SkiaPaintProps & {
  cx: number;
  cy: number;
  r: number;
};

export type SkiaLineProps = SkiaPaintProps & {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type SkiaTextProps = SkiaTestableProps & {
  children?: ReactNode;
  fill?: string;
  font?: SkiaFontLike;
  fontSize?: number;
  opacity?: number;
  text?: string;
  x: number;
  y: number;
};

export type SkiaDefsProps = {
  children?: ReactNode;
};

export type SkiaGradientStop = {
  color: string;
  offset: number | string;
  opacity?: number;
};

export type SkiaLinearGradientProps = SkiaTestableProps & {
  id?: string;
  stops: SkiaGradientStop[];
  x1?: number | string;
  x2?: number | string;
  y1?: number | string;
  y2?: number | string;
};

export type SkiaClipRectProps = SkiaTestableProps & {
  height: number;
  id?: string;
  width: number;
  x: number;
  y: number;
};

export type SkiaRendererOptions = {
  capabilities?: Partial<SkiaRendererCapabilities>;
  font?: SkiaFontLike;
  measureText?: SkiaTextMeasurer;
  skia: SkiaComponentModule;
};

export type SkiaRenderer = {
  Surface: ComponentType<SkiaSurfaceProps>;
  Group: ComponentType<SkiaGroupProps>;
  Path: ComponentType<SkiaPathProps>;
  Rect: ComponentType<SkiaRectProps>;
  Circle: ComponentType<SkiaCircleProps>;
  Line: ComponentType<SkiaLineProps>;
  Text: ComponentType<SkiaTextProps>;
  Defs: ComponentType<SkiaDefsProps>;
  ClipRect: ComponentType<SkiaClipRectProps>;
  LinearGradient: ComponentType<SkiaLinearGradientProps>;
  capabilities: SkiaRendererCapabilities;
  measureText: SkiaTextMeasurer;
};
