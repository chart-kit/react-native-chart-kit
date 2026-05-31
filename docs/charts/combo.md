---
title: Combo Chart
description: Mix bars and lines on one coordinated mobile chart surface with Chart Kit Pro.
---

# Combo Chart

`ComboChart` is a Pro chart for dashboards that need bars and lines on the same
axis. It is built for revenue operations, growth analytics, cohort performance,
and product health screens where related signals should be inspected together.

This chart is available in Chart Kit Pro.

## Basic Combo

```tsx
import { ComboChart } from "@chart-kit/pro";

const data = [
  { month: "Jan", revenue: 420, forecast: 480, margin: 128 },
  { month: "Feb", revenue: 560, forecast: 530, margin: 168 },
  { month: "Mar", revenue: 490, forecast: 610, margin: 151 },
  { month: "Apr", revenue: 720, forecast: 690, margin: 214 },
  { month: "May", revenue: 640, forecast: 760, margin: 193 },
  { month: "Jun", revenue: 880, forecast: 840, margin: 276 },
  { month: "Jul", revenue: 790, forecast: 920, margin: 244 },
  { month: "Aug", revenue: 1040, forecast: 980, margin: 331 }
];

export function RevenueOperations() {
  return (
    <ComboChart
      data={data}
      xKey="month"
      series={[
        { yKey: "revenue", label: "Revenue", type: "bar", color: "#4f8cff" },
        { yKey: "margin", label: "Margin", type: "bar", color: "#18b7a0" },
        { yKey: "forecast", label: "Forecast", type: "line", color: "#f59e0b" }
      ]}
      defaultSelectedIndex={5}
      width={360}
      height={300}
    />
  );
}
```

::chart-preview{id="pro-combo"}

## Product Use Cases

Use Combo charts for revenue vs forecast, spend vs acquisition, active users vs
conversion, inventory vs sell-through, and operational dashboards where one
metric explains another.

## Install

```sh
npm install react-native-chart-kit @chart-kit/pro react-native-svg
```

Access to `@chart-kit/pro` requires a Pro license.

## Props

| Prop                   | Type                 | Description                                  |
| ---------------------- | -------------------- | -------------------------------------------- |
| `data`                 | `TData[]`            | Object-row source data.                      |
| `xKey`                 | `keyof TData`        | Row key used for x-axis labels.              |
| `series`               | `ComboChartSeries[]` | Mixed `bar` and `line` series configuration. |
| `defaultSelectedIndex` | `number`             | Initial selected x value.                    |
| `width`                | `number`             | Outer chart width in pixels.                 |
| `height`               | `number`             | Outer chart height in pixels.                |
