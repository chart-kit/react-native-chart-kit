import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  DonutChart,
  PieChart,
  getPieChartDataTable
} from "@chart-kit/react-native";

import {
  acquisitionShare,
  retentionSegments,
  subscriptionMix
} from "../fixtures/v2Pie";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";
import { ChartDataDetails } from "./dataDetails";

const formatPiePercentage = (value: number) => `${Math.round(value * 100)}%`;
const acquisitionShareTable = getPieChartDataTable({
  data: acquisitionShare,
  formatPercentage: formatPiePercentage,
  formatValue: (value) => `${value}`,
  labelKey: "channel",
  valueKey: "share"
});
const acquisitionShareDetails = {
  columns: [
    { key: "channel", label: "Channel" },
    { key: "share", label: "Share" },
    { key: "percent", label: "Percent" }
  ],
  rows: acquisitionShareTable.rows.map((row) => ({
    key: `${row.index}`,
    values: [row.label, row.formattedValue, row.percentageLabel]
  }))
};

const V2PieAcquisition = ({ width }: NativeStoryProps) => (
  <ChartSection title="Acquisition share" kicker="Pie chart">
    <PieChart
      data={acquisitionShare}
      height={260}
      labelKey="channel"
      valueKey="share"
      width={width}
      formatPercentage={formatPiePercentage}
    />
  </ChartSection>
);

const V2PieAcquisitionDetails = () => (
  <ChartDataDetails title="Acquisition share" {...acquisitionShareDetails} />
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
      formatPercentage={formatPiePercentage}
    />
  </ChartSection>
);

const V2SelectablePie = ({ width }: NativeStoryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <ChartSection title="Channel selection" kicker="Selectable pie">
      <PieChart
        activeSlice={{
          activeOffset: 7,
          activeScale: 1.035,
          inactiveOpacity: 0.7
        }}
        data={acquisitionShare}
        height={276}
        interaction={{
          mode: "tap",
          onSelect: (event) => setSelectedIndex(event.index)
        }}
        labelKey="channel"
        legend={{
          itemGap: 6,
          maxItemWidth: "48%",
          reservedHeight: 72,
          renderItem: ({ item, selected, theme }) => (
            <View
              style={[
                pieStoryStyles.selectableLegendItem,
                {
                  backgroundColor: selected
                    ? theme.tooltip.background
                    : "transparent",
                  borderColor: selected ? item.color : theme.axis,
                  opacity: selected ? 1 : 0.72
                }
              ]}
            >
              <View
                style={[
                  pieStoryStyles.selectableLegendSwatch,
                  { backgroundColor: item.color }
                ]}
              />
              <Text
                numberOfLines={1}
                style={[
                  pieStoryStyles.selectableLegendLabel,
                  { color: selected ? theme.text : theme.mutedText }
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  pieStoryStyles.selectableLegendValue,
                  { color: selected ? item.color : theme.mutedText }
                ]}
              >
                {item.percentageLabel}
              </Text>
            </View>
          )
        }}
        selectedIndex={selectedIndex}
        selectionAnimation={{ duration: 220 }}
        testID="selectable-pie-chart"
        valueKey="share"
        width={width}
        formatPercentage={formatPiePercentage}
      />
    </ChartSection>
  );
};

const V2DonutRevenue = ({ width }: NativeStoryProps) => (
  <ChartSection title="Revenue mix" kicker="Donut chart">
    <DonutChart
      centerLabel="$1.5M"
      data={subscriptionMix}
      height={260}
      labelKey="plan"
      valueKey="revenue"
      width={width}
      formatPercentage={formatPiePercentage}
    />
  </ChartSection>
);

const V2SelectableDonut = ({ width }: NativeStoryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const selectedPlan = subscriptionMix[selectedIndex]?.plan ?? "Revenue";

  return (
    <ChartSection title="Plan mix" kicker="Tap selection">
      <DonutChart
        activeSlice={{
          activeOffset: 6,
          activeScale: 1.035,
          inactiveOpacity: 0.72
        }}
        centerLabel={selectedPlan}
        data={subscriptionMix}
        height={260}
        interaction={{
          mode: "tap",
          onSelect: (event) => setSelectedIndex(event.index)
        }}
        labelKey="plan"
        selectedIndex={selectedIndex}
        selectionAnimation={{ duration: 220 }}
        testID="selectable-donut-chart"
        valueKey="revenue"
        width={width}
        formatPercentage={formatPiePercentage}
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
      formatPercentage={formatPiePercentage}
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
    Component: V2PieAcquisition,
    Details: V2PieAcquisitionDetails
  },
  {
    id: "v2-pie-external-labels",
    title: "External Labels",
    Component: V2PieExternalLabels
  },
  {
    id: "v2-pie-selection",
    title: "Pie Selection",
    Component: V2SelectablePie
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
  },
  selectableLegendItem: {
    alignItems: "center",
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    minHeight: 26,
    paddingHorizontal: 7,
    width: "100%"
  },
  selectableLegendLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800"
  },
  selectableLegendSwatch: {
    borderRadius: 4,
    height: 8,
    width: 8
  },
  selectableLegendValue: {
    fontSize: 10,
    fontWeight: "900"
  }
});
