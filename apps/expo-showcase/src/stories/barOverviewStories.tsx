import { BarChart } from "@chart-kit/react-native-v2";

import {
  acquisitionByChannel,
  campaignSpend,
  monthlyProfit,
  platformShare,
  supportVolume
} from "../fixtures/v2Bar";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const formatThousands = (value: number) => `${value}k`;
const formatPercent = (value: number) => `${value}%`;
const formatSignedCurrency = (value: number) =>
  value < 0 ? `-$${Math.abs(value)}k` : `$${value}k`;

const V2GroupedBar = ({ width }: NativeStoryProps) => (
  <ChartSection title="Acquisition mix" kicker="Grouped bars">
    <BarChart
      data={acquisitionByChannel}
      height={300}
      preset="analytics"
      series={[
        { yKey: "organic", label: "Organic" },
        { yKey: "paid", label: "Paid" }
      ]}
      showValuesOnTopOfBars
      width={width}
      xKey="month"
      yDomain={{ min: 0, max: "dataMax", nice: true }}
      formatYLabel={formatThousands}
    />
  </ChartSection>
);

const V2SelectableBar = ({ width }: NativeStoryProps) => (
  <ChartSection title="Paid acquisition" kicker="Tap selection">
    <BarChart
      data={acquisitionByChannel}
      defaultSelectedBar={{ dataIndex: 3, seriesKey: "paid" }}
      height={260}
      interaction={{ mode: "tap", deselectOnOutsidePress: true }}
      preset="analytics"
      series={[
        { yKey: "organic", label: "Organic" },
        { yKey: "paid", label: "Paid" }
      ]}
      testID="selectable-bar-chart"
      tooltip={{ width: 132 }}
      width={width}
      xKey="month"
      yDomain={{ min: 0, max: "dataMax", nice: true }}
      formatYLabel={formatThousands}
    />
  </ChartSection>
);

const V2ScrollableBar = ({ width }: NativeStoryProps) => (
  <ChartSection title="Campaign spend" kicker="Scrollable bars">
    <BarChart
      data={campaignSpend}
      height={250}
      initialIndex="end"
      preset="analytics"
      scrollable
      series={[{ yKey: "spend", label: "Spend" }]}
      visiblePoints={5}
      width={width}
      xKey="week"
      yDomain={{ min: 0, max: "dataMax", nice: true }}
      formatYLabel={(value) => `$${value}k`}
    />
  </ChartSection>
);

const V2ScrollableSelectableBar = ({ width }: NativeStoryProps) => (
  <ChartSection title="Spend inspection" kicker="Scrollable selection">
    <BarChart
      data={campaignSpend}
      defaultSelectedBar={{ dataIndex: 15, seriesKey: "spend" }}
      height={260}
      initialIndex="end"
      interaction={{ mode: "tap", deselectOnOutsidePress: true }}
      preset="analytics"
      scrollable
      selectionAnimation={{ duration: 220 }}
      series={[{ yKey: "spend", label: "Spend" }]}
      testID="scrollable-selectable-bar-chart"
      tooltip={{ positionAnimationDuration: 260, width: 128 }}
      visiblePoints={5}
      width={width}
      xKey="week"
      yDomain={{ min: 0, max: "dataMax", nice: true }}
      formatYLabel={(value) => `$${value}k`}
    />
  </ChartSection>
);

const V2HorizontalBar = ({ width }: NativeStoryProps) => (
  <ChartSection title="Support volume" kicker="Horizontal bars">
    <BarChart
      data={supportVolume}
      height={260}
      labelStrategy="show"
      orientation="horizontal"
      preset="analytics"
      series={[{ yKey: "tickets", label: "Tickets" }]}
      showValuesOnTopOfBars
      width={width}
      xKey="channel"
      yDomain={{ min: 0, max: "dataMax", nice: true }}
      formatYLabel={(value) => `${value}`}
    />
  </ChartSection>
);

const V2NegativeBar = ({ width }: NativeStoryProps) => (
  <ChartSection title="Monthly profit" kicker="Negative values">
    <BarChart
      data={monthlyProfit}
      height={250}
      preset="fintech"
      series={[{ yKey: "profit", label: "Profit", color: "#0284c7" }]}
      showValuesOnTopOfBars
      width={width}
      xKey="month"
      formatYLabel={formatSignedCurrency}
    />
  </ChartSection>
);

const V2StackedPercentBar = ({ width }: NativeStoryProps) => (
  <ChartSection title="Platform share" kicker="100% stacked">
    <BarChart
      data={platformShare}
      height={250}
      mode="stacked100"
      preset="analytics"
      series={[
        { yKey: "ios", label: "iOS" },
        { yKey: "android", label: "Android" }
      ]}
      width={width}
      xKey="month"
      formatYLabel={formatPercent}
    />
  </ChartSection>
);

export const barOverviewStories = [
  {
    id: "v2-bar-grouped",
    title: "Grouped Bars",
    Component: V2GroupedBar
  },
  {
    id: "v2-bar-selection",
    title: "Tap Selection",
    Component: V2SelectableBar
  },
  {
    id: "v2-bar-scrollable",
    title: "Scrollable Bars",
    Component: V2ScrollableBar
  },
  {
    id: "v2-bar-scrollable-selection",
    title: "Scrollable Selection",
    Component: V2ScrollableSelectableBar
  },
  {
    id: "v2-bar-horizontal",
    title: "Horizontal Bars",
    Component: V2HorizontalBar
  },
  {
    id: "v2-bar-negative",
    title: "Negative Bars",
    Component: V2NegativeBar
  },
  {
    id: "v2-bar-stacked-percent",
    title: "Stacked Percent",
    Component: V2StackedPercentBar
  }
];
