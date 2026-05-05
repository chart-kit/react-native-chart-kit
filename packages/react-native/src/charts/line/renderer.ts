import {
  SvgClipRect,
  SvgCircle,
  SvgDefs,
  SvgGroup,
  SvgLayer,
  SvgLine,
  SvgLinearGradientDef,
  SvgPath,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import type { LineChartRenderer } from "./types";

export const lineChartSvgRenderer: LineChartRenderer = {
  ClipRect: SvgClipRect,
  Circle: SvgCircle,
  Defs: SvgDefs,
  Group: SvgGroup,
  Layer: SvgLayer,
  Line: SvgLine,
  LinearGradient: SvgLinearGradientDef,
  Path: SvgPath,
  Rect: SvgRect,
  Surface: SvgSurface,
  Text: SvgText,
  capabilities: {
    clipPaths: true,
    gradients: true,
    pathGradients: false,
    text: true
  },
  name: "svg"
};

export const getLineChartRenderer = (renderer: LineChartRenderer | undefined) =>
  renderer ?? lineChartSvgRenderer;
