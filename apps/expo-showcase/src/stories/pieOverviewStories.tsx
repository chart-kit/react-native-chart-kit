import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { DonutChart, PieChart } from "@chart-kit/react-native";

import {
  acquisitionShare,
  retentionSegments,
  subscriptionMix
} from "../fixtures/v2Pie";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const V2PieAcquisition = ({ width }: NativeStoryProps) => (
  <ChartSection title="Acquisition share" kicker="Pie chart">
    <PieChart
      data={acquisitionShare}
      height={260}
      labelKey="channel"
      valueKey="share"
      width={width}
      formatPercentage={(value) => `${Math.round(value * 100)}%`}
    />
  </ChartSection>
);

const V2PieExternalLabels = ({ width }: NativeStoryProps) => (
  <ChartSection title="Lead sources" kicker="External labels">
    <PieChart
      arcLabels={{
        minPercentage: 0.09,
        formatLabel: ({ label, percentageLabel }) =>
          `${label.split(" ")[0]} ${percentageLabel}`
      }}
      data={acquisitionShare}
      height={260}
      labelKey="channel"
      legend={false}
      valueKey="share"
      width={width}
      formatPercentage={(value) => `${Math.round(value * 100)}%`}
    />
  </ChartSection>
);

const V2DonutRevenue = ({ width }: NativeStoryProps) => (
  <ChartSection title="Revenue mix" kicker="Donut chart">
    <DonutChart
      centerLabel="$1.5M"
      data={subscriptionMix}
      height={260}
      labelKey="plan"
      valueKey="revenue"
      width={width}
      formatPercentage={(value) => `${Math.round(value * 100)}%`}
    />
  </ChartSection>
);

const V2SelectableDonut = ({ width }: NativeStoryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const selectedPlan = subscriptionMix[selectedIndex]?.plan ?? "Revenue";

  return (
    <ChartSection title="Plan mix" kicker="Tap selection">
      <DonutChart
        activeSlice={{ inactiveOpacity: 0.36, strokeWidth: 4 }}
        centerLabel={selectedPlan}
        data={subscriptionMix}
        height={260}
        interaction={{
          mode: "tap",
          onSelect: (event) => setSelectedIndex(event.index)
        }}
        labelKey="plan"
        selectedIndex={selectedIndex}
        testID="selectable-donut-chart"
        valueKey="revenue"
        width={width}
        formatPercentage={(value) => `${Math.round(value * 100)}%`}
      />
    </ChartSection>
  );
};

const V2CustomLegendDonut = ({ width }: NativeStoryProps) => (
  <ChartSection title="Retention quality" kicker="Custom legend">
    <DonutChart
      data={retentionSegments}
      height={300}
      labelKey="status"
      valueKey="accounts"
      width={width}
      centerLabel={({ theme, total }) => (
        <View style={pieStoryStyles.centerLabel}>
          <Text style={[pieStoryStyles.centerValue, { color: theme.text }]}>
            {total}
          </Text>
          <Text
            style={[pieStoryStyles.centerCaption, { color: theme.mutedText }]}
          >
            accounts
          </Text>
        </View>
      )}
      formatPercentage={(value) => `${Math.round(value * 100)}%`}
      legend={{
        itemGap: 6,
        maxItemWidth: "100%",
        renderItem: ({ item, theme }) => (
          <View style={pieStoryStyles.customLegendItem}>
            <View
              style={[
                pieStoryStyles.customLegendSwatch,
                { backgroundColor: item.color }
              ]}
            />
            <Text
              numberOfLines={1}
              style={[pieStoryStyles.customLegendLabel, { color: theme.text }]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                pieStoryStyles.customLegendValue,
                { color: theme.mutedText }
              ]}
            >
              {item.percentageLabel}
            </Text>
          </View>
        )
      }}
    />
  </ChartSection>
);

export const pieOverviewStories = [
  {
    id: "v2-pie-acquisition",
    title: "Acquisition Pie",
    Component: V2PieAcquisition
  },
  {
    id: "v2-pie-external-labels",
    title: "External Labels",
    Component: V2PieExternalLabels
  },
  {
    id: "v2-donut-revenue",
    title: "Revenue Donut",
    Component: V2DonutRevenue
  },
  {
    id: "v2-donut-selection",
    title: "Donut Selection",
    Component: V2SelectableDonut
  },
  {
    id: "v2-donut-custom-legend",
    title: "Custom Legend",
    Component: V2CustomLegendDonut
  }
];

const pieStoryStyles = StyleSheet.create({
  centerCaption: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: -2
  },
  centerLabel: {
    alignItems: "center",
    justifyContent: "center"
  },
  centerValue: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26
  },
  customLegendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    minHeight: 18,
    width: "100%"
  },
  customLegendLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700"
  },
  customLegendSwatch: {
    borderRadius: 3,
    height: 9,
    width: 9
  },
  customLegendValue: {
    fontSize: 10,
    fontWeight: "800"
  }
});
