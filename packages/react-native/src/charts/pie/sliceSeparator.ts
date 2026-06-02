import type {
  PieChartSliceSeparatorConfig,
  ResolvedPieChartSliceSeparatorConfig
} from "./types";

const defaultSliceSeparatorWidth = 2;

const clampOpacity = (value: number | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : fallback;

const resolveNonNegativeNumber = (
  value: number | undefined,
  fallback: number
) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : fallback;

export const resolvePieChartSliceSeparatorConfig = ({
  backgroundColor,
  sliceSeparator
}: {
  backgroundColor: string;
  sliceSeparator: boolean | PieChartSliceSeparatorConfig | undefined;
}): ResolvedPieChartSliceSeparatorConfig => {
  if (sliceSeparator === undefined || sliceSeparator === false) {
    return {
      color: backgroundColor,
      opacity: 1,
      visible: false,
      width: 0
    };
  }

  const config = typeof sliceSeparator === "object" ? sliceSeparator : {};
  const width = resolveNonNegativeNumber(
    config.width,
    defaultSliceSeparatorWidth
  );

  return {
    color: config.color ?? backgroundColor,
    opacity: clampOpacity(config.opacity, 1),
    visible: config.visible !== false && width > 0,
    width
  };
};

export const getPieChartSliceSeparatorGutter = (
  sliceSeparator: ResolvedPieChartSliceSeparatorConfig
) => (sliceSeparator.visible ? Math.ceil(sliceSeparator.width / 2) : 0);
