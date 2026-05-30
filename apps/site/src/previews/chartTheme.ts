export type ChartThemePreset =
  | "default"
  | "analytics"
  | "fintech"
  | "health"
  | "ios"
  | "material"
  | "minimal"
  | "highContrast"
  | "darkFintech"
  | "studio";

export const chartThemeStorageKey = "chartkit-chart-theme";
export const chartThemeChangeEvent = "chartkit:chart-theme-change";

export const chartThemeOptions: Array<{
  label: string;
  value: ChartThemePreset;
}> = [
  { label: "Default", value: "default" },
  { label: "Analytics", value: "analytics" },
  { label: "Fintech", value: "fintech" },
  { label: "Health", value: "health" },
  { label: "iOS", value: "ios" },
  { label: "Material", value: "material" },
  { label: "Minimal", value: "minimal" },
  { label: "High contrast", value: "highContrast" },
  { label: "Dark fintech", value: "darkFintech" },
  { label: "Studio", value: "studio" }
];

export const isChartThemePreset = (
  value: string | null | undefined
): value is ChartThemePreset =>
  chartThemeOptions.some((option) => option.value === value);

export const getCurrentChartThemePreset = (): ChartThemePreset => {
  if (typeof document !== "undefined") {
    const documentTheme = document.documentElement.dataset.chartTheme;

    if (isChartThemePreset(documentTheme)) {
      return documentTheme;
    }
  }

  if (typeof localStorage !== "undefined") {
    try {
      const storedTheme = localStorage.getItem(chartThemeStorageKey);

      if (isChartThemePreset(storedTheme)) {
        return storedTheme;
      }
    } catch {
      // Storage can be blocked in restricted browser contexts.
    }
  }

  return "default";
};

export const applyChartThemePreset = (
  preset: ChartThemePreset,
  options: { dispatch?: boolean } = {}
) => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.chartTheme = preset;
  }

  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(chartThemeStorageKey, preset);
    } catch {
      // Persisting the preference is best-effort.
    }
  }

  if (options.dispatch !== false && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(chartThemeChangeEvent, { detail: { preset } })
    );
  }
};
