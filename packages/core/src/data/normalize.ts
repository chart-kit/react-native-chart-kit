import type {
  ChartKitWarning,
  ChartXValue,
  ChartYValue,
  CartesianSeriesInput,
  LegacyLineData,
  LegacyPieDataItem,
  LegacyProgressData,
  NormalizeCartesianInput,
  NormalizeLegacyPieOptions,
  NormalizeOptions,
  NormalizedCartesianData,
  NormalizedDataPoint,
  NormalizedPieData,
  NormalizedPieSlice,
  NormalizedProgressData,
  NormalizedProgressRing,
  NormalizedSeries
} from "./types";

type WarningCollector = {
  warnings: ChartKitWarning[];
  warn: (warning: ChartKitWarning) => void;
};

const createWarningCollector = (options: NormalizeOptions = {}) => {
  const warnings: ChartKitWarning[] = [];

  return {
    warnings,
    warn: (warning: ChartKitWarning) => {
      warnings.push(warning);
      options.onWarning?.(warning);
    }
  } satisfies WarningCollector;
};

const isChartXValue = (value: unknown): value is ChartXValue => {
  return (
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    (value instanceof Date && Number.isFinite(value.valueOf()))
  );
};

const normalizeXValue = (
  value: unknown,
  fallback: number,
  path: string,
  collector: WarningCollector
): ChartXValue => {
  if (isChartXValue(value)) {
    return value;
  }

  collector.warn({
    code: "invalid-x-value",
    message: `Expected x value at ${path} to be a string, number, or Date.`,
    path
  });

  return fallback;
};

const normalizeNumberValue = (
  value: unknown,
  path: string,
  collector: WarningCollector
): ChartYValue => {
  if (value === null) {
    return null;
  }

  if (value === undefined) {
    collector.warn({
      code: "missing-value",
      message: `Missing numeric value at ${path}; normalized to null.`,
      path
    });

    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  collector.warn({
    code: "invalid-number",
    message: `Expected finite number or null at ${path}; normalized to null.`,
    path
  });

  return null;
};

const getSeriesInputs = <TData extends Record<string, unknown>>(
  input: NormalizeCartesianInput<TData>
): Array<CartesianSeriesInput<TData>> => {
  if (input.series && input.series.length > 0) {
    return input.series;
  }

  if (input.yKeys && input.yKeys.length > 0) {
    return input.yKeys.map(
      (yKey) => ({ yKey }) satisfies CartesianSeriesInput<TData>
    );
  }

  if (input.yKey) {
    return [{ yKey: input.yKey }];
  }

  return [];
};

export const normalizeCartesianData = <TData extends Record<string, unknown>>(
  input: NormalizeCartesianInput<TData>,
  options: NormalizeOptions = {}
): NormalizedCartesianData<TData> => {
  const collector = createWarningCollector(options);
  const seriesInputs = getSeriesInputs(input);
  const series = seriesInputs.map<NormalizedSeries<TData>>(
    (seriesInput, seriesIndex) => {
      const key = seriesInput.key ?? seriesInput.yKey;
      const label = seriesInput.label ?? key;
      const points = input.data.map<NormalizedDataPoint<TData>>(
        (row, rowIndex) => {
          const x = normalizeXValue(
            row[input.xKey],
            rowIndex,
            `data[${rowIndex}].${input.xKey}`,
            collector
          );
          const value = normalizeNumberValue(
            row[seriesInput.yKey],
            `data[${rowIndex}].${seriesInput.yKey}`,
            collector
          );

          return {
            index: rowIndex,
            x,
            value,
            defined: value !== null,
            raw: row
          };
        }
      );

      const normalizedSeries: NormalizedSeries<TData> = {
        key: String(key || `series-${seriesIndex}`),
        label: String(label || key || `Series ${seriesIndex + 1}`),
        points
      };

      if (seriesInput.color !== undefined) {
        normalizedSeries.color = seriesInput.color;
      }

      return normalizedSeries;
    }
  );

  return {
    kind: "cartesian",
    xKey: input.xKey,
    series,
    rows: input.data,
    warnings: collector.warnings
  };
};

export const normalizeLegacyLineData = (
  data: LegacyLineData,
  options: NormalizeOptions = {}
): NormalizedCartesianData<LegacyLineData> => {
  const collector = createWarningCollector(options);
  const maxPointCount = Math.max(
    data.labels?.length ?? 0,
    ...data.datasets.map((dataset) => dataset.data.length)
  );

  const rows = Array.from({ length: maxPointCount }, () => data);
  const series = data.datasets.map<NormalizedSeries<LegacyLineData>>(
    (dataset, datasetIndex) => {
      const key = String(dataset.key ?? `series-${datasetIndex}`);
      const label = data.legend?.[datasetIndex] ?? key;
      const points = Array.from<unknown, NormalizedDataPoint<LegacyLineData>>(
        { length: maxPointCount },
        (_, pointIndex) => {
          const value = normalizeNumberValue(
            dataset.data[pointIndex],
            `datasets[${datasetIndex}].data[${pointIndex}]`,
            collector
          );

          return {
            index: pointIndex,
            x: data.labels?.[pointIndex] ?? pointIndex,
            value,
            defined: value !== null,
            raw: data
          };
        }
      );

      return {
        key,
        label,
        points
      };
    }
  );

  return {
    kind: "cartesian",
    xKey: "labels",
    series,
    rows,
    warnings: collector.warnings
  };
};

export const normalizeLegacyPieData = (
  data: LegacyPieDataItem[],
  options: NormalizeLegacyPieOptions = {}
): NormalizedPieData<LegacyPieDataItem> => {
  const accessor = options.accessor ?? "population";
  const collector = createWarningCollector(options);
  const slices = data.map<NormalizedPieSlice<LegacyPieDataItem>>(
    (item, index) => {
      let value = normalizeNumberValue(
        item[accessor],
        `data[${index}].${accessor}`,
        collector
      );

      if (value !== null && value < 0) {
        collector.warn({
          code: "negative-pie-value",
          message: `Expected non-negative pie value at data[${index}].${accessor}; normalized to null.`,
          path: `data[${index}].${accessor}`
        });
        value = null;
      }

      const slice: NormalizedPieSlice<LegacyPieDataItem> = {
        index,
        label: item.name ?? `Slice ${index + 1}`,
        value,
        defined: value !== null,
        raw: item
      };

      if (item.color !== undefined) {
        slice.color = item.color;
      }

      return slice;
    }
  );

  return {
    kind: "pie",
    accessor,
    slices,
    warnings: collector.warnings
  };
};

export const normalizeLegacyProgressData = (
  input: LegacyProgressData,
  options: NormalizeOptions = {}
): NormalizedProgressData => {
  const collector = createWarningCollector(options);
  const data = Array.isArray(input) ? input : input.data;
  const labels = Array.isArray(input) ? undefined : input.labels;
  const colors = Array.isArray(input) ? undefined : input.colors;
  const rings = data.map<NormalizedProgressRing>((rawValue, index) => {
    const value = normalizeNumberValue(rawValue, `data[${index}]`, collector);

    if (value !== null && (value < 0 || value > 1)) {
      collector.warn({
        code: "progress-out-of-range",
        message: `Expected progress value at data[${index}] to be between 0 and 1.`,
        path: `data[${index}]`
      });
    }

    const ring: NormalizedProgressRing = {
      index,
      value,
      defined: value !== null
    };

    if (labels?.[index] !== undefined) {
      ring.label = labels[index];
    }

    if (colors?.[index] !== undefined) {
      ring.color = colors[index];
    }

    return ring;
  });

  return {
    kind: "progress",
    rings,
    warnings: collector.warnings
  };
};
