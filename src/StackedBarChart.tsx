import React from "react";
import { View, ViewStyle } from "react-native";
import { G, Rect, Svg, Text } from "react-native-svg";

import AbstractChart, {
  AbstractChartConfig,
  AbstractChartProps,
  DEFAULT_X_LABELS_HEIGHT_PERCENTAGE
} from "./AbstractChart";

export interface StackedBarChartData {
  labels: string[];
  legend: string[];
  data: number[][];
  barColors: string[];
}

export interface StackedBarChartProps extends AbstractChartProps {
  /**
   * E.g.
   * ```javascript
   * const data = {
   *   labels: ["Test1", "Test2"],
   *   legend: ["L1", "L2", "L3"],
   *   data: [[60, 60, 60], [30, 30, 60]],
   *   barColors: ["#dfe4ea", "#ced6e0", "#a4b0be"]
   * };
   * ```
   */
  data: StackedBarChartData;
  width: number;
  height: number;
  chartConfig: AbstractChartConfig;
  hideLegend: boolean;
  style?: Partial<ViewStyle>;
  barPercentage?: number;
  decimalPlaces?: number;
  /**
   * Show vertical labels - default: True.
   */
  withVerticalLabels?: boolean;
  /**
   * Show horizontal labels - default: True.
   */
  withHorizontalLabels?: boolean;
  /**
   * The number of horizontal lines
   */
  segments?: number;

  percentile?: boolean;

  /**
   * Percentage of the chart height, dedicated to vertical labels
   * (space below chart)
   */
  verticalLabelsHeightPercentage?: number;

  formatYLabel?: (yLabel: string) => string;
}

type StackedBarChartState = {};

class StackedBarChart extends AbstractChart<
  StackedBarChartProps,
  StackedBarChartState
> {
  getBarPercentage = () => {
    const { barPercentage = 1 } = this.props.chartConfig;
    return barPercentage;
  };

  getBarRadius = (ret: string | any[], x: string | any[]) => {
    return this.props.chartConfig.barRadius && ret.length === x.length - 1
      ? this.props.chartConfig.barRadius
      : 0;
  };

  renderBars = ({
    data,
    width,
    height,
    paddingTop,
    paddingRight,
    border,
    colors,
    stackedBar = false,
    verticalLabelsHeightPercentage
  }: Pick<
    Omit<AbstractChartConfig, "data">,
    | "width"
    | "height"
    | "paddingRight"
    | "paddingTop"
    | "stackedBar"
    | "verticalLabelsHeightPercentage"
  > & {
    border: number;
    colors: string[];
    data: number[][];
  }) =>
    data.map((x, i) => {
      const barWidth = 32 * this.getBarPercentage();
      const ret = [];
      let h = 0;
      let st = paddingTop;

      let fac = 1;
      if (stackedBar) {
        fac = 0.7;
      }
      const sum = this.props.percentile ? x.reduce((a, b) => a + b, 0) : border;
      const barsAreaHeight = height * verticalLabelsHeightPercentage;
      for (let z = 0; z < x.length; z++) {
        h = barsAreaHeight * (x[z] / sum);
        const y = barsAreaHeight - h + st;
        const xC =
          (paddingRight +
            (i * (width - paddingRight)) / data.length +
            barWidth / 2) *
          fac;

        ret.push(
          <Rect
            key={Math.random()}
            x={xC}
            y={y}
            rx={this.getBarRadius(ret, x)}
            ry={this.getBarRadius(ret, x)}
            width={barWidth}
            height={h}
            fill={colors[z]}
          />
        );

        if (!this.props.hideLegend) {
          ret.push(
            <Text
              key={Math.random()}
              x={xC + 7 + barWidth / 2}
              textAnchor="end"
              y={h > 15 ? y + 15 : y + 7}
              {...this.getPropsForLabels()}
            >
              {x[z]}
            </Text>
          );
        }

        st -= h;
      }

      return ret;
    });

  renderLegend = ({
    legend,
    colors,
    width,
    height
  }: Pick<AbstractChartConfig, "width" | "height"> & {
    legend: string[];
    colors: string[];
  }) =>
    legend.map((x, i) => {
      return (
        <G key={Math.random()}>
          <Rect
            width="16px"
            height="16px"
            fill={colors[i]}
            rx={8}
            ry={8}
            x={width * 0.71}
            y={height * 0.7 - i * 50}
          />
          <Text
            x={width * 0.78}
            y={height * 0.76 - i * 50}
            {...this.getPropsForLabels()}
          >
            {x}
          </Text>
        </G>
      );
    });

  render() {
    const paddingTop = 15;
    const paddingRight = 50;
    const barWidth = 32 * this.getBarPercentage();

    const {
      width,
      height,
      style = {},
      data,
      withHorizontalLabels = true,
      withVerticalLabels = true,
      segments = 4,
      decimalPlaces,
      percentile = false,
      verticalLabelsHeightPercentage = DEFAULT_X_LABELS_HEIGHT_PERCENTAGE,
      formatYLabel = (yLabel: string) => {
        return yLabel;
      },
      hideLegend = false
    } = this.props;

    const { borderRadius = 0 } = style;
    const config = {
      width,
      height
    };

    let border = 0;

    let max = 0;
    for (let i = 0; i < data.data.length; i++) {
      const actual = data.data[i].reduce((pv, cv) => pv + cv, 0);
      if (actual > max) {
        max = actual;
      }
    }

    if (percentile) {
      border = 100;
    } else {
      border = max;
    }

    const showLegend = !hideLegend && data.legend && data.legend.length != 0;
    const stackedBar = showLegend;

    return (
      <View style={style}>
        <Svg height={height} width={width}>
          {this.renderDefs({
            ...config,
            ...this.props.chartConfig
          })}
          <Rect
            width="100%"
            height={height}
            rx={borderRadius}
            ry={borderRadius}
            fill="url(#backgroundGradient)"
          />
          <G>
            {this.renderHorizontalLines({
              ...config,
              count: segments,
              paddingTop,
              verticalLabelsHeightPercentage
            })}
          </G>
          <G>
            {withHorizontalLabels
              ? this.renderHorizontalLabels({
                  ...config,
                  count: segments,
                  data: [0, border],
                  paddingTop,
                  paddingRight,
                  decimalPlaces,
                  verticalLabelsHeightPercentage,
                  formatYLabel
                })
              : null}
          </G>
          <G>
            {withVerticalLabels
              ? this.renderVerticalLabels({
                  ...config,
                  labels: data.labels,
                  paddingRight: paddingRight + 28,
                  stackedBar,
                  paddingTop,
                  horizontalOffset: barWidth,
                  verticalLabelsHeightPercentage
                })
              : null}
          </G>
          <G>
            {this.renderBars({
              ...config,
              data: data.data,
              border,
              colors: this.props.data.barColors,
              paddingTop,
              paddingRight: paddingRight + 20,
              stackedBar,
              verticalLabelsHeightPercentage
            })}
          </G>
          {showLegend &&
            this.renderLegend({
              ...config,
              legend: data.legend,
              colors: this.props.data.barColors
            })}
        </Svg>
      </View>
    );
  }
}

export default StackedBarChart;
