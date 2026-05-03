import { layoutLegend, solveChartBoxes } from "@chart-kit/core";
import type { Size } from "@chart-kit/core";
import { SvgGroup, SvgLine, SvgSymbol, SvgText } from "@chart-kit/svg-renderer";

import type { ResolvedCartesianChartTheme } from "../../theme";
import type {
  LineChartLegendAlign,
  LineChartLegendRenderItem,
  LineChartLegendRenderProps,
  LineChartLegendPosition,
  LineChartProps,
  ResolvedLineChartLegendConfig
} from "./types";
import { getFontFamilyProps } from "./text";

export const getLegendConfig = (
  legend: LineChartProps<Record<string, unknown>>["legend"],
  seriesCount: number,
  theme: ResolvedCartesianChartTheme
): ResolvedLineChartLegendConfig => {
  const config = typeof legend === "object" ? legend : {};
  const visible =
    typeof legend === "boolean"
      ? legend
      : config.visible !== undefined
        ? config.visible
        : seriesCount > 1;

  return {
    visible,
    position: config.position ?? "top",
    align: config.align ?? "start",
    wrap: config.wrap ?? true,
    itemGap: config.itemGap ?? 20,
    rowGap: config.rowGap ?? 8,
    padding: config.padding ?? 0,
    labelGap: config.labelGap ?? 6,
    itemPaddingHorizontal: config.itemPaddingHorizontal ?? 0,
    itemPaddingVertical: config.itemPaddingVertical ?? 0,
    markerSize: config.markerSize ?? 8,
    marker: config.marker ?? "square",
    labelColor: config.labelColor ?? theme.text,
    fontSize: config.fontSize ?? theme.typography.legendLabelSize,
    fontFamily: config.fontFamily ?? theme.typography.fontFamily,
    renderItem: config.renderItem,
    renderLegend: config.renderLegend
  };
};

export const getLegendX = ({
  align,
  boxes,
  legendWidth,
  width
}: {
  align: LineChartLegendAlign;
  boxes: ReturnType<typeof solveChartBoxes>;
  legendWidth: number;
  width: number;
}) => {
  if (align === "center") {
    return Math.max(4, (width - legendWidth) / 2);
  }

  if (align === "end") {
    return Math.max(4, width - boxes.padding.right - legendWidth);
  }

  return boxes.plot.x;
};

export const getLegendY = ({
  boxes,
  xLabelHeight,
  xLabelLineHeight,
  legendHeight,
  position
}: {
  boxes: ReturnType<typeof solveChartBoxes>;
  xLabelHeight: number;
  xLabelLineHeight: number;
  legendHeight: number;
  position: LineChartLegendPosition;
}) => {
  if (position === "bottom") {
    return (
      boxes.plot.y +
      boxes.plot.height +
      (xLabelHeight > 0
        ? 20 + Math.max(0, xLabelHeight - xLabelLineHeight) + 10
        : 10)
    );
  }

  return Math.max(8, boxes.plot.y - legendHeight - 8);
};

const renderDefaultLegendItem = (item: LineChartLegendRenderItem) => {
  const markerCenterY = item.contentY + item.contentHeight / 2;
  const markerShape = item.marker === "line" ? "line" : item.marker;
  const legendLineStrokeWidth = Math.min(3, Math.max(1.5, item.strokeWidth));

  return (
    <SvgGroup key={`legend-${item.key}`}>
      {item.marker === "line" ? (
        <SvgLine
          x1={item.contentX}
          x2={item.contentX + item.markerSize}
          y1={markerCenterY}
          y2={markerCenterY}
          stroke={item.color}
          strokeLinecap={item.strokeLinecap}
          strokeOpacity={item.strokeOpacity}
          strokeWidth={legendLineStrokeWidth}
          {...(item.strokeDasharray
            ? { strokeDasharray: item.strokeDasharray }
            : {})}
        />
      ) : (
        <SvgSymbol
          shape={markerShape}
          x={item.contentX + item.markerSize / 2}
          y={markerCenterY}
          size={item.markerSize}
          fill={item.color}
          opacity={item.strokeOpacity}
          stroke={item.color}
          cornerRadius={2}
        />
      )}
      <SvgText
        x={item.contentX + item.markerSize + item.labelGap}
        y={item.contentY + item.contentHeight / 2 + item.fontSize * 0.36}
        fill={item.labelColor}
        fontSize={item.fontSize}
        {...getFontFamilyProps(item.fontFamily)}
      >
        {item.label}
      </SvgText>
    </SvgGroup>
  );
};

export const renderConfiguredLegend = ({
  legend,
  config
}: {
  legend: LineChartLegendRenderProps;
  config: ResolvedLineChartLegendConfig;
}) => {
  if (config.renderLegend) {
    return config.renderLegend(legend);
  }

  return (
    <SvgGroup>
      {legend.items.map((item) =>
        config.renderItem
          ? config.renderItem(item)
          : renderDefaultLegendItem(item)
      )}
    </SvgGroup>
  );
};

export const buildLegendLayout = ({
  config,
  items,
  maxWidth,
  measureText
}: {
  config: ResolvedLineChartLegendConfig;
  items: Array<{ id: string; label: string }>;
  maxWidth: number;
  measureText: (text: string, options: { fontSize: number }) => Size;
}) => {
  const markerSize =
    config.marker === "line" ? config.markerSize + 8 : config.markerSize;

  return layoutLegend({
    items: items.map((item) => {
      const labelSize = measureText(item.label, {
        fontSize: config.fontSize,
        ...getFontFamilyProps(config.fontFamily)
      });

      return {
        id: item.id,
        label: item.label,
        markerSize,
        labelWidth: labelSize.width,
        labelHeight: labelSize.height
      };
    }),
    position: config.position,
    maxWidth: config.wrap ? Math.max(0, maxWidth - 32) : 100_000,
    itemGap: config.itemGap,
    rowGap: config.rowGap,
    padding: config.padding,
    labelGap: config.labelGap,
    itemPaddingHorizontal: config.itemPaddingHorizontal,
    itemPaddingVertical: config.itemPaddingVertical
  });
};
