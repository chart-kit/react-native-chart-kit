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

const getAnchoredTextX = ({
  font,
  text,
  textAnchor,
  x
}: {
  font: SkiaTextProps["font"];
  text: string;
  textAnchor?: SkiaTextProps["textAnchor"] | undefined;
  x: number;
}) => {
  if (textAnchor === undefined || textAnchor === "start") {
    return x;
  }

  const width = font?.measureText?.(text).width;

  if (width === undefined) {
    return x;
  }

  return textAnchor === "middle" ? x - width / 2 : x - width;
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

const clampOpacity = (opacity: number) => Math.max(0, Math.min(1, opacity));

const applyOpacityToColor = ({
  color,
  opacity
}: {
  color: string;
  opacity?: number | undefined;
}) => {
  if (opacity === undefined) {
    return color;
  }

  const clampedOpacity = clampOpacity(opacity);
  const expandedHex =
    color.startsWith("#") && color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color;

  if (expandedHex.startsWith("#") && expandedHex.length === 7) {
    const red = Number.parseInt(expandedHex.slice(1, 3), 16);
    const green = Number.parseInt(expandedHex.slice(3, 5), 16);
    const blue = Number.parseInt(expandedHex.slice(5, 7), 16);

    if ([red, green, blue].every(Number.isFinite)) {
      return `rgba(${red}, ${green}, ${blue}, ${clampedOpacity})`;
    }
  }

  return color;
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
      colors: stops.map((stop) =>
        applyOpacityToColor({ color: stop.color, opacity: stop.opacity })
      ),
      end: skia.vec(percentToUnit(x2, 1), percentToUnit(y2, 0)),
      positions: stops.map((stop) => percentToUnit(stop.offset, 0)),
      start: skia.vec(percentToUnit(x1, 0), percentToUnit(y1, 0)),
      testID
    });
  };

  const Path = ({
    clipRect,
    d,
    fillGradient,
    path,
    testID,
    ...paint
  }: SkiaPathProps) => {
    const skiaPath = path ?? d ?? "";
    const dashEffect = getSkiaDashEffect({ paint, skia });
    const fillPaint = getSkiaFillPaintProps(paint);
    const strokePaint = getSkiaStrokePaintProps(paint);
    const gradientElement = fillGradient
      ? createElement(LinearGradient, fillGradient)
      : undefined;
    const pathElement = renderSkiaPaintPair({
      fillElement:
        fillPaint || gradientElement
          ? createElement(
              skia.Path,
              {
                path: skiaPath,
                testID,
                ...(fillPaint ?? { style: "fill" as const })
              },
              gradientElement
            )
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

    if (!clipRect || !skia.rect) {
      return pathElement;
    }

    return createElement(
      skia.Group,
      {
        clip: skia.rect(
          clipRect.x,
          clipRect.y,
          clipRect.width,
          clipRect.height
        ),
        ...(testID ? { testID: `${testID}-clip-group` } : {})
      },
      pathElement
    );
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
    textAnchor,
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
      x: getAnchoredTextX({
        font: resolvedFont,
        text: resolvedText,
        textAnchor,
        x
      }),
      y
    });
  };

  const Defs = ({ children }: SkiaDefsProps) =>
    createElement(Group, {}, children);

  const ClipRect = (_props: SkiaClipRectProps) => null;

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
