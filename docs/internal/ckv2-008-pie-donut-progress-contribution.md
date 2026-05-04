# CKV2-008 Pie, Donut, Progress, Contribution Notes

Date: May 4, 2026

## Current Slice

Started the renderer-agnostic geometry foundation for PieChart and DonutChart.

Added:

- `buildPieArcs()` in `@chart-kit/core`
- proportional sector geometry from normalized pie slices
- donut support through `innerRadius`
- full-circle handling through two SVG arc commands
- graceful zero, invalid, and negative value handling after normalization
- arc centroid positions for future labels, press targets, and active slice states
- unit tests for proportional sectors, donut paths, invalid slices, and single-slice full circles

## Design Choices

The first slice stays in `core` and does not add React Native rendering yet. That keeps the math testable without `react-native-svg` and matches the v2 architecture rule that rendering consumes a computed model.

The geometry builder accepts normalized slices instead of legacy props. Modern and compat components can both normalize into the same model before rendering.

## Remaining Work

- Add SVG PieChart and DonutChart components.
- Add wrapped/bottom legend support for pie and donut examples.
- Add active slice and press event model.
- Add percentage label formatting and center label support.
- Add ProgressChart/ProgressRing geometry and renderer.
- Add ContributionGraph/CalendarHeatmap geometry and renderer.
- Add visual stories and screenshots for long legends, zero slices, active slices, progress rings, and calendar heatmaps.
