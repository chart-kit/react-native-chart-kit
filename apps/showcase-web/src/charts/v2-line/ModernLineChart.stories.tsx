import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AreaChart, LineChart } from "@chart-kit/react-native-v2";

import {
  basicRevenue,
  denseRevenue,
  multiSeriesRevenue,
  priceHistory,
  revenueWithGaps,
  subscriptionMetrics
} from "./fixtures";

type StoryFrameProps = {
  title: string;
  tone?: "light" | "dark";
  children: React.ReactNode;
};

const StoryFrame = ({ title, tone = "light", children }: StoryFrameProps) => {
  const isDark = tone === "dark";

  return (
    <View style={[styles.screen, isDark && styles.darkScreen]}>
      <View
        testID="visual-frame"
        style={[styles.phone, isDark && styles.darkPhone]}
      >
        <View style={styles.statusBar}>
          <View style={[styles.speaker, isDark && styles.darkSpeaker]} />
        </View>
        <View style={[styles.stage, isDark && styles.darkStage]}>
          <Text style={[styles.title, isDark && styles.darkTitle]}>
            {title}
          </Text>
          <View style={styles.chartSlot}>{children}</View>
        </View>
      </View>
    </View>
  );
};

export default {
  title: "Charts/V2LineChart",
  component: LineChart,
  parameters: {
    layout: "fullscreen"
  }
};

export const Basic = () => (
  <StoryFrame title="Revenue">
    <LineChart
      data={basicRevenue}
      xKey="month"
      yKey="actual"
      width={345}
      height={230}
      curve="monotone"
    />
  </StoryFrame>
);

export const RevenueCard = () => (
  <StoryFrame title="MRR growth">
    <LineChart
      data={subscriptionMetrics}
      xKey="month"
      width={345}
      height={230}
      showDots={false}
      curve="monotone"
      formatYLabel={(value) => `$${Math.round(value)}k`}
      series={[
        { yKey: "revenue", label: "Revenue", color: "#2563eb" },
        {
          yKey: "netRetention",
          label: "Retention",
          color: "#10b981",
          strokeWidth: 2
        }
      ]}
    />
  </StoryFrame>
);

export const MultiSeries = () => (
  <StoryFrame title="Plan vs actual">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={345}
      height={238}
      showDots={false}
      curve="monotone"
      series={[
        { yKey: "actual", label: "Actual", color: "#2563eb", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#0891b2",
          strokeWidth: 2
        }
      ]}
    />
  </StoryFrame>
);

export const NullGaps = () => (
  <StoryFrame title="Missing readings">
    <LineChart
      data={revenueWithGaps}
      xKey="month"
      yKey="actual"
      width={345}
      height={230}
      yDomain={[0, "dataMax"]}
      showDots
    />
  </StoryFrame>
);

export const AreaFill = () => (
  <StoryFrame title="Price history">
    <AreaChart
      data={priceHistory}
      xKey="date"
      yKey="price"
      width={345}
      height={230}
      theme="dark"
      curve="monotone"
      formatYLabel={(value) => `$${Math.round(value)}`}
    />
  </StoryFrame>
);

export const DenseLabels = () => (
  <StoryFrame title="Weekly trend">
    <LineChart
      data={denseRevenue}
      xKey="month"
      yKey="actual"
      width={345}
      height={230}
      showDots={false}
      curve="linear"
    />
  </StoryFrame>
);

export const DarkMode = () => (
  <StoryFrame title="Dark mode" tone="dark">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={345}
      height={238}
      theme="dark"
      curve="monotone"
      area
      series={[
        { yKey: "actual", label: "Actual", color: "#38bdf8", strokeWidth: 3 },
        { yKey: "forecast", label: "Target", color: "#a78bfa", strokeWidth: 2 }
      ]}
    />
  </StoryFrame>
);

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: "#eef2f7",
    justifyContent: "center",
    minHeight: 852,
    padding: 24
  },
  darkScreen: {
    backgroundColor: "#020617"
  },
  phone: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
    borderRadius: 48,
    borderWidth: 1,
    height: 812,
    overflow: "hidden",
    width: 393
  },
  darkPhone: {
    backgroundColor: "#020617",
    borderColor: "#334155"
  },
  statusBar: {
    alignItems: "center",
    height: 42,
    justifyContent: "center"
  },
  speaker: {
    backgroundColor: "#cbd5e1",
    borderRadius: 4,
    height: 5,
    width: 64
  },
  darkSpeaker: {
    backgroundColor: "#334155"
  },
  stage: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 24,
    paddingTop: 16
  },
  darkStage: {
    backgroundColor: "#020617"
  },
  title: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14
  },
  darkTitle: {
    color: "#e5e7eb"
  },
  chartSlot: {
    alignItems: "center"
  }
});
