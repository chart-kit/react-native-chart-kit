import {
  SvgCircle,
  SvgDefs,
  SvgGroup,
  SvgLine,
  SvgPath,
  SvgRect,
  SvgSurface,
  SvgText
} from "./primitives";
import { SvgClipRect, SvgLinearGradientDef } from "./defs";
import { createSvgTextMeasurer } from "./textMeasurement";
import type { SvgRenderer, SvgRendererOptions } from "./types";

export const createSvgRenderer = (
  options: SvgRendererOptions = {}
): SvgRenderer => ({
  Surface: SvgSurface,
  Group: SvgGroup,
  Path: SvgPath,
  Rect: SvgRect,
  Circle: SvgCircle,
  Text: SvgText,
  Line: SvgLine,
  Defs: SvgDefs,
  ClipRect: SvgClipRect,
  LinearGradient: SvgLinearGradientDef,
  measureText:
    options.measureText ?? createSvgTextMeasurer(options.textMeasurement)
});

export const svgRenderer = createSvgRenderer();
