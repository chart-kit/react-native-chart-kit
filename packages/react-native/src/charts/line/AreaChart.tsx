import { LineChart } from "./LineChart";
import type { LineChartProps } from "./types";

export const AreaChart = <TData extends Record<string, unknown>>(
  props: LineChartProps<TData>
) => <LineChart {...props} area />;
