import { SvgGroup, SvgPath, SvgRect } from "@chart-kit/svg-renderer";
import type {
  LineChartRangeSelectorHandleRenderProps,
  LineChartRangeSelectorLineRenderProps
} from "@chart-kit/react-native/pro-preview";

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
    <SvgGroup key={`range-selector-line-${seriesKey}`}>
      <SvgPath
        key="halo"
        d={path}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={Math.min(0.2, opacity)}
        strokeWidth={strokeWidth + 3}
      />
      <SvgPath
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
    </SvgGroup>
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
    <SvgGroup key={`range-selector-handle-${side}`}>
      <SvgRect
        key="track"
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        fill={color}
        opacity={opacity}
      />
      <SvgRect
        key="grip"
        x={x + width / 2 - 0.75}
        y={y + 7}
        width={1.5}
        height={height - 14}
        rx={0.75}
        fill={handleGripColor}
        opacity={0.68}
      />
    </SvgGroup>
  );

  return RangeSelectorHandle;
};
