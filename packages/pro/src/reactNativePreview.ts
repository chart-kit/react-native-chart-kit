export const chartKitProReactNativePreviewExports = [
  "BarChart",
  "CandlestickChart",
  "ChartSelectionProvider",
  "CombinedChart",
  "DonutChart",
  "LineChart",
  "useChartSelection",
  "useDismissChartSelection"
] as const;

export type ChartKitProReactNativePreviewExport =
  (typeof chartKitProReactNativePreviewExports)[number];

export type ChartKitProReactNativePreviewModule = {
  [Key in ChartKitProReactNativePreviewExport]: unknown;
};

export type ChartKitProReactNativePreview<TModule> = Pick<
  TModule,
  Extract<keyof TModule, ChartKitProReactNativePreviewExport>
>;

export type ChartKitProReactNativePreviewOptions = {
  onMissingExport?: (exportName: ChartKitProReactNativePreviewExport) => void;
};

export const createChartKitProReactNativePreview = <
  TModule extends Partial<ChartKitProReactNativePreviewModule>
>(
  reactNativeModule: TModule,
  options: ChartKitProReactNativePreviewOptions = {}
): ChartKitProReactNativePreview<TModule> => {
  const preview = {} as ChartKitProReactNativePreview<TModule>;

  for (const exportName of chartKitProReactNativePreviewExports) {
    if (!(exportName in reactNativeModule)) {
      options.onMissingExport?.(exportName);
      continue;
    }

    Object.assign(preview, {
      [exportName]: reactNativeModule[exportName]
    });
  }

  return preview;
};
