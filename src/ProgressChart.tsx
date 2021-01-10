import Pie from "paths-js/pie";
import React from "react";
import { View, ViewStyle } from "react-native";
import { G, Path, Rect, Svg, Text } from "react-native-svg";

import AbstractChart, {
  AbstractChartConfig,
  AbstractChartProps
} from "./AbstractChart";

export type ProgressChartData =
  | Array<number>
  | { labels?: Array<string>; colors?: Array<string>; data: Array<number> };

export interface ProgressChartProps extends AbstractChartProps {
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

type ProgressChartState = {};

class ProgressChart extends AbstractChart<
  ProgressChartProps,
  ProgressChartState
> {
  public static defaultProps = { style: {}, strokeWidth: 16, radius: 32 };

  render() {
    let {
      width,
      height,
      style,
      data,
      hideLegend,
      strokeWidth,
      radius
    } = this.props;

    const { borderRadius = 0, margin = 0, marginRight = 0 } = style;

    if (Array.isArray(data)) {
      data = {
        data
      };
    }

    const pies = data.data.map((pieData, i) => {
      const r =
        ((height / 2 - 32) /
          (Array.isArray(data) ? data.length : data.data.length)) *
          i +
        radius;

      return Pie({
        r,
        R: r,
        center: [0, 0],
        data: [pieData, 1 - pieData],
        accessor(x: string) {
          return x;
        }
      });
    });

    const pieBackgrounds = data.data.map((pieData, i) => {
      const r =
        ((height / 2 - 32) /
          (Array.isArray(data) ? data.length : data.data.length)) *
          i +
        radius;
      return Pie({
        r,
        R: r,
        center: [0, 0],
        data: [0.999, 0.001],
        accessor(x: string) {
          return x;
        }
      });
    });

    const withLabel = (i: number) =>
      (data as any).labels && (data as any).labels[i];

    const withColor = (i: number) =>
      (data as any).colors && (data as any).colors[i];

    const legend = !hideLegend && (
      <>
        <G>
          {pies.map((_, i) => {
            return (
              <Rect
                key={Math.random()}
                width="16px"
                height="16px"
                fill={
                  this.props.withCustomBarColorFromData
                    ? withColor(i)
                    : this.props.chartConfig.color(0.2 * (i + 1), i)
                }
                rx={8}
                ry={8}
                x={this.props.width / 2.5 - 24}
                y={
                  -(this.props.height / 2.5) +
                  ((this.props.height * 0.8) /
                    (Array.isArray(data) ? data.length : data.data.length)) *
                    i +
                  12
                }
              />
            );
          })}
        </G>
        <G>
          {pies.map((_, i) => {
            return (
              <Text
                key={Math.random()}
                x={this.props.width / 2.5}
                y={
                  -(this.props.height / 2.5) +
                  ((this.props.height * 0.8) /
                    (Array.isArray(data) ? data.length : data.data.length)) *
                    i +
                  12 * 2
                }
                {...this.getPropsForLabels()}
              >
                {withLabel(i)
                  ? `${(data as any).labels[i]} ${Math.round(
                      100 * (data as any).data[i]
                    )}%`
                  : `${Math.round(100 * (data as any).data[i])}%`}
              </Text>
            );
          })}
        </G>
      </>
    );

    return (
      <View
        style={{
          width,
          height,
          padding: 0,
          ...style
        }}
      >
        <Svg
          width={width - (margin as number) * 2 - (marginRight as number)}
          height={height}
        >
          {this.renderDefs({
            width: this.props.height,
            height: this.props.height,
            ...this.props.chartConfig
          })}
          <Rect
            width="100%"
            height={this.props.height}
            rx={borderRadius}
            ry={borderRadius}
            fill="url(#backgroundGradient)"
          />
          <G
            x={this.props.width / (hideLegend ? 2 : 2.5)}
            y={this.props.height / 2}
          >
            <G>
              {pieBackgrounds.map((pie, i) => {
                return (
                  <Path
                    key={Math.random()}
                    d={pie.curves[0].sector.path.print()}
                    strokeWidth={strokeWidth}
                    stroke={this.props.chartConfig.color(0.2, i)}
                  />
                );
              })}
            </G>
            <G>
              {pies.map((pie, i) => {
                return (
                  <Path
                    key={Math.random()}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={pie.curves[0].sector.path.print()}
                    strokeWidth={strokeWidth}
                    stroke={
                      this.props.withCustomBarColorFromData
                        ? withColor(i)
                        : this.props.chartConfig.color(
                            (i / pies.length) * 0.5 + 0.5,
                            i
                          )
                    }
                  />
                );
              })}
            </G>
            {legend}
          </G>
        </Svg>
      </View>
    );
  }
}

export default ProgressChart;
