import "./ensureConsole";

import { ClipPath, LinearGradient, Rect, Stop } from "react-native-svg";

import type { SvgClipRectProps, SvgLinearGradientDefProps } from "./types";

export { createClipPathRef } from "./clipPath";

export const SvgClipRect = ({ id, x, y, width, height }: SvgClipRectProps) => (
  <ClipPath id={id}>
    <Rect x={x} y={y} width={width} height={height} />
  </ClipPath>
);

export const SvgLinearGradientDef = ({
  stops,
  ...props
}: SvgLinearGradientDefProps) => (
  <LinearGradient {...props}>
    {stops.map((stop, index) => {
      const stopProps =
        stop.opacity === undefined
          ? {
              offset: stop.offset,
              stopColor: stop.color
            }
          : {
              offset: stop.offset,
              stopColor: stop.color,
              stopOpacity: stop.opacity
            };

      return <Stop key={`${stop.offset}-${index}`} {...stopProps} />;
    })}
  </LinearGradient>
);
