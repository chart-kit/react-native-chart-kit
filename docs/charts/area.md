---
title: Area Chart
description: Build filled trend charts with AreaChart or LineChart area mode.
---

# Area Chart

`AreaChart` is the dedicated v2 surface for filled trend charts. It shares the
same data model and interaction primitives as `LineChart`, but defaults to an
area fill.

## Basic Area

```tsx
import { AreaChart } from "react-native-chart-kit/v2";

const data = [
  { date: "Jan", price: 18 },
  { date: "Feb", price: 34 },
  { date: "Mar", price: 29 },
  { date: "Apr", price: 52 }
];

export function PipelineChart() {
  return (
    <AreaChart
      data={data}
      xKey="date"
      yKey="price"
      curve="monotone"
      width={360}
      height={240}
    />
  );
}
```

::chart-preview{id="line-area"}

## Area Fill

Use `areaFill` to tune fill opacity. You can also pass `area` to `LineChart`
when a product uses line and area variants from the same component wrapper.

```tsx
<LineChart
  area
  areaFill={{ fromOpacity: 0.32, toOpacity: 0.05 }}
  data={data}
  xKey="date"
  yKey="price"
  curve="monotone"
  width={360}
  height={240}
/>
```

Use `areaFill` on the chart for a shared fill style, or per series when each
series needs its own colors or opacity.

## Threshold Area

Threshold coloring clips the rendered path and area fill above or below a y
value. Raw points are unchanged.

```tsx
<AreaChart
  data={data}
  xKey="month"
  series={[
    {
      yKey: "attainment",
      label: "Attainment",
      threshold: {
        y: 100,
        aboveColor: "#16a34a",
        belowColor: "#dc2626",
        areaAboveColor: "#16a34a",
        areaBelowColor: "#dc2626",
        areaOpacity: 0.16
      }
    }
  ]}
  referenceLines={[{ y: 100, label: "Plan", strokeDasharray: [5, 4] }]}
  width={360}
  height={240}
/>
```

## Dense Area Charts

For long time series, use the same viewport, scrolling, and decimation options
as `LineChart`.

```tsx
<AreaChart
  data={largeData}
  xKey="timestamp"
  yKey="price"
  scrollable
  visiblePoints={30}
  initialIndex="end"
  showDots={false}
  decimation={{ maxPoints: 700 }}
  yAxisLabelWidth="stable"
  width={360}
  height={260}
/>
```
