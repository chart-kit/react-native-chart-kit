import _ from "lodash";
import React from "react";
import { View } from "react-native";
import { G, Rect, RectProps, Svg, Text } from "react-native-svg";

import AbstractChart from "../AbstractChart";
import { mapValue } from "../Utils";
import {
  convertToDate,
  getBeginningTimeForDate,
  shiftDate
} from "./DateHelpers";
import {
  DAYS_IN_WEEK,
  MILLISECONDS_IN_ONE_DAY,
  MONTH_LABELS
} from "./constants";
import { ContributionGraphProps, ContributionGraphState } from ".";

const SQUARE_SIZE = 20;
const MONTH_LABEL_GUTTER_SIZE = 8;
const paddingLeft = 32;

export type ContributionChartValue = {
  value: number;
  title: string;
  tooltipDataAttrs: TooltipDataAttrs;
  date: Date;
};

export type TooltipDataAttrs = (
  value: ContributionChartValue
) => Partial<RectProps> | Partial<RectProps>;

class ContributionGraph extends AbstractChart<
  ContributionGraphProps,
  ContributionGraphState
> {
  constructor(props: ContributionGraphProps) {
    super(props);

    let { maxValue, minValue, valueCache } = this.getValueCache(props.values);

    this.state = {
      maxValue,
      minValue,
      valueCache
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: ContributionGraphProps) {
    let { maxValue, minValue, valueCache } = this.getValueCache(
      nextProps.values
    );

    this.setState({
      maxValue,
      minValue,
      valueCache
    });
  }

  getSquareSizeWithGutter() {
    return (this.props.squareSize || SQUARE_SIZE) + this.props.gutterSize;
  }

  getMonthLabelSize() {
    let { squareSize = SQUARE_SIZE } = this.props;
    if (!this.props.showMonthLabels) {
      return 0;
    }
    if (this.props.horizontal) {
      return squareSize + MONTH_LABEL_GUTTER_SIZE;
    }
    return 2 * (squareSize + MONTH_LABEL_GUTTER_SIZE);
  }

  getStartDate() {
    return shiftDate(this.getEndDate(), -this.props.numDays + 1); // +1 because endDate is inclusive
  }

  getEndDate() {
    return getBeginningTimeForDate(convertToDate(this.props.endDate));
  }

  getStartDateWithEmptyDays() {
    return shiftDate(this.getStartDate(), -this.getNumEmptyDaysAtStart());
  }

  getNumEmptyDaysAtStart() {
    return this.getStartDate().getDay();
  }

  getNumEmptyDaysAtEnd() {
    return DAYS_IN_WEEK - 1 - this.getEndDate().getDay();
  }

  getWeekCount() {
    const numDaysRoundedToWeek =
      this.props.numDays +
      this.getNumEmptyDaysAtStart() +
      this.getNumEmptyDaysAtEnd();
    return Math.ceil(numDaysRoundedToWeek / DAYS_IN_WEEK);
  }

  getWeekWidth() {
    return DAYS_IN_WEEK * this.getSquareSizeWithGutter();
  }

  getWidth() {
    return (
      this.getWeekCount() * this.getSquareSizeWithGutter() -
      this.props.gutterSize
    );
  }

  getHeight() {
    return (
      this.getWeekWidth() + (this.getMonthLabelSize() - this.props.gutterSize)
    );
  }

  getValueCache(values: ContributionChartValue[]) {
    let minValue = Infinity,
      maxValue = -Infinity;

    return {
      valueCache: values.reduce((memo, value) => {
        const date = convertToDate(value.date);

        const index = Math.floor(
          (date.valueOf() - this.getStartDateWithEmptyDays().valueOf()) /
            MILLISECONDS_IN_ONE_DAY
        );

        minValue = Math.min(value[this.props.accessor], minValue);
        maxValue = Math.max(value[this.props.accessor], maxValue);

        memo[index] = {
          value,
          title: this.props.titleForValue
            ? this.props.titleForValue(value)
            : null,
          tooltipDataAttrs: this.getTooltipDataAttrsForValue(value)
        };

        return memo;
      }, {}),
      minValue,
      maxValue
    };
  }

  getValueForIndex(index: number) {
    if (this.state.valueCache[index]) {
      return this.state.valueCache[index].value;
    }
    return null;
  }

  getClassNameForIndex(index: number) {
    if (this.state.valueCache[index]) {
      if (this.state.valueCache[index].value) {
        const count = this.state.valueCache[index].value[this.props.accessor];

        if (count) {
          const opacity = mapValue(
            count,
            this.state.minValue,
            this.state.maxValue,
            0.15 + 0.05, // + 0.05 to make smaller values a bit more visible
            1
          );

          return this.props.chartConfig.color(opacity);
        }
      }
    }

    return this.props.chartConfig.color(0.15);
  }

  getTitleForIndex(index: number) {
    if (this.state.valueCache[index]) {
      return this.state.valueCache[index].title;
    }

    return this.props.titleForValue ? this.props.titleForValue(null) : null;
  }

  getTooltipDataAttrsForIndex(index: number) {
    if (this.state.valueCache[index]) {
      return this.state.valueCache[index].tooltipDataAttrs;
    }

    return this.getTooltipDataAttrsForValue({
      date: null,
      [this.props.accessor]: null
    } as ContributionChartValue);
  }

  getTooltipDataAttrsForValue(value: ContributionChartValue) {
    const { tooltipDataAttrs } = this.props;

    if (typeof tooltipDataAttrs === "function") {
      return tooltipDataAttrs(value);
    }

    return tooltipDataAttrs;
  }

  getTransformForWeek(weekIndex: number) {
    if (this.props.horizontal) {
      return [weekIndex * this.getSquareSizeWithGutter(), 50];
    }
    return [10, weekIndex * this.getSquareSizeWithGutter()];
  }

  getTransformForMonthLabels() {
    if (this.props.horizontal) {
      return null;
    }
    return `${this.getWeekWidth() + MONTH_LABEL_GUTTER_SIZE}, 0`;
  }

  getTransformForAllWeeks() {
    if (this.props.horizontal) {
      return `0, ${this.getMonthLabelSize() - 100}`;
    }
    return null;
  }

  getViewBox() {
    if (this.props.horizontal) {
      return `${this.getWidth()} ${this.getHeight()}`;
    }
    return `${this.getHeight()} ${this.getWidth()}`;
  }

  getSquareCoordinates(dayIndex: number) {
    if (this.props.horizontal) {
      return [0, dayIndex * this.getSquareSizeWithGutter()];
    }
    return [dayIndex * this.getSquareSizeWithGutter(), 0];
  }

  getMonthLabelCoordinates(weekIndex: number) {
    if (this.props.horizontal) {
      return [
        weekIndex * this.getSquareSizeWithGutter(),
        this.getMonthLabelSize() - MONTH_LABEL_GUTTER_SIZE
      ];
    }
    const verticalOffset = -2;
    return [
      0,
      (weekIndex + 1) * this.getSquareSizeWithGutter() + verticalOffset
    ];
  }

  renderSquare(dayIndex: number, index: number) {
    const indexOutOfRange =
      index < this.getNumEmptyDaysAtStart() ||
      index >= this.getNumEmptyDaysAtStart() + this.props.numDays;

    if (indexOutOfRange && !this.props.showOutOfRangeDays) {
      return null;
    }

    const [x, y] = this.getSquareCoordinates(dayIndex);
    const { squareSize = SQUARE_SIZE } = this.props;

    return (
      <Rect
        key={index}
        width={squareSize}
        height={squareSize}
        x={x + paddingLeft}
        y={y}
        title={this.getTitleForIndex(index)}
        fill={this.getClassNameForIndex(index)}
        onPress={() => {
          this.handleDayPress(index);
        }}
        {...this.getTooltipDataAttrsForIndex(index)}
      />
    );
  }

  handleDayPress(index: number) {
    if (!this.props.onDayPress) {
      return;
    }

    this.props.onDayPress(
      this.state.valueCache[index] && this.state.valueCache[index].value
        ? this.state.valueCache[index].value
        : {
            [this.props.accessor]: 0,
            date: new Date(
              this.getStartDate().valueOf() + index * MILLISECONDS_IN_ONE_DAY
            )
          }
    );
  }

  renderWeek(weekIndex: number) {
    const [x, y] = this.getTransformForWeek(weekIndex);
    return (
      <G key={weekIndex} x={x} y={y}>
        {_.range(DAYS_IN_WEEK).map(dayIndex =>
          this.renderSquare(dayIndex, weekIndex * DAYS_IN_WEEK + dayIndex)
        )}
      </G>
    );
  }

  renderAllWeeks() {
    return _.range(this.getWeekCount()).map(weekIndex =>
      this.renderWeek(weekIndex)
    );
  }

  renderMonthLabels() {
    if (!this.props.showMonthLabels) {
      return null;
    }

    const weekRange = _.range(this.getWeekCount() - 1); // don't render for last week, because label will be cut off

    return weekRange.map(weekIndex => {
      const endOfWeek = shiftDate(
        this.getStartDateWithEmptyDays(),
        (weekIndex + 1) * DAYS_IN_WEEK
      );

      const [x, y] = this.getMonthLabelCoordinates(weekIndex);

      return endOfWeek.getDate() >= 1 && endOfWeek.getDate() <= DAYS_IN_WEEK ? (
        <Text
          key={weekIndex}
          x={x + paddingLeft}
          y={y + 8}
          {...this.getPropsForLabels()}
        >
          {this.props.getMonthLabel
            ? this.props.getMonthLabel(endOfWeek.getMonth())
            : MONTH_LABELS[endOfWeek.getMonth()]}
        </Text>
      ) : null;
    });
  }

  public static defaultProps = {
    numDays: 200,
    endDate: new Date(),
    gutterSize: 1,
    squareSize: SQUARE_SIZE,
    horizontal: true,
    showMonthLabels: true,
    showOutOfRangeDays: false,
    accessor: "count",
    classForValue: value => (value ? "black" : "#8cc665"),
    style: {}
  };

  render() {
    const { style } = this.props;

    let { borderRadius = 0 } = style;

    if (!borderRadius && this.props.chartConfig.style) {
      const stupidXo = this.props.chartConfig.style.borderRadius;
      borderRadius = stupidXo;
    }

    return (
      <View style={style}>
        <Svg height={this.props.height} width={this.props.width}>
          {this.renderDefs({
            width: this.props.width,
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
          <G>{this.renderMonthLabels()}</G>
          <G>{this.renderAllWeeks()}</G>
        </Svg>
      </View>
    );
  }
}

export default ContributionGraph;
