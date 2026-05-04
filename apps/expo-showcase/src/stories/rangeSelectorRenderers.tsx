import { SvgGroup, SvgPath, SvgRect } from "@chart-kit/svg-renderer";
import type {
  LineChartRangeSelectorHandleRenderProps,
  LineChartRangeSelectorLineRenderProps
} from "@chart-kit/react-native-v2";

export type RangeSelectorRendererPalette = {
  handleGripColor: string;
};

export const createRangeSelectorLineRenderer = () => {
  const RangeSelectorLine = ({
    color,
    opacity,
    path,
    strokeDasharray,
    strokeWidth
  }: LineChartRangeSelectorLineRenderProps) => (
    <SvgGroup>
      <SvgPath
        d={path}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={Math.min(0.2, opacity)}
        strokeWidth={strokeWidth + 3}
      />
      <SvgPath
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
    width,
    x,
    y
  }: LineChartRangeSelectorHandleRenderProps) => (
    <SvgGroup>
      <SvgRect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        fill={color}
        opacity={opacity}
      />
      <SvgRect
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
