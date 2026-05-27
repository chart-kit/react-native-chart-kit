import { useCallback, useState } from "react";

import {
  BarChart,
  LineChart,
  type LineChartViewportChangeEvent,
  type LineChartViewportConfig
} from "react-native-chart-kit/v2";

import {
  ChartSection,
  type NativeStoryProps,
  type ShowcaseStory
} from "./storyPrimitives";
import performanceStoryMetadata from "./performanceStoryMetadata.json";

type PerfLinePoint = {
  benchmark: number;
  index: number;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  value: number;
};

type PerfBarPoint = {
  spend: number;
  week: string;
};

const formatCompactCurrency = (value: number) =>
  value >= 1000
    ? `$${Math.round(value / 100) / 10}M`
    : `$${Math.round(value)}k`;

const formatIndexLabel = (value: unknown) => `${value}`;

const createLineData = (count: number): PerfLinePoint[] =>
  Array.from({ length: count }, (_, index) => {
    const trend = 180 + index * 0.095;
    const cycle = Math.sin(index / 13) * 18 + Math.cos(index / 37) * 12;
    const fasterCycle = Math.sin(index / 5) * 4;
    const value = Math.max(12, trend + cycle + fasterCycle);

    return {
      benchmark: Math.max(12, 170 + index * 0.085 + Math.cos(index / 29) * 10),
      index,
      s1: Math.max(12, value),
      s2: Math.max(12, value * 0.86 + Math.sin(index / 17) * 15),
      s3: Math.max(12, value * 1.08 + Math.cos(index / 21) * 20),
      s4: Math.max(12, value * 0.72 + Math.sin(index / 9) * 11),
      s5: Math.max(12, value * 1.18 + Math.cos(index / 33) * 24),
      value
    };
  });

const createBarData = (count: number): PerfBarPoint[] =>
  Array.from({ length: count }, (_, index) => ({
    spend: Math.round(42 + Math.sin(index / 4) * 14 + Math.cos(index / 19) * 9),
    week: `W${index + 1}`
  }));

const getStoryMetadata = (storyId: string) => {
  const metadata = performanceStoryMetadata.stories.find(
    (story) => story.id === storyId
  );

  if (!metadata) {
    throw new Error(`Missing performance story metadata for ${storyId}`);
  }

  return metadata;
};

const line100Metadata = getStoryMetadata("v2-perf-line-100");
const line1000Metadata = getStoryMetadata("v2-perf-line-1000-scrub");
const line10000Metadata = getStoryMetadata("v2-perf-line-10000-overview");
const panLineMetadata = getStoryMetadata("v2-perf-line-10000-pan");
const rangeMetadata = getStoryMetadata("v2-perf-range-2x10000");
const barMetadata = getStoryMetadata("v2-perf-bar-500-selection");

const line100 = createLineData(line100Metadata.totalPoints);
const line1000 = createLineData(line1000Metadata.totalPoints);
const line10000 = createLineData(line10000Metadata.totalPoints);
const bars500 = createBarData(barMetadata.totalPoints);

const PerfSmallLine = ({ width }: NativeStoryProps) => (
  <ChartSection title="100 point line" kicker="Native performance">
    <LineChart
      data={line100}
      height={232}
      width={width}
      xKey="index"
      yKey="value"
      curve="monotone"
      showDots={false}
      showHorizontalGridLines
      formatXLabel={formatIndexLabel}
      formatYLabel={formatCompactCurrency}
    />
  </ChartSection>
);

const PerfLineScrub = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => (
  <ChartSection title="1,000 point scrub" kicker="Native performance">
    <LineChart
      data={line1000}
      height={244}
      width={width}
      xKey="index"
      yKey="value"
      curve="monotone"
      showDots={false}
      labelStrategy="hide"
      defaultSelectedIndex={740}
      interaction={{
        mode: "scrub",
        onGestureEnd: onScrubEnd,
        onGestureStart: onScrubStart
      }}
      crosshair={{ strokeDasharray: [4, 4] }}
      tooltip={{ width: 136 }}
      formatYLabel={formatCompactCurrency}
    />
  </ChartSection>
);

const PerfDenseLineOverview = ({ width }: NativeStoryProps) => (
  <ChartSection title="10,000 point overview" kicker="Native performance">
    <LineChart
      data={line10000}
      height={244}
      width={width}
      xKey="index"
      yKey="value"
      curve="monotone"
      decimation="auto"
      showDots={false}
      showHorizontalGridLines
      labelStrategy="hide"
      yAxisLabelWidth="stable"
      yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
      formatYLabel={formatCompactCurrency}
    />
  </ChartSection>
);

const PerfMultiLineSharedTooltip = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => (
  <ChartSection title="5 x 1,000 shared tooltip" kicker="Native performance">
    <LineChart
      data={line1000}
      height={258}
      width={width}
      xKey="index"
      curve="monotone"
      showDots={false}
      labelStrategy="hide"
      defaultSelectedIndex={620}
      interaction={{
        mode: "scrub",
        onGestureEnd: onScrubEnd,
        onGestureStart: onScrubStart
      }}
      crosshair={{ strokeDasharray: [4, 4] }}
      tooltip={{ width: 166 }}
      formatYLabel={formatCompactCurrency}
      series={[
        { yKey: "s1", label: "North" },
        { yKey: "s2", label: "South" },
        { yKey: "s3", label: "East" },
        { yKey: "s4", label: "West" },
        { yKey: "s5", label: "Enterprise" }
      ]}
    />
  </ChartSection>
);

const PerfPanLine = ({ onScrubEnd, onScrubStart, width }: NativeStoryProps) => {
  const [viewport, setViewport] = useState<LineChartViewportConfig>({
    endIndex: panLineMetadata.totalPoints - 1,
    startIndex: panLineMetadata.totalPoints - panLineMetadata.visiblePoints
  });
  const handleViewportChange = useCallback(
    (event: LineChartViewportChangeEvent) => setViewport(event.viewport),
    []
  );

  return (
    <ChartSection title="10,000 point pan" kicker="Native performance">
      <LineChart
        data={line10000}
        height={258}
        width={width}
        xKey="index"
        yKey="value"
        curve="monotone"
        decimation="auto"
        showDots={false}
        labelStrategy="hide"
        onViewportChange={handleViewportChange}
        viewport={viewport}
        viewportInteraction={{
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart,
          pan: true
        }}
        yAxisLabelWidth="stable"
        yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
        formatYLabel={formatCompactCurrency}
      />
    </ChartSection>
  );
};

const PerfRangeSelector = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => {
  const [viewport, setViewport] = useState<LineChartViewportConfig>({
    endIndex: rangeMetadata.totalPoints - 1,
    startIndex: rangeMetadata.totalPoints - rangeMetadata.visiblePoints
  });
  const handleViewportChange = useCallback(
    (event: LineChartViewportChangeEvent) => setViewport(event.viewport),
    []
  );

  return (
    <ChartSection title="2 x 10,000 range" kicker="Native performance">
      <LineChart
        data={line10000}
        height={314}
        width={width}
        xKey="index"
        curve="monotone"
        decimation="auto"
        showDots={false}
        labelStrategy="hide"
        onViewportChange={handleViewportChange}
        rangeSelector={{
          gap: 10,
          height: 64,
          interactive: true,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart
        }}
        viewport={viewport}
        yAxisLabelWidth="stable"
        yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
        formatYLabel={formatCompactCurrency}
        series={[
          { yKey: "value", label: "Portfolio", strokeWidth: 3 },
          {
            yKey: "benchmark",
            label: "Benchmark",
            strokeDasharray: [4, 4],
            strokeWidth: 2
          }
        ]}
      />
    </ChartSection>
  );
};

const PerfScrollableBars = ({ width }: NativeStoryProps) => (
  <ChartSection title="500 scrollable bars" kicker="Native performance">
    <BarChart
      data={bars500}
      defaultSelectedBar={{ dataIndex: 490, seriesKey: "spend" }}
      height={252}
      initialIndex="end"
      interaction={{ mode: "tap", deselectOnOutsidePress: true }}
      scrollable
      selectionAnimation={{ duration: 200 }}
      series={[{ yKey: "spend", label: "Spend" }]}
      tooltip={{ positionAnimationDuration: 220, width: 128 }}
      visiblePoints={24}
      width={width}
      xKey="week"
      yDomain={{ min: 0, max: "dataMax", nice: true }}
      formatYLabel={(value) => `$${Math.round(value)}k`}
    />
  </ChartSection>
);

export const performanceStories: ShowcaseStory[] = [
  {
    id: "v2-perf-line-100",
    title: "100 Point Line",
    Component: PerfSmallLine
  },
  {
    id: "v2-perf-line-1000-scrub",
    title: "1,000 Point Scrub",
    Component: PerfLineScrub
  },
  {
    id: "v2-perf-line-10000-overview",
    title: "10,000 Point Overview",
    Component: PerfDenseLineOverview
  },
  {
    id: "v2-perf-line-5x1000-tooltip",
    title: "5 x 1,000 Tooltip",
    Component: PerfMultiLineSharedTooltip
  },
  {
    id: "v2-perf-line-10000-pan",
    title: "10,000 Point Pan",
    Component: PerfPanLine
  },
  {
    id: "v2-perf-range-2x10000",
    title: "2 x 10,000 Range",
    Component: PerfRangeSelector
  },
  {
    id: "v2-perf-bar-500-selection",
    title: "500 Bar Selection",
    Component: PerfScrollableBars
  }
];
