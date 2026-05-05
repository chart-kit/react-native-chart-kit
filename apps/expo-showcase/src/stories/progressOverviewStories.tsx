import { ProgressChart, ProgressRing } from "@chart-kit/react-native-v2";

import { activityProgress, onboardingProgress } from "../fixtures/v2Progress";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const V2ProgressActivity = ({ width }: NativeStoryProps) => (
  <ChartSection title="Activity rings" kicker="Progress chart">
    <ProgressChart
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

export const progressOverviewStories = [
  {
    id: "v2-progress-activity",
    title: "Activity Rings",
    Component: V2ProgressActivity
  },
  {
    id: "v2-progress-single",
    title: "Single Progress Ring",
    Component: V2ProgressSingle
  }
];
