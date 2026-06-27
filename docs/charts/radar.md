---
title: Radar Chart
description: Compare KPI profiles, benchmarks, and capability scores with Chart Kit Pro.
---

# Radar Chart

`RadarChart` compares multiple profiles across the same set of metrics. Use it
for product quality, health scores, benchmarks, rubric scoring, and capability
comparison.

This chart is available in Chart Kit Pro. Install it once from
[Installation](pro-installation.md).

## Basic Radar

```tsx
import { RadarChart } from "@chart-kit/pro";

const benchmarks = [
  { metric: "Speed", current: 92, target: 78, industry: 54 },
  { metric: "Polish", current: 48, target: 94, industry: 72 },
  { metric: "A11y", current: 96, target: 86, industry: 61 },
  { metric: "Depth", current: 38, target: 88, industry: 76 },
  { metric: "Control", current: 84, target: 64, industry: 91 },
  { metric: "Export", current: 42, target: 82, industry: 58 }
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
      width={410}
      height={320}
    />
  );
}
```

::chart-preview{id="pro-radar"}

## Product Use Cases

Use Radar charts for quality rubrics, health checks, skills matrices, competitor
benchmarks, feature maturity reports, and product scorecards.

## Props

| Prop          | Type                 | Description                          |
| ------------- | -------------------- | ------------------------------------ |
| `data`        | `TData[]`            | Object-row source data.              |
| `categoryKey` | `keyof TData`        | Row key used for axis labels.        |
| `series`      | `RadarChartSeries[]` | Values rendered as filled polygons.  |
| `maxValue`    | `number`             | Optional fixed radial scale maximum. |
| `width`       | `number`             | Outer chart width in pixels.         |
| `height`      | `number`             | Outer chart height in pixels.        |
