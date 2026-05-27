import {
  buildProgressRings,
  normalizeLegacyProgressData
} from "@chart-kit/core";
import type { LegacyProgressData } from "@chart-kit/core";

import { resolveCartesianChartThemeConfig } from "../../theme/presets";
import type {
  CartesianChartPresetRegistry,
  CartesianChartPresetValue,
  CartesianChartTheme,
  ResolvedChartKitThemeMode
} from "../../theme/presets";
import type { ProgressChartModel, ProgressChartProps } from "./types";

type ProgressChartThemeContextValue = {
  mode: ResolvedChartKitThemeMode;
  preset: CartesianChartPresetValue;
  presets: CartesianChartPresetRegistry;
  theme: CartesianChartTheme | undefined;
};

const defaultValueKey = "value";
const defaultLabelKey = "label";
const defaultColorKey = "color";
const defaultStrokeWidth = 14;
const defaultRingGap = 8;
const defaultLegendHeight = 50;
const defaultFormatPercentage = (value: number) =>
  `${Math.round(value * 100)}%`;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getStringValue = (value: unknown) =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const getNumberLikeValue = (value: unknown): number | null | undefined => {
  if (typeof value === "number") {
    return value;
  }

  if (value === null) {
    return null;
  }

  if (value === undefined) {
    return undefined;
  }

  return Number(value);
};

const isObjectRowData = <TData extends Record<string, unknown>>(
  data: ProgressChartProps<TData>["data"]
): data is TData[] => Array.isArray(data) && data.some(isObjectRecord);

const normalizeProgressInput = <TData extends Record<string, unknown>>({
  colorKey,
  colors,
  data,
  labelKey,
  labels,
  valueKey
}: {
  colorKey: ProgressChartProps<TData>["colorKey"] | undefined;
  colors: ProgressChartProps<TData>["colors"] | undefined;
  data: ProgressChartProps<TData>["data"];
  labelKey: ProgressChartProps<TData>["labelKey"] | undefined;
  labels: ProgressChartProps<TData>["labels"] | undefined;
  valueKey: ProgressChartProps<TData>["valueKey"] | undefined;
}): LegacyProgressData => {
  if (isObjectRowData(data)) {
    const resolvedValueKey = valueKey ?? defaultValueKey;
    const resolvedLabelKey = labelKey ?? defaultLabelKey;
    const resolvedColorKey = colorKey ?? defaultColorKey;

    return {
      data: data.map((item) => getNumberLikeValue(item[resolvedValueKey])),
      labels: data.map(
        (item, index) =>
          getStringValue(item[resolvedLabelKey]) ??
          labels?.[index] ??
          `Ring ${index + 1}`
      ),
      colors: data.map(
        (item, index) =>
          getStringValue(item[resolvedColorKey]) ?? colors?.[index] ?? ""
      )
    };
  }

  if (Array.isArray(data)) {
    return {
      data,
      ...(labels !== undefined ? { labels } : {}),
      ...(colors !== undefined ? { colors } : {})
    };
  }

  const resolvedLabels = data.labels ?? labels;
  const resolvedColors = data.colors ?? colors;

  return {
    ...data,
    ...(resolvedLabels !== undefined ? { labels: resolvedLabels } : {}),
    ...(resolvedColors !== undefined ? { colors: resolvedColors } : {})
  };
};

const getLegendVisible = ({
  hideLegend,
  legend
}: {
  hideLegend: ProgressChartProps["hideLegend"];
  legend: ProgressChartProps["legend"];
}) => {
  if (hideLegend || legend === false) {
    return false;
  }

  if (typeof legend === "object") {
    return legend.visible !== false;
  }

  return true;
};

export const buildProgressChartModel = <TData extends Record<string, unknown>>({
  chartKitTheme,
  props
}: {
  chartKitTheme: ProgressChartThemeContextValue;
  props: ProgressChartProps<TData>;
}): ProgressChartModel => {
  const {
    backgroundRingColor,
    colorKey,
    colors,
    data,
    formatPercentage = defaultFormatPercentage,
    height,
    hideLegend,
    labelKey,
    labels,
    legend,
    preset,
    radius,
    ringGap = defaultRingGap,
    strokeWidth = defaultStrokeWidth,
    theme,
    valueKey,
    width
  } = props;
  const resolvedTheme = resolveCartesianChartThemeConfig({
    mode:
      typeof theme === "string" && theme !== "system"
        ? theme
        : chartKitTheme.mode,
    preset: preset ?? chartKitTheme.preset,
    presets: chartKitTheme.presets,
    theme: typeof theme === "object" ? theme : chartKitTheme.theme
  });
  const legendVisible = getLegendVisible({ hideLegend, legend });
  const chartHeight = Math.max(
    120,
    height - (legendVisible ? defaultLegendHeight : 0)
  );
  const centerX = width / 2;
  const centerY = chartHeight / 2;
  const resolvedStrokeWidth = Math.max(1, strokeWidth);
  const maxRadius =
    typeof radius === "number" && Number.isFinite(radius)
      ? Math.max(0, radius)
      : Math.max(
          0,
          Math.min(width, chartHeight) / 2 - resolvedStrokeWidth / 2 - 8
        );
  const normalized = normalizeLegacyProgressData(
    normalizeProgressInput({
      colorKey,
      colors,
      data,
      labelKey,
      labels,
      valueKey
    })
  );
  const rings = buildProgressRings({
    rings: normalized.rings,
    centerX,
    centerY,
    maxRadius,
    strokeWidth: resolvedStrokeWidth,
    ringGap
  }).map((ring, index) => {
    const customColor =
      typeof ring.color === "string" && ring.color.length > 0
        ? ring.color
        : undefined;
    const color =
      customColor ??
      resolvedTheme.series[index % resolvedTheme.series.length] ??
      resolvedTheme.text;

    return {
      ...ring,
      color
    };
  });
  const definedRings = rings.filter((ring) => ring.value !== null);
  const average =
    definedRings.length > 0
      ? definedRings.reduce((sum, ring) => sum + ring.clampedValue, 0) /
        definedRings.length
      : 0;
  const legendItems = rings.map((ring) => ({
    index: ring.index,
    key: `${ring.index}-${ring.label ?? "Progress"}`,
    label: ring.label ?? `Ring ${ring.index + 1}`,
    percentageLabel: formatPercentage(ring.clampedValue),
    color: ring.color ?? resolvedTheme.series[0] ?? resolvedTheme.text,
    ring
  }));

  return {
    average,
    centerX,
    centerY,
    chartHeight,
    legendItems,
    legendVisible,
    resolvedTheme: {
      ...resolvedTheme,
      grid: backgroundRingColor ?? resolvedTheme.grid
    },
    rings
  };
};
