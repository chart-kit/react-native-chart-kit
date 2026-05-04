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

Custom legend rendering and advanced label renderers are planned for the next CKV2-008 slices.
