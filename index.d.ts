// Type definitions for ReactNativeChartKit 2.6
// Project: https://github.com/indiespirit/react-native-chart-kit
// TypeScript Version: 3.0

import * as React from 'react'

// LineChart
export interface LineChartProps {
  data: object
  width: number
  height: number
  withDots?: boolean
  withShadow?: boolean
  withInnerLines?: boolean
  withOuterLines?: boolean
  fromZero?: boolean
  yAxisLabel?: string
  chartConfig: object
  decorator?: Function
  onDataPointClick?: Function
  style?: object
  bezier?: boolean
}

export class LineChart extends React.Component<LineChartProps> {}

// ProgressChart
export interface ProgressChartProps {
  data: Array<number>
  width: number
  height: number
  chartConfig: object
}

export class ProgressChart extends React.Component<ProgressChartProps> {}

// BarChart
export interface BarChartProps {
  data: object
  width: number
  height: number
  fromZero?: boolean
  yAxisLabel: string
  chartConfig: object
  style?: object
}

export class BarChart extends React.Component<BarChartProps> {}

// StackedBarChart
export interface StackedBarChartProps {
  data: object
  width: number
  height: number
  chartConfig: object
  style?: object
}

export class StackedBarChart extends React.Component<StackedBarChartProps> {}

// PieChart
export interface PieChartProps {
  data: Array<any>
  width: number
  height: number
  chartConfig: object
  accessor: string
  backgroundColor: string
  paddingLeft: string
  center?: Array<number>
  absolute?: boolean
}

export class PieChart extends React.Component<PieChartProps> {}

// ContributionGraph
export interface ContributionGraphProps {
  values: Array<any>
  endDate: Date
  numDays: number
  width: number
  height: number
  chartConfig: object
  accessor?: string
}

export class ContributionGraph extends React.Component<ContributionGraphProps> {}

// AbstractChart
export class AbstractChart extends React.Component {}
