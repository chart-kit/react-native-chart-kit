# Changelog

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
