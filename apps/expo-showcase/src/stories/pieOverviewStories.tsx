import { DonutChart, PieChart } from "@chart-kit/react-native-v2";

import { acquisitionShare, subscriptionMix } from "../fixtures/v2Pie";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const V2PieAcquisition = ({ width }: NativeStoryProps) => (
  <ChartSection title="Acquisition share" kicker="Pie chart">
    <PieChart
      data={acquisitionShare}
      height={260}
      labelKey="channel"
      preset="analytics"
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
      preset="fintech"
      valueKey="revenue"
      width={width}
      formatPercentage={(value) => `${Math.round(value * 100)}%`}
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
    id: "v2-donut-revenue",
    title: "Revenue Donut",
    Component: V2DonutRevenue
  }
];
