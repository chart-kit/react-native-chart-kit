---
title: Bar Charts
description: Compare category totals, rankings, and composition with bar charts.
---

# Bar Charts

`BarChart` compares values across categories or time buckets. Use it for
rankings, monthly totals, grouped series, stacked composition, negative values,
and horizontal layouts when category labels need more room.

## Basic Bars

```tsx
import { BarChart } from "react-native-chart-kit/v2";

const data = [
  { month: "Jan", signups: 180 },
  { month: "Feb", signups: 520 },
  { month: "Mar", signups: 260 },
  { month: "Apr", signups: 740 },
  { month: "May", signups: 390 },
  { month: "Jun", signups: 860 }
];

export function SignupsChart() {
  return (
    <BarChart
      data={data}
      xKey="month"
      yKey="signups"
      width={410}
      height={240}
    />
  );
}
```

::chart-preview{id="bar-basic"}

## Grouped Bars

Use `series` for multiple bars per x value. The chart shows a bottom legend by default when there is more than one series.

```tsx
const data = [
  { month: "Jan", organic: 28, paid: 62 },
  { month: "Feb", organic: 74, paid: 34 },
  { month: "Mar", organic: 39, paid: 88 },
  { month: "Apr", organic: 96, paid: 41 },
  { month: "May", organic: 54, paid: 103 },
  { month: "Jun", organic: 118, paid: 58 }
];

<BarChart
  data={data}
  xKey="month"
  series={[
    { yKey: "organic", label: "Organic" },
    { yKey: "paid", label: "Paid" }
  ]}
  showValuesOnTopOfBars
  width={410}
  height={260}
/>;
```

::chart-preview{id="bar-grouped"}

Useful grouped-bar props:

- `barWidthRatio`: controls how much of each x band is filled by bars.
- `barGapRatio`: controls spacing between bars inside a group.
- `barRadius`: controls corner radius.
- `legend={false}`: hides the default legend.

## Negative Values

Negative values render below the zero baseline. Keep `yDomain` on its default include-zero behavior unless you intentionally want a cropped baseline.

```tsx
const profit = [
  { month: "Jan", profit: 38 },
  { month: "Feb", profit: -28 },
  { month: "Mar", profit: 64 },
  { month: "Apr", profit: -42 },
  { month: "May", profit: 81 },
  { month: "Jun", profit: -18 }
];

<BarChart
  data={profit}
  xKey="month"
  yKey="profit"
  showValuesOnTopOfBars
  formatYLabel={(value) => (value < 0 ? `-$${Math.abs(value)}k` : `$${value}k`)}
  width={410}
  height={250}
/>;
```

::chart-preview{id="bar-negative"}

## Horizontal Bars

Set `orientation="horizontal"` when category labels are easier to scan down the left axis.

```tsx
const supportVolume = [
  { channel: "Chat", tickets: 95 },
  { channel: "Email", tickets: 37 },
  { channel: "Phone", tickets: 68 },
  { channel: "Social", tickets: 24 },
  { channel: "Community", tickets: 113 }
];

<BarChart
  data={supportVolume}
  xKey="channel"
  yKey="tickets"
  orientation="horizontal"
  showValuesOnTopOfBars
  width={410}
  height={260}
/>;
```

::chart-preview{id="bar-horizontal"}

Horizontal bars support grouped, stacked, 100% stacked, and negative values through the same `mode`, `series`, and `yDomain` props as vertical bars.

## Stacked Bars

Set `mode="stacked"` to stack series by row. Positive and negative stacks are tracked separately from the zero baseline.

```tsx
const data = [
  { month: "Jan", newCustomers: 180, expansion: 60 },
  { month: "Feb", newCustomers: 520, expansion: 210 },
  { month: "Mar", newCustomers: 260, expansion: 120 },
  { month: "Apr", newCustomers: 740, expansion: 330 },
  { month: "May", newCustomers: 390, expansion: 170 },
  { month: "Jun", newCustomers: 860, expansion: 410 }
];

<BarChart
  data={data}
  xKey="month"
  mode="stacked"
  series={[
    { yKey: "newCustomers", label: "New" },
    { yKey: "expansion", label: "Expansion" }
  ]}
  width={410}
  height={260}
/>;
```

## 100% Stacked Bars

Set `mode="stacked100"` for percentage composition. The original values are preserved in the bar model while rendered heights are normalized to row totals.

```tsx
const platformShare = [
  { month: "Jan", ios: 62, android: 25, web: 13 },
  { month: "Feb", ios: 38, android: 47, web: 15 },
  { month: "Mar", ios: 55, android: 21, web: 24 },
  { month: "Apr", ios: 29, android: 58, web: 13 },
  { month: "May", ios: 68, android: 19, web: 13 },
  { month: "Jun", ios: 44, android: 31, web: 25 }
];

<BarChart
  data={platformShare}
  xKey="month"
  mode="stacked100"
  series={[
    { yKey: "ios", label: "iOS" },
    { yKey: "android", label: "Android" },
    { yKey: "web", label: "Web" }
  ]}
  formatYLabel={(value) => `${value}%`}
  width={410}
  height={250}
/>;
```

::chart-preview{id="bar-stacked"}

## Tap Selection And Tooltips

Bar selection is opt-in. Use `interaction="tap"` for the simplest behavior, or pass an object when you need callbacks or outside-press dismissal.

```tsx
const data = [
  { month: "Jan", organic: 28, paid: 62 },
  { month: "Feb", organic: 74, paid: 34 },
  { month: "Mar", organic: 39, paid: 88 },
  { month: "Apr", organic: 96, paid: 41 },
  { month: "May", organic: 54, paid: 103 },
  { month: "Jun", organic: 118, paid: 58 }
];

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
  tooltip={{
    anchor: "pointer",
    placement: "above",
    width: 132
  }}
  defaultSelectedBar={{ dataIndex: 3, seriesKey: "paid" }}
  width={410}
  height={260}
/>;
```

The public select event includes `dataIndex`, `seriesKey`, `seriesLabel`, `value`, `formattedValue`, `x`, `xLabel`, `color`, `position`, and the original `raw` row.

Tooltip positioning uses `anchor: "bar"` and `placement: "auto"` by default. Use `anchor: "pointer"` with `placement: "above"` when the tooltip should follow the tap position and stay above the finger. Styling follows the chart theme tooltip tokens by default and can be overridden per chart with `backgroundColor`, `borderColor`, `textColor`, `labelColor`, `padding`, `borderRadius`, `fontFamily`, `fontSize`, `labelFontSize`, and shadow props.

## Scrollable Bars

Use `scrollable`, `visiblePoints`, and `initialIndex` for long categorical bar charts. For bars, `visiblePoints` maps to visible bar bands.

```tsx
const weeklySpend = [
  { week: "W1", spend: 18 },
  { week: "W2", spend: 52 },
  { week: "W3", spend: 26 },
  { week: "W4", spend: 74 },
  { week: "W5", spend: 31 },
  { week: "W6", spend: 88 },
  { week: "W7", spend: 43 },
  { week: "W8", spend: 96 },
  { week: "W9", spend: 39 },
  { week: "W10", spend: 108 },
  { week: "W11", spend: 57 },
  { week: "W12", spend: 121 },
  { week: "W13", spend: 44 },
  { week: "W14", spend: 132 },
  { week: "W15", spend: 63 },
  { week: "W16", spend: 118 },
  { week: "W17", spend: 71 },
  { week: "W18", spend: 146 }
];

<BarChart
  data={weeklySpend}
  xKey="week"
  yKey="spend"
  scrollable
  visiblePoints={8}
  initialIndex="end"
  formatYLabel={(value) => `$${value}k`}
  width={410}
  height={250}
/>;
```

The y-axis labels stay pinned while the bars and x-axis labels scroll horizontally.

## Custom Bar Rendering

Use `renderBar` when bars need product-specific styling while keeping the built-in layout, selection, hit testing, labels, sticky axes, and tooltips.

```tsx
import { Rect } from "react-native-svg";

const weeklySpend = [
  { week: "W1", spend: 18 },
  { week: "W2", spend: 52 },
  { week: "W3", spend: 26 },
  { week: "W4", spend: 74 },
  { week: "W5", spend: 31 },
  { week: "W6", spend: 88 },
  { week: "W7", spend: 43 },
  { week: "W8", spend: 96 }
];

<BarChart
  data={weeklySpend}
  xKey="week"
  yKey="spend"
  width={410}
  height={250}
  renderBar={({ bar, fill, radius }) => (
    <Rect
      x={bar.x}
      y={bar.y}
      width={bar.width}
      height={bar.height}
      rx={radius}
      fill={fill}
    />
  )}
/>;
```

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

## Props

### BarChart

| Prop                      | Type                                            | Description                                                                   |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `data`                    | `TData[]`                                       | Object-row source data for the chart.                                         |
| `xKey`                    | `keyof TData`                                   | Row key used for category, date, or numeric x values.                         |
| `yKey`                    | `keyof TData`                                   | Single row key used for bar values when `series` or `yKeys` is not provided.  |
| `yKeys`                   | `Array<keyof TData>`                            | Multiple row keys rendered as grouped or stacked series with default styling. |
| `series`                  | `BarChartSeries<TData>[]`                       | Full per-series configuration, including y key, label, key, and color.        |
| `width`                   | `number`                                        | Outer chart width in pixels.                                                  |
| `height`                  | `number`                                        | Outer chart height in pixels.                                                 |
| `theme`                   | `ChartKitThemeMode` or `CartesianChartTheme`    | Theme mode or inline theme tokens for this chart.                             |
| `preset`                  | `CartesianChartPresetValue`                     | Built-in or registered preset name used to seed chart colors and typography.  |
| `scrollable`              | `boolean`                                       | Enables a horizontal scroll viewport for long bar sets.                       |
| `visiblePoints`           | `number`                                        | Number of x values visible in the viewport when `scrollable` is enabled.      |
| `initialIndex`            | `ChartViewportInitialIndex`                     | Initial scroll position, such as `"start"` or `"end"`.                        |
| `orientation`             | `BarChartOrientation`                           | Renders vertical or horizontal bars.                                          |
| `mode`                    | `BarChartMode`                                  | Chooses grouped, stacked, or 100% stacked layout.                             |
| `yDomain`                 | `NumericDomainInput`                            | Overrides or constrains the computed value-axis domain.                       |
| `barRadius`               | `number`                                        | Corner radius applied to rendered bars.                                       |
| `barWidthRatio`           | `number`                                        | Portion of each category slot occupied by bars.                               |
| `barGapRatio`             | `number`                                        | Relative gap between grouped bars.                                            |
| `showValuesOnTopOfBars`   | `boolean`                                       | Shows formatted value labels at bar ends.                                     |
| `showHorizontalGridLines` | `boolean`                                       | Shows or hides horizontal grid lines.                                         |
| `showXAxisLabels`         | `boolean`                                       | Shows or hides x-axis labels.                                                 |
| `showYAxisLabels`         | `boolean`                                       | Shows or hides y-axis labels.                                                 |
| `yTickCount`              | `number`                                        | Number of ticks used for value-axis labels and grid lines.                    |
| `legend`                  | `boolean`                                       | Shows or hides the bottom legend.                                             |
| `interaction`             | `BarChartInteraction<TData>`                    | Tap selection mode and callbacks.                                             |
| `selectedBar`             | `BarChartSelectedBar`                           | Controlled selected bar by data index and series key.                         |
| `defaultSelectedBar`      | `BarChartSelectedBar`                           | Initial uncontrolled selected bar.                                            |
| `selectionAnimation`      | `boolean` or `BarChartSelectionAnimationConfig` | Enables and configures selected-bar animation.                                |
| `tooltip`                 | `boolean` or `BarChartTooltipConfig`            | Shows and configures selected-bar tooltip content and placement.              |
| `renderBar`               | `(props) => ReactNode`                          | Custom renderer for each bar while preserving layout and hit testing.         |
| `renderer`                | `BarChartRenderer`                              | Renderer implementation used for SVG-compatible primitives.                   |
| `labelStrategy`           | `BarChartLabelStrategy`                         | Controls x-axis label visibility.                                             |
| `formatXLabel`            | `(value, index) => string`                      | Formats x-axis labels and selected x labels.                                  |
| `formatYLabel`            | `(value) => string`                             | Formats y-axis labels, value labels, and tooltip values.                      |
| `id`                      | `string`                                        | Stable chart id used for coordinated selection scope.                         |
| `accessibilityLabel`      | `string`                                        | Overrides the generated accessible chart summary.                             |
| `testID`                  | `string`                                        | Test identifier applied to the chart container.                               |
