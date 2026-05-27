import {
  createChartPreset,
  type CartesianChartPresetName,
  type CartesianChartPresetRegistry,
  type ResolvedChartKitThemeMode
} from "react-native-chart-kit/v2";

// Shared by the Expo showcase and the Astro docs examples. Curate chart
// theme modes, preset labels, and custom presets here.
export type ShowcaseThemeMode = ResolvedChartKitThemeMode;
export type ShowcasePresetId = CartesianChartPresetName | "studio";

export const showcaseModeOptions: Array<{
  id: ShowcaseThemeMode;
  title: string;
}> = [
  { id: "light", title: "Light" },
  { id: "dark", title: "Dark" }
];

export const showcasePresetOptions: Array<{
  id: ShowcasePresetId;
  title: string;
}> = [
  { id: "default", title: "Default" },
  { id: "analytics", title: "Analytics" },
  { id: "fintech", title: "Fintech" },
  { id: "health", title: "Health" },
  { id: "ios", title: "iOS" },
  { id: "material", title: "Material" },
  { id: "minimal", title: "Minimal" },
  { id: "highContrast", title: "High Contrast" },
  { id: "darkFintech", title: "Dark Fintech" },
  { id: "studio", title: "Studio" }
];

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
  })
};
