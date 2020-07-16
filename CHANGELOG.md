# Changelog

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
