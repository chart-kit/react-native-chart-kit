import { BarChart } from "@chart-kit/react-native-v2";

import {
  acquisitionByChannel,
  monthlyProfit,
  platformShare
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
      height={260}
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
