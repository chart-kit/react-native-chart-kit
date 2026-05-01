# Current API Inventory

Date: April 30, 2026

## Public Entrypoint

`src/index.ts` exports:

```ts
export {
  AbstractChart,
  BarChart,
  LineChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
};
```

There are no modern v2 composable exports yet.

## Shared Types

### Dataset

```ts
interface Dataset {
  data: number[];
  color?: (opacity: number) => string;
  colors?: Array<(opacity: number) => string>;
  strokeWidth?: number;
  withDots?: boolean;
  withScrollableDot?: boolean;
  key?: string | number;
  strokeDashArray?: number[] | string;
  strokeDashOffset?: number;
}
```

Notes:

- Runtime code has partial handling for `null` in line datasets, but the public `Dataset` type is `number[]`.
- `colors` is used by `BarChart` for per-bar custom colors.
- `strokeDashArray` and `strokeDashOffset` are line-specific but live in the shared dataset type.

### ChartData

```ts
interface ChartData {
  labels: string[];
  datasets: Dataset[];
}
```

### ChartConfig

Current keys:

```ts
interface ChartConfig {
  backgroundColor?: string;
  backgroundGradientFrom?: string;
  backgroundGradientFromOpacity?: number;
  backgroundGradientTo?: string;
  backgroundGradientToOpacity?: number;
  fillShadowGradient?: string;
  fillShadowGradientOpacity?: number;
  fillShadowGradientFrom?: string;
  fillShadowGradientFromOpacity?: number;
  fillShadowGradientFromOffset?: number;
  fillShadowGradientTo?: string;
  fillShadowGradientToOpacity?: number;
  fillShadowGradientToOffset?: number;
  useShadowColorFromDataset?: boolean;
  color?: (opacity: number, index?: number) => string;
  labelColor?: (opacity: number) => string;
  strokeWidth?: number;
  barPercentage?: number;
  barRadius?: number;
  propsForTopLabels?: TextProps;
  propsForBackgroundLines?: object;
  propsForLabels?: TextProps;
  propsForVerticalLabels?: TextProps;
  propsForHorizontalLabels?: TextProps;
  propsForDots?: CircleProps;
  decimalPlaces?: number;
  style?: Partial<ViewStyle>;
  linejoinType?: "miter" | "bevel" | "round";
  scrollableDotFill?: string;
  scrollableDotStrokeColor?: string;
  scrollableDotStrokeWidth?: number;
  scrollableDotRadius?: number;
  scrollableInfoViewStyle?: Partial<ViewStyle>;
  scrollableInfoTextStyle?: Partial<TextStyle>;
  scrollableInfoTextDecorator?: (value: number) => string;
  scrollableInfoOffset?: number;
  scrollableInfoSize?: Size;
}
```

Runtime expectation:

- Many code paths call `chartConfig.color(...)`, `backgroundGradientFrom`, or `backgroundGradientTo` as if present.
- Although some props are typed optional, practical usage requires a mostly complete `chartConfig`.

## AbstractChart Props

```ts
interface AbstractChartProps {
  fromZero?: boolean;
  fromNumber?: number;
  chartConfig?: AbstractChartConfig;
  yAxisLabel?: string;
  yAxisSuffix?: string;
  yLabelsOffset?: number;
  yAxisInterval?: number;
  xAxisLabel?: string;
  xLabelsOffset?: number;
  hidePointsAtIndex?: number[];
}
```

`AbstractChartConfig` extends `ChartConfig` with internal render parameters and formatter hooks:

```ts
interface AbstractChartConfig extends ChartConfig {
  count?: number;
  data?: Dataset[];
  width?: number;
  height?: number;
  paddingTop?: number;
  paddingRight?: number;
  horizontalLabelRotation?: number;
  formatYLabel?: (yLabel: string) => string;
  labels?: string[];
  horizontalOffset?: number;
  xAxisIntervalCount?: number;
  stackedBar?: boolean;
  verticalLabelRotation?: number;
  formatXLabel?: (xLabel: string) => string;
  verticalLabelsHeightPercentage?: number;
  formatTopBarValue?: (topBarValue: number) => string | number;
}
```

## LineChart

### Data Shape

```ts
interface LineChartData extends ChartData {
  legend?: string[];
}
```

### Props

```ts
interface LineChartProps extends AbstractChartProps {
  data: LineChartData;
  width: number;
  height: number;
  withDots?: boolean;
  withShadow?: boolean;
  withScrollableDot?: boolean;
  withInnerLines?: boolean;
  withOuterLines?: boolean;
  withVerticalLines?: boolean;
  withHorizontalLines?: boolean;
  withVerticalLabels?: boolean;
  withHorizontalLabels?: boolean;
  fromZero?: boolean;
  yAxisLabel?: string;
  yAxisSuffix?: string;
  xAxisLabel?: string;
  chartConfig?: AbstractChartConfig;
  yAxisInterval?: number;
  transparent?: boolean;
  decorator?: Function;
  onDataPointClick?: (data: {
    index: number;
    value: number;
    dataset: Dataset;
    x: number;
    y: number;
    getColor: (opacity: number) => string;
  }) => void;
  style?: Partial<ViewStyle>;
  bezier?: boolean;
  getDotColor?: (dataPoint: any, index: number) => string;
  renderDotContent?: (params: {
    x: number;
    y: number;
    index: number;
    indexData: number;
  }) => React.ReactNode;
  horizontalLabelRotation?: number;
  verticalLabelRotation?: number;
  yLabelsOffset?: number;
  xLabelsOffset?: number;
  hidePointsAtIndex?: number[];
  formatYLabel?: (yValue: string) => string;
  formatXLabel?: (xValue: string) => string;
  getDotProps?: (dataPoint: any, index: number) => object;
  segments?: number;
}
```

### Behavior Notes

- Supports multiple datasets.
- Uses the longest dataset length to align x positions.
- Filters invalid values for domain calculations through `getValidData`.
- Linear line rendering treats `null` as the previous point coordinate. Bezier rendering does not have equivalent explicit null segmentation.
- Dots receive an invisible touch target and support `onDataPointClick`.
- `withScrollableDot` overlays a horizontal `ScrollView` and animated dot, using scrollable configuration from `chartConfig`.
- Legend placement is fixed at the top of the chart area when `data.legend` exists.
- Layout uses fixed padding defaults from `style.paddingTop` and `style.paddingRight`.

## BarChart

### Data Shape

Uses `ChartData`; only `data.datasets[0].data` is rendered.

### Props

```ts
interface BarChartProps extends AbstractChartProps {
  data: ChartData;
  width: number;
  height: number;
  fromZero?: boolean;
  withInnerLines?: boolean;
  yAxisLabel: string;
  yAxisSuffix: string;
  chartConfig: AbstractChartConfig;
  style?: Partial<ViewStyle>;
  horizontalLabelRotation?: number;
  verticalLabelRotation?: number;
  withVerticalLabels?: boolean;
  withHorizontalLabels?: boolean;
  segments?: number;
  showBarTops?: boolean;
  showValuesOnTopOfBars?: boolean;
  withCustomBarColorFromData?: boolean;
  flatColor?: boolean;
}
```

### Behavior Notes

- Renders vertical bars only.
- Supports negative values through shared base-height calculation.
- Supports custom per-bar colors through `datasets[0].colors`.
- `chartConfig.barPercentage` controls bar width.
- `chartConfig.barRadius` controls corner radius.
- `chartConfig.formatTopBarValue` controls top labels.
- Does not support grouped bars, stacked bars, tooltips, or press events.

## StackedBarChart

### Data Shape

```ts
interface StackedBarChartData {
  labels: string[];
  legend: string[];
  data: number[][];
  barColors: string[];
}
```

### Props

```ts
interface StackedBarChartProps extends AbstractChartProps {
  data: StackedBarChartData;
  width: number;
  height: number;
  chartConfig: AbstractChartConfig;
  hideLegend: boolean;
  style?: Partial<ViewStyle>;
  barPercentage?: number;
  decimalPlaces?: number;
  withVerticalLabels?: boolean;
  withHorizontalLabels?: boolean;
  segments?: number;
  percentile?: boolean;
  verticalLabelsHeightPercentage?: number;
  formatYLabel?: (yLabel: string) => string;
}
```

### Behavior Notes

- Uses `chartConfig.barPercentage`; the component prop `barPercentage` is typed but not the primary implementation path.
- Supports percentile mode by normalizing stack height to 100.
- Legend placement is fixed inside the right side of the SVG.
- Stack labels are hidden when `hideLegend` is true.

## PieChart

### Data Shape

The type is `Array<any>`. README examples use:

```ts
type LegacyPieDataItem = {
  name: string;
  population: number;
  color: string;
  legendFontColor?: string;
  legendFontSize?: number;
  legendFontFamily?: string;
};
```

### Props

```ts
interface PieChartProps extends AbstractChartProps {
  data: Array<any>;
  width: number;
  height: number;
  accessor: string;
  backgroundColor: string;
  paddingLeft: string;
  center?: Array<number>;
  absolute?: boolean;
  hasLegend?: boolean;
  style?: Partial<ViewStyle>;
  avoidFalseZero?: boolean;
}
```

### Behavior Notes

- Uses `paths-js/pie`.
- The legend is right-side and fixed inside the SVG.
- `absolute` switches labels from percentages to raw values.
- `avoidFalseZero` renders `<1%` for tiny non-zero slices that round to 0%.
- No slice press events or custom legend placement are exposed.

## ProgressChart

### Data Shape

```ts
type ProgressChartData =
  | Array<number>
  | { labels?: Array<string>; colors?: Array<string>; data: Array<number> };
```

### Props

```ts
interface ProgressChartProps extends AbstractChartProps {
  data: ProgressChartData;
  width: number;
  height: number;
  center?: Array<number>;
  absolute?: boolean;
  hasLegend?: boolean;
  style?: Partial<ViewStyle>;
  chartConfig?: AbstractChartConfig;
  hideLegend?: boolean;
  strokeWidth?: number;
  radius?: number;
  withCustomBarColorFromData?: boolean;
}
```

### Behavior Notes

- Supports array shorthand and object data.
- Defaults: `style: {}`, `strokeWidth: 16`, `radius: 32`.
- Uses `paths-js/pie` to draw ring arcs.
- Supports optional labels and custom colors.
- Values are not explicitly clamped or warned when outside `0..1`.

## ContributionGraph

### Data Shape

The component accepts `values: Array<any>` with an accessor defaulting to `count`. README examples use:

```ts
type LegacyContributionValue = {
  date: string | Date;
  count: number;
};
```

### Props

```ts
interface ContributionGraphProps extends AbstractChartProps {
  values: Array<any>;
  endDate: Date;
  numDays: number;
  width: number;
  height: number;
  gutterSize?: number;
  squareSize?: number;
  horizontal?: boolean;
  showMonthLabels?: boolean;
  showOutOfRangeDays?: boolean;
  accessor?: string;
  getMonthLabel?: (monthIndex: number) => string;
  onDayPress?: (value: { count: number; date: Date }) => void;
  classForValue?: (value: string) => string;
  style?: Partial<ViewStyle>;
  titleForValue?: (value: ContributionChartValue) => string;
  tooltipDataAttrs: TooltipDataAttrs;
}
```

### Behavior Notes

- Defaults include `numDays: 200`, `endDate: new Date()`, `gutterSize: 1`, `squareSize: 20`, `horizontal: true`, `showMonthLabels: true`, `showOutOfRangeDays: false`, `accessor: "count"`, and `style: {}`.
- Dates are normalized through local `date.ts` helpers.
- Color opacity is mapped from min/max values with `chartConfig.color`.
- Supports `onDayPress`.
- `classForValue` is typed/defaulted but not used as an SVG class in the current implementation.
- `tooltipDataAttrs` is required by the type but default behavior can be provided by callers.

## README-Documented Public Props Not Fully Reflected In Types

- README says Pie uses `bgColor`, but current prop name is `backgroundColor`.
- README lists `barPercentage` as a `StackedBarChart` prop, while implementation reads `chartConfig.barPercentage`.
- README marks some `chartConfig` keys as optional, while runtime code commonly expects `chartConfig.color`, `backgroundGradientFrom`, and `backgroundGradientTo`.

## Current Public Surface Summary

Level of current implementation:

- Legacy component API: present.
- Modern easy API: absent.
- Modern composable API: absent.
- Compatibility facade: current root exports are effectively the facade, but they are not separated into a `compat` module.
- Renderer abstraction: absent.
- Pro API: absent.
