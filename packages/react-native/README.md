# @chart-kit/react-native

Modern Chart Kit v2 React Native components.

This package is the scoped modern API for new adopters. The root `react-native-chart-kit` package remains the legacy-compatible migration bridge.

The `@chart-kit/react-native/pro-preview` subpath exposes the current Pro-candidate preview surface while H4 finalizes the free-vs-Pro boundary. The main package barrel is reserved for the free/baseline API; demos that review Pro-candidate workflows import the preview subpath explicitly.

Current exports:

- `LineChart`
- `AreaChart`
- `BarChart`
- `StackedBarChart`
- `PieChart`
- `DonutChart`
- `ProgressChart`
- `ProgressRing`
- `ContributionGraph`
- `CalendarHeatmap`
- `ChartKitProvider`

Pro preview subpath exports:

- `LineChart`
- `BarChart`
- `DonutChart`
- `CombinedChart`
- `CandlestickChart`
- `ChartSelectionProvider`
- `useChartSelection`
- `useDismissChartSelection`

Modern docs:

- [Docs home](../../docs/README.md)
- [Installation](../../docs/getting-started/installation.md)
- [Line and area charts](../../docs/charts/line-and-area.md)
- [Bar charts](../../docs/charts/bar.md)
- [Pie and donut charts](../../docs/charts/pie-and-donut.md)
- [Progress charts](../../docs/charts/progress.md)
- [Contribution heatmap](../../docs/charts/contribution-heatmap.md)
- [Combined charts](../../docs/charts/combined.md)
- [Candlestick charts](../../docs/charts/candlestick.md)
- [Migration from v1](../../docs/migration/from-v1.md)
- [Production recipes](../../docs/recipes/README.md)

Current customization surface:

- theme colors
- theme typography for axis and legend labels
- configurable legend visibility, position, alignment, wrapping, marker style, spacing, item padding, and custom renderers
- x-axis label strategies: auto, show, skip, rotate, stagger, and hide
- edge label policies for shifting or hiding labels that would clip
- tap and scrub selection with shared tooltip, crosshair, and active dots
- scrollable charts, controlled viewport pan/zoom, and mini-chart range selector
- stable y-axis labels and animated axis label changes for viewport updates
- area fills, dashed lines, custom markers, threshold colors, and reference overlays
- automatic path-only decimation for dense line charts
- generated accessibility summaries and data table helpers
- first modern vertical bar geometry for grouped, stacked, stacked100, and negative values
