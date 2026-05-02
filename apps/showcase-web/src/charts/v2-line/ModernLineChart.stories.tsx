import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AreaChart, LineChart } from "@chart-kit/react-native-v2";
import { SvgCircle, SvgGroup, SvgRect, SvgText } from "@chart-kit/svg-renderer";

import {
  basicRevenue,
  denseRevenue,
  longRangeRevenue,
  multiSeriesRevenue,
  priceHistory,
  revenueWithGaps,
  sixMonthRevenue,
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

export const BottomLegend = () => (
  <StoryFrame title="Legend placement">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={345}
      height={248}
      showDots={false}
      curve="monotone"
      legend={{
        position: "bottom",
        align: "center",
        marker: "line",
        itemGap: 18,
        fontSize: 12
      }}
      series={[
        { yKey: "actual", label: "Actual", color: "#2563eb" },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#7c3aed",
          strokeWidth: 2
        }
      ]}
    />
  </StoryFrame>
);

export const CustomLegend = () => (
  <StoryFrame title="Custom legend">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={345}
      height={238}
      showDots={false}
      curve="monotone"
      legend={{
        align: "center",
        marker: "circle",
        fontSize: 12,
        itemGap: 18,
        itemPaddingHorizontal: 10,
        itemPaddingVertical: 4,
        renderItem: (item) => (
          <SvgGroup key={item.key}>
            <SvgRect
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              rx={8}
              fill={item.color}
              opacity={0.1}
            />
            <SvgCircle
              cx={item.contentX + item.markerSize / 2}
              cy={item.contentY + item.contentHeight / 2}
              r={item.markerSize / 2}
              fill={item.color}
            />
            <SvgText
              x={item.contentX + item.markerSize + item.labelGap}
              y={item.contentY + item.contentHeight / 2 + item.fontSize * 0.36}
              fill={item.color}
              fontSize={item.fontSize}
              fontWeight="600"
            >
              {item.label}
            </SvgText>
          </SvgGroup>
        )
      }}
      series={[
        { yKey: "actual", label: "Actual", color: "#2563eb", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#7c3aed",
          strokeWidth: 2
        }
      ]}
    />
  </StoryFrame>
);

export const CustomTypography = () => (
  <StoryFrame title="Typography">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={345}
      height={238}
      showDots={false}
      curve="monotone"
      theme={{
        background: "#ffffff",
        plotBackground: "#ffffff",
        grid: "#e2e8f0",
        axis: "#e2e8f0",
        text: "#172033",
        mutedText: "#475569",
        series: ["#0f766e", "#2563eb"],
        typography: {
          fontFamily: "Georgia",
          axisLabelSize: 12,
          legendLabelSize: 13
        }
      }}
      legend={{
        align: "center",
        marker: "circle"
      }}
      series={[
        { yKey: "actual", label: "Actual", color: "#0f766e", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#2563eb",
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

export const DotStyles = () => (
  <StoryFrame title="Marker styles">
    <LineChart
      data={multiSeriesRevenue.map((point) => ({
        ...point,
        forecast:
          typeof point.forecast === "number"
            ? point.forecast - 8
            : point.forecast
      }))}
      xKey="month"
      width={345}
      height={238}
      curve="monotone"
      dots={{
        radius: 4,
        fill: "background",
        strokeWidth: 2
      }}
      series={[
        {
          yKey: "actual",
          label: "Actual",
          color: "#2563eb",
          strokeWidth: 3,
          dot: {
            shape: "circle",
            radius: 4.5
          }
        },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#0891b2",
          strokeWidth: 2,
          dot: {
            shape: "diamond",
            radius: 4,
            fill: "series",
            stroke: "background",
            strokeWidth: 1.5
          }
        }
      ]}
    />
  </StoryFrame>
);

export const SelectedTooltip = () => (
  <StoryFrame title="Shared tooltip">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={345}
      height={238}
      showDots={false}
      curve="monotone"
      selectedIndex={2}
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip={{
        width: 138
      }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
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

export const ScrubInteraction = () => (
  <StoryFrame title="Tap and scrub">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={345}
      height={238}
      showDots={false}
      curve="monotone"
      defaultSelectedIndex={3}
      interaction={{
        mode: "scrub",
        selectionPersistence: "persist",
        deselectOnOutsidePress: true
      }}
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip={{
        width: 138
      }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
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
      selectedIndex={3}
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip
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

export const RotatedLabels = () => (
  <StoryFrame title="Monthly expansion">
    <LineChart
      data={longRangeRevenue}
      xKey="month"
      yKey="actual"
      width={345}
      height={260}
      showDots={false}
      curve="monotone"
      labelStrategy="rotate"
      labelRotation={-35}
    />
  </StoryFrame>
);

export const RotatedSixLabels = () => (
  <StoryFrame title="Six month labels">
    <LineChart
      data={sixMonthRevenue}
      xKey="month"
      yKey="actual"
      width={345}
      height={250}
      showDots={false}
      curve="monotone"
      labelStrategy="rotate"
      labelRotation={-70}
      labelMinGap={0}
    />
  </StoryFrame>
);

export const StaggeredLabels = () => (
  <StoryFrame title="Weekly retention">
    <LineChart
      data={denseRevenue}
      xKey="month"
      yKey="actual"
      width={345}
      height={248}
      showDots={false}
      curve="monotone"
      labelStrategy="stagger"
    />
  </StoryFrame>
);

export const GridLines = () => (
  <StoryFrame title="Grid lines">
    <LineChart
      data={basicRevenue}
      xKey="month"
      yKey="actual"
      width={345}
      height={230}
      curve="monotone"
      showDots={false}
      showHorizontalGridLines
      showVerticalGridLines
    />
  </StoryFrame>
);

export const HiddenLabels = () => (
  <StoryFrame title="Spark trend">
    <LineChart
      data={denseRevenue}
      xKey="month"
      yKey="actual"
      width={345}
      height={220}
      showDots={false}
      curve="monotone"
      labelStrategy="hide"
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
