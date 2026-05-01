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

export type SvgTextMeasurementOptions = {
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
export type SvgCircleProps = CircleProps & SvgTestableProps;
export type SvgTextProps = TextProps & SvgTestableProps;
export type SvgLineProps = LineProps & SvgTestableProps;

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
  measureText?: SvgTextMeasurer;
  textMeasurement?: SvgTextMeasurementOptions;
};

export type SvgRenderer = {
  Surface: ComponentType<SvgSurfaceProps>;
  Group: ComponentType<SvgGroupProps>;
  Path: ComponentType<SvgPathProps>;
  Rect: ComponentType<SvgRectProps>;
  Circle: ComponentType<SvgCircleProps>;
  Text: ComponentType<SvgTextProps>;
  Line: ComponentType<SvgLineProps>;
  Defs: ComponentType<SvgDefsProps>;
  ClipRect: ComponentType<SvgClipRectProps>;
  LinearGradient: ComponentType<SvgLinearGradientDefProps>;
  measureText: SvgTextMeasurer;
};
