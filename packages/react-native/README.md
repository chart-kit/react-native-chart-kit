# @chart-kit/react-native

Modern Chart Kit v2 React Native components.

This workspace is private and unpublished. Its built output is assembled into
the public `react-native-chart-kit/v2` package subpath.

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

Pro and Skia implementations live outside this public repository.

Modern docs:

- [Docs home](../../docs/README.md)
- [Installation](../../docs/getting-started/installation.md)
- [Line charts](../../docs/charts/line.md)
- [Area charts](../../docs/charts/area.md)
- [Bar charts](../../docs/charts/bar.md)
- [Pie charts](../../docs/charts/pie.md)
- [Donut charts](../../docs/charts/donut.md)
- [Progress charts](../../docs/charts/progress.md)
- [Contribution heatmap](../../docs/charts/contribution-heatmap.md)
- [Migration from v1](../../docs/migration/from-v1.md)

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
