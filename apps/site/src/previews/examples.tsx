import React, { type ReactNode } from "react";
import { Text, View } from "react-native";

import {
  type CartesianChartPresetValue,
  type ChartKitThemeMode
} from "react-native-chart-kit/v2";

import { ChartPreviewProviders } from "./ChartPreviewProviders";
import { chartPreviewExamples } from "./registry";
import { showcaseCustomPresets } from "./showcaseTheme";

type PreviewRenderContext = {
  chartThemePreset: CartesianChartPresetValue;
  isMostMobile: boolean;
  mode: Exclude<ChartKitThemeMode, "system">;
  width: number;
};

export type ChartPreviewExample = {
  ctaHref?: string;
  ctaLabel?: string;
  description?: string;
  eyebrow: string;
  id: string;
  render: (context: PreviewRenderContext) => ReactNode;
  supportsChartTheme?: boolean;
  tier?: "free" | "pro";
  title: string;
};

export const renderChartPreview = ({
  chartThemePreset,
  id,
  isMostMobile,
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

  const preset =
    example.supportsChartTheme === false ? "default" : chartThemePreset;

  return (
    <ChartPreviewProviders
      mode={mode}
      preset={preset}
      presets={showcaseCustomPresets}
    >
      <View style={previewStyles.shell}>
        <View style={previewStyles.header}>
          <View style={previewStyles.metaRow}>
            <Text style={previewStyles.eyebrow}>{example.eyebrow}</Text>
            {example.tier === "pro" ? (
              <Text
                accessibilityLabel="Available in Chart Kit Pro"
                style={[
                  previewStyles.proBadge,
                  mode === "dark" && previewStyles.proBadgeDark
                ]}
              >
                Pro
              </Text>
            ) : null}
          </View>
          <Text
            style={[
              previewStyles.title,
              mode === "dark" && previewStyles.titleDark
            ]}
          >
            {example.title}
          </Text>
          {example.description ? (
            <Text
              style={[
                previewStyles.description,
                mode === "dark" && previewStyles.descriptionDark
              ]}
            >
              {example.description}
            </Text>
          ) : null}
        </View>
        <View style={previewStyles.chart}>
          {example.render({ chartThemePreset, isMostMobile, mode, width })}
        </View>
        {example.tier === "pro" ? (
          <a
            className="chart-kit-live-preview__pro-link"
            href={example.ctaHref ?? "/#pricing"}
          >
            {example.ctaLabel ?? "View Pro plans"}
          </a>
        ) : null}
      </View>
    </ChartPreviewProviders>
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
  description: {
    color: "rgba(7, 23, 51, 0.62)",
    fontSize: 14,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 540
  },
  descriptionDark: {
    color: "rgba(255, 255, 255, 0.62)"
  },
  metaRow: {
    alignItems: "center" as const,
    flexDirection: "row" as const,
    gap: 8,
    marginBottom: 8
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
  proBadge: {
    backgroundColor: "rgba(0, 85, 218, 0.1)",
    borderColor: "rgba(0, 85, 218, 0.22)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#0055DA",
    fontSize: 11,
    fontWeight: "800" as const,
    letterSpacing: 0,
    lineHeight: 18,
    overflow: "hidden" as const,
    paddingHorizontal: 8,
    textTransform: "uppercase" as const
  },
  proBadgeDark: {
    backgroundColor: "rgba(0, 85, 218, 0.16)",
    borderColor: "rgba(0, 85, 218, 0.38)",
    color: "#8AB6FF"
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
