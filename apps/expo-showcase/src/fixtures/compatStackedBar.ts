export type StackedBarChartFixture = {
  width: number;
  height: number;
  data: {
    labels: string[];
    legend: string[];
    data: number[][];
    barColors: string[];
  };
  chartConfig: {
    backgroundColor?: string;
    backgroundGradientFrom: string;
    backgroundGradientTo: string;
    decimalPlaces?: number;
    labelColor?: (opacity?: number) => string;
    barPercentage?: number;
    barRadius?: number;
    propsForBackgroundLines?: {
      stroke?: string;
    };
  };
  hideLegend?: boolean;
  percentile?: boolean;
  segments?: number;
  style?: {
    borderRadius?: number;
    marginVertical?: number;
    paddingRight?: number;
    width?: number;
  };
  yAxisSuffix?: string;
};

const chartConfig: StackedBarChartFixture["chartConfig"] = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  barPercentage: 0.68,
  barRadius: 5,
  decimalPlaces: 0,
  labelColor: () => "#475569",
  propsForBackgroundLines: {
    stroke: "#d8e0ea"
  }
};

const baseStyle = {
  borderRadius: 8,
  marginVertical: 4,
  paddingRight: 28,
  width: 393
};

export const fixtures = {
  basic: {
    width: 393,
    height: 250,
    data: {
      labels: ["Free", "Starter", "Team", "Business"],
      legend: ["Active", "Trial", "Paused"],
      data: [
        [44, 18, 8],
        [38, 24, 11],
        [52, 28, 14],
        [61, 32, 18]
      ],
      barColors: ["#2563eb", "#0891b2", "#7c3aed"]
    },
    chartConfig,
    segments: 4,
    style: baseStyle,
    yAxisSuffix: "k"
  },
  percentile: {
    width: 393,
    height: 250,
    data: {
      labels: ["Free", "Starter", "Team", "Business"],
      legend: ["Active", "Trial", "Paused"],
      data: [
        [63, 26, 11],
        [52, 33, 15],
        [58, 31, 11],
        [64, 24, 12]
      ],
      barColors: ["#16a34a", "#f59e0b", "#64748b"]
    },
    chartConfig,
    percentile: true,
    segments: 4,
    style: baseStyle,
    yAxisSuffix: "%"
  }
} satisfies Record<string, StackedBarChartFixture>;
