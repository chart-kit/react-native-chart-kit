import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  BarChart as CompatBarChart,
  LineChart as CompatLineChart
} from "@chart-kit/react-native";
import { AreaChart, LineChart } from "@chart-kit/react-native-v2";
import { SvgCircle, SvgGroup, SvgRect, SvgText } from "@chart-kit/svg-renderer";

import { BarChartFixture, fixtures as barFixtures } from "./fixtures/compatBar";
import {
  LineChartFixture,
  fixtures as lineFixtures
} from "./fixtures/compatLine";
import {
  basicRevenue,
  denseRevenue,
  longRangeRevenue,
  multiSeriesRevenue,
  priceHistory,
  revenueWithGaps,
  sixMonthRevenue,
  subscriptionMetrics
} from "./fixtures/v2Line";

export type NativeStoryProps = {
  isVisualMode?: boolean;
  onScrubEnd?: () => void;
  onScrubStart?: () => void;
  width: number;
};

export type ShowcaseStory = {
  id: string;
  title: string;
  Component: React.ComponentType<NativeStoryProps>;
};

export type ShowcaseSection = {
  id: string;
  title: string;
  stories: ShowcaseStory[];
};

const ChartCard = ({
  children,
  isDark = false,
  kicker,
  title
}: {
  children: React.ReactNode;
  isDark?: boolean;
  kicker?: string;
  title: string;
}) => (
  <View style={[styles.card, isDark && styles.darkCard]}>
    {kicker ? (
      <Text style={[styles.kicker, isDark && styles.darkKicker]}>{kicker}</Text>
    ) : null}
    <Text style={[styles.cardTitle, isDark && styles.darkCardTitle]}>
      {title}
    </Text>
    <View style={styles.chartSlot}>{children}</View>
  </View>
);

const EmptyState = ({ copy, height }: { copy: string; height: number }) => (
  <View style={[styles.emptyState, { height }]}>
    <Text style={styles.emptyTitle}>No chart data</Text>
    <Text style={styles.emptyCopy}>{copy}</Text>
  </View>
);

const V2Basic = ({ width }: NativeStoryProps) => (
  <ChartCard title="Revenue" kicker="Basic">
    <LineChart
      data={basicRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      curve="monotone"
    />
  </ChartCard>
);

const V2RevenueCard = ({ width }: NativeStoryProps) => (
  <ChartCard title="MRR growth" kicker="Multi-metric">
    <LineChart
      data={subscriptionMetrics}
      xKey="month"
      width={width}
      height={230}
      showDots={false}
      curve="monotone"
      formatYLabel={(value) => `$${Math.round(value)}k`}
      series={[
        { yKey: "revenue", label: "Revenue", color: "#2563eb" },
        {
          yKey: "netRetention",
          label: "Retention",
          color: "#10b981",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2BottomLegend = ({ width }: NativeStoryProps) => (
  <ChartCard title="Plan vs actual" kicker="Bottom legend">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={248}
      showDots={false}
      curve="monotone"
      legend={{
        position: "bottom",
        align: "center",
        marker: "line",
        itemGap: 18,
        fontSize: 12
      }}
      series={[
        { yKey: "actual", label: "Actual", color: "#2563eb" },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#7c3aed",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2CustomLegend = ({ width }: NativeStoryProps) => (
  <ChartCard title="Custom legend" kicker="Composable legend item">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      legend={{
        align: "center",
        marker: "circle",
        fontSize: 12,
        itemGap: 18,
        itemPaddingHorizontal: 10,
        itemPaddingVertical: 4,
        renderItem: (item) => (
          <SvgGroup key={item.key}>
            <SvgRect
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              rx={8}
              fill={item.color}
              opacity={0.1}
            />
            <SvgCircle
              cx={item.contentX + item.markerSize / 2}
              cy={item.contentY + item.contentHeight / 2}
              r={item.markerSize / 2}
              fill={item.color}
            />
            <SvgText
              x={item.contentX + item.markerSize + item.labelGap}
              y={item.contentY + item.contentHeight / 2 + item.fontSize * 0.36}
              fill={item.color}
              fontSize={item.fontSize}
              fontWeight="600"
            >
              {item.label}
            </SvgText>
          </SvgGroup>
        )
      }}
      series={[
        { yKey: "actual", label: "Actual", color: "#2563eb", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#7c3aed",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2CustomTypography = ({ width }: NativeStoryProps) => (
  <ChartCard title="Typography" kicker="Font token mapping">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      theme={{
        background: "#ffffff",
        plotBackground: "#ffffff",
        grid: "#e2e8f0",
        axis: "#e2e8f0",
        text: "#172033",
        mutedText: "#475569",
        series: ["#0f766e", "#2563eb"],
        typography: {
          fontFamily: "Georgia",
          axisLabelSize: 12,
          legendLabelSize: 13
        }
      }}
      legend={{
        align: "center",
        marker: "circle"
      }}
      series={[
        { yKey: "actual", label: "Actual", color: "#0f766e", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#2563eb",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2MultiSeries = ({ width }: NativeStoryProps) => (
  <ChartCard title="Plan vs actual" kicker="Multi-series">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      series={[
        { yKey: "actual", label: "Actual", color: "#2563eb", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#0891b2",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2DotStyles = ({ width }: NativeStoryProps) => (
  <ChartCard title="Marker styles" kicker="Circle and diamond markers">
    <LineChart
      data={multiSeriesRevenue.map((point) => ({
        ...point,
        forecast:
          typeof point.forecast === "number"
            ? point.forecast - 8
            : point.forecast
      }))}
      xKey="month"
      width={width}
      height={238}
      curve="monotone"
      dots={{
        radius: 4,
        fill: "background",
        strokeWidth: 2
      }}
      series={[
        {
          yKey: "actual",
          label: "Actual",
          color: "#2563eb",
          strokeWidth: 3,
          dot: {
            shape: "circle",
            radius: 4.5
          }
        },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#0891b2",
          strokeWidth: 2,
          dot: {
            shape: "diamond",
            radius: 4,
            fill: "series",
            stroke: "background",
            strokeWidth: 1.5
          }
        }
      ]}
    />
  </ChartCard>
);

const V2SelectedTooltip = ({ width }: NativeStoryProps) => (
  <ChartCard title="Shared tooltip" kicker="Selection model">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      selectedIndex={2}
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip={{
        width: 138
      }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        { yKey: "actual", label: "Actual", color: "#2563eb", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#0891b2",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2ScrubInteraction = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => (
  <ChartCard title="Tap and scrub" kicker="Persistent selection">
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
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip={{
        width: 138,
        positionAnimationDuration: 180
      }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        { yKey: "actual", label: "Actual", color: "#2563eb", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#0891b2",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2WhileActiveScrub = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => (
  <ChartCard title="Hold to inspect" kicker="While-active selection">
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
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip={{
        width: 138,
        positionAnimationDuration: 110
      }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        { yKey: "actual", label: "Actual", color: "#2563eb", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#0891b2",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2NullGaps = ({ width }: NativeStoryProps) => (
  <ChartCard title="Missing readings" kicker="Null gap handling">
    <LineChart
      data={revenueWithGaps}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      yDomain={[0, "dataMax"]}
      showDots
      selectedIndex={3}
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip
    />
  </ChartCard>
);

const V2AreaFill = ({ width }: NativeStoryProps) => (
  <ChartCard title="Price history" kicker="Dark area chart" isDark>
    <AreaChart
      data={priceHistory}
      xKey="date"
      yKey="price"
      width={width}
      height={230}
      theme="dark"
      curve="monotone"
      formatYLabel={(value) => `$${Math.round(value)}`}
    />
  </ChartCard>
);

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

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

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
      const nextProgress = Math.min(elapsed / 1500, 1);
      setProgress(easeOutCubic(nextProgress));

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
        const delay = index * 0.045;
        const localProgress = Math.max(
          0,
          Math.min(1, (progress - delay) / (1 - delay))
        );

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
    replay: () => setRunId((currentRunId) => currentRunId + 1),
    selectedIndex: Math.min(
      data.length - 1,
      Math.max(0, Math.round(progress * (data.length - 1)))
    )
  };
};

const V2ProAnimation = ({ isVisualMode, width }: NativeStoryProps) => {
  const { data, replay, selectedIndex } = useAnimatedPreviewData(isVisualMode);

  return (
    <ChartCard title="Portfolio growth" kicker="Pro animation preview" isDark>
      <LineChart
        data={data}
        xKey="month"
        width={width}
        height={248}
        theme="dark"
        curve="monotone"
        area
        showDots={false}
        selectedIndex={selectedIndex}
        yDomain={[0, "dataMax"]}
        crosshair={{
          color: "#38bdf8",
          opacity: 0.8,
          strokeDasharray: [4, 4]
        }}
        activeDot={{
          radius: 5.5,
          fill: "background",
          strokeWidth: 2.5
        }}
        formatYLabel={(value) => `$${Math.round(value)}k`}
        series={[
          {
            yKey: "actual",
            label: "Portfolio",
            color: "#38bdf8",
            strokeWidth: 3
          },
          {
            yKey: "forecast",
            label: "Benchmark",
            color: "#a78bfa",
            strokeWidth: 2
          }
        ]}
      />
      {isVisualMode ? null : (
        <Pressable
          accessibilityRole="button"
          onPress={replay}
          style={({ pressed }) => [
            styles.replayButton,
            pressed && styles.replayButtonPressed
          ]}
        >
          <Text style={styles.replayButtonText}>Replay</Text>
        </Pressable>
      )}
    </ChartCard>
  );
};

const V2DenseLabels = ({ width }: NativeStoryProps) => (
  <ChartCard title="Weekly trend" kicker="Dense labels">
    <LineChart
      data={denseRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      showDots={false}
      curve="linear"
    />
  </ChartCard>
);

const V2RotatedLabels = ({ width }: NativeStoryProps) => (
  <ChartCard title="Monthly expansion" kicker="Rotated labels">
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
  </ChartCard>
);

const V2RotatedSixLabels = ({ width }: NativeStoryProps) => (
  <ChartCard title="Six month labels" kicker="Steep rotation">
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
  </ChartCard>
);

const V2StaggeredLabels = ({ width }: NativeStoryProps) => (
  <ChartCard title="Weekly retention" kicker="Staggered labels">
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
  </ChartCard>
);

const V2GridLines = ({ width }: NativeStoryProps) => (
  <ChartCard title="Grid lines" kicker="Opt-in horizontal and vertical grid">
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
  </ChartCard>
);

const V2HiddenLabels = ({ width }: NativeStoryProps) => (
  <ChartCard title="Spark trend" kicker="Hidden labels">
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
  </ChartCard>
);

const V2DarkMode = ({ width }: NativeStoryProps) => (
  <ChartCard title="Dark mode" kicker="Area and multi-series" isDark>
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
  </ChartCard>
);

const hasLineData = (fixture: LineChartFixture) =>
  fixture.data.datasets.some((dataset) => dataset.data.length > 0);

const hasBarData = (fixture: BarChartFixture) =>
  fixture.data.datasets.some((dataset) => dataset.data.length > 0);

const resolveLegacyWidth = (
  availableWidth: number,
  fixture: Pick<LineChartFixture | BarChartFixture, "width">
) => Math.min(availableWidth, fixture.width);

const legacyChartStyle = (
  fixture: Pick<LineChartFixture | BarChartFixture, "style">
) => ({
  ...fixture.style,
  paddingRight: Math.min(fixture.style?.paddingRight ?? 28, 28),
  width: undefined
});

const CompatLineStory = ({
  fixture,
  title
}: {
  fixture: LineChartFixture;
  title: string;
}) => {
  const Story = ({ width }: NativeStoryProps) => {
    const chartWidth = resolveLegacyWidth(width, fixture);
    const isDark = title === "Dark Mode";

    return (
      <ChartCard title={title} kicker="Compat LineChart" isDark={isDark}>
        {hasLineData(fixture) ? (
          <CompatLineChart
            data={fixture.data}
            width={chartWidth}
            height={fixture.height}
            chartConfig={fixture.chartConfig}
            style={legacyChartStyle(fixture)}
            segments={fixture.segments}
            bezier={fixture.bezier}
            fromZero={fixture.fromZero}
            withDots={fixture.withDots}
            withInnerLines={fixture.withInnerLines}
            withOuterLines={fixture.withOuterLines}
            verticalLabelRotation={fixture.verticalLabelRotation}
            xLabelsOffset={fixture.xLabelsOffset}
            yAxisSuffix={fixture.yAxisSuffix}
          />
        ) : (
          <EmptyState
            copy="The compatibility fixture contains zero points."
            height={fixture.height}
          />
        )}
      </ChartCard>
    );
  };

  return Story;
};

const CompatBarStory = ({
  fixture,
  title
}: {
  fixture: BarChartFixture;
  title: string;
}) => {
  const Story = ({ width }: NativeStoryProps) => {
    const chartWidth = resolveLegacyWidth(width, fixture);
    const isDark = title === "Dark Mode";

    return (
      <ChartCard title={title} kicker="Compat BarChart" isDark={isDark}>
        {hasBarData(fixture) ? (
          <CompatBarChart
            data={fixture.data}
            width={chartWidth}
            height={fixture.height}
            chartConfig={fixture.chartConfig}
            style={legacyChartStyle(fixture)}
            fromZero={fixture.fromZero}
            flatColor={fixture.flatColor}
            horizontalLabelRotation={fixture.horizontalLabelRotation}
            segments={fixture.segments}
            showBarTops={fixture.showBarTops}
            showValuesOnTopOfBars={fixture.showValuesOnTopOfBars}
            verticalLabelRotation={fixture.verticalLabelRotation}
            withCustomBarColorFromData={fixture.withCustomBarColorFromData}
            withHorizontalLabels={fixture.withHorizontalLabels}
            withInnerLines={fixture.withInnerLines}
            withVerticalLabels={fixture.withVerticalLabels}
            yAxisLabel={fixture.yAxisLabel ?? ""}
            yAxisSuffix={fixture.yAxisSuffix ?? ""}
          />
        ) : (
          <EmptyState
            copy="The compatibility fixture contains zero bars."
            height={fixture.height}
          />
        )}
      </ChartCard>
    );
  };

  return Story;
};

export const storySections: ShowcaseSection[] = [
  {
    id: "v2-line",
    title: "V2 Line and Area",
    stories: [
      { id: "v2-basic", title: "Basic", Component: V2Basic },
      {
        id: "v2-revenue-card",
        title: "Revenue Card",
        Component: V2RevenueCard
      },
      {
        id: "v2-bottom-legend",
        title: "Bottom Legend",
        Component: V2BottomLegend
      },
      {
        id: "v2-custom-legend",
        title: "Custom Legend",
        Component: V2CustomLegend
      },
      {
        id: "v2-custom-typography",
        title: "Custom Typography",
        Component: V2CustomTypography
      },
      {
        id: "v2-multi-series",
        title: "Multi Series",
        Component: V2MultiSeries
      },
      {
        id: "v2-dot-styles",
        title: "Marker Styles",
        Component: V2DotStyles
      },
      {
        id: "v2-selected-tooltip",
        title: "Shared Tooltip",
        Component: V2SelectedTooltip
      },
      {
        id: "v2-scrub",
        title: "Tap and Scrub",
        Component: V2ScrubInteraction
      },
      {
        id: "v2-while-active",
        title: "Hold to Inspect",
        Component: V2WhileActiveScrub
      },
      {
        id: "v2-null-gaps",
        title: "Null Gaps",
        Component: V2NullGaps
      },
      { id: "v2-area", title: "Area Fill", Component: V2AreaFill },
      {
        id: "v2-pro-animation",
        title: "Pro Animation",
        Component: V2ProAnimation
      },
      {
        id: "v2-dense-labels",
        title: "Dense Labels",
        Component: V2DenseLabels
      },
      {
        id: "v2-rotated-labels",
        title: "Rotated Labels",
        Component: V2RotatedLabels
      },
      {
        id: "v2-six-labels",
        title: "Six Rotated Labels",
        Component: V2RotatedSixLabels
      },
      {
        id: "v2-staggered-labels",
        title: "Staggered Labels",
        Component: V2StaggeredLabels
      },
      {
        id: "v2-grid-lines",
        title: "Grid Lines",
        Component: V2GridLines
      },
      {
        id: "v2-hidden-labels",
        title: "Hidden Labels",
        Component: V2HiddenLabels
      },
      {
        id: "v2-dark-mode",
        title: "Dark Mode",
        Component: V2DarkMode
      }
    ]
  },
  {
    id: "legacy-line",
    title: "Compat LineChart",
    stories: [
      {
        id: "line-basic",
        title: "Basic",
        Component: CompatLineStory({
          fixture: lineFixtures.basic,
          title: "Basic"
        })
      },
      {
        id: "line-long-labels",
        title: "Long Labels",
        Component: CompatLineStory({
          fixture: lineFixtures.longLabels,
          title: "Long Labels"
        })
      },
      {
        id: "line-dense-data",
        title: "Dense Data",
        Component: CompatLineStory({
          fixture: lineFixtures.denseData,
          title: "Dense Data"
        })
      },
      {
        id: "line-negative-values",
        title: "Negative Values",
        Component: CompatLineStory({
          fixture: lineFixtures.negativeValues,
          title: "Negative Values"
        })
      },
      {
        id: "line-empty-state",
        title: "Empty State",
        Component: CompatLineStory({
          fixture: lineFixtures.emptyState,
          title: "Empty State"
        })
      },
      {
        id: "line-dark-mode",
        title: "Dark Mode",
        Component: CompatLineStory({
          fixture: lineFixtures.darkMode,
          title: "Dark Mode"
        })
      },
      {
        id: "line-tiny-width",
        title: "Tiny Width",
        Component: CompatLineStory({
          fixture: lineFixtures.tinyWidth,
          title: "Tiny Width"
        })
      }
    ]
  },
  {
    id: "legacy-bar",
    title: "Compat BarChart",
    stories: [
      {
        id: "bar-basic",
        title: "Basic",
        Component: CompatBarStory({
          fixture: barFixtures.basic,
          title: "Basic"
        })
      },
      {
        id: "bar-long-labels",
        title: "Long Labels",
        Component: CompatBarStory({
          fixture: barFixtures.longLabels,
          title: "Long Labels"
        })
      },
      {
        id: "bar-dense-data",
        title: "Dense Data",
        Component: CompatBarStory({
          fixture: barFixtures.denseData,
          title: "Dense Data"
        })
      },
      {
        id: "bar-negative-values",
        title: "Negative Values",
        Component: CompatBarStory({
          fixture: barFixtures.negativeValues,
          title: "Negative Values"
        })
      },
      {
        id: "bar-empty-state",
        title: "Empty State",
        Component: CompatBarStory({
          fixture: barFixtures.emptyState,
          title: "Empty State"
        })
      },
      {
        id: "bar-dark-mode",
        title: "Dark Mode",
        Component: CompatBarStory({
          fixture: barFixtures.darkMode,
          title: "Dark Mode"
        })
      },
      {
        id: "bar-tiny-width",
        title: "Tiny Width",
        Component: CompatBarStory({
          fixture: barFixtures.tinyWidth,
          title: "Tiny Width"
        })
      }
    ]
  }
];

export const stories = storySections.flatMap((section) => section.stories);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#dde6f2",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12
  },
  darkCard: {
    backgroundColor: "#020617",
    borderColor: "#1e293b"
  },
  kicker: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 4,
    textTransform: "uppercase"
  },
  darkKicker: {
    color: "#94a3b8"
  },
  cardTitle: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 14
  },
  darkCardTitle: {
    color: "#f8fafc"
  },
  chartSlot: {
    alignItems: "center",
    overflow: "hidden"
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    justifyContent: "center",
    width: "100%"
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8
  },
  emptyCopy: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center"
  },
  replayButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#e0f2fe",
    borderColor: "#7dd3fc",
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    marginTop: 10,
    minWidth: 88,
    paddingHorizontal: 14
  },
  replayButtonPressed: {
    opacity: 0.72
  },
  replayButtonText: {
    color: "#075985",
    fontSize: 13,
    fontWeight: "800"
  }
});
