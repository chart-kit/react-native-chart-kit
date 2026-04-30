const blue = "37, 99, 235";
const cyan = "8, 145, 178";
const green = "22, 163, 74";
const red = "220, 38, 38";
const violet = "124, 58, 237";

type BarColor = (opacity: number) => string;

export type BarChartFixture = {
  width: number;
  height: number;
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      colors?: BarColor[];
    }>;
  };
  chartConfig: {
    backgroundColor?: string;
    backgroundGradientFrom: string;
    backgroundGradientTo: string;
    backgroundGradientFromOpacity?: number;
    backgroundGradientToOpacity?: number;
    decimalPlaces?: number;
    color: (opacity: number, index?: number) => string;
    labelColor?: (opacity: number) => string;
    barPercentage?: number;
    barRadius?: number;
    formatTopBarValue?: (value: number) => string | number;
    propsForBackgroundLines?: {
      stroke?: string;
      strokeDasharray?: string;
      strokeOpacity?: number;
    };
    propsForTopLabels?: {
      fill?: string;
      fontSize?: number;
      fontWeight?: string;
    };
  };
  style?: {
    borderRadius?: number;
    marginVertical?: number;
    paddingRight?: number;
    paddingTop?: number;
    width?: number;
  };
  flatColor?: boolean;
  fromZero?: boolean;
  horizontalLabelRotation?: number;
  segments?: number;
  showBarTops?: boolean;
  showValuesOnTopOfBars?: boolean;
  verticalLabelRotation?: number;
  withCustomBarColorFromData?: boolean;
  withHorizontalLabels?: boolean;
  withInnerLines?: boolean;
  withVerticalLabels?: boolean;
  yAxisLabel?: string;
  yAxisSuffix?: string;
};

const barColor = (rgb: string): BarColor => {
  return (opacity = 1) => `rgba(${rgb}, ${opacity})`;
};

const lightChartConfig: BarChartFixture["chartConfig"] = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(${blue}, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
  barPercentage: 0.72,
  barRadius: 5,
  propsForBackgroundLines: {
    stroke: "#d1d5db",
    strokeDasharray: "4 6",
    strokeOpacity: 0.85
  },
  propsForTopLabels: {
    fill: "#374151",
    fontSize: 11,
    fontWeight: "600"
  }
};

const darkChartConfig: BarChartFixture["chartConfig"] = {
  backgroundColor: "#0f172a",
  backgroundGradientFrom: "#0f172a",
  backgroundGradientTo: "#111827",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(125, 211, 252, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(226, 232, 240, ${opacity})`,
  barPercentage: 0.72,
  barRadius: 5,
  propsForBackgroundLines: {
    stroke: "#334155",
    strokeDasharray: "4 6",
    strokeOpacity: 0.85
  },
  propsForTopLabels: {
    fill: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600"
  }
};

const phoneChartStyle: BarChartFixture["style"] = {
  borderRadius: 8,
  paddingRight: 36,
  paddingTop: 8,
  width: 393
};

export const barChartFixtures = {
  basic: {
    width: 393,
    height: 220,
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          data: [18, 34, 29, 52, 46, 68]
        }
      ]
    },
    chartConfig: lightChartConfig,
    style: phoneChartStyle,
    fromZero: true,
    segments: 4,
    showValuesOnTopOfBars: true,
    yAxisSuffix: "k"
  },
  longLabels: {
    width: 393,
    height: 236,
    data: {
      labels: [
        "North America",
        "South America",
        "Western Europe",
        "Central Asia",
        "Southeast Asia",
        "Oceania"
      ],
      datasets: [
        {
          data: [42, 38, 57, 46, 71, 64]
        }
      ]
    },
    chartConfig: {
      ...lightChartConfig,
      color: (opacity = 1) => `rgba(${cyan}, ${opacity})`
    },
    style: phoneChartStyle,
    fromZero: true,
    segments: 4,
    verticalLabelRotation: 46
  },
  denseData: {
    width: 393,
    height: 220,
    data: {
      labels: [
        "W1",
        "W2",
        "W3",
        "W4",
        "W5",
        "W6",
        "W7",
        "W8",
        "W9",
        "W10",
        "W11",
        "W12"
      ],
      datasets: [
        {
          data: [12, 18, 17, 24, 31, 29, 35, 43, 39, 47, 52, 58]
        }
      ]
    },
    chartConfig: {
      ...lightChartConfig,
      barPercentage: 0.52,
      color: (opacity = 1) => `rgba(${violet}, ${opacity})`
    },
    style: phoneChartStyle,
    fromZero: true,
    segments: 5,
    showBarTops: false
  },
  negativeValues: {
    width: 393,
    height: 220,
    data: {
      labels: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"],
      datasets: [
        {
          data: [-24, -12, 8, 19, -6, 31],
          colors: [
            barColor(red),
            barColor(red),
            barColor(green),
            barColor(green),
            barColor(red),
            barColor(green)
          ]
        }
      ]
    },
    chartConfig: lightChartConfig,
    style: phoneChartStyle,
    segments: 4,
    withCustomBarColorFromData: true
  },
  emptyState: {
    width: 393,
    height: 220,
    data: {
      labels: [],
      datasets: [
        {
          data: []
        }
      ]
    },
    chartConfig: lightChartConfig,
    style: phoneChartStyle
  },
  darkMode: {
    width: 393,
    height: 220,
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          data: [16, 24, 21, 36, 42, 39, 50]
        }
      ]
    },
    chartConfig: darkChartConfig,
    style: phoneChartStyle,
    fromZero: true,
    segments: 4,
    showValuesOnTopOfBars: true
  },
  tinyWidth: {
    width: 280,
    height: 220,
    data: {
      labels: ["A", "B", "C", "D"],
      datasets: [
        {
          data: [7, 18, 11, 24]
        }
      ]
    },
    chartConfig: {
      ...lightChartConfig,
      barPercentage: 0.62
    },
    style: {
      borderRadius: 8,
      paddingRight: 28,
      paddingTop: 8,
      width: 280
    },
    fromZero: true,
    segments: 3,
    withInnerLines: false
  }
} satisfies Record<string, BarChartFixture>;
