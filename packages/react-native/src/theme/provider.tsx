import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren
} from "react";
import { useColorScheme } from "react-native";

import type {
  CartesianChartPresetRegistry,
  CartesianChartPresetValue,
  CartesianChartTheme,
  ChartKitThemeMode,
  ResolvedChartKitThemeMode
} from "./presets";

export type ChartKitThemeContextValue = {
  mode: ResolvedChartKitThemeMode;
  preset: CartesianChartPresetValue;
  presets: CartesianChartPresetRegistry;
  theme: CartesianChartTheme | undefined;
};

const defaultChartKitThemeContext: ChartKitThemeContextValue = {
  mode: "light",
  preset: "default",
  presets: {},
  theme: undefined
};

const ChartKitThemeContext = createContext<ChartKitThemeContextValue>(
  defaultChartKitThemeContext
);

export type ChartKitProviderProps = PropsWithChildren<{
  mode?: ChartKitThemeMode;
  preset?: CartesianChartPresetValue;
  presets?: CartesianChartPresetRegistry;
  theme?: CartesianChartTheme;
}>;

export const ChartKitProvider = ({
  children,
  mode = "light",
  preset = "default",
  presets = {},
  theme
}: ChartKitProviderProps) => {
  const systemColorScheme = useColorScheme();
  const resolvedMode: ResolvedChartKitThemeMode =
    mode === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : mode;
  const value = useMemo<ChartKitThemeContextValue>(
    () => ({
      mode: resolvedMode,
      preset,
      presets,
      theme
    }),
    [preset, presets, resolvedMode, theme]
  );

  return (
    <ChartKitThemeContext.Provider value={value}>
      {children}
    </ChartKitThemeContext.Provider>
  );
};

export const useChartKitTheme = () => useContext(ChartKitThemeContext);
