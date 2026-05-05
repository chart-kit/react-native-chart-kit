import { ContributionGraph } from "@chart-kit/react-native-v2";

import {
  productUsage,
  productUsageEndDate,
  productUsageNumDays
} from "../fixtures/v2Contribution";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const V2ContributionUsage = ({ width }: NativeStoryProps) => (
  <ChartSection title="Product usage" kicker="Contribution heatmap">
    <ContributionGraph
      endDate={productUsageEndDate}
      height={162}
      numDays={productUsageNumDays}
      testID="product-usage-heatmap"
      values={productUsage}
      weekStartsOn={1}
      width={width}
    />
  </ChartSection>
);

export const contributionOverviewStories = [
  {
    id: "v2-contribution-usage",
    title: "Product Usage Heatmap",
    Component: V2ContributionUsage
  }
];
