import { TextStyle, ViewStyle } from "react-native";
import { CircleProps, TextProps } from "react-native-svg";

export interface Dataset {
  /** The data corresponding to the x-axis label. */
  data: number[];

  /** A function returning the color of the stroke given an input opacity value. */
  color?: (opacity: number) => string;

  /** A function returning array of the colors of the stroke given an input opacity value for each data value. */
  colors?: Array<(opacity: number) => string>;

  /** The width of the stroke. Defaults to 2. */
  strokeWidth?: number;

  /** A boolean indicating whether to render dots for this line */
  withDots?: boolean;

  /** Override of LineChart's withScrollableDot property just for this dataset */
  withScrollableDot?: boolean;

  /** Unique key **/
  key?: string | number;

  /** Stroke Dash Array */
  strokeDashArray?: number[];

  /** Stroke Dash Offset */
  strokeDashOffset?: number;
}

export interface ChartData {
  /** The x-axis labels */
  labels: string[];
  datasets: Dataset[];
}

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
   * Defines the option to use color from dataset to each chart data
   */
  useShadowColorFromDataset?: boolean;
  /**
   * Defines the base color function that is used to calculate colors of labels and sectors used in a chart
   */
  color?: (opacity: number, index?: number) => string;
  /**
   * Defines the function that is used to calculate the color of the labels used in a chart.
   */
  labelColor?: (opacity: number) => string;
  /**
   * Defines the base stroke width in a chart
   */
  strokeWidth?: number;
  /**
   * Defines the percent (0-1) of the available width each bar width in a chart
   */
  barPercentage?: number;
  barRadius?: number;
  /**
   * Override styles of the background lines, refer to react-native-svg's Line documentation
   */
  propsForBackgroundLines?: object;
  /**
   * Override styles of the labels, refer to react-native-svg's Text documentation
   */
  propsForLabels?: TextProps;
  /**
   * Override styles of vertical labels, refer to react-native-svg's Text documentation
   */
  propsForVerticalLabels?: TextProps;

  /**
   * Override styles of horizontal labels, refer to react-native-svg's Text documentation
   */
  propsForHorizontalLabels?: TextProps;
  /**
   * Override styles of the dots, refer to react-native-svg's Text documentation
   */
  propsForDots?: CircleProps;
  decimalPlaces?: number;
  style?: Partial<ViewStyle>;

  /**
   * Define stroke line join type
   */
  linejoinType?: "miter" | "bevel" | "round";

  /**
   * Define fill color for scrollable dot
   */
  scrollableDotFill?: string;

  /**
   * Define stroke color for scrollable dot
   */
  scrollableDotStrokeColor?: string;

  /**
   * Define stroke width for scrollable dot
   */
  scrollableDotStrokeWidth?: number;

  /**
   * Define radius for scrollable dot
   */
  scrollableDotRadius?: number;

  /**
   * Override style for additional info view upper scrollable dot
   */
  scrollableInfoViewStyle?: Partial<ViewStyle>;

  /**
   * Override text style for additional info view upper scrollable dot
   */
  scrollableInfoTextStyle?: Partial<TextStyle>;
  scrollableInfoTextDecorator?: (value: number) => string;

  /**
   * Set Info View offset
   */
  scrollableInfoOffset?: number;

  /**
   * Set Info View size
   */
  scrollableInfoSize?: Size;
}

export interface Size {
  width: number;
  height: number;
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
