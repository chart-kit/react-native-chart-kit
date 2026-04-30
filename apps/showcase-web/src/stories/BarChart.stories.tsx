import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BarChart } from "@chart-kit/react-native";

import {
  BarChartFixture,
  barChartFixtures
} from "../fixtures/barChartFixtures";

type StoryFrameProps = {
  fixture: BarChartFixture;
  label: string;
  tone?: "light" | "dark";
};

const hasRenderableData = (fixture: BarChartFixture) =>
  fixture.data.datasets.some((dataset) => dataset.data.length > 0);

const StoryFrame = ({ fixture, label, tone = "light" }: StoryFrameProps) => {
  const isDark = tone === "dark";

  return (
    <View style={[styles.screen, isDark && styles.darkScreen]}>
      <View style={[styles.phone, isDark && styles.darkPhone]}>
        <View style={styles.statusBar}>
          <View style={[styles.speaker, isDark && styles.darkSpeaker]} />
        </View>
        <View style={[styles.stage, isDark && styles.darkStage]}>
          <Text style={[styles.label, isDark && styles.darkLabel]}>
            {label}
          </Text>
          {hasRenderableData(fixture) ? (
            <View
              style={[
                styles.chartSlot,
                fixture.width < 393 && styles.narrowChartSlot
              ]}
            >
              <BarChart
                data={fixture.data}
                width={fixture.width}
                height={fixture.height}
                chartConfig={fixture.chartConfig}
                style={fixture.style}
                fromZero={fixture.fromZero}
                flatColor={fixture.flatColor}
                horizontalLabelRotation={fixture.horizontalLabelRotation}
                segments={fixture.segments}
                showBarTops={fixture.showBarTops}
                showValuesOnTopOfBars={fixture.showValuesOnTopOfBars}
                verticalLabelRotation={fixture.verticalLabelRotation}
                withCustomBarColorFromData={fixture.withCustomBarColorFromData}
                withHorizontalLabels={fixture.withHorizontalLabels}
                withInnerLines={fixture.withInnerLines}
                withVerticalLabels={fixture.withVerticalLabels}
                yAxisLabel={fixture.yAxisLabel ?? ""}
                yAxisSuffix={fixture.yAxisSuffix ?? ""}
              />
            </View>
          ) : (
            <View
              style={[
                styles.emptyState,
                {
                  width: fixture.width,
                  height: fixture.height
                }
              ]}
            >
              <Text style={styles.emptyTitle}>No chart data</Text>
              <Text style={styles.emptyCopy}>Fixture contains zero bars.</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default {
  title: "Charts/BarChart",
  component: BarChart,
  parameters: {
    layout: "fullscreen"
  }
};

export const Basic = () => (
  <StoryFrame fixture={barChartFixtures.basic} label="Basic" />
);

export const LongLabels = () => (
  <StoryFrame fixture={barChartFixtures.longLabels} label="Long Labels" />
);

export const DenseData = () => (
  <StoryFrame fixture={barChartFixtures.denseData} label="Dense Data" />
);

export const NegativeValues = () => (
  <StoryFrame
    fixture={barChartFixtures.negativeValues}
    label="Negative Values"
  />
);

export const EmptyState = () => (
  <StoryFrame fixture={barChartFixtures.emptyState} label="Empty State" />
);

export const DarkMode = () => (
  <StoryFrame
    fixture={barChartFixtures.darkMode}
    label="Dark Mode"
    tone="dark"
  />
);

export const TinyWidth = () => (
  <StoryFrame fixture={barChartFixtures.tinyWidth} label="Tiny Width" />
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
    paddingTop: 8
  },
  darkStage: {
    backgroundColor: "#020617",
    borderColor: "#1e293b"
  },
  label: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 16
  },
  darkLabel: {
    color: "#e5e7eb"
  },
  chartSlot: {
    alignItems: "center",
    width: "100%"
  },
  narrowChartSlot: {
    paddingTop: 4
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    justifyContent: "center"
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8
  },
  emptyCopy: {
    color: "#6b7280",
    fontSize: 14
  }
});
