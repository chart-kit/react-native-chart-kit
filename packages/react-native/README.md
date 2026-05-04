# @chart-kit/react-native-v2

Private experimental package for Chart Kit v2 React Native components.

The package is intentionally not exported from the legacy root package yet. It exists so modern components can be built and visually reviewed before public API approval.

Current exports:

- `LineChart`
- `AreaChart`
- `BarChart`

Modern docs:

- [Line and area charts](../../docs/charts/line-and-area.md)
- [Bar charts](../../docs/charts/bar.md)

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
