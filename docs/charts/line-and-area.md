# Line and Area Charts

`LineChart` is the primary modern v2 chart surface. It uses object-row data, explicit keys, renderer-agnostic geometry from `@chart-kit/core`, and SVG rendering by default.

Use this API for new apps. The legacy `react-native-chart-kit` data shape is handled separately by the compatibility facade.

## Basic Line

```tsx
import { LineChart } from "@chart-kit/react-native-v2";

const data = [
  { month: "Jan", revenue: 18 },
  { month: "Feb", revenue: 34 },
  { month: "Mar", revenue: 29 },
  { month: "Apr", revenue: 52 }
];

export function RevenueChart() {
  return (
    <LineChart
      data={data}
      xKey="month"
      yKey="revenue"
      width={360}
      height={240}
    />
  );
}
```

## Multi-Series

Use `series` when each line needs its own label, color, marker, curve, or stroke style.

```tsx
<LineChart
  data={data}
  xKey="month"
  series={[
    { yKey: "actual", label: "Actual", color: "#2563eb" },
    {
      yKey: "forecast",
      label: "Forecast",
      color: "#94a3b8",
      strokeDasharray: [6, 4],
      strokeOpacity: 0.72
    }
  ]}
  legend={{ position: "bottom", wrap: true }}
  width={360}
  height={260}
/>
```

## Area Fill

`AreaChart` is an alias for `LineChart` with `area` enabled. You can also opt into area fill per chart or per series.

```tsx
<LineChart
  area
  areaFill={{ fromOpacity: 0.32, toOpacity: 0.05 }}
  data={data}
  xKey="date"
  yKey="price"
  curve="monotone"
  width={360}
  height={240}
/>
```

Use `areaFill` on the chart for a shared fill style, or per series when each series needs its own gradient colors or opacity.

## Styling Lines and Dots

Supported curve values are `linear`, `monotone`, and `step`.

```tsx
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
  width={360}
  height={260}
/>
```

## Threshold Coloring

Threshold coloring clips the rendered path and area fill above or below a y value. Raw points are unchanged.

```tsx
<LineChart
  area
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
/>
```

## Tooltips and Selection

Selection state is shared by tooltips, active dots, crosshairs, and external UI through `onSelect`.

```tsx
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
  tooltip={{ shared: true, positionAnimationDuration: 320 }}
  crosshair
  width={360}
  height={260}
/>
```

Selection modes:

- `none`: no chart selection.
- `tap`: tap to select the nearest x value.
- `scrub`: press and drag to update the nearest x value.

Selection persistence:

- `persist`: keep the last selection after the gesture ends.
- `whileActive`: clear selection on gesture end.
- `none`: emit selection events without keeping internal selected state.

## Custom Crosshair

Use `renderCrosshair` when a product needs branded cursors, axis badges, or a custom inspection overlay. The render prop receives the selected x/y position, selected series, plot bounds, theme tokens, and resolved crosshair config.

```tsx
<LineChart
  data={data}
  xKey="month"
  yKeys={["actual", "forecast"]}
  selectedIndex={4}
  crosshair={{ strokeDasharray: [3, 4] }}
  renderCrosshair={({ config, plot, series, x, xLabel, y }) => (
    <SvgGroup>
      <SvgLine
        x1={x}
        x2={x}
        y1={plot.y}
        y2={plot.y + plot.height}
        stroke={config.color}
        strokeDasharray={config.strokeDasharray}
      />
      <SvgText x={x + 8} y={y - 8}>
        {xLabel}: {series[0]?.formattedValue}
      </SvgText>
    </SvgGroup>
  )}
  width={360}
  height={260}
/>
```

## Scroll, Pan, Zoom, and Range Selector

Use simple horizontal scrolling for long categorical or time-series charts.

```tsx
<LineChart
  data={data}
  xKey="date"
  yKey="price"
  scrollable
  visiblePoints={30}
  initialIndex="end"
  yAxisLabelWidth="stable"
  width={360}
  height={260}
/>
```

Use a controlled viewport for direct pan, pinch zoom, or a mini-chart range selector.

```tsx
const [viewport, setViewport] = useState({
  startIndex: 40,
  endIndex: 90
});

<LineChart
  data={data}
  xKey="date"
  yKeys={["portfolio", "benchmark"]}
  viewport={viewport}
  onViewportChange={(event) => setViewport(event.viewport)}
  viewportInteraction={{ pan: true, pinchZoom: true, lockParentScroll: true }}
  rangeSelector={{ visible: true, interactive: true, height: 68 }}
  yAxisLabelWidth="stable"
  width={360}
  height={340}
/>;
```

`yAxisLabelWidth="stable"` reserves label width from the full dataset, so changing the viewport does not make the plot jump when labels change from values such as `$10k` to `$100k`.

The range selector is composable through `renderLine`, `renderHandle`, and `renderWindow`, so products can brand the overview path, handles, and selected window without replacing the built-in viewport logic.

## Reference Overlays

Reference lines and bands are clipped to the plot bounds. Line labels default to automatic vertical placement and try to avoid nearby series geometry.

```tsx
<LineChart
  data={data}
  xKey="month"
  yKey="attainment"
  referenceBands={[{ y1: 90, y2: 110, label: "Target range", opacity: 0.12 }]}
  referenceLines={[{ y: 100, label: "Plan", strokeDasharray: [5, 4] }]}
  width={360}
  height={240}
/>
```

Set `labelPlacement="above"` or `labelPlacement="below"` only when you need a fixed position.

## Labels and Axes

Useful label props:

- `labelStrategy`: `auto`, `show`, `skip`, `rotate`, `stagger`, or `hide`.
- `edgeLabelPolicy`: `shift`, `hide`, or `show`.
- `formatXLabel`: format dates, categories, or numeric x values.
- `formatYLabel`: format y-axis labels and tooltip values.
- `axisLabelAnimation`: crossfade y-axis label changes during viewport changes.
- `yAxisLabelWidth`: `auto`, `stable`, or a fixed number.

When `labelStrategy` is `auto` or `skip`, duplicate formatted x-axis labels are collapsed before collision solving. Use `labelStrategy="show"` when repeated labels are intentional.

## Decimation

LineChart uses automatic path-only min/max decimation by default. This reduces SVG path complexity for dense charts while preserving source points for selection, tooltips, labels, and custom dots.

```tsx
<LineChart
  data={largeData}
  xKey="timestamp"
  yKey="price"
  showDots={false}
  decimation={{ maxPoints: 700 }}
  width={360}
  height={240}
/>
```

Decimation options:

- `decimation="auto"`: default. Uses roughly two rendered path points per plot pixel, with a minimum of 120.
- `decimation={false}`: disables path decimation.
- `decimation={500}`: caps each rendered path around a fixed point budget.
- `decimation={{ maxPoints: 700 }}`: object form for future strategy options.

For large charts, set `showDots={false}` unless every marker is intentional. Decimation only affects paths; dots remain exact because custom dots may encode business meaning.

## Accessibility

Every LineChart generates a summary if `accessibilityLabel` is not provided. For custom accessibility surfaces, use:

```ts
import {
  getLineChartAccessibilitySummary,
  getLineChartDataTable
} from "@chart-kit/react-native-v2";
```

`getLineChartDataTable()` returns columns and rows suitable for an app-level table fallback or export workflow.
