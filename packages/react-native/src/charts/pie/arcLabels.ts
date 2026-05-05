import type { PieArcModel } from "@chart-kit/core";

import type { ResolvedCartesianChartTheme } from "../../theme";
import type {
  PieChartArcLabelModel,
  PieChartArcLabelsConfig,
  PieChartArcLabelRenderProps,
  PieChartLegendItem
} from "./types";

const defaultArcLabelFontSize = 11;
const defaultArcLabelMinPercentage = 0.07;
const defaultArcLabelOffset = 10;
const defaultConnectorLength = 12;
const labelEdgePadding = 10;
const estimatedCharacterWidthRatio = 0.68;

export type ResolvedPieChartArcLabelsConfig<TData = unknown> = {
  connectorLength: number;
  connectorLines: boolean;
  fontSize: number;
  formatLabel:
    | ((props: PieChartArcLabelRenderProps<TData>) => string | null)
    | undefined;
  minPercentage: number;
  offset: number;
  visible: boolean;
};

export const getPieChartArcLabelsVisible = <TData = unknown>(
  arcLabels: boolean | PieChartArcLabelsConfig<TData> | undefined
) => {
  if (arcLabels === undefined || arcLabels === false) {
    return false;
  }

  if (typeof arcLabels === "object") {
    return arcLabels.visible !== false;
  }

  return true;
};

export const resolvePieChartArcLabelsConfig = <TData = unknown>(
  arcLabels: boolean | PieChartArcLabelsConfig<TData> | undefined
): ResolvedPieChartArcLabelsConfig<TData> => {
  const config = typeof arcLabels === "object" ? arcLabels : {};

  return {
    connectorLength:
      typeof config.connectorLength === "number" &&
      Number.isFinite(config.connectorLength)
        ? Math.max(0, config.connectorLength)
        : defaultConnectorLength,
    connectorLines: config.connectorLines !== false,
    fontSize:
      typeof config.fontSize === "number" && Number.isFinite(config.fontSize)
        ? Math.max(8, config.fontSize)
        : defaultArcLabelFontSize,
    formatLabel: config.formatLabel,
    minPercentage:
      typeof config.minPercentage === "number" &&
      Number.isFinite(config.minPercentage)
        ? Math.max(0, config.minPercentage)
        : defaultArcLabelMinPercentage,
    offset:
      typeof config.offset === "number" && Number.isFinite(config.offset)
        ? Math.max(0, config.offset)
        : defaultArcLabelOffset,
    visible: getPieChartArcLabelsVisible(arcLabels)
  };
};

const getMidAngle = (arc: PieArcModel) =>
  arc.startAngle + (arc.endAngle - arc.startAngle) / 2;

const clamp = (value: number, min: number, max: number) => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const estimateLabelWidth = ({
  fontSize,
  text
}: {
  fontSize: number;
  text: string;
}) => text.length * fontSize * estimatedCharacterWidthRatio;

const spreadArcLabelsOnSide = <TData>({
  chartHeight,
  labels,
  minGap
}: {
  chartHeight: number;
  labels: Array<PieChartArcLabelModel<TData>>;
  minGap: number;
}) => {
  const minY = labelEdgePadding + minGap / 2;
  const maxY = Math.max(minY, chartHeight - labelEdgePadding);
  const sorted = [...labels].sort((a, b) => a.y - b.y);
  let cursorY = minY;

  sorted.forEach((label) => {
    const y = clamp(Math.max(label.y, cursorY), minY, maxY);
    label.y = y;
    label.connectorEndY = y;
    cursorY = y + minGap;
  });

  for (let index = sorted.length - 2; index >= 0; index -= 1) {
    const label = sorted[index];
    const nextLabel = sorted[index + 1];

    if (!label || !nextLabel) {
      continue;
    }

    const maxAllowedY = nextLabel.y - minGap;

    if (label.y > maxAllowedY) {
      label.y = clamp(maxAllowedY, minY, maxY);
      label.connectorEndY = label.y;
    }
  }
};

export const buildPieChartArcLabels = <TData>({
  arcs,
  chartHeight,
  chartWidth,
  centerX,
  centerY,
  config,
  legendItems,
  radius,
  selectedIndex,
  theme
}: {
  arcs: Array<PieArcModel<TData>>;
  chartHeight: number;
  chartWidth: number;
  centerX: number;
  centerY: number;
  config: ResolvedPieChartArcLabelsConfig<TData>;
  legendItems: Array<PieChartLegendItem<TData>>;
  radius: number;
  selectedIndex: number | undefined;
  theme: ResolvedCartesianChartTheme;
}): Array<PieChartArcLabelModel<TData>> => {
  if (!config.visible) {
    return [];
  }

  const legendByIndex = new Map(legendItems.map((item) => [item.index, item]));
  const labels = arcs.flatMap<PieChartArcLabelModel<TData>>((arc) => {
    const legendItem = legendByIndex.get(arc.index);

    if (!arc.defined || !legendItem || arc.percentage < config.minPercentage) {
      return [];
    }

    const angle = getMidAngle(arc);
    const side = Math.cos(angle) >= 0 ? 1 : -1;
    const startRadius = radius + 2;
    const bendRadius = radius + config.offset;
    const preferredLabelX =
      centerX + side * (radius + config.offset + config.connectorLength + 2);
    const labelY = centerY + bendRadius * Math.sin(angle);
    const renderProps: PieChartArcLabelRenderProps<TData> = {
      arc,
      color: legendItem.color,
      index: legendItem.index,
      label: legendItem.label,
      percentageLabel: legendItem.percentageLabel,
      selected: selectedIndex === arc.index,
      theme,
      valueLabel: legendItem.valueLabel
    };
    const text =
      config.formatLabel?.(renderProps) ??
      `${legendItem.label} ${legendItem.percentageLabel}`;

    if (text.length === 0) {
      return [];
    }

    const labelWidth = estimateLabelWidth({ fontSize: config.fontSize, text });
    const labelX =
      side > 0
        ? Math.min(
            preferredLabelX,
            Math.max(centerX, chartWidth - labelEdgePadding - labelWidth)
          )
        : Math.max(
            preferredLabelX,
            Math.min(centerX, labelEdgePadding + labelWidth)
          );

    return [
      {
        arc,
        color: legendItem.color,
        connectorBendX: centerX + side * bendRadius * Math.cos(angle),
        connectorBendY: centerY + bendRadius * Math.sin(angle),
        connectorEndX: labelX - side * 4,
        connectorEndY: labelY,
        connectorStartX: centerX + startRadius * Math.cos(angle),
        connectorStartY: centerY + startRadius * Math.sin(angle),
        connectorVisible: config.connectorLines,
        fontSize: config.fontSize,
        index: arc.index,
        key: `${arc.index}-${arc.label}-arc-label`,
        text,
        textAnchor: side > 0 ? "start" : "end",
        x: labelX,
        y: labelY
      }
    ];
  });
  const minGap = config.fontSize + 5;

  spreadArcLabelsOnSide({
    chartHeight,
    labels: labels.filter((label) => label.textAnchor === "start"),
    minGap
  });
  spreadArcLabelsOnSide({
    chartHeight,
    labels: labels.filter((label) => label.textAnchor === "end"),
    minGap
  });

  return labels;
};
