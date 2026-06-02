---
title: Contribution Heatmaps
description: Render calendar-style contribution heatmaps for activity and intensity data.
---

# Contribution Heatmaps

`ContributionGraph` and `CalendarHeatmap` show activity intensity across a
calendar grid. Use them for usage streaks, daily habits, contribution history,
or any date-based metric where consistency over time matters.

```tsx
import { ContributionGraph } from "react-native-chart-kit/v2";

const endDate = "2026-05-03";
const numDays = 154;
const values = Array.from({ length: numDays }, (_, index) => {
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const date = new Date(
    end.valueOf() - (numDays - 1 - index) * 24 * 60 * 60 * 1000
  );
  const weekday = date.getUTCDay();
  const cycle = (index * 7 + weekday * 3) % 17;
  const launchWeekBoost = index > 110 && index < 126 ? 8 : 0;
  const weekendDip = weekday === 0 || weekday === 6 ? -4 : 0;

  return {
    date: date.toISOString().slice(0, 10),
    count: Math.max(0, cycle + launchWeekBoost + weekendDip)
  };
});

<ContributionGraph
  values={values}
  endDate={endDate}
  numDays={numDays}
  width={360}
  height={162}
  weekStartsOn={1}
/>;
```

::chart-preview{id="contribution-basic"}

## Custom Color Scale

```tsx
<ContributionGraph
  values={values}
  endDate="2026-05-03"
  numDays={154}
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
  numDays={154}
  width={340}
  height={150}
  weekStartsOn={1}
/>
```

::chart-preview{id="contribution-empty"}

## Props

### ContributionGraph / CalendarHeatmap

`CalendarHeatmap` is exported as an alias of `ContributionGraph` and accepts the same props.

| Prop                 | Type                                                      | Description                                                                  |
| -------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `values`             | `TData[]`                                                 | Source contribution rows.                                                    |
| `endDate`            | `string`, `number`, or `Date`                             | Last date included in the rendered range.                                    |
| `numDays`            | `number`                                                  | Number of days to render, counting backward from `endDate`.                  |
| `width`              | `number`                                                  | Outer chart width in pixels.                                                 |
| `height`             | `number`                                                  | Outer chart height in pixels.                                                |
| `accessor`           | `keyof TData`                                             | Row key used for contribution values when not using the default `count`.     |
| `cellSize`           | `number`                                                  | Size of each day cell in pixels.                                             |
| `gutterSize`         | `number`                                                  | Gap between day cells in pixels.                                             |
| `weekStartsOn`       | `number`                                                  | First day of the week, where `0` is Sunday and `1` is Monday.                |
| `showMonthLabels`    | `boolean`                                                 | Shows or hides month labels above the heatmap.                               |
| `showWeekdayLabels`  | `boolean`                                                 | Shows or hides weekday labels beside the heatmap.                            |
| `showOutOfRangeDays` | `boolean`                                                 | Renders calendar cells outside the requested date range.                     |
| `theme`              | `"light"`, `"dark"`, `"system"`, or `CartesianChartTheme` | Theme mode or inline theme tokens for this chart.                            |
| `preset`             | `CartesianChartPresetValue`                               | Built-in or registered preset name used to seed chart colors and typography. |
| `colors`             | `string[]`                                                | Color scale used for non-empty contribution values.                          |
| `emptyColor`         | `string`                                                  | Fill color used for zero or missing values.                                  |
| `colorForValue`      | `(props) => string`                                       | Custom color resolver for each rendered cell.                                |
| `getMonthLabel`      | `(monthIndex, date) => string`                            | Custom month label formatter.                                                |
| `getWeekdayLabel`    | `(dayIndex) => string`                                    | Custom weekday label formatter.                                              |
| `onDayPress`         | `(event) => void`                                         | Called when a day cell is pressed.                                           |
| `renderer`           | `ContributionGraphRenderer`                               | Renderer implementation used for SVG-compatible primitives.                  |
| `accessibilityLabel` | `string`                                                  | Overrides the generated accessible chart summary.                            |
| `testID`             | `string`                                                  | Test identifier applied to the chart container.                              |
