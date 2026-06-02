import React, { type ReactNode } from "react";

import {
  ChartKitProvider,
  type CartesianChartPresetRegistry,
  type CartesianChartPresetValue,
  type ChartKitThemeMode
} from "react-native-chart-kit/v2";
import { ChartKitProvider as ProChartKitProvider } from "@chart-kit/pro/react-native";

type ChartPreviewProvidersProps = {
  children: ReactNode;
  mode: Exclude<ChartKitThemeMode, "system">;
  preset: CartesianChartPresetValue;
  presets: CartesianChartPresetRegistry;
};

export const ChartPreviewProviders = ({
  children,
  mode,
  preset,
  presets
}: ChartPreviewProvidersProps) => (
  <ChartKitProvider mode={mode} preset={preset} presets={presets}>
    <ProChartKitProvider mode={mode} preset={preset} presets={presets}>
      {children}
    </ProChartKitProvider>
  </ChartKitProvider>
);
