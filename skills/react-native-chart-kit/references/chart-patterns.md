# Chart Patterns

## Free v2 Install

```sh
npm install react-native-chart-kit react-native-svg
```

```tsx
import {
  BarChart,
  ChartKitProvider,
  DonutChart,
  LineChart
} from "react-native-chart-kit/v2";
```

Wrap app charts when shared theme is useful:

```tsx
<ChartKitProvider mode="system" preset="default">
  <Dashboard />
</ChartKitProvider>
```

## Data Shape

Default to object rows:

```ts
type Point = {
  month: string;
  revenue: number;
  target: number;
};

const data: Point[] = [
  { month: "Jan", revenue: 120, target: 110 },
  { month: "Feb", revenue: 132, target: 118 }
];
```

Use legacy arrays only for v1 migration:

```tsx
<LineChart
  data={{
    labels: ["Jan", "Feb"],
    datasets: [{ data: [120, 132] }]
  }}
  chartConfig={chartConfig}
  height={220}
  width={width}
/>
```

## Line And Area

Use for trends, time series, comparisons, and compact dashboard cards.

```tsx
<LineChart
  data={data}
  height={240}
  width={width}
  xKey="month"
  series={[
    { yKey: "revenue", label: "Revenue" },
    { yKey: "target", label: "Target", strokeDasharray: [4, 4] }
  ]}
  curve="monotone"
  tooltip="shared"
  yDomain={{ min: 0, max: "dataMax", nice: true }}
/>
```

Dense data defaults:

```tsx
<LineChart
  data={points}
  height={260}
  width={width}
  xKey="index"
  yKey="value"
  curve="monotone"
  decimation="auto"
  labelStrategy="hide"
  showDots={false}
  yAxisLabelWidth="stable"
/>
```

Scrollable/zoomable defaults:

```tsx
<LineChart
  data={points}
  height={260}
  width={width}
  xKey="time"
  yKey="price"
  showDots={false}
  viewport={{ startIndex: points.length - 40, endIndex: points.length - 1 }}
  viewportInteraction={{ pan: true, pinchZoom: true }}
  tooltip={{ width: 136 }}
/>
```

## Bar

Use for category comparisons, selectable columns, stacked values, and negative values.

```tsx
<BarChart
  data={data}
  height={240}
  width={width}
  xKey="month"
  yKeys={["ios", "android"]}
  mode="grouped"
  interaction="tap"
  tooltip={{ width: 132 }}
/>
```

Mobile defaults:

- Use `labelStrategy="auto"` for crowded x labels.
- Use horizontal bars for long category labels.
- Use `viewport` for more than 12-16 bars.
- Keep value labels off until there is space.

## Pie And Donut

Prefer donut for dashboards because the center label can carry total/value context.

```tsx
<DonutChart
  data={segments}
  height={240}
  width={width}
  valueKey="value"
  labelKey="channel"
  centerLabel={({ total }) => `$${Math.round(total)}k`}
  legend={{ position: "bottom", wrap: true }}
  interaction="tap"
/>
```

Rules:

- Use bottom wrapped legends for mobile.
- Handle zero values explicitly.
- Keep labels outside only when there is enough radius.

## Progress

```tsx
<ProgressChart
  data={[
    { label: "Move", value: 0.72 },
    { label: "Exercise", value: 0.58 }
  ]}
  height={220}
  width={width}
/>
```

Rules:

- Values should be `0..1`.
- Clamp or warn for out-of-range data.
- Provide a text summary outside the chart for accessibility.

## Contribution

```tsx
<ContributionGraph
  values={days}
  endDate={new Date()}
  height={180}
  width={width}
  numDays={91}
  onDayPress={(event) => console.log(event.value)}
/>
```

Rules:

- Test date-to-cell mapping.
- Be explicit about UTC/date parsing.
- Use deterministic color thresholds.

## Theme

Use provider presets for app-wide style. Use chart props for one-off series colors.

```tsx
<ChartKitProvider
  mode="dark"
  theme={{
    background: "transparent",
    plotBackground: "transparent",
    series: ["#4f7cff", "#27c499", "#ffb020"]
  }}
>
  <LineChart {...props} />
</ChartKitProvider>
```

## Accessibility

For serious examples, export or use helpers:

```tsx
import { getLineChartAccessibilitySummary } from "react-native-chart-kit/v2";

const label = getLineChartAccessibilitySummary({
  data,
  xKey: "month",
  yKey: "revenue"
});
```

Also add:

- `accessibilityLabel` for the chart or surrounding card.
- visible text summary near dense charts.
- `testID` for visual/E2E coverage.

## Migration

When moving v1 code:

1. Keep the old component name first.
2. Keep common `data`, `width`, `height`, `chartConfig`, formatter, and display props.
3. Move new feature work to object rows and v2 props.
4. Do not promise exact SVG node order or old spacing bugs.
