# Bar Charts

`BarChart` is the modern v2 bar surface for object-row data. It supports vertical grouped bars, stacked bars, 100% stacked bars, negative values, automatic axis padding, theme presets, value labels, tap selection, tooltips, and a simple bottom legend.

Use this API for new apps. Legacy `BarChart` compatibility fixtures remain separate from the modern v2 API.

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

## Labels and Themes

Useful label and theme props:

- `labelStrategy`: `auto`, `show`, or `hide`.
- `formatXLabel`: formats x-axis labels.
- `formatYLabel`: formats y-axis and value labels.
- `showHorizontalGridLines`: enabled by default.
- `preset`: uses the same cartesian presets as LineChart.
- `theme`: overrides chart colors, plot background, text, typography, and series colors.

## Current Limitations

This is still an early modern BarChart slice. The current implementation does not yet include horizontal bars, scrollable bars, sticky axes, custom bar renderers, or legacy BarChart prop mapping. Those belong to later CKV2-007 slices.
