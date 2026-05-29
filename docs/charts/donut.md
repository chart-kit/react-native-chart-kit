---
title: Donut Chart
description: Render donut charts with center labels, legends, and tap selection.
---

# Donut Chart

`DonutChart` uses the same normalized slice model as `PieChart`, with a default
inner radius and center-label support.

## Basic Donut

```tsx
import { DonutChart } from "react-native-chart-kit/v2";

<DonutChart
  centerLabel="$1.5M"
  data={revenueMix}
  valueKey="revenue"
  labelKey="plan"
  width={360}
  height={260}
  preset="fintech"
/>;
```

::chart-preview{id="donut-basic"}

## Current Scope

The first v2 donut chart supports:

- modern object-row data
- theme and preset colors
- bottom wrapped legend
- percentage labels in the legend
- donut center text
- rich custom center labels
- custom legend item rendering
- tap selection with active-slice highlighting
- zero and invalid slices without broken paths

## Tap Selection

Use `interaction="tap"` for uncontrolled selection, or pass `selectedIndex` with
`interaction.onSelect` for controlled product UI.

```tsx
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
  width={360}
  height={260}
/>;
```

## Custom Legend and Center Label

Use `legend.renderItem` when the default compact legend is not enough.
`centerLabel` can return React content for multi-line KPI labels.

```tsx
<DonutChart
  data={retentionSegments}
  valueKey="accounts"
  labelKey="status"
  centerLabel={({ theme, total }) => (
    <View>
      <Text style={{ color: theme.text }}>{total}</Text>
      <Text style={{ color: theme.mutedText }}>accounts</Text>
    </View>
  )}
  legend={{
    maxItemWidth: "100%",
    renderItem: ({ item, theme }) => (
      <View>
        <Text style={{ color: theme.text }}>{item.label}</Text>
        <Text style={{ color: theme.mutedText }}>{item.percentageLabel}</Text>
      </View>
    )
  }}
  width={360}
  height={300}
/>
```
