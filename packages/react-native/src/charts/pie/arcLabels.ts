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
const defaultConnectorOpacity = 0.84;
const defaultConnectorWidth = 1.35;
const defaultReservedWidth = 86;
const minConnectorLabelGap = 6;
const labelEdgePadding = 10;
const estimatedCharacterWidthRatio = 0.68;

export type ResolvedPieChartArcLabelsConfig<TData = unknown> = {
  connectorColor: string | undefined;
  connectorLength: number;
  connectorLines: boolean;
  connectorOpacity: number;
  connectorWidth: number;
  fontSize: number;
  formatLabel:
    | ((props: PieChartArcLabelRenderProps<TData>) => string | null)
    | undefined;
  minPercentage: number;
  offset: number;
  reservedWidth: number;
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
    connectorColor: config.connectorColor,
    connectorLength:
      typeof config.connectorLength === "number" &&
      Number.isFinite(config.connectorLength)
        ? Math.max(0, config.connectorLength)
        : defaultConnectorLength,
    connectorLines: config.connectorLines !== false,
    connectorOpacity:
      typeof config.connectorOpacity === "number" &&
      Number.isFinite(config.connectorOpacity)
        ? clamp(config.connectorOpacity, 0, 1)
        : defaultConnectorOpacity,
    connectorWidth:
      typeof config.connectorWidth === "number" &&
      Number.isFinite(config.connectorWidth)
        ? Math.max(0, config.connectorWidth)
        : defaultConnectorWidth,
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
    reservedWidth:
      typeof config.reservedWidth === "number" &&
      Number.isFinite(config.reservedWidth)
        ? Math.max(0, config.reservedWidth)
        : defaultReservedWidth,
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
    label.connectorBendY = y;
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
      label.connectorBendY = label.y;
      label.connectorEndY = label.y;
    }
  }
};

const alignArcLabelConnectors = <TData>(
  labels: Array<PieChartArcLabelModel<TData>>
) => {
  labels.forEach((label) => {
    label.connectorBendX =
      label.connectorStartX + (label.connectorEndX - label.connectorStartX) / 2;
    label.connectorBendY =
      label.connectorStartY + (label.connectorEndY - label.connectorStartY) / 2;
  });
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
    const startRadius = radius;
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
    const outsideRightX =
      centerX +
      radius +
      config.offset +
      config.connectorLength +
      minConnectorLabelGap;
    const outsideLeftX =
      centerX -
      radius -
      config.offset -
      config.connectorLength -
      minConnectorLabelGap;
    const labelX =
      side > 0
        ? clamp(
            preferredLabelX,
            outsideRightX,
            chartWidth - labelEdgePadding - labelWidth
          )
        : clamp(preferredLabelX, labelEdgePadding + labelWidth, outsideLeftX);

    return [
      {
        arc,
        color: legendItem.color,
        connectorColor: config.connectorColor ?? theme.mutedText,
        connectorBendX: centerX + side * bendRadius * Math.cos(angle),
        connectorBendY: centerY + bendRadius * Math.sin(angle),
        connectorEndX: labelX - side * 4,
        connectorEndY: labelY,
        connectorOpacity: config.connectorOpacity,
        connectorStartX: centerX + startRadius * Math.cos(angle),
        connectorStartY: centerY + startRadius * Math.sin(angle),
        connectorVisible: config.connectorLines,
        connectorWidth: config.connectorWidth,
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
  alignArcLabelConnectors(labels);

  return labels;
};
