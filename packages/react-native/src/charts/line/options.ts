export type LineChartDotShape = "circle" | "square" | "diamond";
export type LineChartDotColor = string | "background" | "series";

export type LineChartDotConfig = {
  visible?: boolean;
  shape?: LineChartDotShape;
  radius?: number;
  fill?: LineChartDotColor;
  stroke?: LineChartDotColor;
  strokeWidth?: number;
  opacity?: number;
};

export type ResolvedLineChartDotConfig = {
  visible: boolean;
  shape: LineChartDotShape;
  radius: number;
  fill: LineChartDotColor;
  stroke: LineChartDotColor;
  strokeWidth: number;
  opacity: number;
};

export type LineChartCrosshairConfig = {
  visible?: boolean;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  strokeDasharray?: readonly number[];
};

export type ResolvedLineChartCrosshairConfig = {
  visible: boolean;
  color: string;
  strokeWidth: number;
  opacity: number;
  strokeDasharray?: readonly number[];
};

export type LineChartStrokeLinecap = "butt" | "round" | "square";
export type LineChartStrokeLinejoin = "bevel" | "miter" | "round";

export type LineChartStrokeStyleConfig = {
  strokeDasharray?: readonly number[] | undefined;
  strokeLinecap?: LineChartStrokeLinecap | undefined;
  strokeLinejoin?: LineChartStrokeLinejoin | undefined;
  strokeOpacity?: number | undefined;
};

export type ResolvedLineChartStrokeStyle = {
  strokeLinecap: LineChartStrokeLinecap;
  strokeLinejoin: LineChartStrokeLinejoin;
  strokeOpacity: number;
  strokeDasharray?: readonly number[] | undefined;
};

export type LineChartTooltipConfig = {
  visible?: boolean;
  shared?: boolean;
  width?: number;
  padding?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  labelColor?: string;
  fontSize?: number;
  labelFontSize?: number;
  positionAnimationDuration?: number;
};

export const defaultLineChartTooltipPositionAnimationDuration = 140;

export type ResolvedLineChartTooltipConfig = {
  visible: boolean;
  shared: boolean;
  width: number | undefined;
  padding: number;
  borderRadius: number;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  labelColor: string;
  fontSize: number;
  labelFontSize: number;
  positionAnimationDuration: number;
};

const resolveNonNegativeNumber = (
  value: number | undefined,
  fallback: number
) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : fallback;

const resolveOpacity = (value: number | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : fallback;

export const getLineChartStrokeStyle = ({
  strokeDasharray,
  strokeLinecap,
  strokeLinejoin,
  strokeOpacity
}: LineChartStrokeStyleConfig = {}): ResolvedLineChartStrokeStyle => {
  const resolved: ResolvedLineChartStrokeStyle = {
    strokeLinecap: strokeLinecap ?? "round",
    strokeLinejoin: strokeLinejoin ?? "round",
    strokeOpacity: resolveOpacity(strokeOpacity, 1)
  };

  if (strokeDasharray !== undefined) {
    resolved.strokeDasharray = strokeDasharray;
  }

  return resolved;
};

export const getLineChartDotConfig = ({
  dots,
  seriesDot,
  showDots
}: {
  dots: boolean | LineChartDotConfig | undefined;
  seriesDot: boolean | LineChartDotConfig | undefined;
  showDots: boolean;
}): ResolvedLineChartDotConfig => {
  const globalConfig = typeof dots === "object" ? dots : {};
  const seriesConfig = typeof seriesDot === "object" ? seriesDot : {};
  const visible =
    typeof seriesDot === "boolean"
      ? seriesDot
      : typeof seriesConfig.visible === "boolean"
        ? seriesConfig.visible
        : typeof dots === "boolean"
          ? dots
          : typeof globalConfig.visible === "boolean"
            ? globalConfig.visible
            : showDots;

  return {
    visible,
    shape: seriesConfig.shape ?? globalConfig.shape ?? "circle",
    radius: seriesConfig.radius ?? globalConfig.radius ?? 3.5,
    fill: seriesConfig.fill ?? globalConfig.fill ?? "background",
    stroke: seriesConfig.stroke ?? globalConfig.stroke ?? "series",
    strokeWidth: seriesConfig.strokeWidth ?? globalConfig.strokeWidth ?? 2,
    opacity: seriesConfig.opacity ?? globalConfig.opacity ?? 1
  };
};

export const getLineChartActiveDotConfig = ({
  activeDot,
  baseDot
}: {
  activeDot: boolean | LineChartDotConfig | undefined;
  baseDot: ResolvedLineChartDotConfig;
}): ResolvedLineChartDotConfig => {
  const config = typeof activeDot === "object" ? activeDot : {};
  const visible =
    typeof activeDot === "boolean"
      ? activeDot
      : typeof config.visible === "boolean"
        ? config.visible
        : true;

  return {
    visible,
    shape: config.shape ?? baseDot.shape,
    radius: config.radius ?? Math.max(5, baseDot.radius + 1.5),
    fill: config.fill ?? baseDot.fill,
    stroke: config.stroke ?? baseDot.stroke,
    strokeWidth: config.strokeWidth ?? Math.max(2.5, baseDot.strokeWidth),
    opacity: config.opacity ?? 1
  };
};

export const getLineChartCrosshairConfig = ({
  crosshair,
  themeAxisColor
}: {
  crosshair: boolean | LineChartCrosshairConfig | undefined;
  themeAxisColor: string;
}): ResolvedLineChartCrosshairConfig => {
  const config = typeof crosshair === "object" ? crosshair : {};
  const visible =
    typeof crosshair === "boolean"
      ? crosshair
      : typeof config.visible === "boolean"
        ? config.visible
        : crosshair !== undefined;
  const resolved: ResolvedLineChartCrosshairConfig = {
    visible,
    color: config.color ?? themeAxisColor,
    strokeWidth: config.strokeWidth ?? 1,
    opacity: config.opacity ?? 0.95
  };

  if (config.strokeDasharray !== undefined) {
    resolved.strokeDasharray = config.strokeDasharray;
  }

  return resolved;
};

export const getLineChartTooltipConfig = ({
  themeAxisColor,
  tooltip
}: {
  tooltip: boolean | LineChartTooltipConfig | undefined;
  themeAxisColor: string;
}): ResolvedLineChartTooltipConfig => {
  const config = typeof tooltip === "object" ? tooltip : {};
  const visible =
    typeof tooltip === "boolean"
      ? tooltip
      : typeof config.visible === "boolean"
        ? config.visible
        : tooltip !== undefined;

  return {
    visible,
    shared: config.shared ?? true,
    width: config.width,
    padding: config.padding ?? 10,
    borderRadius: config.borderRadius ?? 8,
    backgroundColor: config.backgroundColor ?? "#0f172a",
    borderColor: config.borderColor ?? themeAxisColor,
    textColor: config.textColor ?? "#f8fafc",
    labelColor: config.labelColor ?? "#cbd5e1",
    fontSize: config.fontSize ?? 11,
    labelFontSize: config.labelFontSize ?? 11,
    positionAnimationDuration: resolveNonNegativeNumber(
      config.positionAnimationDuration,
      defaultLineChartTooltipPositionAnimationDuration
    )
  };
};
