import {
  ProgressChart,
  ProgressRing,
  getProgressChartDataTable
} from "react-native-chart-kit/v2";

import {
  activityProgress,
  goalReadinessProgress,
  onboardingProgress
} from "../fixtures/v2Progress";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";
import { ChartDataDetails } from "./dataDetails";

const activityProgressTable = getProgressChartDataTable({
  data: activityProgress,
  labelKey: "metric",
  valueKey: "progress"
});
const activityProgressDetails = {
  columns: [
    { key: "metric", label: "Metric" },
    { key: "progress", label: "Progress" }
  ],
  rows: activityProgressTable.rows.map((row) => ({
    key: `${row.index}`,
    values: [row.label, row.formattedValue]
  }))
};

const V2ProgressActivity = ({ isVisualMode, width }: NativeStoryProps) => (
  <ChartSection title="Activity rings" kicker="Progress chart">
    <ProgressChart
      animation={isVisualMode ? false : { duration: 1400, stagger: 0.08 }}
      centerLabel={({ average }) => `${Math.round(average * 100)}%`}
      data={activityProgress}
      height={260}
      labelKey="metric"
      strokeWidth={16}
      testID="activity-progress-chart"
      valueKey="progress"
      width={width}
    />
  </ChartSection>
);

const V2ProgressActivityDetails = () => (
  <ChartDataDetails title="Activity rings" {...activityProgressDetails} />
);

const V2ProgressSingle = ({ width }: NativeStoryProps) => (
  <ChartSection title="Setup completion" kicker="Progress ring">
    <ProgressRing
      centerLabel={`${Math.round(onboardingProgress * 100)}%`}
      height={240}
      label="Workspace setup"
      ringGap={0}
      strokeWidth={18}
      value={onboardingProgress}
      width={width}
    />
  </ChartSection>
);

const V2ProgressZeroMissing = ({ width }: NativeStoryProps) => (
  <ChartSection title="Launch readiness" kicker="Zero-value ring">
    <ProgressChart
      centerLabel={({ average }) => `${Math.round(average * 100)}%`}
      data={goalReadinessProgress}
      height={260}
      labelKey="metric"
      strokeWidth={16}
      testID="zero-missing-progress-chart"
      valueKey="progress"
      width={width}
    />
  </ChartSection>
);

export const progressOverviewStories = [
  {
    id: "v2-progress-activity",
    title: "Activity Rings",
    Component: V2ProgressActivity,
    Details: V2ProgressActivityDetails
  },
  {
    id: "v2-progress-single",
    title: "Single Progress Ring",
    Component: V2ProgressSingle
  },
  {
    id: "v2-progress-zero-missing",
    title: "Launch Readiness",
    Component: V2ProgressZeroMissing
  }
];
