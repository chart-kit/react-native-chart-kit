---
title: Migrating From v1
description: Move existing react-native-chart-kit screens toward the modern v2 API safely.
---

# Migrating From v1

The v2 migration strategy is intentionally partial compatibility. Existing apps should be able to keep common chart names and data shapes while new product work uses the modern object-row API.

## Recommended Path

1. Upgrade the package and peer dependencies.
2. Keep existing `LineChart`, `BarChart`, `StackedBarChart`, `PieChart`, `ProgressChart`, and `ContributionGraph` imports working through the compatibility surface.
3. Run the app and fix any documented compatibility warnings.
4. Review the modern API examples before adopting it in apps.
5. Migrate old charts gradually when you need better layout, selection, scrolling, or theming.

## What Should Keep Working

Common v1 data shapes remain the compatibility target:

```tsx
import { LineChart } from "react-native-chart-kit";

<LineChart
  data={{
    labels: ["Jan", "Feb", "Mar"],
    datasets: [{ data: [18, 34, 29] }],
    legend: ["Revenue"]
  }}
  width={410}
  height={220}
  chartConfig={{
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`
  }}
/>;
```

The compatibility promise covers the common public API, not undocumented internals, exact SVG node order, or layout bugs that made labels clip.

## Modern API

The modern object-row API is available from the same public package through the
`react-native-chart-kit/v2` subpath.

```tsx
import { LineChart } from "react-native-chart-kit/v2";

<LineChart
  data={[
    { month: "Jan", revenue: 52 },
    { month: "Feb", revenue: 86 },
    { month: "Mar", revenue: 58 },
    { month: "Apr", revenue: 134 },
    { month: "May", revenue: 95 },
    { month: "Jun", revenue: 176 }
  ]}
  xKey="month"
  yKey="revenue"
  interaction={{ mode: "tap" }}
  tooltip={{ shared: true }}
  width={410}
  height={240}
/>;
```

## Layout Differences

v2 defaults prioritize correct mobile layout over pixel-perfect legacy spacing:

- Labels reserve space automatically where possible.
- Edge labels shift or hide instead of clipping.
- Tooltips are rendered above chart content and are shifted inside the viewport.
- Scrollable charts use visible data windows instead of requiring manual SVG width hacks.
- `null` values create line gaps by default in modern charts.

Keep migrated charts on the legacy package path when they rely on old spacing during a transition. Do not use legacy spacing patterns for new charts.

## Package Paths

The current repository has one intended public package path:

- `react-native-chart-kit`: legacy-compatible root package for upgrade testing,
  continuity, and modern chart adoption through the `/v2` subpath.

The `@chart-kit/*` names remain internal workspace aliases only.

## Visual Review

Use the public
[`chart-kit/react-native-chart-kit-example`](https://github.com/chart-kit/react-native-chart-kit-example)
Expo app for visual review. It installs React Native Chart Kit from npm, so it
does not require this repository to live in a sibling folder.
