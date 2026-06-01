---
title: Pie Chart
description: Render segmented pie charts with accessible legends and labels.
---

# Pie Chart

`PieChart` renders a normalized slice model from object-row data and
renderer-agnostic arc geometry.

## Basic Pie

```tsx
import { PieChart } from "react-native-chart-kit/v2";

const data = [
  { channel: "Organic search", share: 42 },
  { channel: "Paid social", share: 24 },
  { channel: "Referrals", share: 18 },
  { channel: "Partners", share: 10 },
  { channel: "Lifecycle", share: 6 }
];

export function AcquisitionShare() {
  return (
    <PieChart
      data={data}
      valueKey="share"
      labelKey="channel"
      width={360}
      height={260}
      preset="spectrum"
    />
  );
}
```

::chart-preview{id="pie-basic"}

## Current Scope

The first v2 pie chart supports:

- modern object-row data
- theme and preset colors
- bottom wrapped legend
- percentage labels in the legend
- custom legend item rendering
- external arc labels with connector lines
- tap selection with active-slice highlighting
- zero and invalid slices without broken paths

## Tap Selection

Use `interaction="tap"` for uncontrolled selection, or pass `selectedIndex` with
`interaction.onSelect` for controlled product UI.

```tsx
const acquisitionShare = [
  { channel: "Organic search", share: 42 },
  { channel: "Paid social", share: 24 },
  { channel: "Referrals", share: 18 },
  { channel: "Partners", share: 10 },
  { channel: "Lifecycle", share: 6 }
];

const [selectedIndex, setSelectedIndex] = useState(0);

<PieChart
  data={acquisitionShare}
  valueKey="share"
  labelKey="channel"
  selectedIndex={selectedIndex}
  interaction={{
    mode: "tap",
    onSelect: (event) => setSelectedIndex(event.index)
  }}
  activeSlice={{ inactiveOpacity: 0.36, strokeWidth: 4 }}
  width={360}
  height={260}
/>;
```

## External Arc Labels

Use `arcLabels` when the chart should explain itself without a separate legend.
Small slices are filtered by `minPercentage` so long-tail labels do not collide
with the primary categories.

```tsx
const acquisitionShare = [
  { channel: "Organic search", share: 42 },
  { channel: "Paid social", share: 24 },
  { channel: "Referrals", share: 18 },
  { channel: "Partners", share: 10 },
  { channel: "Lifecycle", share: 6 }
];

<PieChart
  data={acquisitionShare}
  valueKey="share"
  labelKey="channel"
  legend={false}
  arcLabels={{
    minPercentage: 0.09,
    formatLabel: ({ label, percentageLabel }) =>
      `${label.split(" ")[0]} ${percentageLabel}`
  }}
  width={360}
  height={260}
/>;
```

## Props

### PieChart

| Prop                   | Type                                                      | Description                                                                  |
| ---------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `data`                 | `TData[]`                                                 | Object-row source data for the chart.                                        |
| `valueKey`             | `keyof TData`                                             | Row key used for slice values.                                               |
| `labelKey`             | `keyof TData`                                             | Row key used for slice and legend labels.                                    |
| `colorKey`             | `keyof TData`                                             | Row key used for per-slice colors.                                           |
| `colors`               | `string[]`                                                | Fallback color palette used when `colorKey` is not provided.                 |
| `width`                | `number`                                                  | Outer chart width in pixels.                                                 |
| `height`               | `number`                                                  | Outer chart height in pixels.                                                |
| `theme`                | `"light"`, `"dark"`, `"system"`, or `CartesianChartTheme` | Theme mode or inline theme tokens for this chart.                            |
| `preset`               | `CartesianChartPresetValue`                               | Built-in or registered preset name used to seed chart colors and typography. |
| `innerRadius`          | `number`                                                  | Explicit inner radius in pixels for donut-style rendering.                   |
| `innerRadiusRatio`     | `number`                                                  | Inner radius as a fraction of the computed outer radius.                     |
| `legend`               | `boolean` or `PieChartLegendConfig<TData>`                | Shows and configures the wrapped legend.                                     |
| `arcLabels`            | `boolean` or `PieChartArcLabelsConfig<TData>`             | Shows and configures external arc labels and connector lines.                |
| `selectedIndex`        | `number`                                                  | Controlled selected slice index.                                             |
| `defaultSelectedIndex` | `number`                                                  | Initial uncontrolled selected slice index.                                   |
| `activeSlice`          | `PieChartActiveSliceConfig`                               | Configures selected-slice stroke, opacity, offset, and scale.                |
| `selectionAnimation`   | `boolean` or `PieChartSelectionAnimationConfig`           | Enables and configures selected-slice animation.                             |
| `interaction`          | `PieChartInteraction<TData>`                              | Tap selection mode and callbacks.                                            |
| `centerLabel`          | `string`, `ReactNode`, or `(props) => ReactNode`          | Content rendered in the chart center.                                        |
| `renderer`             | `PieChartRenderer`                                        | Renderer implementation used for SVG-compatible primitives.                  |
| `accessibilityLabel`   | `string`                                                  | Overrides the generated accessible chart summary.                            |
| `id`                   | `string`                                                  | Stable chart id used for coordinated selection scope.                        |
| `testID`               | `string`                                                  | Test identifier applied to the chart surface.                                |
| `formatValue`          | `(value) => string`                                       | Formats raw slice values in labels and accessible output.                    |
| `formatPercentage`     | `(percentage) => string`                                  | Formats percentage labels in legends, arc labels, and accessible output.     |
