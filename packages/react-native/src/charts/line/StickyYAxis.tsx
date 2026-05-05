import { View } from "react-native";

import { getLineChartRenderer } from "./renderer";
import { getFontFamilyProps } from "./text";
import type { LineChartModel } from "./useChartModel";
import type { LineChartRenderer, LineChartYAxisLabelModel } from "./types";

export const StickyYAxis = <TData extends Record<string, unknown>>({
  fadeHeight,
  fadeWidth,
  fadeY,
  gradientId,
  mainHeight,
  model,
  renderer: rendererProp,
  width,
  yAxisLabels
}: {
  fadeHeight: number;
  fadeWidth: number;
  fadeY: number;
  gradientId: string;
  mainHeight: number;
  model: LineChartModel<TData>;
  renderer?: LineChartRenderer | undefined;
  width: number;
  yAxisLabels: LineChartYAxisLabelModel[];
}) => {
  const { boxes, resolvedTheme } = model;
  const renderer = getLineChartRenderer(rendererProp);
  const { Defs, Group, Rect, Surface, Text } = renderer;
  const Layer = renderer.Layer ?? Group;
  const LinearGradient = renderer.LinearGradient;
  const canRenderText = renderer.capabilities?.text !== false;
  const supportsGradients =
    renderer.capabilities?.gradients !== false && Boolean(LinearGradient);

  return (
    <View
      pointerEvents="none"
      style={{
        left: 0,
        position: "absolute",
        top: 0,
        width,
        height: mainHeight
      }}
    >
      <Surface width={width} height={mainHeight}>
        <Defs>
          {supportsGradients && LinearGradient ? (
            <LinearGradient
              id={gradientId}
              x1="0%"
              x2="100%"
              y1="0%"
              y2="0%"
              stops={[
                { offset: "0%", color: resolvedTheme.background, opacity: 1 },
                { offset: "100%", color: resolvedTheme.background, opacity: 0 }
              ]}
            />
          ) : null}
        </Defs>
        <Layer name="background">
          <Rect
            x={0}
            y={0}
            width={boxes.plot.x}
            height={mainHeight}
            fill={resolvedTheme.background}
          />
          {supportsGradients && fadeWidth > 0 ? (
            <Rect
              x={boxes.plot.x}
              y={fadeY}
              width={fadeWidth}
              height={fadeHeight}
              fill={`url(#${gradientId})`}
            />
          ) : null}
        </Layer>
        <Layer name="axes">
          {canRenderText
            ? yAxisLabels.map((label) => (
                <Text
                  key={`sticky-label-y-${label.key}`}
                  x={boxes.plot.x - 8}
                  y={label.y}
                  fill={resolvedTheme.mutedText}
                  fontSize={resolvedTheme.typography.axisLabelSize}
                  opacity={label.opacity}
                  textAnchor="end"
                  {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
                >
                  {label.text}
                </Text>
              ))
            : null}
        </Layer>
      </Surface>
    </View>
  );
};
