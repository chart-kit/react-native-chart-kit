import { G, Path, Rect } from "react-native-svg";
import type {
  LineChartRangeSelectorHandleRenderProps,
  LineChartRangeSelectorLineRenderProps
} from "react-native-chart-kit/v2";

export type RangeSelectorRendererPalette = {
  handleGripColor: string;
};

export const createRangeSelectorLineRenderer = () => {
  const RangeSelectorLine = ({
    color,
    key: seriesKey,
    opacity,
    path,
    strokeDasharray,
    strokeWidth
  }: LineChartRangeSelectorLineRenderProps) => (
    <G key={`range-selector-line-${seriesKey}`}>
      <Path
        key="halo"
        d={path}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={Math.min(0.2, opacity)}
        strokeWidth={strokeWidth + 3}
      />
      <Path
        key="line"
        d={path}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={opacity}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />
    </G>
  );

  return RangeSelectorLine;
};

export const createRangeSelectorHandleRenderer = ({
  handleGripColor
}: RangeSelectorRendererPalette) => {
  const RangeSelectorHandle = ({
    color,
    height,
    opacity,
    radius,
    side,
    width,
    x,
    y
  }: LineChartRangeSelectorHandleRenderProps) => (
    <G key={`range-selector-handle-${side}`}>
      <Rect
        key="track"
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        fill={color}
        opacity={opacity}
      />
      <Rect
        key="grip"
        x={x + width / 2 - 0.75}
        y={y + 7}
        width={1.5}
        height={height - 14}
        rx={0.75}
        fill={handleGripColor}
        opacity={0.68}
      />
    </G>
  );

  return RangeSelectorHandle;
};
