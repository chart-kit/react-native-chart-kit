// Type definitions for ReactNativeChartKit 2.6
// Project: https://github.com/indiespirit/react-native-chart-kit
// TypeScript Version: 3.0

import * as React from "react";

// LineChart
export interface LineChartProps {
  data: object;
  width: number;
  height: number;
  withDots?: boolean;
  withShadow?: boolean;
  withInnerLines?: boolean;
  withOuterLines?: boolean;
  fromZero?: boolean;
  yAxisLabel?: string;
  yAxisSuffix?: string;
  xAxisLabel?: string;
  chartConfig: ChartConfig;
  decorator?: Function;
  onDataPointClick?: Function;
  style?: object;
  bezier?: boolean;
  getDotColor?: (dataPoint: any, index: number) => string;
  horizontalLabelRotation?: number;
  verticalLabelRotation?: number;
  yLabelsOffset?: number;
  xLabelsOffset?: number;
  hidePointsAtIndex?: number[];
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
