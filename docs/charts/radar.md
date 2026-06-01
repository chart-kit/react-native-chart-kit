---
title: Radar Chart
description: Compare KPI profiles, benchmarks, and capability scores with Chart Kit Pro.
---

# Radar Chart

`RadarChart` is a Pro chart for comparing multiple metric profiles across a
fixed set of dimensions. It is useful for product quality, health scores,
benchmarks, rubric scoring, and portfolio comparison.

This chart is available in Chart Kit Pro.

## Basic Radar

```tsx
import { RadarChart } from "@chart-kit/pro";

const benchmarks = [
  { metric: "Speed", current: 82, target: 92, industry: 68 },
  { metric: "Polish", current: 76, target: 88, industry: 61 },
  { metric: "A11y", current: 90, target: 94, industry: 72 },
  { metric: "Depth", current: 68, target: 84, industry: 55 },
  { metric: "Control", current: 86, target: 91, industry: 65 },
  { metric: "Export", current: 72, target: 86, industry: 58 }
];

export function QualityRadar() {
  return (
    <RadarChart
      data={benchmarks}
      categoryKey="metric"
      maxValue={100}
      series={[
        { valueKey: "current", label: "Current" },
        { valueKey: "target", label: "Target" },
        { valueKey: "industry", label: "Industry" }
      ]}
      width={360}
      height={320}
    />
  );
}
```

::chart-preview{id="pro-radar"}

## Product Use Cases

Use Radar charts for quality rubrics, health checks, skills matrices, competitor
benchmarks, feature maturity reports, and product scorecards.

## Install

```sh
npm install react-native-chart-kit @chart-kit/pro react-native-svg
```

Access to `@chart-kit/pro` requires a Pro license.

## Props

| Prop          | Type                 | Description                          |
| ------------- | -------------------- | ------------------------------------ |
| `data`        | `TData[]`            | Object-row source data.              |
| `categoryKey` | `keyof TData`        | Row key used for axis labels.        |
| `series`      | `RadarChartSeries[]` | Values rendered as filled polygons.  |
| `maxValue`    | `number`             | Optional fixed radial scale maximum. |
| `width`       | `number`             | Outer chart width in pixels.         |
| `height`      | `number`             | Outer chart height in pixels.        |
