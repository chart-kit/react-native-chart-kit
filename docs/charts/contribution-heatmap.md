# Contribution Heatmaps

`ContributionGraph` and `CalendarHeatmap` render calendar-style activity charts from date/count rows. The core geometry maps dates into deterministic week and weekday cells, so timezone, leap-year, and week-start behavior can be tested without React Native.

```tsx
import { ContributionGraph } from "@chart-kit/react-native-v2";

<ContributionGraph
  values={[
    { date: "2026-04-01", count: 4 },
    { date: "2026-04-02", count: 8 }
  ]}
  endDate="2026-05-03"
  numDays={154}
  width={360}
  height={162}
  weekStartsOn={1}
  preset="analytics"
/>;
```

## Custom Color Scale

```tsx
<ContributionGraph
  values={values}
  endDate="2026-05-03"
  numDays={90}
  width={340}
  height={150}
  colors={["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8"]}
/>
```

Use `onDayPress` to connect cells to native tooltips, bottom sheets, or app-level detail panels.

## Empty Ranges

An empty `values` array still renders the requested date range as zero-count cells. This keeps loading, quiet-period, and newly created workspace states visually stable.

```tsx
<ContributionGraph
  values={[]}
  endDate="2026-05-03"
  numDays={91}
  width={340}
  height={150}
  weekStartsOn={1}
/>
```
