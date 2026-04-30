const blue = "37, 99, 235";
const cyan = "8, 145, 178";
const violet = "124, 58, 237";

export type LineChartFixture = {
  width: number;
  height: number;
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
    legend?: string[];
  };
  chartConfig: {
    backgroundColor?: string;
    backgroundGradientFrom: string;
    backgroundGradientTo: string;
    backgroundGradientFromOpacity?: number;
    backgroundGradientToOpacity?: number;
    decimalPlaces?: number;
    color: (opacity: number) => string;
    labelColor?: (opacity: number) => string;
    propsForBackgroundLines?: {
      stroke?: string;
      strokeDasharray?: string;
      strokeOpacity?: number;
    };
    propsForDots?: {
      r?: string;
      strokeWidth?: string;
      stroke?: string;
    };
    fillShadowGradientFrom?: string;
    fillShadowGradientFromOpacity?: number;
    fillShadowGradientTo?: string;
    fillShadowGradientToOpacity?: number;
  };
  style?: {
    borderRadius?: number;
    marginVertical?: number;
  };
  segments?: number;
  bezier?: boolean;
  fromZero?: boolean;
  withDots?: boolean;
  withInnerLines?: boolean;
  withOuterLines?: boolean;
  verticalLabelRotation?: number;
  xLabelsOffset?: number;
  yAxisSuffix?: string;
};

const lightChartConfig: LineChartFixture["chartConfig"] = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(${blue}, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
  propsForBackgroundLines: {
    stroke: "#d1d5db",
    strokeDasharray: "4 6",
    strokeOpacity: 0.85
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#ffffff"
  },
  fillShadowGradientFrom: "#2563eb",
  fillShadowGradientFromOpacity: 0.2,
  fillShadowGradientTo: "#2563eb",
  fillShadowGradientToOpacity: 0.02
};

const darkChartConfig: LineChartFixture["chartConfig"] = {
  backgroundColor: "#0f172a",
  backgroundGradientFrom: "#0f172a",
  backgroundGradientTo: "#111827",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(125, 211, 252, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(226, 232, 240, ${opacity})`,
  propsForBackgroundLines: {
    stroke: "#334155",
    strokeDasharray: "4 6",
    strokeOpacity: 0.85
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#0f172a"
  },
  fillShadowGradientFrom: "#38bdf8",
  fillShadowGradientFromOpacity: 0.3,
  fillShadowGradientTo: "#38bdf8",
  fillShadowGradientToOpacity: 0.03
};

export const lineChartFixtures = {
  basic: {
    width: 375,
    height: 220,
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          data: [18, 34, 29, 52, 46, 68],
          color: (opacity = 1) => `rgba(${blue}, ${opacity})`,
          strokeWidth: 3
        }
      ],
      legend: ["Revenue"]
    },
    chartConfig: lightChartConfig,
    style: {
      borderRadius: 8
    },
    bezier: true,
    segments: 4,
    yAxisSuffix: "k"
  },
  longLabels: {
    width: 375,
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
          data: [42, 38, 57, 46, 71, 64],
          color: (opacity = 1) => `rgba(${cyan}, ${opacity})`,
          strokeWidth: 3
        }
      ],
      legend: ["Regional demand"]
    },
    chartConfig: {
      ...lightChartConfig,
      color: (opacity = 1) => `rgba(${cyan}, ${opacity})`,
      fillShadowGradientFrom: "#0891b2",
      fillShadowGradientTo: "#0891b2"
    },
    style: {
      borderRadius: 8
    },
    segments: 4,
    verticalLabelRotation: 46,
    xLabelsOffset: -10
  },
  denseData: {
    width: 375,
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
          data: [12, 18, 17, 24, 31, 29, 35, 43, 39, 47, 52, 58],
          color: (opacity = 1) => `rgba(${violet}, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: [9, 14, 19, 20, 26, 24, 32, 36, 37, 43, 48, 51],
          color: (opacity = 1) => `rgba(${cyan}, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Actual", "Forecast"]
    },
    chartConfig: {
      ...lightChartConfig,
      color: (opacity = 1) => `rgba(${violet}, ${opacity})`,
      fillShadowGradientFrom: "#7c3aed",
      fillShadowGradientTo: "#7c3aed"
    },
    style: {
      borderRadius: 8
    },
    segments: 5,
    withDots: false
  },
  negativeValues: {
    width: 375,
    height: 220,
    data: {
      labels: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"],
      datasets: [
        {
          data: [-24, -12, 8, 19, -6, 31],
          color: (opacity = 1) => `rgba(${blue}, ${opacity})`,
          strokeWidth: 3
        }
      ],
      legend: ["Net change"]
    },
    chartConfig: lightChartConfig,
    style: {
      borderRadius: 8
    },
    segments: 4
  },
  emptyState: {
    width: 375,
    height: 220,
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          color: (opacity = 1) => `rgba(${blue}, ${opacity})`,
          strokeWidth: 3
        }
      ],
      legend: ["No data"]
    },
    chartConfig: lightChartConfig,
    style: {
      borderRadius: 8
    }
  },
  darkMode: {
    width: 375,
    height: 220,
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          data: [16, 24, 21, 36, 42, 39, 50],
          color: (opacity = 1) => `rgba(125, 211, 252, ${opacity})`,
          strokeWidth: 3
        }
      ],
      legend: ["Sessions"]
    },
    chartConfig: darkChartConfig,
    style: {
      borderRadius: 8
    },
    bezier: true,
    segments: 4
  },
  tinyWidth: {
    width: 280,
    height: 220,
    data: {
      labels: ["A", "B", "C", "D"],
      datasets: [
        {
          data: [7, 18, 11, 24],
          color: (opacity = 1) => `rgba(${blue}, ${opacity})`,
          strokeWidth: 3
        }
      ]
    },
    chartConfig: lightChartConfig,
    style: {
      borderRadius: 8
    },
    segments: 3,
    withInnerLines: false,
    withOuterLines: true
  }
} satisfies Record<string, LineChartFixture>;
