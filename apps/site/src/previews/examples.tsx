import React, { type ReactNode } from "react";
import { Text, View } from "react-native";

import {
  ChartKitProvider,
  type ChartKitThemeMode
} from "react-native-chart-kit/v2";

import { chartPreviewExamples } from "./registry";
import { showcaseCustomPresets } from "../../../expo-showcase/src/showcaseTheme";

type PreviewRenderContext = {
  mode: Exclude<ChartKitThemeMode, "system">;
  width: number;
};

export type ChartPreviewExample = {
  eyebrow: string;
  id: string;
  render: (context: PreviewRenderContext) => ReactNode;
  title: string;
};

export const renderChartPreview = ({
  id,
  mode,
  width
}: PreviewRenderContext & { id: string }) => {
  const example = chartPreviewExamples[id];

  if (!example) {
    return (
      <View style={previewStyles.missing}>
        <Text style={previewStyles.missingText}>Unknown preview: {id}</Text>
      </View>
    );
  }

  return (
    <ChartKitProvider
      mode={mode}
      preset="default"
      presets={showcaseCustomPresets}
    >
      <View style={previewStyles.shell}>
        <View style={previewStyles.header}>
          <Text style={previewStyles.eyebrow}>{example.eyebrow}</Text>
          <Text
            style={[
              previewStyles.title,
              mode === "dark" && previewStyles.titleDark
            ]}
          >
            {example.title}
          </Text>
        </View>
        <View style={previewStyles.chart}>
          {example.render({ mode, width: width - 2 })}
        </View>
      </View>
    </ChartKitProvider>
  );
};

const previewStyles = {
  chart: {
    alignItems: "center" as const,
    overflow: "visible" as const
  },
  eyebrow: {
    color: "#2f5f9f",
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 0,
    marginBottom: 8
  },
  header: {
    marginBottom: 16
  },
  missing: {
    backgroundColor: "#ffffff",
    borderColor: "rgba(16, 18, 23, 0.14)",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16
  },
  missingText: {
    color: "#697182",
    fontSize: 14,
    fontWeight: "400" as const
  },
  shell: {
    width: "100%" as const
  },
  title: {
    color: "#101217",
    fontSize: 28,
    fontWeight: "600" as const,
    letterSpacing: 0
  },
  titleDark: {
    color: "#f7f8f8"
  }
};
