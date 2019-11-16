// Type definitions for ReactNativeChartKit 2.6
// Project: https://github.com/indiespirit/react-native-chart-kit
// TypeScript Version: 3.0

import * as React from "react";

// LineChart
export interface LineChartProps {
  /**
   * Data for the chart.
   *
   * Example from [docs](https://github.com/indiespirit/react-native-chart-kit#line-chart):
   *
   * ```javascript
   * const data = {
   *   labels: ['January', 'February', 'March', 'April', 'May', 'June'],
   *   datasets: [{
   *     data: [ 20, 45, 28, 80, 99, 43 ],
   *     color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
   *     strokeWidth: 2 // optional
   *   }]
   * }
   * ```
   */
  data: object;
  /**
   * Width of the chart, use 'Dimensions' library to get the width of your screen for responsive.
   */
  width: number;
  /**
   * Height of the chart.
   */
  height: number;
  /**
   * Show dots on the line - default: True.
   */
  withDots?: boolean;
  /**
   * Show shadow for line - default: True.
   */
  withShadow?: boolean;
  /**
   * Show inner dashed lines - default: True.
   */
  withInnerLines?: boolean;
  /**
   * Show outer dashed lines - default: True.
   */
  withOuterLines?: boolean;
  /**
   * Show vertical labels - default: True.
   */
  withVerticalLabels?: boolean;
  /**
   * Show horizontal labels - default: True.
   */
  withHorizontalLabels?: boolean;
  /**
   * Render charts from 0 not from the minimum value. - default: False.
   */
  fromZero?: boolean;
  /**
   * Prepend text to horizontal labels -- default: ''.
   */
  yAxisLabel?: string;
  /**
   * Append text to horizontal labels -- default: ''.
   */
  yAxisSuffix?: string;
  /**
   * Prepend text to vertical labels -- default: ''.
   */
  xAxisLabel?: string;
  /**
   * Configuration object for the chart, see example:
   *
   * ```javascript
   * const chartConfig = {
   *   backgroundGradientFrom: "#1E2923",
   *   backgroundGradientFromOpacity: 0,
   *   backgroundGradientTo: "#08130D",
   *   backgroundGradientToOpacity: 0.5,
   *   color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
   *   strokeWidth: 2, // optional, default 3
   *   barPercentage: 0.5
   * };
   * ```
   */
  chartConfig: ChartConfig;
  /**
   * This function takes a [whole bunch](https://github.com/indiespirit/react-native-chart-kit/blob/master/src/line-chart.js#L266)
   * of stuff and can render extra elements,
   * such as data point info or additional markup.
   */
  decorator?: Function;
  /**
   * Callback that takes as params: `{value, dataset, getColor}`.
   */
  onDataPointClick?: Function;
  /**
   * Style of the container view of the chart.
   */
  style?: object;
  /**
   * Add this prop to make the line chart smooth and curvy.
   *
   * [Example](https://github.com/indiespirit/react-native-chart-kit#bezier-line-chart)
   */
  bezier?: boolean;
  /**
   * Defines the dot color function that is used to calculate colors of dots in a line chart.
   * Takes `(dataPoint, dataPointIndex)` as arguments.
   */
  getDotColor?: (dataPoint: any, index: number) => string;
  /**
   * Rotation angle of the horizontal labels - default 0 (degrees).
   */
  horizontalLabelRotation?: number;
  /**
   * Rotation angle of the vertical labels - default 0 (degrees).
   */
  verticalLabelRotation?: number;
  /**
   * Offset for Y axis labels.
   */
  yLabelsOffset?: number;
  /**
   * Offset for X axis labels.
   */
  xLabelsOffset?: number;
  /**
   * Array of indices of the data points you don't want to display.
   */
  hidePointsAtIndex?: number[];
  /**
   * This function change the format of the display value of the Y label.
   * Takes the y value as argument and should return the desirable string.
   */
  formatYLabel?: (yValue: string) => string;
  /**
   * This function change the format of the display value of the X label.
   * Takes the X value as argument and should return the desirable string.
   */
  formatXLabel?: (xValue: string) => string;
  /**
   * Provide props for a data point dot.
   */
  getDotProps?: (dataPoint: any, index: number) => object;
}

export class LineChart extends React.Component<LineChartProps> {}

// ProgressChart
export interface ProgressChartProps {
  data: Array<number>;
  width: number;
  height: number;
  chartConfig: ChartConfig;
}

export class ProgressChart extends React.Component<ProgressChartProps> {}

// BarChart
export interface BarChartProps {
  data: object;
  width: number;
  height: number;
  fromZero?: boolean;
  withInnerLines?: boolean;
  yAxisLabel: string;
  yAxisSuffix: string;
  chartConfig: ChartConfig;
  style?: object;
  horizontalLabelRotation?: number;
  verticalLabelRotation?: number;
}

export class BarChart extends React.Component<BarChartProps> {}

// StackedBarChart
export interface StackedBarChartProps {
  data: object;
  width: number;
  height: number;
  chartConfig: ChartConfig;
  style?: object;
}

export class StackedBarChart extends React.Component<StackedBarChartProps> {}

// PieChart
export interface PieChartProps {
  data: Array<any>;
  width: number;
  height: number;
  chartConfig: ChartConfig;
  accessor: string;
  backgroundColor: string;
  paddingLeft: string;
  center?: Array<number>;
  absolute?: boolean;
  hasLegend?: boolean;
}

export class PieChart extends React.Component<PieChartProps> {}

// ContributionGraph
export interface ContributionGraphProps {
  values: Array<any>;
  endDate: Date;
  numDays: number;
  width: number;
  height: number;
  chartConfig: ChartConfig;
  accessor?: string;
}

export class ContributionGraph extends React.Component<
  ContributionGraphProps
> {}

// AbstractChart
export class AbstractChart extends React.Component {}

// ChartConfig
export interface ChartConfig {
  backgroundColor?: string;
  /**
   * Defines the first color in the linear gradient of a chart's background
   */
  backgroundGradientFrom?: string;
  /**
   * Defines the first color opacity in the linear gradient of a chart's background
   */
  backgroundGradientFromOpacity?: number;
  /**
   * Defines the second color in the linear gradient of a chart's background
   */
  backgroundGradientTo?: string;
  /**
   * Defines the second color opacity in the linear gradient of a chart's background
   */
  backgroundGradientToOpacity?: number;
  fillShadowGradient?: string;
  fillShadowGradientOpacity?: number;
  /**
   * Defines the base color function that is used to calculate colors of labels and sectors used in a chart
   */
  color: (opacity: number) => string;
  /**
   * Defines the base stroke width in a chart
   */
  strokeWidth?: number;
  /**
   * Defines the percent (0-1) of the available width each bar width in a chart
   */
  barPercentage?: number;
  /**
   * Override styles of the background lines, refer to react-native-svg's Line documentation
   */
  propsForBackgroundLines?: object;
  /**
   * Override styles of the labels, refer to react-native-svg's Text documentation
   */
  propsForLabels?: object;
  decimalPlaces?: number;
  style?: object;
}
