---
title: Line Chart
description: Show trends, forecasts, and changes over time with line charts.
---

# Line Chart

`LineChart` shows how a value changes over time or across ordered categories.
Use it for trends, forecasts, performance tracking, and any metric where the
shape of change matters.

## Basic Line

```tsx
import { LineChart } from "react-native-chart-kit/v2";

const data = [
  { month: "Jan", revenue: 52 },
  { month: "Feb", revenue: 86 },
  { month: "Mar", revenue: 58 },
  { month: "Apr", revenue: 134 },
  { month: "May", revenue: 95 },
  { month: "Jun", revenue: 176 },
  { month: "Jul", revenue: 126 },
  { month: "Aug", revenue: 218 },
  { month: "Sep", revenue: 164 },
  { month: "Oct", revenue: 252 },
  { month: "Nov", revenue: 198 },
  { month: "Dec", revenue: 286 }
];

export function RevenueChart() {
  return (
    <LineChart
      data={data}
      xKey="month"
      yKey="revenue"
      width={410}
      height={240}
    />
  );
}
```

::chart-preview{id="line-basic"}

## Multi-Series

Use `series` when each line needs its own label, color, marker, curve, or
stroke style.

```tsx
const data = [
  { month: "Jan", actual: 22, forecast: 190 },
  { month: "Feb", actual: 64, forecast: 168 },
  { month: "Mar", actual: 39, forecast: 143 },
  { month: "Apr", actual: 118, forecast: 122 },
  { month: "May", actual: 73, forecast: 101 },
  { month: "Jun", actual: 161, forecast: 84 },
  { month: "Jul", actual: 109, forecast: 66 },
  { month: "Aug", actual: 204, forecast: 48 }
];

<LineChart
  data={data}
  xKey="month"
  series={[
    { yKey: "actual", label: "Actual" },
    {
      yKey: "forecast",
      label: "Forecast",
      strokeDasharray: [6, 4],
      strokeOpacity: 0.72
    }
  ]}
  legend={{ position: "bottom", wrap: true }}
  width={410}
  height={260}
/>;
```

::chart-preview{id="line-multi-series"}

## Styling Lines and Dots

Supported curve values are `linear`, `monotone`, and `step`.

```tsx
const data = [
  { date: "Mon", portfolio: 512, benchmark: 690 },
  { date: "Tue", portfolio: 660, benchmark: 610 },
  { date: "Wed", portfolio: 430, benchmark: 650 },
  { date: "Thu", portfolio: 760, benchmark: 540 },
  { date: "Fri", portfolio: 590, benchmark: 700 },
  { date: "Sat", portfolio: 820, benchmark: 520 },
  { date: "Sun", portfolio: 548, benchmark: 735 }
];

<LineChart
  data={data}
  xKey="date"
  series={[
    {
      yKey: "portfolio",
      label: "Portfolio",
      curve: "monotone",
      strokeWidth: 3,
      dot: {
        shape: "diamond",
        radius: 4,
        fill: "background",
        stroke: "series"
      }
    },
    {
      yKey: "benchmark",
      label: "Benchmark",
      curve: "linear",
      strokeDasharray: [5, 5],
      strokeLinecap: "butt",
      dot: false
    }
  ]}
  activeDot={{ radius: 6, fill: "background", stroke: "series" }}
  width={410}
  height={260}
/>;
```

## Threshold Coloring

Threshold coloring clips the rendered path above or below a y value. Raw points
are unchanged.

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

<LineChart
  data={data}
  xKey="month"
  series={[
    {
      yKey: "attainment",
      label: "Attainment",
      threshold: {
        y: 100,
        aboveColor: "#16a34a",
        belowColor: "#dc2626"
      }
    }
  ]}
  referenceLines={[
    { y: 100, label: "Plan", labelContainer: true, strokeDasharray: [5, 4] }
  ]}
  width={410}
  height={240}
/>;
```

## Tooltips and Selection

Selection state is shared by tooltips, active dots, crosshairs, and external UI
through `onSelect`.

```tsx
const data = [
  { date: "Nov 03", portfolio: 512, benchmark: 720 },
  { date: "Nov 04", portfolio: 681, benchmark: 604 },
  { date: "Nov 05", portfolio: 438, benchmark: 698 },
  { date: "Nov 10", portfolio: 794, benchmark: 552 },
  { date: "Nov 11", portfolio: 566, benchmark: 746 },
  { date: "Nov 12", portfolio: 842, benchmark: 580 },
  { date: "Nov 13", portfolio: 618, benchmark: 790 },
  { date: "Nov 14", portfolio: 906, benchmark: 534 }
];

<LineChart
  data={data}
  xKey="date"
  yKeys={["portfolio", "benchmark"]}
  interaction={{
    mode: "scrub",
    selectionPersistence: "whileActive",
    onSelect: (event) => {
      setHeaderValue(event.series[0]?.formattedValue);
    }
  }}
  tooltip={{
    shared: true,
    anchor: "pointer",
    placement: "above",
    offset: 18,
    positionAnimationDuration: 320
  }}
  crosshair
  width={410}
  height={260}
/>;
```

::chart-preview{id="line-selection"}

Selection modes:

- `none`: no chart selection.
- `tap`: tap to select the nearest x value.
- `scrub`: press and drag to update the nearest x value.

Selection persistence:

- `persist`: keep the last selection after the gesture ends.
- `whileActive`: clear selection on gesture end.
- `none`: emit selection events without keeping internal selected state.

Tooltip positioning:

- `anchor: "point"` positions around the selected data point.
- `anchor: "pointer"` positions around the touch/mouse pointer.
- `placement: "auto" | "above" | "below"` controls vertical placement while
  preserving edge clamping.

## Custom Crosshair

Use `renderCrosshair` when a product needs branded cursors, axis badges, or a
custom inspection overlay.

```tsx
import { G, Line, Text as SvgText } from "react-native-svg";

const data = [
  { month: "Jan", actual: 22, forecast: 190 },
  { month: "Feb", actual: 64, forecast: 168 },
  { month: "Mar", actual: 39, forecast: 143 },
  { month: "Apr", actual: 118, forecast: 122 },
  { month: "May", actual: 73, forecast: 101 },
  { month: "Jun", actual: 161, forecast: 84 },
  { month: "Jul", actual: 109, forecast: 66 },
  { month: "Aug", actual: 204, forecast: 48 }
];

<LineChart
  data={data}
  xKey="month"
  yKeys={["actual", "forecast"]}
  selectedIndex={4}
  crosshair={{ strokeDasharray: [3, 4] }}
  renderCrosshair={({ config, plot, series, theme, x, xLabel, y }) => (
    <G>
      <Line
        x1={x}
        x2={x}
        y1={plot.y}
        y2={plot.y + plot.height}
        stroke={config.color}
        strokeDasharray={config.strokeDasharray}
      />
      <SvgText
        x={x + 8}
        y={y - 8}
        fill={theme.text}
        fontSize={theme.typography.legendLabelSize}
        fontFamily={theme.typography.fontFamily}
      >
        {xLabel}: {series[0]?.formattedValue}
      </SvgText>
    </G>
  )}
  width={410}
  height={260}
/>;
```

## Scroll, Pan, Zoom, and Range Selector

Use simple horizontal scrolling for long categorical or time-series charts.

```tsx
<LineChart
  data={largeData}
  xKey="date"
  yKey="price"
  scrollable
  visiblePoints={30}
  initialIndex="end"
  yAxisLabelWidth="stable"
  width={410}
  height={260}
/>
```

Use a controlled viewport for direct pan, pinch zoom, or a mini-chart range
selector.

```tsx
const [viewport, setViewport] = useState<LineChartViewportConfig>({
  startIndex: 40,
  endIndex: 90
});

<LineChart
  data={portfolioHistory}
  xKey="date"
  yKeys={["portfolio", "benchmark"]}
  viewport={viewport}
  onViewportChange={(event) => setViewport(event.viewport)}
  viewportInteraction={{ pan: true, pinchZoom: true, lockParentScroll: true }}
  rangeSelector={{ visible: true, interactive: true, height: 68 }}
  yAxisLabelWidth="stable"
  width={410}
  height={340}
/>;
```

`yAxisLabelWidth="stable"` reserves label width from the full dataset, so
changing the viewport does not make the plot jump when labels change.

## Reference Overlays

Reference lines and bands are clipped to the plot bounds. Line labels default to
automatic vertical placement and try to avoid nearby series geometry. Add
`labelContainer` to a reference line or band when a label needs a small
background chip over busy data.

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

<LineChart
  data={data}
  xKey="month"
  yKey="attainment"
  referenceBands={[{ y1: 176, y2: 190, label: "Target range", opacity: 0.12 }]}
  referenceLines={[{ y: 183, label: "Plan", strokeDasharray: [5, 4] }]}
  width={410}
  height={240}
/>;
```

## Layout Debug

Use `debugLayout` in development when a chart clips labels, legends, or
tooltips. It draws the computed layout rectangles over the chart and exposes the
same rectangles through `onLayoutDebug`.

Use the overlay to identify which layout box is causing the issue, then tune the
related prop:

- X labels collide or overflow: adjust `labelStrategy`, `labelRotation`,
  `labelMinGap`, or `edgeLabelPolicy`.
- Y labels clip or steal too much plot width: adjust `yAxisLabelWidth` or
  `formatYLabel`.
- Legend rows crowd the plot: adjust `legend`, hide it, or simplify series
  labels.
- Tooltip overlaps important data: adjust `tooltip` placement, width, or custom
  renderer.

```tsx
<LineChart
  data={data}
  xKey="month"
  yKey="revenue"
  debugLayout
  onLayoutDebug={(model) => {
    console.log(model.rects);
  }}
  width={410}
  height={240}
/>
```

## Labels and Axes

Useful label props:

- `labelStrategy`: `auto`, `show`, `skip`, `rotate`, `stagger`, or `hide`.
- `edgeLabelPolicy`: `shift`, `hide`, or `show`.
- `formatXLabel`: format dates, categories, or numeric x values.
- `formatYLabel`: format y-axis labels and tooltip values.
- `axisLabelAnimation`: crossfade y-axis label changes during viewport changes.
- `yAxisLabelWidth`: `auto`, `stable`, or a fixed number.

## Decimation

LineChart uses automatic path-only min/max decimation by default. This reduces
SVG path complexity for dense charts while preserving source points for
selection, tooltips, labels, and custom dots.

```tsx
<LineChart
  data={largeData}
  xKey="timestamp"
  yKey="price"
  showDots={false}
  decimation={{ maxPoints: 700 }}
  width={410}
  height={240}
/>
```

Decimation options:

- `decimation="auto"`: default. Uses roughly two rendered path points per plot
  pixel, with a minimum of 120.
- `decimation={false}`: disables path decimation.
- `decimation={500}`: caps each rendered path around a fixed point budget.
- `decimation={{ maxPoints: 700 }}`: object form for future strategy options.

## Accessibility

Every LineChart generates a summary if `accessibilityLabel` is not provided. For
custom accessibility output, use:

```ts
import {
  getLineChartAccessibilitySummary,
  getLineChartDataTable
} from "react-native-chart-kit/v2";
```

`getLineChartDataTable()` returns columns and rows suitable for an app-level
table fallback or export workflow.

## Props

### LineChart

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
| `area`                    | `boolean`                                                   | Renders area fills under the line series.                                                         |
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
