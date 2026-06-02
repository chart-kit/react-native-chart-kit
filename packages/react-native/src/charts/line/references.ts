import type { LinearScale, Rect } from "@chart-kit/core";

import type { ResolvedCartesianChartTheme } from "../../theme";
import {
  resolveReferenceLineLabelY,
  type ReferenceCollisionGeometry
} from "./referenceLabelPlacement";
import type {
  LineChartReferenceBandConfig,
  LineChartReferenceLabelContainerConfig,
  LineChartReferenceLabelPosition,
  LineChartReferenceLineConfig
} from "./types";

export type LineChartReferenceLabelContainerModel = {
  backgroundColor: string;
  borderRadius: number;
  opacity: number;
  paddingX: number;
  paddingY: number;
};

export type LineChartReferenceLineModel = {
  key: string;
  x1: number;
  x2: number;
  y: number;
  color: string;
  opacity: number;
  strokeDasharray?: readonly number[];
  strokeWidth: number;
  label?: {
    text: string;
    x: number;
    y: number;
    color: string;
    container?: LineChartReferenceLabelContainerModel;
    fontSize: number;
    textAnchor: "middle" | "start" | "end";
  };
};

export type LineChartReferenceBandModel = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  label?: {
    text: string;
    x: number;
    y: number;
    color: string;
    container?: LineChartReferenceLabelContainerModel;
    fontSize: number;
    textAnchor: "middle" | "start" | "end";
  };
};

const defaultReferenceLineOpacity = 0.86;
const defaultReferenceBandOpacity = 0.1;
const defaultReferenceLabelContainerBorderRadius = 4;
const defaultReferenceLabelContainerOpacity = 0.9;
const defaultReferenceLabelContainerPaddingX = 3;
const defaultReferenceLabelContainerPaddingY = 2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const resolveOpacity = (value: number | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? clamp(value, 0, 1)
    : fallback;

const isFiniteNumber = (value: number) =>
  typeof value === "number" && Number.isFinite(value);

const resolveFiniteNumber = (value: number | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const resolveReferenceLabelContainer = ({
  container,
  theme
}: {
  container: boolean | LineChartReferenceLabelContainerConfig | undefined;
  theme: ResolvedCartesianChartTheme;
}): LineChartReferenceLabelContainerModel | undefined => {
  if (!container) {
    return undefined;
  }

  const config = typeof container === "object" ? container : {};

  return {
    backgroundColor: config.backgroundColor ?? theme.plotBackground,
    borderRadius: Math.max(
      0,
      resolveFiniteNumber(
        config.borderRadius,
        defaultReferenceLabelContainerBorderRadius
      )
    ),
    opacity: resolveOpacity(
      config.opacity,
      defaultReferenceLabelContainerOpacity
    ),
    paddingX: Math.max(
      0,
      resolveFiniteNumber(
        config.paddingX,
        defaultReferenceLabelContainerPaddingX
      )
    ),
    paddingY: Math.max(
      0,
      resolveFiniteNumber(
        config.paddingY,
        defaultReferenceLabelContainerPaddingY
      )
    )
  };
};

const getTextAnchor = (position: LineChartReferenceLabelPosition) => {
  if (position === "start") {
    return "start";
  }

  if (position === "center") {
    return "middle";
  }

  return "end";
};

const getReferenceLabelX = ({
  plot,
  position
}: {
  plot: Rect;
  position: LineChartReferenceLabelPosition;
}) => {
  if (position === "start") {
    return plot.x + 8;
  }

  if (position === "center") {
    return plot.x + plot.width / 2;
  }

  return plot.x + plot.width - 8;
};

export const buildLineChartReferenceLineModels = ({
  geometries,
  lines,
  plot,
  theme,
  yScale
}: {
  geometries?: ReferenceCollisionGeometry[] | undefined;
  lines: LineChartReferenceLineConfig[] | undefined;
  plot: Rect;
  theme: ResolvedCartesianChartTheme;
  yScale: LinearScale;
}): LineChartReferenceLineModel[] => {
  if (!lines || lines.length === 0) {
    return [];
  }

  const plotBottom = plot.y + plot.height;

  return lines.flatMap((line, index) => {
    if (!isFiniteNumber(line.y)) {
      return [];
    }

    const y = yScale.scale(line.y);

    if (y < plot.y || y > plotBottom) {
      return [];
    }

    const labelPosition = line.labelPosition ?? "end";
    const labelFontSize =
      typeof line.labelFontSize === "number" && line.labelFontSize > 0
        ? line.labelFontSize
        : theme.typography.axisLabelSize;
    const labelOffset =
      typeof line.labelOffset === "number" && Number.isFinite(line.labelOffset)
        ? line.labelOffset
        : 6;
    const model: LineChartReferenceLineModel = {
      key: `reference-line-${index}-${line.y}`,
      x1: plot.x,
      x2: plot.x + plot.width,
      y,
      color: line.color ?? theme.mutedText,
      opacity: resolveOpacity(line.opacity, defaultReferenceLineOpacity),
      strokeWidth: line.strokeWidth ?? 1
    };

    if (line.strokeDasharray !== undefined) {
      model.strokeDasharray = line.strokeDasharray;
    }

    if (line.label) {
      const textAnchor = getTextAnchor(labelPosition);
      const labelX = getReferenceLabelX({ plot, position: labelPosition });
      const labelContainer = resolveReferenceLabelContainer({
        container: line.labelContainer,
        theme
      });

      model.label = {
        text: line.label,
        x: labelX,
        y: resolveReferenceLineLabelY({
          geometries,
          labelOffset,
          labelPlacement: line.labelPlacement,
          lineY: y,
          plot,
          text: line.label,
          textAnchor,
          fontSize: labelFontSize,
          x: labelX
        }),
        color: line.labelColor ?? line.color ?? theme.mutedText,
        ...(labelContainer !== undefined ? { container: labelContainer } : {}),
        fontSize: labelFontSize,
        textAnchor
      };
    }

    return [model];
  });
};

export const buildLineChartReferenceBandModels = ({
  bands,
  plot,
  theme,
  yScale
}: {
  bands: LineChartReferenceBandConfig[] | undefined;
  plot: Rect;
  theme: ResolvedCartesianChartTheme;
  yScale: LinearScale;
}): LineChartReferenceBandModel[] => {
  if (!bands || bands.length === 0) {
    return [];
  }

  const plotBottom = plot.y + plot.height;

  return bands.flatMap((band, index) => {
    if (!isFiniteNumber(band.y1) || !isFiniteNumber(band.y2)) {
      return [];
    }

    const yA = yScale.scale(band.y1);
    const yB = yScale.scale(band.y2);
    const top = Math.min(yA, yB);
    const bottom = Math.max(yA, yB);
    const clampedTop = clamp(top, plot.y, plotBottom);
    const clampedBottom = clamp(bottom, plot.y, plotBottom);
    const height = clampedBottom - clampedTop;

    if (height <= 0.5) {
      return [];
    }

    const labelPosition = band.labelPosition ?? "start";
    const labelFontSize =
      typeof band.labelFontSize === "number" && band.labelFontSize > 0
        ? band.labelFontSize
        : theme.typography.axisLabelSize;
    const model: LineChartReferenceBandModel = {
      key: `reference-band-${index}-${band.y1}-${band.y2}`,
      x: plot.x,
      y: clampedTop,
      width: plot.width,
      height,
      color: band.color ?? theme.series[0] ?? theme.grid,
      opacity: resolveOpacity(band.opacity, defaultReferenceBandOpacity)
    };

    if (band.label) {
      const labelContainer = resolveReferenceLabelContainer({
        container: band.labelContainer,
        theme
      });

      model.label = {
        text: band.label,
        x: getReferenceLabelX({ plot, position: labelPosition }),
        y: clamp(
          clampedTop + labelFontSize + 6,
          plot.y + labelFontSize,
          plotBottom - 4
        ),
        color: band.labelColor ?? band.color ?? theme.mutedText,
        ...(labelContainer !== undefined ? { container: labelContainer } : {}),
        fontSize: labelFontSize,
        textAnchor: getTextAnchor(labelPosition)
      };
    }

    return [model];
  });
};
