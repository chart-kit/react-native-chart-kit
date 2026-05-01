import Svg, { Circle, Defs, G, Line, Path, Rect, Text } from "react-native-svg";

import type {
  SvgCircleProps,
  SvgDefsProps,
  SvgGroupProps,
  SvgLineProps,
  SvgPathProps,
  SvgRectProps,
  SvgSurfaceProps,
  SvgTextProps
} from "./types";

export const SvgSurface = ({
  children,
  width,
  height,
  ...props
}: SvgSurfaceProps) => (
  <Svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    {...props}
  >
    {children}
  </Svg>
);

export const SvgGroup = ({ children, ...props }: SvgGroupProps) => (
  <G {...props}>{children}</G>
);

export const SvgPath = (props: SvgPathProps) => <Path {...props} />;
export const SvgRect = (props: SvgRectProps) => <Rect {...props} />;
export const SvgCircle = (props: SvgCircleProps) => <Circle {...props} />;
export const SvgText = ({ children, ...props }: SvgTextProps) => (
  <Text {...props}>{children}</Text>
);
export const SvgLine = (props: SvgLineProps) => <Line {...props} />;
export const SvgDefs = ({ children }: SvgDefsProps) => <Defs>{children}</Defs>;
