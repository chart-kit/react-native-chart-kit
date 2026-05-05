# CKV2-008 Pie, Donut, Progress, Contribution Notes

Date: May 4, 2026

## Current Slice

Started the renderer-agnostic geometry foundation and modern SVG component surface for PieChart and DonutChart.

Added:

- `buildPieArcs()` in `@chart-kit/core`
- proportional sector geometry from normalized pie slices
- donut support through `innerRadius`
- full-circle handling through two SVG arc commands
- graceful zero, invalid, and negative value handling after normalization
- arc centroid positions for future labels, press targets, and active slice states
- unit tests for proportional sectors, donut paths, invalid slices, and single-slice full circles
- modern `PieChart` and `DonutChart` exports from `@chart-kit/react-native-v2`
- object-row props with `valueKey`, `labelKey`, and optional `colorKey` / `colors`
- theme/preset integration and bottom wrapped legends
- donut center text
- tap selection, typed slice select events, and active-slice highlighting
- renderer-agnostic progress ring geometry in `@chart-kit/core`
- modern `ProgressChart` and `ProgressRing` exports from `@chart-kit/react-native-v2`
- progress object-row props with `valueKey`, `labelKey`, and optional `colorKey` / `colors`
- legacy progress data shape support
- progress center labels, legends, stroke width, ring gap, radius, and stroke cap customization
- renderer-agnostic contribution heatmap geometry in `@chart-kit/core`
- modern `ContributionGraph` and `CalendarHeatmap` exports from `@chart-kit/react-native-v2`
- heatmap month labels, weekday labels, Monday/Sunday week starts, theme-aware density, custom color scales, and day press events
- Expo showcase stories for acquisition share and revenue mix
- Expo showcase stories for activity rings and single-ring completion
- Expo showcase story for product usage contribution heatmap
- Expo interaction test for donut slice selection
- visual baselines for pie and donut stories
- custom pie/donut legend item rendering
- rich React center labels for donut KPI content
- long-label and zero-slice donut visual coverage

## Design Choices

The arc math stays in `core` and the React Native component consumes that computed model. That keeps the geometry testable without `react-native-svg` and matches the v2 architecture rule that rendering consumes a computed model.

The geometry builder accepts normalized slices instead of legacy props. Modern and compat components can both normalize into the same model before rendering.

## Remaining Work

- Add external arc labels.
- Add more zero/empty-state fixtures across ProgressChart and ContributionGraph.
