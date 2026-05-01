import type {
  ChartKitWarning,
  ChartXValue,
  ChartYValue,
  CartesianSeriesInput,
  LegacyContributionValue,
  LegacyLineData,
  LegacyPieDataItem,
  LegacyProgressData,
  LegacyStackedBarData,
  NormalizeCartesianInput,
  NormalizeLegacyContributionOptions,
  NormalizeLegacyPieOptions,
  NormalizeLegacyStackedBarOptions,
  NormalizeOptions,
  NormalizedCartesianData,
  NormalizedContributionData,
  NormalizedContributionDay,
  NormalizedDataPoint,
  NormalizedPieData,
  NormalizedPieSlice,
  NormalizedProgressData,
  NormalizedProgressRing,
  NormalizedSeries,
  NormalizedStackedBarData,
  NormalizedStackedBarGroup,
  NormalizedStackedBarSegment
} from "./types";

const millisecondsInOneDay = 24 * 60 * 60 * 1000;

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

const shiftDate = (date: Date, numDays: number): Date => {
  const shiftedDate = new Date(date);
  shiftedDate.setDate(shiftedDate.getDate() + numDays);
  return shiftedDate;
};

const isUtcMidnightDate = (date: Date): boolean => {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
};

const getBeginningTimeForDate = (date: Date): Date => {
  if (isUtcMidnightDate(date)) {
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const normalizeDateValue = (
  value: unknown,
  path: string,
  collector: WarningCollector
): Date | null => {
  if (
    !(
      typeof value === "string" ||
      typeof value === "number" ||
      value instanceof Date
    )
  ) {
    collector.warn({
      code: "invalid-date",
      message: `Expected date value at ${path} to be a string, number, or Date.`,
      path
    });

    return null;
  }

  const localDateMatch =
    typeof value === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  const date =
    localDateMatch &&
    localDateMatch[1] &&
    localDateMatch[2] &&
    localDateMatch[3]
      ? new Date(
          Number(localDateMatch[1]),
          Number(localDateMatch[2]) - 1,
          Number(localDateMatch[3])
        )
      : value instanceof Date
        ? value
        : new Date(value);

  if (!Number.isFinite(date.valueOf())) {
    collector.warn({
      code: "invalid-date",
      message: `Expected parseable date value at ${path}.`,
      path
    });

    return null;
  }

  return getBeginningTimeForDate(date);
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

export const normalizeLegacyStackedBarData = (
  data: LegacyStackedBarData,
  options: NormalizeLegacyStackedBarOptions = {}
): NormalizedStackedBarData<Array<number | null | undefined>> => {
  const collector = createWarningCollector(options);
  const segmentCount = Math.max(
    data.legend.length,
    data.barColors.length,
    ...data.data.map((group) => group.length)
  );
  const groups = data.data.map<
    NormalizedStackedBarGroup<Array<number | null | undefined>>
  >((group, groupIndex) => {
    const segments = Array.from<
      unknown,
      NormalizedStackedBarSegment<Array<number | null | undefined>>
    >({ length: segmentCount }, (_, segmentIndex) => {
      const value = normalizeNumberValue(
        group[segmentIndex],
        `data[${groupIndex}][${segmentIndex}]`,
        collector
      );
      const segment: NormalizedStackedBarSegment<
        Array<number | null | undefined>
      > = {
        index: groupIndex,
        seriesIndex: segmentIndex,
        label: data.legend[segmentIndex] ?? `Series ${segmentIndex + 1}`,
        value,
        defined: value !== null,
        raw: group
      };

      if (data.barColors[segmentIndex] !== undefined) {
        segment.color = data.barColors[segmentIndex];
      }

      return segment;
    });

    return {
      index: groupIndex,
      label: data.labels[groupIndex] ?? String(groupIndex),
      total: segments.reduce(
        (total, segment) => total + (segment.value ?? 0),
        0
      ),
      segments,
      raw: group
    };
  });

  return {
    kind: "stacked-bar",
    legend: data.legend,
    colors: data.barColors,
    percentile: options.percentile ?? false,
    groups,
    warnings: collector.warnings
  };
};

export const normalizeLegacyContributionData = (
  values: LegacyContributionValue[],
  options: NormalizeLegacyContributionOptions
): NormalizedContributionData<LegacyContributionValue> => {
  const collector = createWarningCollector(options);
  const accessor = options.accessor ?? "count";
  const endDate =
    normalizeDateValue(options.endDate, "endDate", collector) ??
    getBeginningTimeForDate(new Date(0));
  const startDate = shiftDate(endDate, -Math.max(options.numDays, 0) + 1);
  const emptyValue = "emptyValue" in options ? options.emptyValue : 0;
  const valuesByIndex = new Map<number, LegacyContributionValue>();

  values.forEach((value, valueIndex) => {
    const date = normalizeDateValue(
      value.date,
      `values[${valueIndex}].date`,
      collector
    );

    if (!date) {
      return;
    }

    const dayIndex = Math.floor(
      (date.valueOf() - startDate.valueOf()) / millisecondsInOneDay
    );

    if (dayIndex < 0 || dayIndex >= options.numDays) {
      collector.warn({
        code: "contribution-out-of-range",
        message: `Contribution date at values[${valueIndex}].date falls outside the configured range.`,
        path: `values[${valueIndex}].date`
      });

      return;
    }

    valuesByIndex.set(dayIndex, value);
  });

  const days = Array.from<
    unknown,
    NormalizedContributionDay<LegacyContributionValue>
  >({ length: Math.max(options.numDays, 0) }, (_, dayIndex) => {
    const raw = valuesByIndex.get(dayIndex);
    const value = raw
      ? normalizeNumberValue(
          raw[accessor],
          `valuesByDate[${dayIndex}].${accessor}`,
          collector
        )
      : emptyValue;
    const day: NormalizedContributionDay<LegacyContributionValue> = {
      index: dayIndex,
      date: shiftDate(startDate, dayIndex),
      value,
      defined: value !== null
    };

    if (raw !== undefined) {
      day.raw = raw;
    }

    return day;
  });

  return {
    kind: "contribution",
    accessor,
    startDate,
    endDate,
    days,
    warnings: collector.warnings
  };
};
