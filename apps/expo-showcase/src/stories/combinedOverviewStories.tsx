import { CombinedChart } from "@chart-kit/react-native-v2";

import { revenueMargin } from "../fixtures/v2Combined";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const formatCurrency = (value: number) => `$${value}k`;
const formatPercent = (value: number) => `${value}%`;

const V2CombinedRevenueMargin = ({ width }: NativeStoryProps) => (
  <ChartSection title="Revenue and margin" kicker="Dual-axis combined">
    <CombinedChart
      bars={[{ yKey: "revenue", label: "Revenue" }]}
      data={revenueMargin}
      formatLeftYLabel={formatCurrency}
      formatRightYLabel={formatPercent}
      height={280}
      leftYDomain={[0, "dataMax"]}
      lines={[
        {
          yKey: "margin",
          label: "Margin",
          curve: "monotone",
          strokeWidth: 3.5
        }
      ]}
      rightYDomain={[0, 40]}
      testID="combined-revenue-margin-chart"
      width={width}
      xKey="month"
    />
  </ChartSection>
);

export const combinedOverviewStories = [
  {
    id: "v2-combined-revenue-margin",
    title: "Revenue + Margin",
    Component: V2CombinedRevenueMargin
  }
];
