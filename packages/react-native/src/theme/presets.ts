export type ChartKitThemeMode = "light" | "dark" | "system";
export type ResolvedChartKitThemeMode = Exclude<ChartKitThemeMode, "system">;

export type CartesianChartTypography = {
  fontFamily?: string;
  axisLabelSize?: number;
  legendLabelSize?: number;
};

export type CartesianChartTheme = {
  background?: string;
  plotBackground?: string;
  grid?: string;
  axis?: string;
  text?: string;
  mutedText?: string;
  series?: string[];
  typography?: CartesianChartTypography;
};

export type ResolvedCartesianChartTypography = {
  fontFamily?: string;
  axisLabelSize: number;
  legendLabelSize: number;
};

export type ResolvedCartesianChartTheme = {
  background: string;
  plotBackground: string;
  grid: string;
  axis: string;
  text: string;
  mutedText: string;
  series: string[];
  typography: ResolvedCartesianChartTypography;
};

export type CartesianChartPreset = {
  light?: CartesianChartTheme;
  dark?: CartesianChartTheme;
};

type ResolvedCartesianChartPreset = {
  light: ResolvedCartesianChartTheme;
  dark: ResolvedCartesianChartTheme;
};

export type CartesianChartPresetInput =
  | CartesianChartTheme
  | CartesianChartPreset;

export type CartesianChartPresetName =
  | "default"
  | "analytics"
  | "fintech"
  | "health"
  | "minimal"
  | "highContrast";

export type CartesianChartPresetValue =
  | CartesianChartPresetName
  | (string & {})
  | CartesianChartPresetInput;

export type CartesianChartPresetRegistry = Record<
  string,
  CartesianChartPresetInput
>;

export const defaultCartesianChartTypography: ResolvedCartesianChartTypography =
  {
    axisLabelSize: 11,
    legendLabelSize: 11
  };

const defaultLightTheme: ResolvedCartesianChartTheme = {
  background: "#ffffff",
  plotBackground: "#ffffff",
  grid: "#e5e7eb",
  axis: "#e5e7eb",
  text: "#0f172a",
  mutedText: "#64748b",
  series: ["#2563eb", "#0891b2", "#7c3aed", "#16a34a"],
  typography: defaultCartesianChartTypography
};

const defaultDarkTheme: ResolvedCartesianChartTheme = {
  background: "#0f172a",
  plotBackground: "#111827",
  grid: "#334155",
  axis: "#475569",
  text: "#e5e7eb",
  mutedText: "#94a3b8",
  series: ["#38bdf8", "#a78bfa", "#22c55e", "#f59e0b"],
  typography: defaultCartesianChartTypography
};

export const builtInCartesianChartPresets: Record<
  CartesianChartPresetName,
  ResolvedCartesianChartPreset
> = {
  default: {
    light: defaultLightTheme,
    dark: defaultDarkTheme
  },
  analytics: {
    light: {
      background: "#ffffff",
      plotBackground: "#ffffff",
      grid: "#dbe5f1",
      axis: "#cfdae8",
      text: "#102033",
      mutedText: "#55708d",
      series: ["#2563eb", "#10b981", "#f59e0b", "#7c3aed"],
      typography: defaultCartesianChartTypography
    },
    dark: {
      background: "#07111f",
      plotBackground: "#0b1627",
      grid: "#1d3554",
      axis: "#2d4867",
      text: "#e8f1ff",
      mutedText: "#9db2cb",
      series: ["#60a5fa", "#34d399", "#fbbf24", "#c084fc"],
      typography: defaultCartesianChartTypography
    }
  },
  fintech: {
    light: {
      background: "#f8fbff",
      plotBackground: "#ffffff",
      grid: "#d9e5f2",
      axis: "#c6d6e6",
      text: "#08111f",
      mutedText: "#52667d",
      series: ["#0284c7", "#8b5cf6", "#14b8a6", "#f97316"],
      typography: defaultCartesianChartTypography
    },
    dark: {
      background: "#020617",
      plotBackground: "#0c1424",
      grid: "#1e3a5f",
      axis: "#2c5078",
      text: "#f8fafc",
      mutedText: "#9fb6d1",
      series: ["#38bdf8", "#a78bfa", "#2dd4bf", "#fb923c"],
      typography: defaultCartesianChartTypography
    }
  },
  health: {
    light: {
      background: "#fbfefc",
      plotBackground: "#ffffff",
      grid: "#dbeee5",
      axis: "#c9dfd4",
      text: "#10221a",
      mutedText: "#5f776b",
      series: ["#059669", "#e11d48", "#0ea5e9", "#84cc16"],
      typography: defaultCartesianChartTypography
    },
    dark: {
      background: "#07130f",
      plotBackground: "#0b1c15",
      grid: "#214638",
      axis: "#315b4c",
      text: "#eefbf4",
      mutedText: "#a8c7b7",
      series: ["#34d399", "#fb7185", "#38bdf8", "#bef264"],
      typography: defaultCartesianChartTypography
    }
  },
  minimal: {
    light: {
      background: "#ffffff",
      plotBackground: "#ffffff",
      grid: "#eceff3",
      axis: "#e2e6ec",
      text: "#111827",
      mutedText: "#6b7280",
      series: ["#111827", "#64748b", "#94a3b8", "#cbd5e1"],
      typography: defaultCartesianChartTypography
    },
    dark: {
      background: "#0b0d10",
      plotBackground: "#111418",
      grid: "#2a2f36",
      axis: "#3a4048",
      text: "#f3f4f6",
      mutedText: "#a1a8b3",
      series: ["#f8fafc", "#cbd5e1", "#94a3b8", "#64748b"],
      typography: defaultCartesianChartTypography
    }
  },
  highContrast: {
    light: {
      background: "#ffffff",
      plotBackground: "#ffffff",
      grid: "#111827",
      axis: "#111827",
      text: "#000000",
      mutedText: "#1f2937",
      series: ["#005fcc", "#d0006f", "#008a00", "#a15c00"],
      typography: {
        axisLabelSize: 12,
        legendLabelSize: 12
      }
    },
    dark: {
      background: "#000000",
      plotBackground: "#050505",
      grid: "#f9fafb",
      axis: "#f9fafb",
      text: "#ffffff",
      mutedText: "#e5e7eb",
      series: ["#7dd3fc", "#f0abfc", "#86efac", "#fde68a"],
      typography: {
        axisLabelSize: 12,
        legendLabelSize: 12
      }
    }
  }
};

export const createChartPreset = (
  preset: CartesianChartPresetInput
): CartesianChartPresetInput => preset;

const isModePreset = (
  preset: CartesianChartPresetInput
): preset is CartesianChartPreset => "light" in preset || "dark" in preset;

const getPresetTheme = ({
  mode,
  preset,
  registry
}: {
  mode: ResolvedChartKitThemeMode;
  preset: CartesianChartPresetValue | undefined;
  registry: CartesianChartPresetRegistry;
}) => {
  const presetInput =
    typeof preset === "string"
      ? (registry[preset] ?? builtInCartesianChartPresets.default)
      : preset;

  if (!presetInput) {
    return builtInCartesianChartPresets.default[mode];
  }

  if (isModePreset(presetInput)) {
    return (
      presetInput[mode] ??
      presetInput.light ??
      presetInput.dark ??
      builtInCartesianChartPresets.default[mode]
    );
  }

  return presetInput;
};

export const mergeCartesianChartTheme = (
  base: ResolvedCartesianChartTheme,
  override: CartesianChartTheme | undefined
): ResolvedCartesianChartTheme => {
  if (!override) {
    return base;
  }

  const typography: ResolvedCartesianChartTypography = {
    axisLabelSize:
      override.typography?.axisLabelSize ?? base.typography.axisLabelSize,
    legendLabelSize:
      override.typography?.legendLabelSize ?? base.typography.legendLabelSize
  };

  const fontFamily =
    override.typography?.fontFamily ?? base.typography.fontFamily;

  if (fontFamily) {
    typography.fontFamily = fontFamily;
  }

  return {
    background: override.background ?? base.background,
    plotBackground: override.plotBackground ?? base.plotBackground,
    grid: override.grid ?? base.grid,
    axis: override.axis ?? base.axis,
    text: override.text ?? base.text,
    mutedText: override.mutedText ?? base.mutedText,
    series: override.series ?? base.series,
    typography
  };
};

export const resolveCartesianChartThemeConfig = ({
  mode,
  preset = "default",
  presets = {},
  theme
}: {
  mode: ResolvedChartKitThemeMode;
  preset?: CartesianChartPresetValue | undefined;
  presets?: CartesianChartPresetRegistry | undefined;
  theme?: CartesianChartTheme | undefined;
}): ResolvedCartesianChartTheme => {
  const registry = {
    ...builtInCartesianChartPresets,
    ...presets
  };
  const presetTheme = getPresetTheme({ mode, preset, registry });
  const baseTheme = builtInCartesianChartPresets.default[mode];

  return mergeCartesianChartTheme(
    mergeCartesianChartTheme(baseTheme, presetTheme),
    theme
  );
};
