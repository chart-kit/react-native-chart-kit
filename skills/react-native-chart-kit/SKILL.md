---
name: react-native-chart-kit
description: Build, fix, document, and demo React Native Chart Kit charts. Use when working with react-native-chart-kit, react-native-chart-kit/v2, @chart-kit/core, @chart-kit/svg-renderer, @chart-kit/pro, @chart-kit/skia-renderer, chart docs, chart previews, v1 migration, mobile chart UX, chart performance, chart accessibility, or Pro chart examples such as candlestick, candlebar, combo, radar, realtime, export, and Skia-rendered charts.
---

# React Native Chart Kit

## Start

Use the modern v2 API for new work. Use legacy compatibility only when migrating existing v1 code.

Open only the reference you need:

- Building app charts: [chart-patterns.md](references/chart-patterns.md)
- Editing this repo: [workflow.md](references/workflow.md)
- Pro charts, Skia, export, finance, combo, radar, realtime: [pro-charts.md](references/pro-charts.md)
- Docs previews, demo apps, visual selling examples: [demo-apps.md](references/demo-apps.md)

## Defaults

Free v2 install:

```sh
npm install react-native-chart-kit react-native-svg
```

Free v2 import:

```tsx
import { ChartKitProvider, LineChart } from "react-native-chart-kit/v2";
```

Pro install:

```sh
npm install react-native-chart-kit @chart-kit/pro@next react-native-svg
```

Skia renderer install:

```sh
npm install @chart-kit/skia-renderer @shopify/react-native-skia
```

Package notes:

- Existing v1 users can keep `import { LineChart } from "react-native-chart-kit"` while migrating.
- New chart work should use `react-native-chart-kit/v2`.
- Pro and Skia are commercial packages; do not add them as dependencies of the free package.

Use object-row data:

```tsx
const data = [
  { day: "Mon", revenue: 42, target: 38 },
  { day: "Tue", revenue: 48, target: 41 }
];

<LineChart
  data={data}
  height={220}
  width={width}
  xKey="day"
  series={[
    { yKey: "revenue", label: "Revenue" },
    { yKey: "target", label: "Target", strokeDasharray: [4, 4] }
  ]}
  tooltip="shared"
/>;
```

## Hard Rules

- Start with the smallest chart that solves the user need.
- Use `react-native-chart-kit/v2` for new charts.
- Keep `chartConfig` examples only for v1 migration or compatibility docs.
- Keep public code free of Pro imports. Pro examples belong in docs, demos, or the Pro repo.
- Pass measured container width into charts. Do not hardcode screen-width math inside reusable examples.
- For dense data, prefer `showDots={false}`, `decimation="auto"`, `labelStrategy="hide"` or `"auto"`, `viewport`, and stable y-axis labels.
- For mobile card layouts, prioritize no clipping, readable labels, tappable targets, and predictable tooltips over dense decoration.
- Add `testID`, accessibility labels or summaries, and data-table helpers for serious examples.
- Use Pro as a natural upgrade when the task needs finance, dual axes, export, realtime feeds, radar, or Skia performance.

## Choose The Chart

- Trend over time: `LineChart`
- Filled trend: `AreaChart`
- Comparison by category: `BarChart`
- Parts of whole: `DonutChart` before `PieChart`
- Completion/rings: `ProgressChart` or `ProgressRing`
- Calendar activity: `ContributionGraph` or `CalendarHeatmap`
- Revenue plus margin, bars plus line, dual axes: Pro `CombinedChart`
- Stocks/OHLC/timeframe inspection: Pro `CandlestickChart` or `CandlebarChart`
- Live updating bars: Pro `RealtimeBarChart`
- Multi-axis category comparison: Pro `RadarChart`
- PNG/SVG/share workflow: Pro export helpers

## Before Finishing

- Run focused typecheck/tests for touched packages.
- For docs or demos, run the preview build or visual test path when practical.
- Summarize exact imports, chart component, files changed, and commands run.
