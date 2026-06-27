export type ChartKitThemeMode = "light" | "dark" | "system";
export type ResolvedChartKitThemeMode = Exclude<ChartKitThemeMode, "system">;

export type CartesianChartTypography = {
  fontFamily?: string;
  axisLabelSize?: number;
  legendLabelSize?: number;
};

export type CartesianChartTooltipTheme = {
  background?: string;
  border?: string;
  text?: string;
  mutedText?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  borderRadius?: number;
  padding?: number;
  fontSize?: number;
  labelFontSize?: number;
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
  tooltip?: CartesianChartTooltipTheme;
};

export type ResolvedCartesianChartTypography = {
  fontFamily?: string;
  axisLabelSize: number;
  legendLabelSize: number;
};

export type ResolvedCartesianChartTooltipTheme = {
  background: string;
  border: string;
  text: string;
  mutedText: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  borderRadius: number;
  padding: number;
  fontSize: number;
  labelFontSize: number;
};

type CartesianChartCoreTheme = {
  background: string;
  plotBackground: string;
  grid: string;
  axis: string;
  text: string;
  mutedText: string;
  series: string[];
  typography: ResolvedCartesianChartTypography;
};

export type ResolvedCartesianChartTheme = CartesianChartCoreTheme & {
  tooltip: ResolvedCartesianChartTooltipTheme;
};

export type CartesianChartPreset = {
  light?: CartesianChartTheme;
  dark?: CartesianChartTheme;
};

export type CartesianChartPresetInput =
  | CartesianChartTheme
  | CartesianChartPreset;

export type CartesianChartPresetName =
  | "default"
  | "spectrum"
  | "aurora"
  | "verdant"
  | "cupertino"
  | "material"
  | "graphite"
  | "contrast"
  | "midnight";

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

const resolveCartesianChartTooltipTheme = (
  theme: CartesianChartCoreTheme,
  tooltip: CartesianChartTooltipTheme | undefined
): ResolvedCartesianChartTooltipTheme => ({
  background: tooltip?.background ?? theme.plotBackground,
  border: tooltip?.border ?? theme.axis,
  text: tooltip?.text ?? theme.text,
  mutedText: tooltip?.mutedText ?? theme.mutedText,
  shadowColor: tooltip?.shadowColor ?? "#020617",
  shadowOpacity: tooltip?.shadowOpacity ?? 0.16,
  shadowOffsetX: tooltip?.shadowOffsetX ?? 0,
  shadowOffsetY: tooltip?.shadowOffsetY ?? 3,
  borderRadius: tooltip?.borderRadius ?? 8,
  padding: tooltip?.padding ?? 10,
  fontSize: tooltip?.fontSize ?? theme.typography.legendLabelSize,
  labelFontSize: tooltip?.labelFontSize ?? theme.typography.legendLabelSize
});

const createResolvedCartesianChartTheme = (
  theme: CartesianChartCoreTheme & { tooltip?: CartesianChartTooltipTheme }
): ResolvedCartesianChartTheme => ({
  ...theme,
  tooltip: resolveCartesianChartTooltipTheme(theme, theme.tooltip)
});

const defaultLightTheme: CartesianChartCoreTheme = {
  background: "#ffffff",
  plotBackground: "#ffffff",
  grid: "#e5e7eb",
  axis: "#e5e7eb",
  text: "#0f172a",
  mutedText: "#64748b",
  series: ["#2563eb", "#0891b2", "#7c3aed", "#16a34a"],
  typography: defaultCartesianChartTypography
};

const defaultDarkTheme: CartesianChartCoreTheme = {
  background: "#0f172a",
  plotBackground: "#111827",
  grid: "#334155",
  axis: "#475569",
  text: "#e5e7eb",
  mutedText: "#94a3b8",
  series: ["#38bdf8", "#a78bfa", "#22c55e", "#f59e0b"],
  typography: defaultCartesianChartTypography
};

const resolvedDefaultThemes: Record<
  ResolvedChartKitThemeMode,
  ResolvedCartesianChartTheme
> = {
  light: createResolvedCartesianChartTheme(defaultLightTheme),
  dark: createResolvedCartesianChartTheme(defaultDarkTheme)
};

export const builtInCartesianChartPresets: Record<
  CartesianChartPresetName,
  Required<CartesianChartPreset>
> = {
  default: {
    light: defaultLightTheme,
    dark: defaultDarkTheme
  },
  spectrum: {
    light: {
      background: "#f4f7ff",
      plotBackground: "#ffffff",
      grid: "#cfddff",
      axis: "#b8c8ef",
      text: "#122044",
      mutedText: "#566482",
      series: ["#e11d48", "#2563eb", "#f59e0b", "#16a34a"],
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
  aurora: {
    light: {
      background: "#f7f2ff",
      plotBackground: "#fffaff",
      grid: "#ddd0ff",
      axis: "#c7b7f5",
      text: "#21133d",
      mutedText: "#705d8f",
      series: ["#7c3aed", "#0891b2", "#db2777", "#ea580c"],
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
  verdant: {
    light: {
      background: "#f1fbf5",
      plotBackground: "#fbfffd",
      grid: "#cdebd9",
      axis: "#b4dbc4",
      text: "#0d2618",
      mutedText: "#557064",
      series: ["#059669", "#65a30d", "#0e7490", "#dc2626"],
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
  cupertino: {
    light: {
      background: "#f2f7ff",
      plotBackground: "#ffffff",
      grid: "#d5e6fa",
      axis: "#c5d8ed",
      text: "#162033",
      mutedText: "#617189",
      series: ["#007aff", "#ff2d55", "#34c759", "#ff9500"],
      typography: defaultCartesianChartTypography
    },
    dark: {
      background: "#000000",
      plotBackground: "#1c1c1e",
      grid: "#38383a",
      axis: "#48484a",
      text: "#f5f5f7",
      mutedText: "#aeaeb2",
      series: ["#0a84ff", "#30d158", "#ff9f0a", "#ff375f"],
      typography: defaultCartesianChartTypography
    }
  },
  material: {
    light: {
      background: "#fff7fb",
      plotBackground: "#fffafd",
      grid: "#eaddec",
      axis: "#d7c5dd",
      text: "#1d1b20",
      mutedText: "#625b71",
      series: ["#6750a4", "#006a6a", "#b3261e", "#7d5260"],
      typography: defaultCartesianChartTypography
    },
    dark: {
      background: "#141218",
      plotBackground: "#1d1b20",
      grid: "#49454f",
      axis: "#5d5668",
      text: "#e6e0e9",
      mutedText: "#cac4d0",
      series: ["#d0bcff", "#4fd8d8", "#ffb4ab", "#efb8c8"],
      typography: defaultCartesianChartTypography
    }
  },
  graphite: {
    light: {
      background: "#f4f5f7",
      plotBackground: "#fbfcfd",
      grid: "#d9dee7",
      axis: "#c9d0dc",
      text: "#111827",
      mutedText: "#6b7280",
      series: ["#111827", "#475569", "#737b88", "#a1aab6"],
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
  contrast: {
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
  },
  midnight: {
    light: {
      background: "#edf3fb",
      plotBackground: "#f8fbff",
      grid: "#bfd0e2",
      axis: "#a8b9cc",
      text: "#0b1220",
      mutedText: "#53657a",
      series: ["#0f766e", "#2563eb", "#9333ea", "#ea580c"],
      typography: defaultCartesianChartTypography
    },
    dark: {
      background: "#020617",
      plotBackground: "#07111f",
      grid: "#1e293b",
      axis: "#334155",
      text: "#e2e8f0",
      mutedText: "#94a3b8",
      series: ["#22d3ee", "#34d399", "#f59e0b", "#f472b6"],
      typography: defaultCartesianChartTypography
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

  const mergedTheme = {
    background: override.background ?? base.background,
    plotBackground: override.plotBackground ?? base.plotBackground,
    grid: override.grid ?? base.grid,
    axis: override.axis ?? base.axis,
    text: override.text ?? base.text,
    mutedText: override.mutedText ?? base.mutedText,
    series: override.series ?? base.series,
    typography
  };

  return {
    ...mergedTheme,
    tooltip: resolveCartesianChartTooltipTheme(
      mergedTheme,
      override.tooltip ?? base.tooltip
    )
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
  const baseTheme = resolvedDefaultThemes[mode];
  const mergedTheme = mergeCartesianChartTheme(
    mergeCartesianChartTheme(baseTheme, presetTheme),
    theme
  );
  const hasTooltipOverride =
    presetTheme.tooltip !== undefined || theme?.tooltip !== undefined;
  const tooltipOverride = hasTooltipOverride
    ? {
        ...(presetTheme.tooltip ?? {}),
        ...(theme?.tooltip ?? {})
      }
    : undefined;

  return {
    ...mergedTheme,
    tooltip: resolveCartesianChartTooltipTheme(mergedTheme, tooltipOverride)
  };
};
