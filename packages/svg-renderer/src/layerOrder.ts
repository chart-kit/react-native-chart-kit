import { createSvgTestId } from "./testIds";

export const chartRenderLayers = {
  background: 0,
  plot: 10,
  grid: 20,
  axes: 30,
  dataArea: 40,
  data: 50,
  markers: 60,
  overlays: 70,
  interaction: 80,
  debug: 90
} as const;

export type ChartRenderLayerName = keyof typeof chartRenderLayers;

export const chartRenderLayerOrder = Object.keys(
  chartRenderLayers
) as ChartRenderLayerName[];

export const getChartRenderLayerTestId = (name: ChartRenderLayerName) =>
  createSvgTestId("chart-layer", name);
