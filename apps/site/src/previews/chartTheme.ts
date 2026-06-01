export type ChartThemePreset =
  | "default"
  | "spectrum"
  | "aurora"
  | "verdant"
  | "cupertino"
  | "material"
  | "graphite"
  | "contrast"
  | "midnight"
  | "studio";

export const chartThemeStorageKey = "chartkit-chart-theme";
export const chartThemeChangeEvent = "chartkit:chart-theme-change";

export const chartThemeOptions: Array<{
  label: string;
  value: ChartThemePreset;
}> = [
  { label: "Base", value: "default" },
  { label: "Spectrum", value: "spectrum" },
  { label: "Aurora", value: "aurora" },
  { label: "Verdant", value: "verdant" },
  { label: "Cupertino", value: "cupertino" },
  { label: "Material", value: "material" },
  { label: "Graphite", value: "graphite" },
  { label: "Contrast", value: "contrast" },
  { label: "Midnight", value: "midnight" },
  { label: "Studio", value: "studio" }
];

export const isChartThemePreset = (
  value: string | null | undefined
): value is ChartThemePreset =>
  chartThemeOptions.some((option) => option.value === value);

export const normalizeChartThemePreset = (
  value: string | null | undefined
): ChartThemePreset | null => {
  if (!value) {
    return null;
  }

  if (isChartThemePreset(value)) {
    return value;
  }

  return null;
};

export const getCurrentChartThemePreset = (): ChartThemePreset => {
  if (typeof document !== "undefined") {
    const documentTheme = document.documentElement.dataset.chartTheme;

    const normalizedDocumentTheme = normalizeChartThemePreset(documentTheme);

    if (normalizedDocumentTheme) {
      return normalizedDocumentTheme;
    }
  }

  if (typeof localStorage !== "undefined") {
    try {
      const storedTheme = localStorage.getItem(chartThemeStorageKey);

      const normalizedStoredTheme = normalizeChartThemePreset(storedTheme);

      if (normalizedStoredTheme) {
        return normalizedStoredTheme;
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
