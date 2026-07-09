---
title: Prop Mapping
description: Map legacy chart props to their modern v2 equivalents.
---

# Prop Mapping

This table summarizes the current migration intent for common v1 props. It is a public-facing version of the internal compatibility matrix, scoped to props most apps actually use.

## Line And Bar Props

| v1 prop                     | v2 status                        | Modern replacement                                  |
| --------------------------- | -------------------------------- | --------------------------------------------------- |
| `data.labels`               | Supported in compat              | `data` rows plus `xKey`                             |
| `data.datasets[].data`      | Supported in compat              | `yKey`, `yKeys`, or `series`                        |
| `data.legend`               | Supported in compat              | `legend` plus `series[].label`                      |
| `width` / `height`          | Supported                        | Same props                                          |
| `chartConfig.color`         | Supported in compat              | `theme.colors.series` or `series[].color`           |
| `chartConfig.labelColor`    | Supported in compat              | `theme.colors.mutedText`                            |
| `chartConfig.strokeWidth`   | Supported in compat              | `strokeWidth` or `series[].strokeWidth`             |
| `chartConfig.barPercentage` | Supported in compat              | `barWidthRatio`                                     |
| `bezier`                    | Supported with changed internals | `curve="monotone"`                                  |
| `withDots`                  | Supported in compat              | `showDots` or `series[].dot`                        |
| `withInnerLines`            | Supported in compat              | `showHorizontalGridLines` / `showVerticalGridLines` |
| `withOuterLines`            | Compatibility only               | Modern charts avoid hard plot borders by default    |
| `formatXLabel`              | Supported                        | Same prop                                           |
| `formatYLabel`              | Supported                        | Same prop                                           |
| `fromZero`                  | Supported in compat              | `yDomain={{ min: 0, max: "dataMax" }}`              |
| `yAxisLabel`                | Supported in compat              | `formatYLabel`                                      |
| `yAxisSuffix`               | Supported in compat              | `formatYLabel`                                      |
| `verticalLabelRotation`     | Supported in compat              | `labelStrategy="rotate"` plus `labelRotation`       |
| `horizontalLabelRotation`   | Supported in compat              | Prefer auto layout or custom label rendering        |

## Modern Series Mapping

Before:

```tsx
import { LineChart } from "react-native-chart-kit";

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: () => "#2563eb"
};

<LineChart
  data={{
    labels: ["Jan", "Feb"],
    datasets: [
      { data: [10, 14], color: () => "#2563eb", strokeWidth: 3 },
      { data: [8, 12], color: () => "#94a3b8", strokeWidth: 2 }
    ],
    legend: ["Actual", "Target"]
  }}
  width={410}
  height={220}
  chartConfig={chartConfig}
/>;
```

After:

```tsx
<LineChart
  data={[
    { month: "Jan", actual: 10, target: 8 },
    { month: "Feb", actual: 14, target: 12 }
  ]}
  xKey="month"
  series={[
    { yKey: "actual", label: "Actual", color: "#2563eb", strokeWidth: 3 },
    { yKey: "target", label: "Target", color: "#94a3b8", strokeWidth: 2 }
  ]}
  width={410}
  height={240}
/>
```

## Chart Config Mapping

Move reusable styling into `ChartKitProvider` or a custom preset.

```tsx
import { ChartKitProvider, createChartPreset } from "react-native-chart-kit/v2";

const brand = createChartPreset({
  light: {
    background: "#ffffff",
    plotBackground: "#ffffff",
    grid: "#e5edf7",
    text: "#0f172a",
    mutedText: "#64748b",
    series: ["#2563eb", "#0891b2", "#7c3aed"]
  }
});

<ChartKitProvider preset="brand" presets={{ brand }}>
  <Dashboard />
</ChartKitProvider>;
```

## Props Not Promised

Do not depend on:

- private `AbstractChart` internals
- exact SVG child order
- old clipping and padding bugs
- deep imports from implementation files

The legacy root `LineChart` preserves v6 point-slot spacing for existing
overlays. Prefer the `x` and `y` coordinates supplied by `renderDotContent` and
`onDataPointClick` when adding or updating custom point content.

If a legacy chart needs an unsupported behavior, keep it on the compatibility
surface until there is an explicit modern extension point.
