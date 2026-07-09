---
title: Legacy Charts
description: Old root-import chart examples for the legacy-compatible API.
---

# Legacy Charts

These examples use the legacy-compatible root import:

```tsx
import {
  BarChart,
  ContributionGraph,
  LineChart,
  PieChart,
  ProgressChart,
  StackedBarChart
} from "react-native-chart-kit";
```

Legacy charts do not read `ChartKitProvider` presets. Theme them by passing
legacy props such as `chartConfig`, `barColors`, `legendFontColor`, and
`backgroundColor`.

## LineChart

```tsx
import { LineChart } from "react-native-chart-kit";

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`
};

<LineChart
  data={{
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [20, 45, 28, 80, 99, 43] }],
    legend: ["Revenue"]
  }}
  width={410}
  height={240}
  chartConfig={chartConfig}
  bezier
/>;
```

::chart-preview{id="legacy-line"}

The legacy root `LineChart` preserves v6 point-slot spacing for existing
overlays. For custom point content, prefer `renderDotContent`, which supplies
the rendered `x` and `y` coordinates, instead of recalculating positions.

## BarChart

```tsx
import { BarChart } from "react-native-chart-kit";

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`
};

<BarChart
  data={{
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [20, 45, 28, 80, 99, 43] }]
  }}
  width={410}
  height={240}
  yAxisLabel="$"
  yAxisSuffix="k"
  chartConfig={chartConfig}
/>;
```

::chart-preview{id="legacy-bar"}

## StackedBarChart

```tsx
import { StackedBarChart } from "react-native-chart-kit";

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`
};

<StackedBarChart
  data={{
    labels: ["Q1", "Q2", "Q3", "Q4"],
    legend: ["Direct", "Partner", "Expansion"],
    data: [
      [60, 30, 20],
      [80, 45, 35],
      [70, 55, 40],
      [95, 65, 45]
    ],
    barColors: ["#2563eb", "#0891b2", "#7c3aed"]
  }}
  width={410}
  height={240}
  chartConfig={chartConfig}
  hideLegend={false}
/>;
```

::chart-preview{id="legacy-stacked-bar"}

## PieChart

```tsx
import { PieChart } from "react-native-chart-kit";

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`
};

const data = [
  {
    name: "Organic",
    population: 42,
    color: "#2563eb",
    legendFontColor: "#334155",
    legendFontSize: 12
  },
  {
    name: "Paid",
    population: 24,
    color: "#0891b2",
    legendFontColor: "#334155",
    legendFontSize: 12
  },
  {
    name: "Referral",
    population: 18,
    color: "#7c3aed",
    legendFontColor: "#334155",
    legendFontSize: 12
  }
];

<PieChart
  data={data}
  width={410}
  height={240}
  accessor="population"
  backgroundColor="#ffffff"
  chartConfig={chartConfig}
  paddingLeft="15"
/>;
```

::chart-preview{id="legacy-pie"}

## ProgressChart

```tsx
import { ProgressChart } from "react-native-chart-kit";

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`
};

<ProgressChart
  data={{
    labels: ["Swim", "Bike", "Run"],
    data: [0.4, 0.6, 0.8]
  }}
  width={410}
  height={240}
  chartConfig={chartConfig}
/>;
```

::chart-preview{id="legacy-progress"}

## ContributionGraph

```tsx
import { ContributionGraph } from "react-native-chart-kit";

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(37, 99, 235, ${Math.max(opacity, 0.28)})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`
};

const values = [
  { date: "2026-01-02", count: 1 },
  { date: "2026-01-03", count: 4 },
  { date: "2026-01-04", count: 2 },
  { date: "2026-01-07", count: 6 },
  { date: "2026-01-08", count: 3 },
  { date: "2026-01-12", count: 8 },
  { date: "2026-01-15", count: 2 },
  { date: "2026-01-16", count: 5 },
  { date: "2026-01-17", count: 1 },
  { date: "2026-01-24", count: 10 },
  { date: "2026-01-28", count: 4 },
  { date: "2026-01-31", count: 7 },
  { date: "2026-02-01", count: 2 },
  { date: "2026-02-03", count: 9 },
  { date: "2026-02-04", count: 1 },
  { date: "2026-02-10", count: 5 },
  { date: "2026-02-14", count: 11 },
  { date: "2026-02-15", count: 3 },
  { date: "2026-02-18", count: 6 },
  { date: "2026-02-19", count: 2 },
  { date: "2026-02-23", count: 8 },
  { date: "2026-02-27", count: 4 },
  { date: "2026-03-01", count: 12 },
  { date: "2026-03-02", count: 6 },
  { date: "2026-03-05", count: 3 },
  { date: "2026-03-08", count: 9 },
  { date: "2026-03-13", count: 2 },
  { date: "2026-03-14", count: 7 },
  { date: "2026-03-21", count: 5 },
  { date: "2026-03-25", count: 10 },
  { date: "2026-03-29", count: 1 },
  { date: "2026-03-31", count: 6 }
];

<ContributionGraph
  values={values}
  endDate={new Date("2026-03-31")}
  numDays={90}
  width={410}
  height={220}
  chartConfig={chartConfig}
  gutterSize={2}
  tooltipDataAttrs={() => ({})}
/>;
```

::chart-preview{id="legacy-contribution"}
