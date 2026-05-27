import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useChartKitTheme } from "react-native-chart-kit/v2";

export type NativeStoryProps = {
  isTakeoverMode?: boolean;
  isVisualMode?: boolean;
  onExitTakeover?: () => void;
  onScrubEnd?: () => void;
  onScrubStart?: () => void;
  width: number;
};

export type ShowcaseStory = {
  id: string;
  title: string;
  Component: React.ComponentType<NativeStoryProps>;
  Details?: React.ComponentType<NativeStoryProps>;
  presentation?: "card" | "takeover";
};

export type ShowcaseSection = {
  id: string;
  title: string;
  stories: ShowcaseStory[];
};

export type ShowcaseMode = {
  id: "preview" | "charts" | "features" | "qa";
  title: string;
  pages: ShowcasePage[];
};

export type ShowcasePage = {
  id: string;
  title: string;
  description: string;
  storyGroups?: ShowcaseStoryGroup[];
  storyIds?: string[];
};

export type ShowcaseStoryGroup = {
  id: string;
  title: string;
  description?: string;
  storyIds: string[];
};

export const ChartSection = ({
  children,
  title
}: {
  children: React.ReactNode;
  kicker?: string;
  title: string;
}) => {
  const { mode } = useChartKitTheme();
  const isDarkSection = mode === "dark";

  return (
    <View style={styles.storySection}>
      <Text style={[styles.storyTitle, isDarkSection && styles.darkStoryTitle]}>
        {title}
      </Text>
      <View style={styles.chartSlot}>{children}</View>
    </View>
  );
};

export const EmptyState = ({
  copy,
  height
}: {
  copy: string;
  height: number;
}) => (
  <View style={[styles.emptyState, { height }]}>
    <Text style={styles.emptyTitle}>No chart data</Text>
    <Text style={styles.emptyCopy}>{copy}</Text>
  </View>
);

const styles = StyleSheet.create({
  storySection: {
    width: "100%"
  },
  storyTitle: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 14
  },
  darkStoryTitle: {
    color: "#f8fafc"
  },
  chartSlot: {
    alignItems: "center",
    overflow: "visible"
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    justifyContent: "center",
    width: "100%"
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8
  },
  emptyCopy: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center"
  },
  replayButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#e0f2fe",
    borderColor: "#7dd3fc",
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    marginTop: 10,
    minWidth: 88,
    paddingHorizontal: 14
  },
  replayButtonPressed: {
    opacity: 0.72
  },
  replayButtonText: {
    color: "#075985",
    fontSize: 13,
    fontWeight: "800"
  }
});

export const storyStyles = styles;
