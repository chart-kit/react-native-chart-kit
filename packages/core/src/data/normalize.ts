import type {
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
import {
  createWarningCollector,
  getBeginningTimeForDate,
  millisecondsInOneDay,
  normalizeDateValue,
  normalizeNumberValue,
  normalizeXValue,
  shiftDate
} from "./normalizeValues";

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

export const normalizeLegacyContributionData = <
  TData extends LegacyContributionValue = LegacyContributionValue
>(
  values: TData[],
  options: NormalizeLegacyContributionOptions
): NormalizedContributionData<TData> => {
  const collector = createWarningCollector(options);
  const accessor = options.accessor ?? "count";
  const endDate =
    normalizeDateValue(options.endDate, "endDate", collector) ??
    getBeginningTimeForDate(new Date(0));
  const startDate = shiftDate(endDate, -Math.max(options.numDays, 0) + 1);
  const emptyValue = options.emptyValue === undefined ? 0 : options.emptyValue;
  const valuesByIndex = new Map<number, TData>();

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

  const days = Array.from<unknown, NormalizedContributionDay<TData>>(
    { length: Math.max(options.numDays, 0) },
    (_, dayIndex) => {
      const raw = valuesByIndex.get(dayIndex);
      const value = raw
        ? normalizeNumberValue(
            raw[accessor],
            `valuesByDate[${dayIndex}].${accessor}`,
            collector
          )
        : emptyValue;
      const day: NormalizedContributionDay<TData> = {
        index: dayIndex,
        date: shiftDate(startDate, dayIndex),
        value,
        defined: value !== null
      };

      if (raw !== undefined) {
        day.raw = raw;
      }

      return day;
    }
  );

  return {
    kind: "contribution",
    accessor,
    startDate,
    endDate,
    days,
    warnings: collector.warnings
  };
};
