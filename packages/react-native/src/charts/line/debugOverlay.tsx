import type { ReactNode } from "react";

import type { LayoutDebugModel, LayoutDebugRect } from "@chart-kit/core";

import { getFontFamilyProps } from "./text";
import type { LineChartRenderer } from "./types";

const getDebugStroke = (kind: LayoutDebugRect["kind"]) => {
  switch (kind) {
    case "outer":
      return "#ef4444";
    case "plot":
      return "#22c55e";
    case "legend":
      return "#a855f7";
    case "tooltip":
      return "#f97316";
    case "axis":
      return "#eab308";
    case "label":
    default:
      return "#2563eb";
  }
};

export const renderLineChartDebugLayout = ({
  fontFamily,
  model,
  renderer
}: {
  fontFamily?: string | undefined;
  model: LayoutDebugModel;
  renderer: LineChartRenderer;
}): ReactNode => {
  const { Group, Rect, Text } = renderer;
  const canRenderText = renderer.capabilities?.text !== false;

  return model.rects.map((rect, index) => {
    const stroke = getDebugStroke(rect.kind);
    const dashProps =
      rect.kind === "outer" || rect.kind === "plot"
        ? {}
        : { strokeDasharray: [4, 3] };

    return (
      <Group key={`debug-${rect.kind}-${rect.id}-${index}`}>
        <Rect
          fill="none"
          height={rect.height}
          stroke={stroke}
          strokeOpacity={0.9}
          strokeWidth={1}
          width={rect.width}
          x={rect.x}
          y={rect.y}
          {...dashProps}
        />
        {rect.text && canRenderText ? (
          <Text
            fill={stroke}
            fontSize={9}
            text={rect.text}
            x={rect.x + 2}
            y={Math.max(10, rect.y - 3)}
            {...getFontFamilyProps(fontFamily)}
          >
            {rect.text}
          </Text>
        ) : null}
      </Group>
    );
  });
};
