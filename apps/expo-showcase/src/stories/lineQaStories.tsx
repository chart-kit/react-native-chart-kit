import { useEffect, useMemo, useState } from "react";
import { Pressable, Text } from "react-native";

import { LineChart } from "@chart-kit/react-native-v2";

import {
  basicRevenue,
  denseRevenue,
  longRangeRevenue,
  multiSeriesRevenue,
  sixMonthRevenue
} from "../fixtures/v2Line";
import {
  ChartSection,
  storyStyles,
  type NativeStoryProps,
  type ShowcaseStory
} from "./storyPrimitives";

type AnimatedPreviewPoint = {
  month: string;
  actual: number;
  forecast: number;
};

const animationStartData: AnimatedPreviewPoint[] = [
  { month: "Jan", actual: 22, forecast: 20 },
  { month: "Feb", actual: 23, forecast: 22 },
  { month: "Mar", actual: 24, forecast: 23 },
  { month: "Apr", actual: 25, forecast: 24 },
  { month: "May", actual: 27, forecast: 25 },
  { month: "Jun", actual: 28, forecast: 27 },
  { month: "Jul", actual: 29, forecast: 28 }
];

const animationEndData: AnimatedPreviewPoint[] = [
  { month: "Jan", actual: 22, forecast: 20 },
  { month: "Feb", actual: 31, forecast: 26 },
  { month: "Mar", actual: 28, forecast: 31 },
  { month: "Apr", actual: 47, forecast: 38 },
  { month: "May", actual: 53, forecast: 44 },
  { month: "Jun", actual: 62, forecast: 51 },
  { month: "Jul", actual: 76, forecast: 57 }
];

const animationPreviewDuration = 1850;
const animationPreviewPointDelay = 0.04;
const animationPreviewYMax = 84;

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

const useAnimatedPreviewData = (isVisualMode?: boolean) => {
  const [progress, setProgress] = useState(isVisualMode ? 1 : 0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (isVisualMode) {
      return;
    }

    let frameId = 0;
    let startTime: number | undefined;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;

      const elapsed = timestamp - startTime;
      const nextProgress = clamp01(elapsed / animationPreviewDuration);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isVisualMode, runId]);

  const data = useMemo(
    () =>
      animationEndData.map((target, index) => {
        const start = animationStartData[index];
        const delay = index * animationPreviewPointDelay;
        const localProgress = smootherStep((progress - delay) / (1 - delay));

        return {
          month: target.month,
          actual: interpolate(start.actual, target.actual, localProgress),
          forecast: interpolate(start.forecast, target.forecast, localProgress)
        };
      }),
    [progress]
  );

  return {
    data,
    replay: () => setRunId((currentRunId) => currentRunId + 1)
  };
};

const V2ProAnimation = ({ isVisualMode, width }: NativeStoryProps) => {
  const { data, replay } = useAnimatedPreviewData(isVisualMode);

  return (
    <ChartSection title="Portfolio growth" kicker="Pro animation preview">
      <LineChart
        data={data}
        xKey="month"
        width={width}
        height={248}
        curve="monotone"
        area
        showDots={false}
        yDomain={[0, animationPreviewYMax]}
        formatYLabel={(value) => `$${Math.round(value)}k`}
        series={[
          { yKey: "actual", label: "Portfolio", strokeWidth: 3 },
          { yKey: "forecast", label: "Benchmark", strokeWidth: 2 }
        ]}
      />
      {isVisualMode ? null : (
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
      )}
    </ChartSection>
  );
};

const V2DenseLabels = ({ width }: NativeStoryProps) => (
  <ChartSection title="Weekly trend" kicker="Dense labels">
    <LineChart
      data={denseRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      showDots={false}
      curve="linear"
    />
  </ChartSection>
);

const V2RotatedLabels = ({ width }: NativeStoryProps) => (
  <ChartSection title="Monthly expansion" kicker="Rotated labels">
    <LineChart
      data={longRangeRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={260}
      showDots={false}
      curve="monotone"
      labelStrategy="rotate"
      labelRotation={-35}
    />
  </ChartSection>
);

const V2RotatedSixLabels = ({ width }: NativeStoryProps) => (
  <ChartSection title="Six month labels" kicker="Steep rotation">
    <LineChart
      data={sixMonthRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={250}
      showDots={false}
      curve="monotone"
      labelStrategy="rotate"
      labelRotation={-70}
      labelMinGap={0}
    />
  </ChartSection>
);

const V2StaggeredLabels = ({ width }: NativeStoryProps) => (
  <ChartSection title="Weekly retention" kicker="Staggered labels">
    <LineChart
      data={denseRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={248}
      showDots={false}
      curve="monotone"
      labelStrategy="stagger"
    />
  </ChartSection>
);

const V2GridLines = ({ width }: NativeStoryProps) => (
  <ChartSection title="Grid lines" kicker="Opt-in horizontal and vertical grid">
    <LineChart
      data={basicRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      curve="monotone"
      showDots={false}
      showHorizontalGridLines
      showVerticalGridLines
    />
  </ChartSection>
);

const V2HiddenLabels = ({ width }: NativeStoryProps) => (
  <ChartSection title="Spark trend" kicker="Hidden labels">
    <LineChart
      data={denseRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={220}
      showDots={false}
      curve="monotone"
      labelStrategy="hide"
    />
  </ChartSection>
);

const V2DarkMode = ({ width }: NativeStoryProps) => (
  <ChartSection title="Dark mode" kicker="Area and multi-series">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      theme="dark"
      curve="monotone"
      area
      series={[
        { yKey: "actual", label: "Actual", color: "#38bdf8", strokeWidth: 3 },
        { yKey: "forecast", label: "Target", color: "#a78bfa", strokeWidth: 2 }
      ]}
    />
  </ChartSection>
);

export const lineQaStories: ShowcaseStory[] = [
  { id: "v2-pro-animation", title: "Pro Animation", Component: V2ProAnimation },
  { id: "v2-dense-labels", title: "Dense Labels", Component: V2DenseLabels },
  {
    id: "v2-rotated-labels",
    title: "Rotated Labels",
    Component: V2RotatedLabels
  },
  { id: "v2-six-labels", title: "Six Labels", Component: V2RotatedSixLabels },
  {
    id: "v2-staggered-labels",
    title: "Staggered Labels",
    Component: V2StaggeredLabels
  },
  { id: "v2-grid-lines", title: "Grid Lines", Component: V2GridLines },
  { id: "v2-hidden-labels", title: "Hidden Labels", Component: V2HiddenLabels },
  { id: "v2-dark-mode", title: "Dark Mode", Component: V2DarkMode }
];
