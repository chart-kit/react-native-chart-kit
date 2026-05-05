import type { CandlestickChartSpecialSessionConfig } from "./types";

export type CandlestickChartEmergencyClosureInput<TData = unknown> =
  | Date
  | string
  | ({
      date: Date | string;
      reason?: string;
    } & Omit<CandlestickChartSpecialSessionConfig<TData>, "date" | "kind">);

export type CandlestickChartEmergencyClosureOptions<TData = unknown> = Omit<
  CandlestickChartSpecialSessionConfig<TData>,
  "date" | "kind"
>;

type CandlestickChartEmergencyClosureRecord<TData = unknown> = Exclude<
  CandlestickChartEmergencyClosureInput<TData>,
  Date | string
>;

const isClosureRecord = <TData>(
  closure: CandlestickChartEmergencyClosureInput<TData>
): closure is CandlestickChartEmergencyClosureRecord<TData> =>
  typeof closure !== "string" && !(closure instanceof Date);

const getClosureDate = <TData>(
  closure: CandlestickChartEmergencyClosureInput<TData>
) => (isClosureRecord(closure) ? closure.date : closure);

const getClosureConfig = <TData>(
  closure: CandlestickChartEmergencyClosureInput<TData>
): Partial<CandlestickChartEmergencyClosureRecord<TData>> =>
  isClosureRecord(closure) ? closure : {};

export const getCandlestickEmergencyClosureSessions = <TData = unknown>(
  closures: readonly CandlestickChartEmergencyClosureInput<TData>[],
  options: CandlestickChartEmergencyClosureOptions<TData> = {}
): Array<CandlestickChartSpecialSessionConfig<TData>> =>
  closures.map((closure) => {
    const config = getClosureConfig(closure);
    const { date: _date, reason, ...sessionConfig } = config;

    return {
      ...options,
      ...sessionConfig,
      date: getClosureDate(closure),
      kind: "closure",
      label: sessionConfig.label ?? reason ?? options.label ?? true
    };
  });
