import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { LineChart } from "@chart-kit/react-native";

import {
  LineChartFixture,
  lineChartFixtures
} from "../fixtures/lineChartFixtures";

type StoryFrameProps = {
  fixture: LineChartFixture;
  label: string;
  tone?: "light" | "dark";
};

const hasRenderableData = (fixture: LineChartFixture) =>
  fixture.data.datasets.some((dataset) => dataset.data.length > 0);

const StoryFrame = ({ fixture, label, tone = "light" }: StoryFrameProps) => {
  const isDark = tone === "dark";

  return (
    <View style={[styles.screen, isDark && styles.darkScreen]}>
      <View
        style={[
          styles.stage,
          {
            width: fixture.width + 48,
            minHeight: fixture.height + 112
          },
          isDark && styles.darkStage
        ]}
      >
        <Text style={[styles.label, isDark && styles.darkLabel]}>{label}</Text>
        {hasRenderableData(fixture) ? (
          <LineChart
            data={fixture.data}
            width={fixture.width}
            height={fixture.height}
            chartConfig={fixture.chartConfig}
            style={fixture.style}
            segments={fixture.segments}
            bezier={fixture.bezier}
            fromZero={fixture.fromZero}
            withDots={fixture.withDots}
            withInnerLines={fixture.withInnerLines}
            withOuterLines={fixture.withOuterLines}
            verticalLabelRotation={fixture.verticalLabelRotation}
            xLabelsOffset={fixture.xLabelsOffset}
            yAxisSuffix={fixture.yAxisSuffix}
          />
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
            <Text style={styles.emptyCopy}>Fixture contains zero points.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default {
  title: "Charts/LineChart",
  component: LineChart,
  parameters: {
    layout: "fullscreen"
  }
};

export const Basic = () => (
  <StoryFrame fixture={lineChartFixtures.basic} label="Basic" />
);

export const LongLabels = () => (
  <StoryFrame fixture={lineChartFixtures.longLabels} label="Long Labels" />
);

export const DenseData = () => (
  <StoryFrame fixture={lineChartFixtures.denseData} label="Dense Data" />
);

export const NegativeValues = () => (
  <StoryFrame
    fixture={lineChartFixtures.negativeValues}
    label="Negative Values"
  />
);

export const EmptyState = () => (
  <StoryFrame fixture={lineChartFixtures.emptyState} label="Empty State" />
);

export const DarkMode = () => (
  <StoryFrame
    fixture={lineChartFixtures.darkMode}
    label="Dark Mode"
    tone="dark"
  />
);

export const TinyWidth = () => (
  <StoryFrame fixture={lineChartFixtures.tinyWidth} label="Tiny Width" />
);

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: "#eef2f7",
    justifyContent: "center",
    minHeight: 520,
    padding: 32
  },
  darkScreen: {
    backgroundColor: "#020617"
  },
  stage: {
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ef",
    borderRadius: 8,
    borderWidth: 1,
    padding: 24
  },
  darkStage: {
    backgroundColor: "#020617",
    borderColor: "#1e293b"
  },
  label: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16
  },
  darkLabel: {
    color: "#e5e7eb"
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
