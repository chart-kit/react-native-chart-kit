import { createSvgTestId } from "@chart-kit/svg-renderer";

import type { ResolvedCartesianChartTheme } from "../../theme";
import type { LineChartDotRenderProps, LineChartRenderer } from "./types";
import type { LineChartDotColor } from "./options";

export const resolveDotColor = ({
  color,
  fallback,
  seriesColor,
  theme
}: {
  color: LineChartDotColor;
  fallback: string;
  seriesColor: string;
  theme: ResolvedCartesianChartTheme;
}) => {
  if (color === "background") {
    return theme.background;
  }

  if (color === "series") {
    return seriesColor;
  }

  return color || fallback;
};

const createDiamondPath = ({
  size,
  x,
  y
}: {
  size: number;
  x: number;
  y: number;
}) => {
  const radius = size / 2;

  return [
    `M ${x} ${y - radius}`,
    `L ${x + radius} ${y}`,
    `L ${x} ${y + radius}`,
    `L ${x - radius} ${y}`,
    "Z"
  ].join(" ");
};

export const renderDefaultDot = <TData,>(
  { color, config, point, theme }: LineChartDotRenderProps<TData>,
  renderer: LineChartRenderer
) => {
  const fill = resolveDotColor({
    color: config.fill,
    fallback: theme.background,
    seriesColor: color,
    theme
  });
  const stroke = resolveDotColor({
    color: config.stroke,
    fallback: color,
    seriesColor: color,
    theme
  });
  const dotKey = `dot-${point.seriesKey}-${point.index}`;
  const commonProps = {
    testID: createSvgTestId("line-dot", point.seriesKey, point.index),
    fill,
    opacity: config.opacity,
    stroke,
    strokeWidth: config.strokeWidth
  };
  const { Circle, Path, Rect } = renderer;
  const size = config.radius * 2;

  if (config.shape === "square") {
    return (
      <Rect
        key={dotKey}
        x={point.x - size / 2}
        y={point.y - size / 2}
        width={size}
        height={size}
        rx={Math.min(3, config.radius * 0.45)}
        {...commonProps}
      />
    );
  }

  if (config.shape === "diamond") {
    return (
      <Path
        key={dotKey}
        d={createDiamondPath({ x: point.x, y: point.y, size })}
        {...commonProps}
      />
    );
  }

  return (
    <Circle
      key={dotKey}
      cx={point.x}
      cy={point.y}
      r={config.radius}
      {...commonProps}
    />
  );
};
