import { SvgSymbol, createSvgTestId } from "@chart-kit/svg-renderer";

import type { ResolvedCartesianChartTheme } from "../../theme";
import type { LineChartDotRenderProps } from "./types";
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

export const renderDefaultDot = <TData,>({
  color,
  config,
  point,
  theme
}: LineChartDotRenderProps<TData>) => {
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

  return (
    <SvgSymbol
      key={dotKey}
      shape={config.shape}
      x={point.x}
      y={point.y}
      size={config.radius * 2}
      cornerRadius={Math.min(3, config.radius * 0.45)}
      {...commonProps}
    />
  );
};
