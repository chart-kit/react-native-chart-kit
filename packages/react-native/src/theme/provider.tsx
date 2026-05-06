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
import type { LineChartRenderer } from "../charts/line/types";

export type ChartKitThemeContextValue = {
  mode: ResolvedChartKitThemeMode;
  preset: CartesianChartPresetValue;
  presets: CartesianChartPresetRegistry;
  renderer?: LineChartRenderer;
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
  renderer?: LineChartRenderer;
  theme?: CartesianChartTheme;
}>;

export const ChartKitProvider = ({
  children,
  mode = "light",
  preset = "default",
  presets = {},
  renderer,
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
      ...(renderer ? { renderer } : {}),
      theme
    }),
    [preset, presets, renderer, resolvedMode, theme]
  );

  return (
    <ChartKitThemeContext.Provider value={value}>
      {children}
    </ChartKitThemeContext.Provider>
  );
};

export const useChartKitTheme = () => useContext(ChartKitThemeContext);
