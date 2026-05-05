# Bar Charts

`BarChart` is the modern v2 bar surface for object-row data. It supports vertical and horizontal bars, grouped bars, stacked bars, 100% stacked bars, negative values, horizontal scrolling, automatic axis padding, theme presets, value labels, tap selection, tooltips, and a simple bottom legend.

Use this API for new apps. The v2 package also exports a `StackedBarChart` compatibility facade for legacy stacked-bar data during migration.

## Basic Bars

```tsx
import { BarChart } from "@chart-kit/react-native-v2";

const data = [
  { month: "Jan", signups: 42 },
  { month: "Feb", signups: 48 },
  { month: "Mar", signups: 54 }
];

export function SignupsChart() {
  return (
    <BarChart
      data={data}
      xKey="month"
      yKey="signups"
      width={360}
      height={240}
    />
  );
}
```

## Grouped Bars

Use `series` for multiple bars per x value. The chart shows a bottom legend by default when there is more than one series.

```tsx
<BarChart
  data={data}
  xKey="month"
  series={[
    { yKey: "organic", label: "Organic" },
    { yKey: "paid", label: "Paid" }
  ]}
  preset="analytics"
  showValuesOnTopOfBars
  width={360}
  height={260}
/>
```

Useful grouped-bar props:

- `barWidthRatio`: controls how much of each x band is filled by bars.
- `barGapRatio`: controls spacing between bars inside a group.
- `barRadius`: controls corner radius.
- `legend={false}`: hides the default legend.

## Negative Values

Negative values render below the zero baseline. Keep `yDomain` on its default include-zero behavior unless you intentionally want a cropped baseline.

```tsx
<BarChart
  data={profit}
  xKey="month"
  yKey="profit"
  preset="fintech"
  showValuesOnTopOfBars
  formatYLabel={(value) => (value < 0 ? `-$${Math.abs(value)}k` : `$${value}k`)}
  width={360}
  height={250}
/>
```

## Horizontal Bars

Set `orientation="horizontal"` when category labels are easier to scan down the left axis.

```tsx
<BarChart
  data={supportVolume}
  xKey="channel"
  yKey="tickets"
  orientation="horizontal"
  showValuesOnTopOfBars
  width={360}
  height={260}
/>
```

Horizontal bars support grouped, stacked, 100% stacked, and negative values through the same `mode`, `series`, and `yDomain` props as vertical bars.

## Stacked Bars

Set `mode="stacked"` to stack series by row. Positive and negative stacks are tracked separately from the zero baseline.

```tsx
<BarChart
  data={data}
  xKey="month"
  mode="stacked"
  series={[
    { yKey: "newCustomers", label: "New" },
    { yKey: "expansion", label: "Expansion" }
  ]}
  width={360}
  height={260}
/>
```

## 100% Stacked Bars

Set `mode="stacked100"` for percentage composition. The original values are preserved in the bar model while rendered heights are normalized to row totals.

```tsx
<BarChart
  data={platformShare}
  xKey="month"
  mode="stacked100"
  series={[
    { yKey: "ios", label: "iOS" },
    { yKey: "android", label: "Android" }
  ]}
  formatYLabel={(value) => `${value}%`}
  width={360}
  height={250}
/>
```

## Legacy StackedBarChart Facade

Existing `StackedBarChart` data can render through the modern stacked-bar engine without changing the old data shape.

```tsx
import { StackedBarChart } from "@chart-kit/react-native-v2";

<StackedBarChart
  data={{
    labels: ["Free", "Starter", "Team"],
    legend: ["Active", "Trial", "Paused"],
    data: [
      [44, 18, 8],
      [38, 24, 11],
      [52, 28, 14]
    ],
    barColors: ["#2563eb", "#0891b2", "#7c3aed"]
  }}
  width={360}
  height={250}
  chartConfig={{
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0
  }}
  segments={4}
  yAxisSuffix="k"
/>;
```

The facade maps `labels`, `legend`, `data`, `barColors`, `hideLegend`, `percentile`, `segments`, `barPercentage`, `chartConfig.barPercentage`, `chartConfig.barRadius`, `decimalPlaces`, `formatYLabel`, `withVerticalLabels`, `withHorizontalLabels`, `withInnerLines`, `yAxisLabel`, and `yAxisSuffix`.

## Tap Selection And Tooltips

Bar selection is opt-in. Use `interaction="tap"` for the simplest behavior, or pass an object when you need callbacks or outside-press dismissal.

```tsx
<BarChart
  data={data}
  xKey="month"
  series={[
    { yKey: "organic", label: "Organic" },
    { yKey: "paid", label: "Paid" }
  ]}
  interaction={{
    mode: "tap",
    deselectOnOutsidePress: true,
    onSelect: (event) => {
      setSelectedChannel(event.seriesLabel);
    }
  }}
  tooltip={{ width: 132 }}
  defaultSelectedBar={{ dataIndex: 3, seriesKey: "paid" }}
  width={360}
  height={260}
/>
```

The public select event includes `dataIndex`, `seriesKey`, `seriesLabel`, `value`, `formattedValue`, `x`, `xLabel`, `color`, `position`, and the original `raw` row.

Tooltip styling follows the chart theme tooltip tokens by default and can be overridden per chart with `backgroundColor`, `borderColor`, `textColor`, `labelColor`, `padding`, `borderRadius`, `fontFamily`, `fontSize`, `labelFontSize`, and shadow props.

## Scrollable Bars

Use `scrollable`, `visiblePoints`, and `initialIndex` for long categorical bar charts. For bars, `visiblePoints` maps to visible bar bands.

```tsx
<BarChart
  data={weeklySpend}
  xKey="week"
  yKey="spend"
  scrollable
  visiblePoints={8}
  initialIndex="end"
  formatYLabel={(value) => `$${value}k`}
  width={360}
  height={250}
/>
```

The y-axis labels stay pinned while the bars and x-axis labels scroll horizontally.

## Labels and Themes

Useful label and theme props:

- `labelStrategy`: `auto`, `show`, or `hide`.
- `formatXLabel`: formats x-axis labels.
- `formatYLabel`: formats y-axis and value labels.
- `showHorizontalGridLines`: enabled by default.
- `showXAxisLabels` / `showYAxisLabels`: hide axis label groups without removing grid geometry.
- `yTickCount`: controls y-axis tick density.
- `preset`: uses the same cartesian presets as LineChart.
- `theme`: overrides chart colors, plot background, text, typography, and series colors.

## Current Limitations

This is still an early modern BarChart slice. The current implementation does not yet include custom bar renderers or full legacy `BarChart` prop mapping. Those belong to later CKV2-007 slices.
