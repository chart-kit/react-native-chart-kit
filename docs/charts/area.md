---
title: Area Chart
description: Show filled trends where magnitude and direction both matter.
---

# Area Chart

`AreaChart` shows a trend with the area beneath the line filled in. Use it when
the size of a value matters as much as its movement, such as balances, capacity,
pipeline, or volume over time.

## Basic Area

```tsx
import { AreaChart } from "react-native-chart-kit/v2";

const data = [
  { date: "Jan 01", price: 72 },
  { date: "Jan 03", price: 138 },
  { date: "Jan 08", price: 91 },
  { date: "Jan 15", price: 166 },
  { date: "Jan 24", price: 118 },
  { date: "Feb 01", price: 202 }
];

export function PipelineChart() {
  return (
    <AreaChart
      data={data}
      xKey="date"
      yKey="price"
      curve="monotone"
      width={360}
      height={240}
    />
  );
}
```

::chart-preview{id="line-area"}

## Area Fill

Use `areaFill` to tune fill opacity. You can also pass `area` to `LineChart`
when a product uses line and area variants from the same component wrapper.

```tsx
const data = [
  { date: "Jan", price: 42 },
  { date: "Feb", price: 96 },
  { date: "Mar", price: 58 },
  { date: "Apr", price: 132 },
  { date: "May", price: 84 },
  { date: "Jun", price: 158 }
];

<LineChart
  area
  areaFill={{ fromOpacity: 0.32, toOpacity: 0.05 }}
  data={data}
  xKey="date"
  yKey="price"
  curve="monotone"
  width={360}
  height={240}
/>;
```

Use `areaFill` on the chart for a shared fill style, or per series when each
series needs its own colors or opacity.

## Threshold Area

Threshold coloring clips the rendered path and area fill above or below a y
value. Raw points are unchanged.

```tsx
const data = [
  { month: "Jan", attainment: 62 },
  { month: "Feb", attainment: 138 },
  { month: "Mar", attainment: 74 },
  { month: "Apr", attainment: 151 },
  { month: "May", attainment: 89 },
  { month: "Jun", attainment: 122 },
  { month: "Jul", attainment: 55 },
  { month: "Aug", attainment: 164 },
  { month: "Sep", attainment: 96 },
  { month: "Oct", attainment: 145 },
  { month: "Nov", attainment: 78 },
  { month: "Dec", attainment: 172 }
];

<AreaChart
  data={data}
  xKey="month"
  series={[
    {
      yKey: "attainment",
      label: "Attainment",
      threshold: {
        y: 100,
        aboveColor: "#16a34a",
        belowColor: "#dc2626",
        areaAboveColor: "#16a34a",
        areaBelowColor: "#dc2626",
        areaOpacity: 0.16
      }
    }
  ]}
  referenceLines={[{ y: 100, label: "Plan", strokeDasharray: [5, 4] }]}
  width={360}
  height={240}
/>;
```

## Dense Area Charts

For long time series, use the same viewport, scrolling, and decimation options
as `LineChart`.

```tsx
<AreaChart
  data={largeData}
  xKey="timestamp"
  yKey="price"
  scrollable
  visiblePoints={30}
  initialIndex="end"
  showDots={false}
  decimation={{ maxPoints: 700 }}
  yAxisLabelWidth="stable"
  width={360}
  height={260}
/>
```

## Props

### AreaChart

`AreaChart` accepts the same props as `LineChart` and renders with area fill
enabled by default.

| Prop                      | Type                                                        | Description                                                                                       |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `data`                    | `TData[]`                                                   | Object-row source data for the chart.                                                             |
| `xKey`                    | `keyof TData`                                               | Row key used for the x-axis value.                                                                |
| `yKey`                    | `keyof TData`                                               | Single row key used for y values when `series` or `yKeys` is not provided.                        |
| `yKeys`                   | `Array<keyof TData>`                                        | Multiple row keys rendered as separate series with default styling.                               |
| `series`                  | `LineChartSeries<TData>[]`                                  | Full per-series configuration, including labels, colors, stroke, dots, thresholds, and area fill. |
| `width`                   | `number`                                                    | Outer chart width in pixels.                                                                      |
| `height`                  | `number`                                                    | Outer chart height in pixels.                                                                     |
| `theme`                   | `ChartKitThemeMode` or `CartesianChartTheme`                | Theme mode or inline theme tokens for this chart.                                                 |
| `preset`                  | `CartesianChartPresetValue`                                 | Built-in or registered preset name used to seed chart colors and typography.                      |
| `scrollable`              | `boolean`                                                   | Enables a horizontal scroll viewport for long data sets.                                          |
| `visiblePoints`           | `number`                                                    | Number of points visible in the viewport when `scrollable` is enabled.                            |
| `initialIndex`            | `ChartViewportInitialIndex`                                 | Initial scroll/window position, such as `"start"` or `"end"`.                                     |
| `viewport`                | `LineChartViewportConfig`                                   | Controlled visible data window for scroll, pan, zoom, or range selector flows.                    |
| `onViewportChange`        | `(event) => void`                                           | Called when viewport state changes from the main plot or range selector.                          |
| `viewportInteraction`     | `boolean` or `LineChartViewportInteractionConfig`           | Enables and configures one-finger pan and pinch zoom for the viewport.                            |
| `rangeSelector`           | `boolean` or `LineChartRangeSelectorConfig`                 | Adds a mini-chart range selector below the main plot.                                             |
| `decimation`              | `false`, `"auto"`, `number`, or `LineChartDecimationConfig` | Controls rendered path simplification for dense series.                                           |
| `curve`                   | `LineCurve`                                                 | Curve interpolation used for line and area paths.                                                 |
| `connectNulls`            | `boolean`                                                   | Connects defined points across `null` or missing y values.                                        |
| `area`                    | `boolean`                                                   | Inherited from `LineChartProps`; `AreaChart` renders with area fill enabled.                      |
| `areaFill`                | `LineChartAreaFillConfig`                                   | Shared area fill opacity, gradient, or color configuration.                                       |
| `showDots`                | `boolean`                                                   | Shows or hides all point markers.                                                                 |
| `dots`                    | `boolean` or `LineChartDotConfig`                           | Configures default point marker visibility, size, shape, and color.                               |
| `renderDot`               | `(props) => ReactNode`                                      | Custom renderer for ordinary point markers.                                                       |
| `selectedIndex`           | `number`                                                    | Controlled selected data index.                                                                   |
| `defaultSelectedIndex`    | `number`                                                    | Initial uncontrolled selected data index.                                                         |
| `activeDot`               | `boolean` or `LineChartDotConfig`                           | Configures the marker shown for the selected point.                                               |
| `renderActiveDot`         | `(props) => ReactNode`                                      | Custom renderer for the selected point marker.                                                    |
| `interaction`             | `LineChartInteraction<TData>`                               | Selection/scrub interaction mode and callbacks.                                                   |
| `crosshair`               | `boolean` or `LineChartCrosshairConfig`                     | Shows and configures the selected-point crosshair.                                                |
| `renderCrosshair`         | `(props) => ReactNode`                                      | Custom renderer for the crosshair.                                                                |
| `tooltip`                 | `boolean` or `LineChartTooltipConfig`                       | Shows and configures selected-point tooltip content and placement.                                |
| `renderTooltip`           | `(props) => ReactNode`                                      | Custom renderer for selected-point tooltip content.                                               |
| `referenceLines`          | `LineChartReferenceLineConfig[]`                            | Horizontal reference lines drawn across the plot. Reference labels support `labelContainer`.      |
| `referenceBands`          | `LineChartReferenceBandConfig[]`                            | Horizontal reference bands drawn behind the series. Reference labels support `labelContainer`.    |
| `showHorizontalGridLines` | `boolean`                                                   | Shows or hides horizontal grid lines.                                                             |
| `showVerticalGridLines`   | `boolean`                                                   | Shows or hides vertical grid lines.                                                               |
| `legend`                  | `boolean` or `LineChartLegendConfig`                        | Shows and configures the chart legend.                                                            |
| `labelStrategy`           | `LineChartLabelStrategy`                                    | Controls x-axis label density and layout.                                                         |
| `labelRotation`           | `number`                                                    | Rotation angle for x-axis labels when using rotated labels.                                       |
| `labelMinGap`             | `number`                                                    | Minimum gap used by automatic x-axis label skipping.                                              |
| `edgeLabelPolicy`         | `LineChartEdgeLabelPolicy`                                  | Controls how first and last x-axis labels are shifted, hidden, or shown.                          |
| `yDomain`                 | `NumericDomainInput`                                        | Overrides or constrains the computed y-axis domain.                                               |
| `yAxisLabelWidth`         | `LineChartYAxisLabelWidth`                                  | Fixed, automatic, or stable width for y-axis labels.                                              |
| `axisLabelAnimation`      | `boolean` or `LineChartAxisLabelAnimationConfig`            | Animates y-axis label changes during viewport updates.                                            |
| `formatXLabel`            | `(value, index) => string`                                  | Formats x-axis labels and selected x labels.                                                      |
| `formatYLabel`            | `(value) => string`                                         | Formats y-axis labels, selected values, and tooltip values.                                       |
| `renderer`                | `LineChartRenderer`                                         | Renderer implementation used for SVG-compatible primitives.                                       |
| `id`                      | `string`                                                    | Stable chart id used for internal ids and coordinated selection scope.                            |
| `debugLayout`             | `boolean`                                                   | Renders layout debug rectangles in development.                                                   |
| `onLayoutDebug`           | `(model) => void`                                           | Receives computed layout debug geometry.                                                          |
| `accessibilityLabel`      | `string`                                                    | Overrides the generated accessible chart summary.                                                 |
| `testID`                  | `string`                                                    | Test identifier applied to the chart container.                                                   |
