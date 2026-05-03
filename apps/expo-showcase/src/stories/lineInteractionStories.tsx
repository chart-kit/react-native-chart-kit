import { LineChart } from "@chart-kit/react-native-v2";

import { multiSeriesRevenue, revenueWithGaps } from "../fixtures/v2Line";
import {
  ChartSection,
  type NativeStoryProps,
  type ShowcaseStory
} from "./storyPrimitives";

const V2SelectedTooltip = ({ width }: NativeStoryProps) => (
  <ChartSection title="Shared tooltip" kicker="Selection model">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      selectedIndex={2}
      crosshair={{ strokeDasharray: [4, 4] }}
      tooltip={{ width: 138 }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        { yKey: "actual", label: "Actual", strokeWidth: 3 },
        { yKey: "forecast", label: "Forecast", strokeWidth: 2 }
      ]}
    />
  </ChartSection>
);

const V2ScrubInteraction = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => (
  <ChartSection title="Tap and scrub" kicker="Persistent selection">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      defaultSelectedIndex={3}
      interaction={{
        mode: "scrub",
        selectionPersistence: "persist",
        deselectOnOutsidePress: true,
        onGestureEnd: onScrubEnd,
        onGestureStart: onScrubStart
      }}
      crosshair={{ strokeDasharray: [4, 4] }}
      tooltip={{ width: 138, positionAnimationDuration: 180 }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        { yKey: "actual", label: "Actual", strokeWidth: 3 },
        { yKey: "forecast", label: "Forecast", strokeWidth: 2 }
      ]}
    />
  </ChartSection>
);

const V2WhileActiveScrub = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => (
  <ChartSection title="Hold to inspect" kicker="While-active selection">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      interaction={{
        mode: "scrub",
        selectionPersistence: "whileActive",
        deselectOnOutsidePress: true,
        onGestureEnd: onScrubEnd,
        onGestureStart: onScrubStart
      }}
      crosshair={{ strokeDasharray: [4, 4] }}
      tooltip={{ width: 138, positionAnimationDuration: 110 }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        { yKey: "actual", label: "Actual", strokeWidth: 3 },
        { yKey: "forecast", label: "Forecast", strokeWidth: 2 }
      ]}
    />
  </ChartSection>
);

const V2NullGaps = ({ width }: NativeStoryProps) => (
  <ChartSection title="Missing readings" kicker="Null gap handling">
    <LineChart
      data={revenueWithGaps}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      yDomain={[0, "dataMax"]}
      showDots
      selectedIndex={3}
      crosshair={{ strokeDasharray: [4, 4] }}
      tooltip
    />
  </ChartSection>
);

export const lineInteractionStories: ShowcaseStory[] = [
  {
    id: "v2-selected-tooltip",
    title: "Shared Tooltip",
    Component: V2SelectedTooltip
  },
  { id: "v2-scrub", title: "Tap and Scrub", Component: V2ScrubInteraction },
  {
    id: "v2-while-active",
    title: "While Active Scrub",
    Component: V2WhileActiveScrub
  },
  { id: "v2-null-gaps", title: "Null Gaps", Component: V2NullGaps }
];
