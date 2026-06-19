import {
  createChartPreset,
  type CartesianChartPresetRegistry
} from "react-native-chart-kit/v2";
import { proCartesianChartPresets } from "@chart-kit/pro/themes";

export const showcaseCustomPresets: CartesianChartPresetRegistry = {
  studio: createChartPreset({
    light: {
      background: "#fffdf8",
      plotBackground: "#ffffff",
      grid: "#eadfca",
      axis: "#dccdaf",
      text: "#18130c",
      mutedText: "#7a6748",
      series: ["#a16207", "#be123c", "#0369a1", "#4d7c0f"],
      typography: {
        axisLabelSize: 11,
        legendLabelSize: 12
      }
    },
    dark: {
      background: "#18130c",
      plotBackground: "#22190f",
      grid: "#574124",
      axis: "#765b34",
      text: "#fff7ed",
      mutedText: "#dbc6a0",
      series: ["#fbbf24", "#fb7185", "#38bdf8", "#a3e635"],
      typography: {
        axisLabelSize: 11,
        legendLabelSize: 12
      }
    }
  }),
  ...proCartesianChartPresets
};
