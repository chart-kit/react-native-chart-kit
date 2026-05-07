import { lineChartSvgRenderer } from "../line/renderer";
import type { BarChartRenderer } from "./types";

const conservativeNativeMaxSurfaceWidth = 2730;

const isInjectedRenderer = (renderer: BarChartRenderer | undefined) =>
  renderer !== undefined &&
  renderer !== lineChartSvgRenderer &&
  renderer.name !== "svg";

const getRendererMaxSurfaceWidth = (renderer: BarChartRenderer | undefined) =>
  renderer?.capabilities?.maxSurfaceWidth ??
  (isInjectedRenderer(renderer)
    ? conservativeNativeMaxSurfaceWidth
    : undefined);

const canRenderWideViewport = (renderer: BarChartRenderer | undefined) =>
  renderer?.capabilities?.viewportWindowing === true;

const shouldConstrainSurfaceWidth = ({
  contentWidth,
  renderer,
  scrollable
}: {
  contentWidth: number;
  renderer: BarChartRenderer | undefined;
  scrollable: boolean | undefined;
}) => {
  const maxSurfaceWidth = getRendererMaxSurfaceWidth(renderer);

  return (
    scrollable &&
    typeof maxSurfaceWidth === "number" &&
    Number.isFinite(maxSurfaceWidth) &&
    contentWidth > maxSurfaceWidth &&
    !canRenderWideViewport(renderer)
  );
};

export const getSafeBarChartContentWidth = ({
  contentWidth,
  renderer,
  scrollable
}: {
  contentWidth: number;
  renderer: BarChartRenderer | undefined;
  scrollable: boolean | undefined;
}) => {
  const maxSurfaceWidth = getRendererMaxSurfaceWidth(renderer);

  return shouldConstrainSurfaceWidth({ contentWidth, renderer, scrollable }) &&
    typeof maxSurfaceWidth === "number"
    ? maxSurfaceWidth
    : contentWidth;
};

export const getSafeBarChartRenderer = ({
  contentWidth,
  renderer,
  scrollable
}: {
  contentWidth: number;
  renderer: BarChartRenderer | undefined;
  scrollable: boolean | undefined;
}) => {
  if (shouldConstrainSurfaceWidth({ contentWidth, renderer, scrollable })) {
    return lineChartSvgRenderer;
  }

  return renderer;
};
