import {
  ContributionGraph,
  getContributionGraphDataTable
} from "@chart-kit/react-native";

import {
  productUsage,
  productUsageEndDate,
  productUsageNumDays,
  quietProductUsage,
  quietUsageEndDate,
  quietUsageNumDays
} from "../fixtures/v2Contribution";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";
import { ChartDataDetails } from "./dataDetails";

const productUsageTable = getContributionGraphDataTable({
  endDate: productUsageEndDate,
  formatValue: (value) => `${value} events`,
  numDays: productUsageNumDays,
  values: productUsage
});
const productUsageDetails = {
  columns: [
    { key: "date", label: "Date" },
    { key: "events", label: "Events" }
  ],
  rows: productUsageTable.rows.slice(-8).map((row) => ({
    key: `${row.index}`,
    values: [row.dateLabel, row.formattedValue]
  }))
};

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

const V2ContributionUsageDetails = () => (
  <ChartDataDetails title="Product usage" {...productUsageDetails} />
);

const V2ContributionQuiet = ({ width }: NativeStoryProps) => (
  <ChartSection title="Quiet workspace" kicker="Empty heatmap">
    <ContributionGraph
      endDate={quietUsageEndDate}
      height={150}
      numDays={quietUsageNumDays}
      showOutOfRangeDays
      testID="quiet-usage-heatmap"
      values={quietProductUsage}
      weekStartsOn={1}
      width={width}
    />
  </ChartSection>
);

export const contributionOverviewStories = [
  {
    id: "v2-contribution-usage",
    title: "Product Usage Heatmap",
    Component: V2ContributionUsage,
    Details: V2ContributionUsageDetails
  },
  {
    id: "v2-contribution-empty",
    title: "Empty Heatmap",
    Component: V2ContributionQuiet
  }
];
