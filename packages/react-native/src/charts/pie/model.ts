import { buildPieArcs, normalizeLegacyPieData } from "@chart-kit/core";
import type { LegacyPieDataItem } from "@chart-kit/core";

import { resolveCartesianChartThemeConfig } from "../../theme/presets";
import type {
  CartesianChartPresetRegistry,
  CartesianChartPresetValue,
  CartesianChartTheme,
  ResolvedChartKitThemeMode
} from "../../theme/presets";
import {
  buildPieChartArcLabels,
  getPieChartArcLabelsVisible,
  resolvePieChartArcLabelsConfig
} from "./arcLabels";
import type { PieChartModel, PieChartProps } from "./types";

type PieChartThemeContextValue = {
  mode: ResolvedChartKitThemeMode;
  preset: CartesianChartPresetValue;
  presets: CartesianChartPresetRegistry;
  theme: CartesianChartTheme | undefined;
};

const defaultLabelKey = "name";
const defaultColorKey = "color";
const defaultLegendHeight = 54;
const defaultArcLabelReserve = 86;
const defaultFormatValue = (value: number) => String(value);
const defaultFormatPercentage = (percentage: number) =>
  `${Math.round(percentage * 100)}%`;

const clamp = (value: number, min: number, max: number) => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const getStringValue = (value: unknown, fallback: string) =>
  typeof value === "string" && value.length > 0 ? value : fallback;

const getLegendVisible = <TData extends Record<string, unknown>>(
  legend: PieChartProps<TData>["legend"]
) => {
  if (legend === false) {
    return false;
  }

  if (typeof legend === "object") {
    return legend.visible !== false;
  }

  return true;
};

const normalizePieInput = <TData extends Record<string, unknown>>({
  colorKey,
  colors,
  data,
  labelKey,
  valueKey
}: {
  colorKey: PieChartProps<TData>["colorKey"] | undefined;
  colors: PieChartProps<TData>["colors"] | undefined;
  data: PieChartProps<TData>["data"];
  labelKey: PieChartProps<TData>["labelKey"] | undefined;
  valueKey: PieChartProps<TData>["valueKey"];
}) =>
  data.map<LegacyPieDataItem>((item, index) => {
    const label = getStringValue(
      item[labelKey ?? defaultLabelKey],
      `Slice ${index + 1}`
    );
    const color = getStringValue(
      item[colorKey ?? defaultColorKey],
      colors?.[index] ?? ""
    );
    const normalized: LegacyPieDataItem = {
      ...item,
      name: label,
      [valueKey]: item[valueKey]
    };

    if (color) {
      normalized.color = color;
    }

    return normalized;
  });

export const buildPieChartModel = <TData extends Record<string, unknown>>({
  chartKitTheme,
  props,
  selectedIndex
}: {
  chartKitTheme: PieChartThemeContextValue;
  props: PieChartProps<TData>;
  selectedIndex?: number | undefined;
}): PieChartModel<TData> => {
  const {
    arcLabels,
    colors,
    colorKey,
    data,
    formatPercentage = defaultFormatPercentage,
    formatValue = defaultFormatValue,
    height,
    innerRadius,
    innerRadiusRatio,
    labelKey,
    legend,
    preset,
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
  const legendVisible = getLegendVisible(legend);
  const arcLabelConfig = resolvePieChartArcLabelsConfig(arcLabels);
  const arcLabelsVisible = getPieChartArcLabelsVisible(arcLabels);
  const chartHeight = Math.max(
    120,
    height - (legendVisible ? defaultLegendHeight : 0)
  );
  const centerX = width / 2;
  const centerY = chartHeight / 2;
  const arcLabelReserve = arcLabelsVisible ? defaultArcLabelReserve : 0;
  const radius = Math.max(
    0,
    Math.min(
      Math.max(0, width - arcLabelReserve * 2),
      Math.max(0, chartHeight - arcLabelReserve * 0.48)
    ) /
      2 -
      6
  );
  const resolvedInnerRadius =
    typeof innerRadius === "number" && Number.isFinite(innerRadius)
      ? innerRadius
      : radius * clamp(innerRadiusRatio ?? 0, 0, 0.92);
  const normalized = normalizeLegacyPieData(
    normalizePieInput({ colorKey, colors, data, labelKey, valueKey }),
    { accessor: valueKey }
  );
  const arcs = buildPieArcs({
    slices: normalized.slices,
    centerX,
    centerY,
    radius,
    innerRadius: resolvedInnerRadius
  }).map((arc, index) => {
    const { color: _color, raw: _raw, ...rest } = arc;
    const color =
      arc.color ??
      resolvedTheme.series[index % resolvedTheme.series.length] ??
      resolvedTheme.text;
    const raw = data[arc.index];

    return {
      ...rest,
      color,
      ...(raw !== undefined ? { raw } : {})
    };
  });
  const total = arcs.reduce(
    (sum, arc) => (arc.value !== null ? sum + arc.value : sum),
    0
  );
  const legendItems = arcs
    .filter((arc) => arc.defined)
    .map((arc) => ({
      index: arc.index,
      key: `${arc.index}-${arc.label}`,
      label: arc.label,
      valueLabel: formatValue(arc.value ?? 0),
      percentageLabel: formatPercentage(arc.percentage),
      color: arc.color ?? resolvedTheme.series[0] ?? resolvedTheme.text,
      arc
    }));
  const resolvedArcLabels = buildPieChartArcLabels({
    arcs,
    centerX,
    centerY,
    chartHeight,
    chartWidth: width,
    config: arcLabelConfig,
    legendItems,
    radius,
    selectedIndex,
    theme: resolvedTheme
  });

  return {
    arcLabels: resolvedArcLabels,
    arcLabelsVisible,
    arcs,
    centerX,
    centerY,
    chartHeight,
    innerRadius: resolvedInnerRadius,
    legendItems,
    legendVisible,
    radius,
    resolvedTheme,
    total
  };
};
