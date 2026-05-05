import { Children, createElement } from "react";
import type { ReactNode } from "react";

import {
  getSkiaDashEffect,
  getSkiaFillPaintProps,
  getSkiaStrokePaintProps,
  renderSkiaPaintPair
} from "./paint";
import type {
  SkiaCircleProps,
  SkiaClipRectProps,
  SkiaComponentModule,
  SkiaDefsProps,
  SkiaGroupProps,
  SkiaLinearGradientProps,
  SkiaLineProps,
  SkiaPathProps,
  SkiaRectProps,
  SkiaSurfaceProps,
  SkiaTextProps
} from "./types";

const getTextValue = ({
  children,
  text
}: {
  children?: ReactNode;
  text?: string | undefined;
}) => {
  if (text !== undefined) {
    return text;
  }

  return Children.toArray(children)
    .map((child) =>
      typeof child === "string" || typeof child === "number" ? child : ""
    )
    .join("");
};

const percentToUnit = (
  value: number | string | undefined,
  fallback: number
) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.endsWith("%")) {
    const parsed = Number.parseFloat(value.slice(0, -1));

    return Number.isFinite(parsed) ? parsed / 100 : fallback;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

export const createSkiaPrimitives = ({
  font,
  skia
}: {
  font?: SkiaTextProps["font"];
  skia: SkiaComponentModule;
}) => {
  const Surface = ({
    children,
    height,
    style,
    testID,
    width
  }: SkiaSurfaceProps) =>
    createElement(
      skia.Canvas,
      {
        style: [{ height, width }, style],
        testID
      },
      children
    );

  const Group = ({ children, ...props }: SkiaGroupProps) =>
    createElement(skia.Group, props, children);

  const Path = ({ d, path, testID, ...paint }: SkiaPathProps) => {
    const skiaPath = path ?? d ?? "";
    const dashEffect = getSkiaDashEffect({ paint, skia });
    const fillPaint = getSkiaFillPaintProps(paint);
    const strokePaint = getSkiaStrokePaintProps(paint);

    return renderSkiaPaintPair({
      fillElement: fillPaint
        ? createElement(skia.Path, {
            path: skiaPath,
            testID,
            ...fillPaint
          })
        : undefined,
      skia,
      strokeElement: strokePaint
        ? createElement(
            skia.Path,
            {
              path: skiaPath,
              testID,
              ...strokePaint
            },
            dashEffect
          )
        : undefined,
      testID
    });
  };

  const Rect = ({
    height,
    rx,
    ry,
    testID,
    width,
    x,
    y,
    ...paint
  }: SkiaRectProps) => {
    const fillPaint = getSkiaFillPaintProps(paint);
    const strokePaint = getSkiaStrokePaintProps(paint);
    const baseProps = { height, rx, ry, testID, width, x, y };

    return renderSkiaPaintPair({
      fillElement: fillPaint
        ? createElement(skia.Rect, {
            ...baseProps,
            ...fillPaint
          })
        : undefined,
      skia,
      strokeElement: strokePaint
        ? createElement(skia.Rect, {
            ...baseProps,
            ...strokePaint
          })
        : undefined,
      testID
    });
  };

  const Circle = ({ cx, cy, r, testID, ...paint }: SkiaCircleProps) => {
    const fillPaint = getSkiaFillPaintProps(paint);
    const strokePaint = getSkiaStrokePaintProps(paint);
    const baseProps = { cx, cy, r, testID };

    return renderSkiaPaintPair({
      fillElement: fillPaint
        ? createElement(skia.Circle, {
            ...baseProps,
            ...fillPaint
          })
        : undefined,
      skia,
      strokeElement: strokePaint
        ? createElement(skia.Circle, {
            ...baseProps,
            ...strokePaint
          })
        : undefined,
      testID
    });
  };

  const Line = ({ testID, x1, x2, y1, y2, ...paint }: SkiaLineProps) => {
    const strokePaint = getSkiaStrokePaintProps(paint);

    if (!strokePaint) {
      return null;
    }

    if (skia.Line) {
      return createElement(skia.Line, {
        p1: { x: x1, y: y1 },
        p2: { x: x2, y: y2 },
        testID,
        ...strokePaint
      });
    }

    return createElement(Path, {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      ...(paint.stroke !== undefined ? { stroke: paint.stroke } : {}),
      ...(paint.strokeDasharray !== undefined
        ? { strokeDasharray: paint.strokeDasharray }
        : {}),
      ...(paint.strokeLinecap !== undefined
        ? { strokeLinecap: paint.strokeLinecap }
        : {}),
      ...(paint.strokeOpacity !== undefined
        ? { strokeOpacity: paint.strokeOpacity }
        : {}),
      ...(paint.strokeWidth !== undefined
        ? { strokeWidth: paint.strokeWidth }
        : {}),
      ...(testID !== undefined ? { testID } : {})
    });
  };

  const Text = ({
    children,
    fill,
    font: textFont,
    opacity,
    testID,
    text,
    x,
    y
  }: SkiaTextProps) => {
    const resolvedText = getTextValue({ children, text });
    const resolvedFont = textFont ?? font;

    if (!resolvedFont || resolvedText.length === 0) {
      return null;
    }

    return createElement(skia.Text, {
      color: fill ?? "black",
      font: resolvedFont,
      opacity,
      testID,
      text: resolvedText,
      x,
      y
    });
  };

  const Defs = ({ children }: SkiaDefsProps) =>
    createElement(Group, {}, children);

  const ClipRect = (_props: SkiaClipRectProps) => null;

  const LinearGradient = ({
    stops,
    testID,
    x1,
    x2,
    y1,
    y2
  }: SkiaLinearGradientProps): ReactNode => {
    if (!skia.LinearGradient || !skia.vec) {
      return null;
    }

    return createElement(skia.LinearGradient, {
      colors: stops.map((stop) => stop.color),
      end: skia.vec(percentToUnit(x2, 1), percentToUnit(y2, 0)),
      positions: stops.map((stop) => percentToUnit(stop.offset, 0)),
      start: skia.vec(percentToUnit(x1, 0), percentToUnit(y1, 0)),
      testID
    });
  };

  return {
    Circle,
    ClipRect,
    Defs,
    Group,
    Line,
    LinearGradient,
    Path,
    Rect,
    Surface,
    Text
  };
};
