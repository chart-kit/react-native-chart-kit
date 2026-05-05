# CKV2-007 Bar Stacked Compatibility Notes

This slice adds a v2 `StackedBarChart` compatibility facade on top of the modern `BarChart` stacked geometry.

## Implemented

- `StackedBarChart` export from `@chart-kit/react-native`.
- Legacy stacked data shape: `labels`, `legend`, `data`, and `barColors`.
- Legacy props mapped into modern bar props:
  - `hideLegend`
  - `percentile`
  - `segments`
  - `barPercentage`
  - `chartConfig.barPercentage`
  - `chartConfig.barRadius`
  - `decimalPlaces`
  - `formatYLabel`
  - `withVerticalLabels`
  - `withHorizontalLabels`
  - `withInnerLines`
  - `yAxisLabel`
  - `yAxisSuffix`
- Axis label visibility and tick count controls on modern `BarChart`.
- Modern `BarChart.renderBar` hook for custom bar rendering without replacing layout, labels, sticky axes, hit testing, or tooltips.
- QA showcase stories for basic and percentile legacy stacked bars.

## Remaining

- Full legacy `BarChart` prop mapping for the root compatibility facade.
- Custom stacked segment labels.
- Exact legacy SVG node order remains out of scope per the compatibility matrix.
