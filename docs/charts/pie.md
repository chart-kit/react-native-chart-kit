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
      preset="analytics"
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
/>
```
