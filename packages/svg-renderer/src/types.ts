import type { ComponentType, ReactNode } from "react";
import type {
  CircleProps,
  GProps,
  LineProps,
  LinearGradientProps,
  PathProps,
  RectProps,
  StopProps,
  SvgProps,
  TextProps
} from "react-native-svg";
import type { ChartRenderLayerName } from "./layerOrder";

export type SvgTextMeasurementOptions = {
  fontFamily?: TextProps["fontFamily"];
  fontSize?: number;
  fontWeight?: TextProps["fontWeight"];
  lineHeight?: number;
  letterSpacing?: number;
  maxWidth?: number;
};

export type SvgMeasuredText = {
  width: number;
  height: number;
};

export type SvgTextMeasurer = (
  text: string,
  options?: SvgTextMeasurementOptions
) => SvgMeasuredText;

export type SvgTestableProps = {
  testID?: string;
};

export type SvgSurfaceProps = SvgProps &
  SvgTestableProps & {
    width: number;
    height: number;
    children?: ReactNode;
  };

export type SvgGroupProps = GProps &
  SvgTestableProps & {
    children?: ReactNode;
  };

export type SvgPathProps = PathProps & SvgTestableProps;
export type SvgRectProps = RectProps & SvgTestableProps;
export type SvgHitRegionProps = Omit<RectProps, "fill" | "fillOpacity"> &
  SvgTestableProps & {
    disabled?: boolean;
    fill?: RectProps["fill"];
    fillOpacity?: RectProps["fillOpacity"];
    height: number;
    width: number;
    x: number;
    y: number;
  };
export type SvgCircleProps = CircleProps & SvgTestableProps;
export type SvgTextProps = TextProps & SvgTestableProps;
export type SvgLineProps = LineProps & SvgTestableProps;

export type SvgSymbolShape = "circle" | "square" | "diamond" | "line";

export type SvgSymbolProps = SvgTestableProps & {
  shape: SvgSymbolShape;
  x: number;
  y: number;
  size: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  strokeLinecap?: LineProps["strokeLinecap"];
  cornerRadius?: number;
};

export type SvgLayerProps = SvgGroupProps & {
  name: ChartRenderLayerName;
};

export type SvgDefsProps = {
  children?: ReactNode;
};

export type SvgClipRectProps = SvgTestableProps & {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SvgGradientStop = {
  offset: NonNullable<StopProps["offset"]>;
  color: string;
  opacity?: number;
};

export type SvgLinearGradientDefProps = Omit<LinearGradientProps, "children"> &
  SvgTestableProps & {
    id: string;
    stops: SvgGradientStop[];
  };

export type SvgRendererOptions = {
  capabilities?: Partial<SvgRendererCapabilities>;
  measureText?: SvgTextMeasurer;
  textMeasurement?: SvgTextMeasurementOptions;
};

export type SvgRendererCapabilities = {
  animation: "none" | "reactNative";
  clipPaths: boolean;
  gradients: boolean;
  hitRegions: boolean;
  layers: boolean;
  shadows: boolean;
  symbols: boolean;
  testIds: boolean;
  textMeasurement: "fallback" | "custom";
};

export type SvgRenderer = {
  Surface: ComponentType<SvgSurfaceProps>;
  Group: ComponentType<SvgGroupProps>;
  Path: ComponentType<SvgPathProps>;
  Rect: ComponentType<SvgRectProps>;
  HitRegion: ComponentType<SvgHitRegionProps>;
  Circle: ComponentType<SvgCircleProps>;
  Symbol: ComponentType<SvgSymbolProps>;
  Text: ComponentType<SvgTextProps>;
  Line: ComponentType<SvgLineProps>;
  Layer: ComponentType<SvgLayerProps>;
  Defs: ComponentType<SvgDefsProps>;
  ClipRect: ComponentType<SvgClipRectProps>;
  LinearGradient: ComponentType<SvgLinearGradientDefProps>;
  capabilities: SvgRendererCapabilities;
  measureText: SvgTextMeasurer;
};
