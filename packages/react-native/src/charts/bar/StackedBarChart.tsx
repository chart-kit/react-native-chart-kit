import { useMemo } from "react";
import { View } from "react-native";

import { BarChart } from "./BarChart";
import {
  buildStackedBarChartCompatProps,
  type StackedBarChartProps
} from "./stackedCompat";

export type * from "./stackedCompat";

export const StackedBarChart = (props: StackedBarChartProps) => {
  const { barChartProps, style } = useMemo(
    () => buildStackedBarChartCompatProps(props),
    [props]
  );

  return (
    <View style={style}>
      <BarChart {...barChartProps} />
    </View>
  );
};
