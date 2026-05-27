import { useEffect, useMemo, useState } from "react";
import { Pressable, Text } from "react-native";

import { BarChart, getBarChartDataTable } from "react-native-chart-kit/v2";
import { SvgRect } from "@chart-kit/svg-renderer";

import {
  acquisitionByChannel,
  campaignSpend,
  monthlyProfit,
  platformShare,
  supportVolume
} from "../fixtures/v2Bar";
import {
  ChartSection,
  storyStyles,
  type NativeStoryProps
} from "./storyPrimitives";
import { ChartDataDetails, createFormattedValueDetails } from "./dataDetails";

const formatThousands = (value: number) => `${value}k`;
const formatPercent = (value: number) => `${value}%`;
const formatSignedCurrency = (value: number) =>
  value < 0 ? `-$${Math.abs(value)}k` : `$${value}k`;
const animatedBarDuration = 1450;
const animatedBarStagger = 0.055;

type PipelinePoint = {
  stage: string;
  accounts: number;
};

const pipelineStart: PipelinePoint[] = [
  { stage: "Lead", accounts: 18 },
  { stage: "Trial", accounts: 12 },
  { stage: "Active", accounts: 8 },
  { stage: "Paid", accounts: 5 },
  { stage: "Retain", accounts: 4 }
];

const pipelineEnd: PipelinePoint[] = [
  { stage: "Lead", accounts: 82 },
  { stage: "Trial", accounts: 64 },
  { stage: "Active", accounts: 49 },
  { stage: "Paid", accounts: 34 },
  { stage: "Retain", accounts: 27 }
];

const channelStart = acquisitionByChannel.map((point) => ({
  ...point,
  organic: Math.round(point.organic * 0.48),
  paid: Math.round(point.paid * 0.42)
}));

const channelEnd = acquisitionByChannel.map((point, index) => ({
  ...point,
  organic: point.organic + index * 2,
  paid: point.paid + index * 3 + 4
}));

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smootherStep = (value: number) => {
  const clampedValue = clamp01(value);

  return (
    clampedValue *
    clampedValue *
    clampedValue *
    (clampedValue * (clampedValue * 6 - 15) + 10)
  );
};

const interpolate = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const useAnimatedBarRows = <TData extends Record<string, unknown>>({
  duration = animatedBarDuration,
  endData,
  isVisualMode,
  startData,
  valueKeys
}: {
  duration?: number;
  endData: TData[];
  isVisualMode?: boolean;
  startData: TData[];
  valueKeys: Array<keyof TData & string>;
}) => {
  const [progress, setProgress] = useState(isVisualMode ? 1 : 0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (isVisualMode) {
      return undefined;
    }

    let frameId = 0;
    let startTime: number | undefined;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;

      const elapsed = timestamp - startTime;
      const nextProgress = clamp01(elapsed / duration);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [duration, isVisualMode, runId]);

  const data = useMemo(
    () =>
      endData.map((target, index) => {
        const start = startData[index] ?? target;
        const delay = index * animatedBarStagger;
        const localProgress = smootherStep((progress - delay) / (1 - delay));
        const row = { ...target };

        valueKeys.forEach((key) => {
          row[key] = interpolate(
            Number(start[key] ?? 0),
            Number(target[key] ?? 0),
            localProgress
          ) as TData[typeof key];
        });

        return row;
      }),
    [endData, progress, startData, valueKeys]
  );

  return {
    data,
    replay: () => setRunId((currentRunId) => currentRunId + 1)
  };
};

const ReplayButton = ({
  isVisualMode,
  replay
}: {
  isVisualMode?: boolean;
  replay: () => void;
}) =>
  isVisualMode ? null : (
    <Pressable
      accessibilityRole="button"
      onPress={replay}
      style={({ pressed }) => [
        storyStyles.replayButton,
        pressed && storyStyles.replayButtonPressed
      ]}
    >
      <Text style={storyStyles.replayButtonText}>Replay</Text>
    </Pressable>
  );

const V2GroupedBar = ({ width }: NativeStoryProps) => (
  <ChartSection title="Acquisition mix" kicker="Grouped bars">
    <BarChart
      data={acquisitionByChannel}
      height={300}
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

const acquisitionMixDetails = createFormattedValueDetails({
  categoryLabel: "Month",
  table: getBarChartDataTable({
    data: acquisitionByChannel,
    formatYLabel: formatThousands,
    xKey: "month",
    yKeys: ["organic", "paid"]
  })
});

const V2GroupedBarDetails = () => (
  <ChartDataDetails title="Acquisition mix" {...acquisitionMixDetails} />
);

const V2SelectableBar = ({ width }: NativeStoryProps) => (
  <ChartSection title="Paid acquisition" kicker="Tap selection">
    <BarChart
      data={acquisitionByChannel}
      defaultSelectedBar={{ dataIndex: 0, seriesKey: "paid" }}
      height={260}
      interaction={{ mode: "tap", deselectOnOutsidePress: true }}
      series={[
        { yKey: "organic", label: "Organic" },
        { yKey: "paid", label: "Paid" }
      ]}
      testID="selectable-bar-chart"
      tooltip={{
        anchor: "pointer",
        borderColor: "transparent",
        placement: "above",
        width: 132
      }}
      width={width}
      xKey="month"
      yDomain={{ min: 0, max: "dataMax", nice: true }}
      formatYLabel={formatThousands}
    />
  </ChartSection>
);

const V2AnimatedBar = ({ isVisualMode, width }: NativeStoryProps) => {
  const { data, replay } = useAnimatedBarRows({
    endData: pipelineEnd,
    isVisualMode,
    startData: pipelineStart,
    valueKeys: ["accounts"]
  });

  return (
    <ChartSection title="Pipeline conversion" kicker="Animated bars">
      <BarChart
        data={data}
        height={250}
        series={[{ yKey: "accounts", label: "Accounts" }]}
        width={width}
        xKey="stage"
        yDomain={{ min: 0, max: 90, nice: true }}
        formatYLabel={(value) => `${Math.round(value)}k`}
      />
      <ReplayButton isVisualMode={isVisualMode} replay={replay} />
    </ChartSection>
  );
};

const V2AnimatedGroupedBar = ({ isVisualMode, width }: NativeStoryProps) => {
  const { data, replay } = useAnimatedBarRows({
    endData: channelEnd,
    isVisualMode,
    startData: channelStart,
    valueKeys: ["organic", "paid"]
  });

  return (
    <ChartSection title="Channel lift" kicker="Animated grouped bars">
      <BarChart
        data={data}
        height={276}
        mode="grouped"
        series={[
          { yKey: "organic", label: "Organic" },
          { yKey: "paid", label: "Paid" }
        ]}
        width={width}
        xKey="month"
        yDomain={{ min: 0, max: 90, nice: true }}
        formatYLabel={formatThousands}
      />
      <ReplayButton isVisualMode={isVisualMode} replay={replay} />
    </ChartSection>
  );
};

const V2ScrollableBar = ({ width }: NativeStoryProps) => (
  <ChartSection title="Campaign spend" kicker="Scrollable bars">
    <BarChart
      data={campaignSpend}
      height={250}
      initialIndex="end"
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

const V2CustomBarRenderer = ({ width }: NativeStoryProps) => (
  <ChartSection title="Weekly spend" kicker="Custom bars">
    <BarChart
      data={campaignSpend.slice(10, 16)}
      height={250}
      renderBar={({ bar, fill, radius }) => (
        <SvgRect
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx={radius}
          fill={fill}
        />
      )}
      series={[{ yKey: "spend", label: "Spend" }]}
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
      series={[{ yKey: "profit", label: "Profit" }]}
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
    Component: V2GroupedBar,
    Details: V2GroupedBarDetails
  },
  {
    id: "v2-bar-selection",
    title: "Tap Selection",
    Component: V2SelectableBar
  },
  {
    id: "v2-bar-animation",
    title: "Animated Bars",
    Component: V2AnimatedBar
  },
  {
    id: "v2-bar-grouped-animation",
    title: "Animated Grouped",
    Component: V2AnimatedGroupedBar
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
    id: "v2-bar-custom-renderer",
    title: "Custom Renderer",
    Component: V2CustomBarRenderer
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
