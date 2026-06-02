---
title: Progress Charts
description: Show circular progress values with configurable labels and accessible output.
---

# Progress Charts

`ProgressChart` shows completion as circular rings. Use it for checklists,
readiness scores, quotas, and compact progress summaries with one or more
tracked values.

## Concentric Rings

```tsx
import { ProgressChart } from "react-native-chart-kit/v2";

const data = [
  { metric: "Build signed", progress: 0.76 },
  { metric: "QA pass", progress: 0 },
  { metric: "Rollout cap", progress: 0.42 }
];

<ProgressChart
  data={data}
  valueKey="progress"
  labelKey="metric"
  width={410}
  height={260}
  centerLabel={({ average }) => `${Math.round(average * 100)}%`}
/>;
```

::chart-preview{id="progress-rings"}

## Single Ring

```tsx
import { ProgressRing } from "react-native-chart-kit/v2";

<ProgressRing
  value={0.76}
  label="Release readiness"
  width={410}
  height={240}
  centerLabel="76%"
/>;
```

## Labels And Data Arrays

Use the `labels` and `data` object shape when progress values already come from
parallel arrays:

```tsx
<ProgressChart
  data={{
    labels: ["Build signed", "QA pass", "Rollout cap"],
    data: [0.76, 0, 0.42]
  }}
  width={410}
  height={240}
/>
```

::chart-preview{id="progress-single"}

Values outside `0..1` produce normalization warnings in core and are clamped by geometry so the ring never draws broken arcs.

## Zero And Missing Values

Zero and missing rings keep their background tracks and legend rows. Values above `1` are clamped visually while their source value remains available in the model.

```tsx
<ProgressChart
  data={[
    { metric: "Brief approved", progress: 0 },
    { metric: "QA pass", progress: null },
    { metric: "Rollout cap", progress: 1.18 }
  ]}
  valueKey="progress"
  labelKey="metric"
  width={410}
  height={260}
/>
```

## Props

### ProgressChart

| Prop                  | Type                                                      | Description                                                                  |
| --------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `data`                | `ProgressChartData<TData>`                                | Object-row data or a progress data object with `labels` and `data` arrays.   |
| `valueKey`            | `keyof TData`                                             | Row key used for ring progress values in object-row data.                    |
| `labelKey`            | `keyof TData`                                             | Row key used for ring labels in object-row data.                             |
| `colorKey`            | `keyof TData`                                             | Row key used for ring colors in object-row data.                             |
| `labels`              | `string[]`                                                | Labels used with data arrays.                                                |
| `colors`              | `string[]`                                                | Colors used with data arrays or as fallback ring colors.                     |
| `width`               | `number`                                                  | Outer chart width in pixels.                                                 |
| `height`              | `number`                                                  | Outer chart height in pixels.                                                |
| `theme`               | `"light"`, `"dark"`, `"system"`, or `CartesianChartTheme` | Theme mode or inline theme tokens for this chart.                            |
| `preset`              | `CartesianChartPresetValue`                               | Built-in or registered preset name used to seed chart colors and typography. |
| `legend`              | `boolean` or `ProgressChartLegendConfig`                  | Shows and configures the legend.                                             |
| `hideLegend`          | `boolean`                                                 | Legacy-style shortcut for hiding the legend.                                 |
| `centerLabel`         | `string` or `(props) => string`                           | Text rendered in the center of the rings.                                    |
| `strokeWidth`         | `number`                                                  | Ring stroke width in pixels.                                                 |
| `ringGap`             | `number`                                                  | Gap between concentric rings.                                                |
| `radius`              | `number`                                                  | Explicit outer ring radius in pixels.                                        |
| `animation`           | `boolean` or `ProgressChartAnimationConfig`               | Enables and configures ring entrance/update animation.                       |
| `strokeLinecap`       | `ProgressChartStrokeLinecap`                              | Stroke cap style for progress arcs.                                          |
| `backgroundRingColor` | `string`                                                  | Color used for ring tracks behind progress arcs.                             |
| `renderer`            | `ProgressChartRenderer`                                   | Renderer implementation used for SVG-compatible primitives.                  |
| `accessibilityLabel`  | `string`                                                  | Overrides the generated accessible chart summary.                            |
| `testID`              | `string`                                                  | Test identifier applied to the chart container.                              |
| `formatPercentage`    | `(value) => string`                                       | Formats percentages in labels and accessible output.                         |

### ProgressRing

| Prop                  | Type                                                      | Description                                                                                          |
| --------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `value`               | `number`, `null`, or `undefined`                          | Single progress value for the ring, usually between `0` and `1`.                                     |
| `label`               | `string`                                                  | Label used for the ring and accessible output.                                                       |
| `color`               | `string`                                                  | Progress arc color for the ring.                                                                     |
| `width`               | `number`                                                  | Outer chart width in pixels.                                                                         |
| `height`              | `number`                                                  | Outer chart height in pixels.                                                                        |
| `theme`               | `"light"`, `"dark"`, `"system"`, or `CartesianChartTheme` | Theme mode or inline theme tokens for this chart.                                                    |
| `preset`              | `CartesianChartPresetValue`                               | Built-in or registered preset name used to seed chart colors and typography.                         |
| `legend`              | `boolean` or `ProgressChartLegendConfig`                  | Shows and configures the legend.                                                                     |
| `hideLegend`          | `boolean`                                                 | Legacy-style shortcut for hiding the legend.                                                         |
| `centerLabel`         | `string` or `(props) => string`                           | Text rendered in the ring center.                                                                    |
| `strokeWidth`         | `number`                                                  | Ring stroke width in pixels.                                                                         |
| `ringGap`             | `number`                                                  | Gap setting inherited from `ProgressChart`; only relevant when the component is wrapped or extended. |
| `radius`              | `number`                                                  | Explicit ring radius in pixels.                                                                      |
| `animation`           | `boolean` or `ProgressChartAnimationConfig`               | Enables and configures ring entrance/update animation.                                               |
| `strokeLinecap`       | `ProgressChartStrokeLinecap`                              | Stroke cap style for the progress arc.                                                               |
| `backgroundRingColor` | `string`                                                  | Color used for the track behind the progress arc.                                                    |
| `renderer`            | `ProgressChartRenderer`                                   | Renderer implementation used for SVG-compatible primitives.                                          |
| `accessibilityLabel`  | `string`                                                  | Overrides the generated accessible chart summary.                                                    |
| `testID`              | `string`                                                  | Test identifier applied to the chart container.                                                      |
| `formatPercentage`    | `(value) => string`                                       | Formats percentages in labels and accessible output.                                                 |
