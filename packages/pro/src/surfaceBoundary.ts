export type ChartKitSurfaceStatus =
  | "compatibility"
  | "free-baseline"
  | "pro-candidate";

export type ChartKitSurfaceKind =
  | "capability"
  | "component"
  | "hook"
  | "provider"
  | "utility";

export type ChartKitSurfaceExport = {
  exportName: string;
  kind: ChartKitSurfaceKind;
  packageName:
    | "@chart-kit/react-native"
    | "@chart-kit/react-native/pro-preview"
    | "react-native-chart-kit";
  status: ChartKitSurfaceStatus;
};

export type ChartKitProCandidateCapability = {
  capabilities: readonly string[];
  exportName: string;
  featureId: string;
};

export const chartKitCompatibilitySurface = [
  "LineChart",
  "BarChart",
  "StackedBarChart",
  "PieChart",
  "ProgressChart",
  "ContributionGraph"
].map(
  (exportName): ChartKitSurfaceExport => ({
    exportName,
    kind: "component",
    packageName: "react-native-chart-kit",
    status: "compatibility"
  })
);

export const chartKitFreeBaselineSurface = [
  "AreaChart",
  "BarChart",
  "CalendarHeatmap",
  "ContributionGraph",
  "DonutChart",
  "LineChart",
  "PieChart",
  "ProgressChart",
  "ProgressRing",
  "StackedBarChart",
  "ChartKitProvider",
  "builtInCartesianChartPresets",
  "createChartPreset",
  "resolveCartesianChartThemeConfig",
  "useChartKitTheme"
].map(
  (exportName): ChartKitSurfaceExport => ({
    exportName,
    kind: exportName.startsWith("use")
      ? "hook"
      : exportName.includes("Provider")
        ? "provider"
        : exportName.startsWith("get") ||
            exportName.startsWith("create") ||
            exportName.startsWith("resolve") ||
            exportName.startsWith("builtIn")
          ? "utility"
          : "component",
    packageName: "@chart-kit/react-native",
    status: "free-baseline"
  })
);

export const chartKitProCandidateSurface = [
  "CandlestickChart",
  "CombinedChart",
  "ChartSelectionProvider",
  "useChartSelection",
  "useDismissChartSelection"
].map(
  (exportName): ChartKitSurfaceExport => ({
    exportName,
    kind: exportName.startsWith("use")
      ? "hook"
      : exportName.includes("Provider")
        ? "provider"
        : "component",
    packageName: "@chart-kit/react-native/pro-preview",
    status: "pro-candidate"
  })
);

export const chartKitProCandidateCapabilities = [
  {
    capabilities: [
      "animated data transitions",
      "crosshair",
      "range selector",
      "scrub tooltip",
      "shared tooltip",
      "viewport pan",
      "viewport pinch zoom"
    ],
    exportName: "LineChart",
    featureId: "pro-interactions"
  },
  {
    capabilities: [
      "animated selection",
      "fixed-axis scroll",
      "grouped bars",
      "horizontal bars",
      "scrollable selection",
      "tap tooltip"
    ],
    exportName: "BarChart",
    featureId: "pro-chart-types"
  },
  {
    capabilities: [
      "dual axis",
      "legend visibility controls",
      "shared tooltip",
      "stacked bar plus line"
    ],
    exportName: "CombinedChart",
    featureId: "pro-chart-types"
  },
  {
    capabilities: [
      "calendar-aware session gaps",
      "emergency closures",
      "financial narrative",
      "OHLC tooltip",
      "range selector",
      "volume overlay"
    ],
    exportName: "CandlestickChart",
    featureId: "pro-chart-types"
  },
  {
    capabilities: ["active slice", "custom rich legend", "tap selection"],
    exportName: "DonutChart",
    featureId: "pro-chart-types"
  }
] as const satisfies readonly ChartKitProCandidateCapability[];

export const chartKitPackageBoundarySurface = [
  ...chartKitCompatibilitySurface,
  ...chartKitFreeBaselineSurface,
  ...chartKitProCandidateSurface
] as const satisfies readonly ChartKitSurfaceExport[];

export const getChartKitSurfaceExport = (
  exportName: string,
  surface: readonly ChartKitSurfaceExport[] = chartKitPackageBoundarySurface
) => surface.find((item) => item.exportName === exportName);

export const getChartKitProCandidateCapabilities = (
  exportName: string,
  capabilities: readonly ChartKitProCandidateCapability[] = chartKitProCandidateCapabilities
) => capabilities.filter((item) => item.exportName === exportName);
