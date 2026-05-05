import {
  SvgCircle,
  SvgDefs,
  SvgGroup,
  SvgHitRegion,
  SvgLine,
  SvgPath,
  SvgRect,
  SvgSurface,
  SvgText
} from "./primitives";
import { SvgClipRect, SvgLinearGradientDef } from "./defs";
import { SvgLayer } from "./layers";
import { SvgSymbol } from "./symbols";
import { createSvgTextMeasurer } from "./textMeasurement";
import { createSvgRendererCapabilities } from "./capabilities";
import type { SvgRenderer, SvgRendererOptions } from "./types";

export const createSvgRenderer = (
  options: SvgRendererOptions = {}
): SvgRenderer => ({
  Surface: SvgSurface,
  Group: SvgGroup,
  Path: SvgPath,
  Rect: SvgRect,
  HitRegion: SvgHitRegion,
  Circle: SvgCircle,
  Symbol: SvgSymbol,
  Text: SvgText,
  Line: SvgLine,
  Layer: SvgLayer,
  Defs: SvgDefs,
  ClipRect: SvgClipRect,
  LinearGradient: SvgLinearGradientDef,
  capabilities: createSvgRendererCapabilities(options),
  measureText:
    options.measureText ?? createSvgTextMeasurer(options.textMeasurement)
});

export const svgRenderer = createSvgRenderer();
