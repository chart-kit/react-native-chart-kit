import { createElement } from "react";
import type { ReactElement, ReactNode } from "react";

import type { SkiaComponentModule, SkiaPaintProps } from "./types";

const isPaintNone = (value: unknown) => value === undefined || value === "none";

const getOpacity = ({
  opacity,
  paintOpacity
}: {
  opacity?: number | undefined;
  paintOpacity?: number | undefined;
}) => {
  if (opacity === undefined) {
    return paintOpacity;
  }

  if (paintOpacity === undefined) {
    return opacity;
  }

  return opacity * paintOpacity;
};

export const getSkiaFillPaintProps = ({
  fill,
  fillOpacity,
  opacity
}: SkiaPaintProps) =>
  isPaintNone(fill)
    ? undefined
    : {
        color: fill ?? "black",
        opacity: getOpacity({ opacity, paintOpacity: fillOpacity }),
        style: "fill" as const
      };

export const getSkiaStrokePaintProps = ({
  opacity,
  stroke,
  strokeLinecap,
  strokeLinejoin,
  strokeOpacity,
  strokeWidth
}: SkiaPaintProps) =>
  isPaintNone(stroke)
    ? undefined
    : {
        color: stroke ?? "black",
        opacity: getOpacity({ opacity, paintOpacity: strokeOpacity }),
        strokeCap: strokeLinecap,
        strokeJoin: strokeLinejoin,
        strokeWidth: strokeWidth ?? 1,
        style: "stroke" as const
      };

export const getSkiaDashEffect = ({
  paint,
  skia
}: {
  paint: SkiaPaintProps;
  skia: SkiaComponentModule;
}) =>
  paint.strokeDasharray?.length && skia.DashPathEffect
    ? createElement(skia.DashPathEffect, {
        intervals: paint.strokeDasharray
      })
    : undefined;

export const renderSkiaPaintPair = ({
  fillElement,
  strokeElement,
  skia,
  testID
}: {
  fillElement?: ReactElement | undefined;
  skia: SkiaComponentModule;
  strokeElement?: ReactElement | undefined;
  testID?: string | undefined;
}): ReactNode => {
  if (fillElement && strokeElement) {
    return createElement(
      skia.Group,
      testID ? { testID: `${testID}-paint-group` } : undefined,
      fillElement,
      strokeElement
    );
  }

  return fillElement ?? strokeElement ?? null;
};
