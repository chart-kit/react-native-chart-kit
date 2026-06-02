---
title: Donut Chart
description: Render donut charts with center labels, legends, and tap selection.
---

# Donut Chart

`DonutChart` shows proportional slices around a center label. Use it for compact
mixes, totals, or status summaries where the middle of the chart can carry a key
number or selected category.

## Basic Donut

```tsx
import { DonutChart } from "react-native-chart-kit/v2";

const revenueMix = [
  { plan: "Enterprise", revenue: 680 },
  { plan: "Business", revenue: 420 },
  { plan: "Teams", revenue: 260 },
  { plan: "Starter", revenue: 140 }
];

<DonutChart
  centerLabel="$1.5M"
  data={revenueMix}
  valueKey="revenue"
  labelKey="plan"
  width={410}
  height={260}
/>;
```

::chart-preview{id="donut-basic"}

## Capabilities

`DonutChart` supports:

- object-row data
- theme and preset colors
- bottom wrapped legend
- percentage labels in the legend
- donut center text
- rich custom center labels
- custom legend item rendering
- slice separators
- tap selection with active-slice highlighting
- zero and invalid slices without broken paths

## Tap Selection

Use `interaction="tap"` for uncontrolled selection, or pass `selectedIndex` with
`interaction.onSelect` for controlled product UI.

```tsx
const revenueMix = [
  { plan: "Enterprise", revenue: 680 },
  { plan: "Business", revenue: 420 },
  { plan: "Teams", revenue: 260 },
  { plan: "Starter", revenue: 140 }
];

const [selectedIndex, setSelectedIndex] = useState(0);

<DonutChart
  data={revenueMix}
  valueKey="revenue"
  labelKey="plan"
  selectedIndex={selectedIndex}
  interaction={{
    mode: "tap",
    onSelect: (event) => setSelectedIndex(event.index)
  }}
  centerLabel={revenueMix[selectedIndex]?.plan}
  activeSlice={{ inactiveOpacity: 0.36, strokeWidth: 4 }}
  width={410}
  height={260}
/>;
```

## Custom Legend and Center Label

Use `legend.renderItem` when the default compact legend is not enough.
`centerLabel` can return React content for multi-line KPI labels.

```tsx
const retentionSegments = [
  { status: "Expanded annual contracts", accounts: 48 },
  { status: "Renewed monthly workspaces", accounts: 32 },
  { status: "At-risk accounts under review", accounts: 14 },
  { status: "Paused or dormant teams", accounts: 6 },
  { status: "Zero usage migrations", accounts: 0 }
];

<DonutChart
  data={retentionSegments}
  valueKey="accounts"
  labelKey="status"
  centerLabel={({ theme, total }) => (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: theme.text, fontSize: 18, fontWeight: "800" }}>
        {total}
      </Text>
      <Text style={{ color: theme.mutedText, fontSize: 11, fontWeight: "700" }}>
        accounts
      </Text>
    </View>
  )}
  sliceSeparator={{ width: 2 }}
  legend={{
    itemGap: 8,
    maxItemWidth: "100%",
    reservedHeight: 104,
    renderItem: ({ item, theme }) => (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          width: 260
        }}
      >
        <View
          style={{
            backgroundColor: item.color,
            borderRadius: 4,
            height: 8,
            width: 8
          }}
        />
        <Text
          numberOfLines={1}
          style={{
            color: theme.text,
            flex: 1,
            fontSize: 12,
            fontWeight: "700"
          }}
        >
          {item.label}
        </Text>
        <Text
          style={{
            color: theme.mutedText,
            fontSize: 11,
            fontWeight: "700"
          }}
        >
          {item.percentageLabel}
        </Text>
      </View>
    )
  }}
  width={410}
  height={320}
/>;
```

## Props

### DonutChart

`DonutChart` accepts the same props as `PieChart` and defaults
`innerRadiusRatio` to `0.58`.

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
| `innerRadius`          | `number`                                                  | Explicit inner radius in pixels.                                             |
| `innerRadiusRatio`     | `number`                                                  | Inner radius as a fraction of the computed outer radius.                     |
| `legend`               | `boolean` or `PieChartLegendConfig<TData>`                | Shows and configures the wrapped legend.                                     |
| `arcLabels`            | `boolean` or `PieChartArcLabelsConfig<TData>`             | Shows and configures external arc labels and connector lines.                |
| `sliceSeparator`       | `boolean` or `PieChartSliceSeparatorConfig`               | Draws separator strokes between slices.                                      |
| `selectedIndex`        | `number`                                                  | Controlled selected slice index.                                             |
| `defaultSelectedIndex` | `number`                                                  | Initial uncontrolled selected slice index.                                   |
| `activeSlice`          | `PieChartActiveSliceConfig`                               | Configures selected-slice stroke, opacity, offset, and scale.                |
| `selectionAnimation`   | `boolean` or `PieChartSelectionAnimationConfig`           | Enables and configures selected-slice animation.                             |
| `interaction`          | `PieChartInteraction<TData>`                              | Tap selection mode and callbacks.                                            |
| `centerLabel`          | `string`, `ReactNode`, or `(props) => ReactNode`          | Content rendered in the donut center.                                        |
| `renderer`             | `PieChartRenderer`                                        | Renderer implementation used for SVG-compatible primitives.                  |
| `accessibilityLabel`   | `string`                                                  | Overrides the generated accessible chart summary.                            |
| `id`                   | `string`                                                  | Stable chart id used for coordinated selection scope.                        |
| `testID`               | `string`                                                  | Test identifier applied to the chart container.                              |
| `formatValue`          | `(value) => string`                                       | Formats raw slice values in labels and accessible output.                    |
| `formatPercentage`     | `(percentage) => string`                                  | Formats percentage labels in legends, arc labels, and accessible output.     |
