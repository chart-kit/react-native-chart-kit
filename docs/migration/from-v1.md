# Migrating From v1

The v2 migration strategy is intentionally partial compatibility. Existing apps should be able to keep common chart names and data shapes while new product work uses the modern object-row API.

## Recommended Path

1. Upgrade the package and peer dependencies.
2. Keep existing `LineChart`, `BarChart`, `StackedBarChart`, `PieChart`, `ProgressChart`, and `ContributionGraph` imports working through the compatibility surface.
3. Run the app and fix any documented compatibility warnings.
4. Move new screens to the modern API instead of copying old `chartConfig` patterns.
5. Migrate old charts gradually when you need better layout, selection, scrolling, or theming.

## What Should Keep Working

Common v1 data shapes remain the compatibility target:

```tsx
<LineChart
  data={{
    labels: ["Jan", "Feb", "Mar"],
    datasets: [{ data: [18, 34, 29] }],
    legend: ["Revenue"]
  }}
  width={360}
  height={220}
  chartConfig={{
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`
  }}
/>
```

The compatibility promise covers the common public API, not undocumented internals, exact SVG node order, or layout bugs that made labels clip.

## New API For New Code

New screens should use object rows, explicit keys, app-level themes, and the interaction API.

```tsx
import { LineChart } from "@chart-kit/react-native-v2";

<LineChart
  data={[
    { month: "Jan", revenue: 18 },
    { month: "Feb", revenue: 34 },
    { month: "Mar", revenue: 29 }
  ]}
  xKey="month"
  yKey="revenue"
  interaction={{ mode: "tap" }}
  tooltip={{ shared: true }}
  width={360}
  height={240}
/>;
```

## Layout Differences

v2 defaults prioritize correct mobile layout over pixel-perfect legacy spacing:

- Labels reserve space automatically where possible.
- Edge labels shift or hide instead of clipping.
- Tooltips are rendered above chart content and are shifted inside the viewport.
- Scrollable charts use visible data windows instead of requiring manual SVG width hacks.
- `null` values create line gaps by default in modern charts.

Use compatibility props only when a migrated chart needs old spacing during a transition. Do not use legacy spacing for new charts.

## Package Path During Preview

The current repository has two surfaces:

- Legacy-compatible root package for upgrade testing.
- Private `@chart-kit/react-native-v2` workspace package for modern API review.

The final public import path is a beta-release gate. Until then, docs use `@chart-kit/react-native-v2` for modern examples so old and new APIs are visibly separate.

## Visual Review

Use the Expo showcase compatibility page to compare old fixtures with the modern renderer:

```sh
npm run example:expo
```

The visual suite also includes legacy fixtures for line, bar, and stacked bar charts:

```sh
npm run test:visual
```
