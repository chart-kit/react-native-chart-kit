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

export type ChartKitProCandidateTriggerKind =
  | "component"
  | "prop"
  | "prop-value";

export type ChartKitProCandidateTrigger = {
  capability: string;
  exportName: string;
  featureId: string;
  freeFallback: string;
  kind: ChartKitProCandidateTriggerKind;
  propName?: string;
  propValue?: string;
};

const getChartKitSurfaceKind = (exportName: string): ChartKitSurfaceKind =>
  exportName.startsWith("use")
    ? "hook"
    : exportName.includes("Provider")
      ? "provider"
      : exportName.startsWith("get") ||
          exportName.startsWith("create") ||
          exportName.startsWith("resolve") ||
          exportName.startsWith("builtIn")
        ? "utility"
        : "component";

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
  "getBarChartAccessibilitySummary",
  "getBarChartDataTable",
  "getContributionGraphAccessibilitySummary",
  "getContributionGraphDataTable",
  "getLineChartAccessibilitySummary",
  "getLineChartDataTable",
  "getPieChartAccessibilitySummary",
  "getPieChartDataTable",
  "getProgressChartAccessibilitySummary",
  "getProgressChartDataTable",
  "resolveCartesianChartThemeConfig",
  "useChartKitTheme"
].map(
  (exportName): ChartKitSurfaceExport => ({
    exportName,
    kind: getChartKitSurfaceKind(exportName),
    packageName: "@chart-kit/react-native",
    status: "free-baseline"
  })
);

export const chartKitProCandidateSurface = [
  "CandlestickChart",
  "ChartSelectionProvider",
  "CombinedChart",
  "getCandlestickChartAccessibilitySummary",
  "getCandlestickChartDataTable",
  "getCandlestickChartFinancialNarrative",
  "getCandlestickEmergencyClosureSessions",
  "getCombinedChartAccessibilitySummary",
  "getCombinedChartDataTable",
  "useChartSelection",
  "useDismissChartSelection"
].map(
  (exportName): ChartKitSurfaceExport => ({
    exportName,
    kind: getChartKitSurfaceKind(exportName),
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

export const chartKitProCandidateTriggers = [
  {
    capability: "brush and range selection",
    exportName: "LineChart",
    featureId: "pro-interactions",
    freeFallback: "Static and scrollable line charts remain free.",
    kind: "prop",
    propName: "rangeSelector"
  },
  {
    capability: "viewport pan and pinch zoom",
    exportName: "LineChart",
    featureId: "pro-interactions",
    freeFallback:
      "Basic viewport sizing and visible point windows remain free.",
    kind: "prop",
    propName: "viewportInteraction"
  },
  {
    capability: "crosshair inspection",
    exportName: "LineChart",
    featureId: "pro-interactions",
    freeFallback: "Basic press selection can remain free.",
    kind: "prop",
    propName: "crosshair"
  },
  {
    capability: "scrub selection",
    exportName: "LineChart",
    featureId: "pro-interactions",
    freeFallback: "Tap selection can remain free.",
    kind: "prop-value",
    propName: "interaction",
    propValue: "scrub"
  },
  {
    capability: "custom production tooltip",
    exportName: "LineChart",
    featureId: "pro-interactions",
    freeFallback: "A simple selected-value readout can remain free.",
    kind: "prop",
    propName: "renderTooltip"
  },
  {
    capability: "axis width stabilization during viewport changes",
    exportName: "LineChart",
    featureId: "pro-layout-engine",
    freeFallback: "Safe default axis padding remains free.",
    kind: "prop",
    propName: "yAxisLabelWidth"
  },
  {
    capability: "large dataset decimation",
    exportName: "LineChart",
    featureId: "pro-performance",
    freeFallback:
      "Common small and medium SVG datasets stay optimized in the free renderer.",
    kind: "prop",
    propName: "decimation"
  },
  {
    capability: "fixed-axis scrollable bars",
    exportName: "BarChart",
    featureId: "pro-interactions",
    freeFallback: "Static vertical bars remain free.",
    kind: "prop",
    propName: "scrollable"
  },
  {
    capability: "tap selection and tooltip",
    exportName: "BarChart",
    featureId: "pro-interactions",
    freeFallback: "Basic static bars and labels remain free.",
    kind: "prop",
    propName: "interaction"
  },
  {
    capability: "animated selected bar state",
    exportName: "BarChart",
    featureId: "pro-interactions",
    freeFallback: "Unanimated selected styles can remain free.",
    kind: "prop",
    propName: "selectionAnimation"
  },
  {
    capability: "grouped bars",
    exportName: "BarChart",
    featureId: "pro-chart-types",
    freeFallback: "Single-series and baseline stacked bars remain free.",
    kind: "prop-value",
    propName: "mode",
    propValue: "grouped"
  },
  {
    capability: "horizontal bars",
    exportName: "BarChart",
    featureId: "pro-chart-types",
    freeFallback: "Vertical bars remain free.",
    kind: "prop-value",
    propName: "orientation",
    propValue: "horizontal"
  },
  {
    capability: "combo bar plus line and dual-axis composition",
    exportName: "CombinedChart",
    featureId: "pro-chart-types",
    freeFallback: "Separate line and bar charts remain free.",
    kind: "component"
  },
  {
    capability: "candlestick and OHLC workflows",
    exportName: "CandlestickChart",
    featureId: "pro-chart-types",
    freeFallback: "General line and area charts remain free.",
    kind: "component"
  },
  {
    capability: "advanced donut active-slice workflow",
    exportName: "DonutChart",
    featureId: "pro-chart-types",
    freeFallback: "Static pie and donut charts remain free.",
    kind: "prop",
    propName: "activeSlice"
  },
  {
    capability: "optional Skia renderer injection",
    exportName: "LineChart",
    featureId: "skia-renderer",
    freeFallback: "SVG remains the default free renderer.",
    kind: "prop",
    propName: "renderer"
  },
  {
    capability: "optional Skia renderer injection",
    exportName: "BarChart",
    featureId: "skia-renderer",
    freeFallback: "SVG remains the default free renderer.",
    kind: "prop",
    propName: "renderer"
  },
  {
    capability: "optional Skia renderer injection",
    exportName: "CombinedChart",
    featureId: "skia-renderer",
    freeFallback: "SVG remains the default free renderer.",
    kind: "prop",
    propName: "renderer"
  },
  {
    capability: "optional Skia renderer injection",
    exportName: "CandlestickChart",
    featureId: "skia-renderer",
    freeFallback: "SVG remains the default free renderer.",
    kind: "prop",
    propName: "renderer"
  }
] as const satisfies readonly ChartKitProCandidateTrigger[];

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

export const getChartKitProCandidateTriggers = (
  exportName: string,
  triggers: readonly ChartKitProCandidateTrigger[] = chartKitProCandidateTriggers
) => triggers.filter((item) => item.exportName === exportName);
