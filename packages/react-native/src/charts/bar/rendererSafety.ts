import { lineChartSvgRenderer } from "../line/renderer";
import type { BarChartRenderer } from "./types";

export const getSafeBarChartRenderer = ({
  contentWidth,
  renderer,
  scrollable
}: {
  contentWidth: number;
  renderer: BarChartRenderer | undefined;
  scrollable: boolean | undefined;
}) => {
  const isInjectedRenderer =
    renderer !== undefined &&
    renderer !== lineChartSvgRenderer &&
    renderer.name !== "svg";
  const maxSurfaceWidth =
    renderer?.capabilities?.maxSurfaceWidth ??
    (isInjectedRenderer ? 8192 : undefined);
  const supportsViewportWindowing =
    renderer?.capabilities?.viewportWindowing === true;

  if (
    scrollable &&
    typeof maxSurfaceWidth === "number" &&
    Number.isFinite(maxSurfaceWidth) &&
    contentWidth > maxSurfaceWidth &&
    !supportsViewportWindowing
  ) {
    return lineChartSvgRenderer;
  }

  return renderer;
};
