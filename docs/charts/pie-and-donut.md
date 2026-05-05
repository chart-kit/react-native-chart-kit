# Pie and Donut Charts

`PieChart` and `DonutChart` use the same normalized slice model and renderer-agnostic arc geometry from `@chart-kit/core`.

## Pie Chart

```tsx
import { PieChart } from "@chart-kit/react-native-v2";

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

## Donut Chart

Use `DonutChart` for the default donut radius, or pass `innerRadius` / `innerRadiusRatio` directly to `PieChart`.

```tsx
import { DonutChart } from "@chart-kit/react-native-v2";

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

## Current Scope

The first v2 slice supports:

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

Use `interaction="tap"` for uncontrolled selection, or pass `selectedIndex` with `interaction.onSelect` for controlled product UI.

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

## Custom Legend And Center Label

Use `legend.renderItem` when the default compact legend is not enough. `centerLabel` can return React content for multi-line KPI labels.

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

Advanced arc labels outside the chart are still planned for a later CKV2-008 slice.
