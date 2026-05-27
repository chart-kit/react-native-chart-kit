# Changelog

## v7.0.0-next.1

- remove deprecated row-by-row native QA matrix tooling from the active release process
- add a concise H6 RC readiness packet that keeps stable-release approval separate from Developer Preview
- keep Developer Preview verification focused on smoke-test notes and release-gate output
- publish `7.0.0-next.1` under the `next` dist-tag and record npm evidence
- require the full H6 owner decision set for release-candidate approval
- guard the required CKV2 command surface and Developer Preview publish manifest in tests
- guard the release-gate-required package scripts and GitHub issue-template
  fields in tests
- verify the main CI workflow in the release gate so required lint, security,
  typecheck, test, e2e, surface, docs, RN CLI, benchmark, and build checks do
  not drift
- add a local Developer Preview publish preflight that runs the preview gate,
  rebuilds packages, pack-checks all release packages, and verifies the expected
  pre-publish npm registry state
- harden npm publish checks so registry/network errors fail instead of being
  treated as unpublished packages
- verify the selected npm dist-tag after publish and require current-version
  changelog notes before creating GitHub release notes
- run the selected release gate inside the publish workflow before package-state
  checks or npm writes
- block `next` publishes unless H5 owner approval has been recorded and block
  `latest` publishes unless H6 owner approval has been recorded
- record post-publish npm evidence through `npm run release:publish:evidence`
  and upload the generated evidence JSON from the `next` publish workflow
- guard package manifest entries, package order, package versions, and the
  Pro/Skia unpublished boundary in tests
- use lockfile-based `npm ci --ignore-scripts` installs with npm caching in CI,
  native-release, and publish workflows
- record the latest high/critical npm security audit result while keeping the
  known moderate Expo/PostCSS advisory documented
- rename release docs and publish-manifest fields from beta wording to Developer Preview wording
- keep Pro and Skia unpublished while preserving pack checks and preview evidence

## v7.0.0-next.0

- publish the rebuild line under the `@chart-kit/react-native` npm package
- update the support matrix to React 19, React Native 0.83+, and react-native-svg 15
- modernize package tooling and remove the legacy Expo 37 root demo setup
- add renderer-agnostic core packages for normalization, scales, layout, geometry, interaction, and benchmarks
- add modern LineChart and AreaChart with multi-series data, null gaps, smart labels, tooltips, crosshair, scrollable viewports, pan/zoom controls, range selector, markers, reference overlays, thresholds, decimation, and accessibility helpers
- add modern BarChart with grouped, stacked, 100% stacked, horizontal, negative, scrollable, selectable, animated, and themed examples
- add PieChart, DonutChart, ProgressChart, ContributionGraph, CombinedChart, and CandlestickChart preview foundations with opt-in calendar-aware session-gap markers for dated candles
- add Expo showcase and Playwright visual regression coverage for modern and compatibility fixtures
- add v1 migration docs, prop mapping, production recipes, troubleshooting,
  Developer Preview checklist, known issues, and issue templates

## v6.12.2

- remove the direct `lodash` dependency
- guard chart scaling and labels against empty or invalid data
- avoid NaN stacked bar geometry when all stacked values are zero
- normalize line chart dash arrays before rendering SVG strokes
- improve LineChart dot interaction support on web
- prevent null placeholders in one line dataset from inheriting another dataset's last point

## v6.12.1

- prepare next patch release after v6.12.0
- add GitHub Actions build verification
- replace unstable random React keys in chart renders
- prefix generated SVG definition IDs to avoid collisions across charts
- replace ContributionGraph's unsafe prop lifecycle with componentDidUpdate
- fix stale root source exports

## v6.11

- added a prop to customize vertical labels heigh
- use full width when legend is hidden in StackedBarChart
- added custom Y labels in StackedBarChart

## v6.8.0

- use same colors in `ProgressChart` legend if `withCustomBarColorFromData` is set

## v6.7.0

- allowed usage of custom color for each bar on ProgressChart
- allowed usage of custom color for each bar on BarChart
- fixed to display the correct height bar even if changing the "height" of the props in StackedBar
- added indexData prop for renderDotContent

## v6.6.0

- added `propsForVerticalLabels` and `propsForHorizontalLabels`

## v6.5.0

- added `StackedBarChart` `percentile` stacking

## v6.4.1

- added `PieChart` props `avoidFalseZero`

## v6.4.0

- `ProgressChart` updated to include a condition to divide width by 2 for x value

## v6.2.0

- added `withVerticalLines` and `withHorizontalLines` to `LineChart`

## v6.1.0

- added `scrollableInfoTextDecorator`

## v6.0.0

- Typescript rewrite

## v5.6.1

- fixed linear gradient issue due to `react-native-svg` lib update
- added handling for datasets data is null to use last line coordinates
- updated to Expo SDK 37 and add clarification on usage to README.md

## v5.6.0

- added `showValuesOnTopOfBars` prop to `BarChart`
- fixed decimalPlaces being 0 and not applied in `BarChart`

## v5.5.0

- added `useShadowColorFromDataset` to `chartConfig` to make `LineChart` shadow same as line color

## v5.4.2

- fixed decimalPlaces not being sent with barChart

## v5.4.0

- added strokeWidth & radius as props for ProgressChart

## v5.3.1

- TS type fixes

## v5.3.0

- added missing ContributionGraph props
- added `withScrollableDot` to LineChart and a whole bunch of props to `chartConfig`. New feature for Line Chart - scrollable dot. It allows to navigate through chart using gesture and see value at dot's current position.

## v5.2.0

- `propsForDots` added to `ChartConfig` interface

## 5.1.1

- add some safe default values in BarChart's `chartConfig` to avoid potential null pointers

## 5.1.0

- added a withDots property to each dataset in LineChart to disable dots on these lines
- removed `prop-types`
- added `onDayPress` to ContributionGraph

## 5.0.0

- made ContributionGraph opacity distribution even through range between the min and max values
- added `getMonthLabel` to ContributionGraph
- added `yAxisInterval` to LineChart, it allows you to skip vertical lines in the background
- expaned StackedBarChart if it has no legend

## 4.5.0

- removed `.babelrc` from distribution
- made decimalPlaces work for StackedBar Chart

## 4.4.0

- added ability to add custom segments on the Y-Axis
- implemented barRadius config in BarChart
- added showBarTops prop to BarChart

## 4.3.0

- added `barPercentage?: number; hideLegend: boolean;` props to StackedBarChart
- added `barRadius` to chart config
- added `renderDotContent` to LineChart

## 4.2.0

- line chart supports legend

## 4.1.0

- add `hideLegend` to ProgressChart

## v4.0.0

- patched a lot of indirect dependencies
- improved ProgressChartProps types
- added item index to some color calls
- added an optional bottom padding to LineChart
- POTENTIALLY BREAKING for typescript: added some typedefs to "LineChart", "BarChart", and "StackedBarChart". Also added some typedefs for styles.
- corrected the line-chart & progress-chart wrong width calculation

## v3.12.0

- added `formatXLabel`, `formatYLabel`, and `getDotProps` to `LineChart`

## v3.11.0

- added optional props: `xAxisLabel`, `yAxisSuffix`, `yLabelsOffset`, `xLabelsOffset`, and `hidePointsAtIndex` to `LineChart`
- added optional prop `withInnerLines` to `BarChart`
- added optional `fillShadowGradient` color and `fillShadowGradientOpacity` to chart config for customizing the area under the data points in `LinChart` and `BarChart`

## v3.10.0

- added type for chart config
- added props config for Dots in the line chart

## v3.9.0

- added propsForLabels to chartConfig
- added labelColor to chartConfig as a shortcut for propsForLabels / fill

## v3.8.0

- added dot cx, cy in the onDataPointClick functions arguments
- fixed for horizontal label position when there is only one data point and fromZero prop is true

## v3.7.0

- expose paddingTop and paddingRight via the style prop
- style the chart background lines with chartConfig's propsForBackgroundLines

## v3.6.0

- added barPercentage property to chartConfig (by @dchirutac)
- added dot color callback prop (by @stephenc222)
- added bar chart label rotations (by @stephenc222)

## v3.5.0

- added `horizontalLabelRotation` and `verticalLabelRotation` props to `LineChart`

## v3.4.0

- added `chartConfig` `backgroundGradientFromOpacity` and `backgroundGradientToOpacity`

## 3.3.0

- added `index` to `onDataPointClick`

## 3.2.0

- added optional labels for ProgressChart

## 3.1.0

- added withVerticalLabels and withHorizontalLabels to LineChart, BarChart and StackedBarChart

## 3.0.0

- added typescript types
