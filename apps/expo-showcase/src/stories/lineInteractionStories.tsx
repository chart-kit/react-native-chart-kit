import { useCallback, useMemo, useState } from "react";

import { resolveChartViewportPresetWindow } from "@chart-kit/core";
import {
  AreaChart,
  LineChart,
  resolveCartesianChartThemeConfig,
  type LineChartViewportChangeEvent,
  type LineChartViewportConfig,
  useChartKitTheme
} from "@chart-kit/react-native-v2";
import { SvgGroup, SvgRect } from "@chart-kit/svg-renderer";

import {
  denseRevenue,
  msftVsGoogHistory,
  multiSeriesRevenue,
  portfolioRangeHistory,
  priceHistory,
  revenueWithGaps,
  scrollablePriceHistory
} from "../fixtures/v2Line";
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

const V2AreaFill = ({ width }: NativeStoryProps) => (
  <ChartSection title="Price history" kicker="Area chart">
    <AreaChart
      data={priceHistory}
      xKey="date"
      yKey="price"
      width={width}
      height={230}
      curve="monotone"
      formatYLabel={(value) => `$${Math.round(value)}`}
    />
  </ChartSection>
);

const V2ScrollablePriceHistory = ({ width }: NativeStoryProps) => (
  <ChartSection title="Stock price history" kicker="Scrollable viewport">
    <AreaChart
      data={scrollablePriceHistory}
      xKey="date"
      yKey="price"
      width={width}
      height={248}
      scrollable
      visiblePoints={18}
      initialIndex="end"
      curve="monotone"
      showDots={false}
      yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
      formatXLabel={(value) =>
        value instanceof Date
          ? value.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            })
          : String(value)
      }
      formatYLabel={(value) => `$${Math.round(value)}`}
    />
  </ChartSection>
);

const V2ScrollableDenseLine = ({ width }: NativeStoryProps) => (
  <ChartSection title="Scrollable weekly trend" kicker="Visible points">
    <LineChart
      data={denseRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      scrollable
      visiblePoints={6}
      initialIndex="start"
      showDots={false}
      curve="monotone"
      showHorizontalGridLines
      labelStrategy="auto"
      formatXLabel={(_, index) => `W${index + 1}`}
    />
  </ChartSection>
);

const V2ScrollableStockComparison = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    msftVsGoogHistory.length - 5
  );

  return (
    <ChartSection title="MSFT vs GOOG" kicker="Scrollable scrub">
      <LineChart
        data={msftVsGoogHistory}
        xKey="date"
        width={width}
        height={262}
        scrollable
        visiblePoints={16}
        initialIndex="end"
        selectedIndex={selectedIndex}
        curve="monotone"
        showHorizontalGridLines
        yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
        formatXLabel={(value) =>
          value instanceof Date
            ? value.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
              })
            : String(value)
        }
        formatYLabel={(value) => `$${Math.round(value)}`}
        interaction={{
          mode: "scrub",
          selectionPersistence: "persist",
          deselectOnOutsidePress: true,
          onDeselect: () => setSelectedIndex(undefined),
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart,
          onSelect: (event) => setSelectedIndex(event.index)
        }}
        crosshair={{ strokeDasharray: [4, 4] }}
        tooltip={{ positionAnimationDuration: 140, width: 142 }}
        dots={{ radius: 3.5, strokeWidth: 1.75 }}
        activeDot={{ radius: 5.5, strokeWidth: 2.5 }}
        series={[
          {
            yKey: "msft",
            label: "MSFT",
            strokeWidth: 3,
            dot: { shape: "circle", fill: "background", stroke: "series" }
          },
          {
            yKey: "goog",
            label: "GOOG",
            strokeWidth: 2.5,
            dot: {
              shape: "diamond",
              fill: "series",
              radius: 3.8,
              stroke: "background",
              strokeWidth: 1.5
            }
          }
        ]}
      />
    </ChartSection>
  );
};

const rangeSelectorXValues = portfolioRangeHistory.map((point) => point.date);

const getInitialRangeSelectorViewport = (): LineChartViewportConfig =>
  resolveChartViewportPresetWindow({
    preset: "1M",
    xValues: rangeSelectorXValues
  });

const V2RangeSelectorOverview = ({
  isVisualMode,
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => {
  const chartKitTheme = useChartKitTheme();
  const resolvedTheme = useMemo(
    () => resolveCartesianChartThemeConfig(chartKitTheme),
    [chartKitTheme]
  );
  const rangeSelectorPalette = {
    backgroundFill: resolvedTheme.background,
    benchmarkColor: resolvedTheme.series[1] ?? resolvedTheme.mutedText,
    handleColor: resolvedTheme.series[0] ?? resolvedTheme.text,
    handleGripColor: resolvedTheme.background,
    outsideFill: resolvedTheme.grid,
    plotFill: resolvedTheme.plotBackground,
    windowFill: resolvedTheme.series[0] ?? resolvedTheme.text,
    windowStroke: resolvedTheme.series[0] ?? resolvedTheme.text
  };
  const [viewport, setViewport] = useState<LineChartViewportConfig>(() =>
    getInitialRangeSelectorViewport()
  );
  const handleViewportChange = useCallback(
    (event: LineChartViewportChangeEvent) => {
      setViewport(event.viewport);
    },
    []
  );

  return (
    <ChartSection title="Portfolio range" kicker="Overview window">
      <LineChart
        data={portfolioRangeHistory}
        xKey="date"
        width={width}
        height={isVisualMode ? 326 : 312}
        onViewportChange={handleViewportChange}
        testID="range-selector-chart"
        viewport={viewport}
        interaction={{
          mode: "scrub",
          selectionPersistence: "persist",
          deselectOnOutsidePress: true,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart
        }}
        crosshair={{ strokeDasharray: [4, 4] }}
        tooltip={{ positionAnimationDuration: 140, width: 168 }}
        activeDot={{ radius: 5.5, fill: "background", strokeWidth: 2.5 }}
        rangeSelector={{
          height: 66,
          gap: 10,
          interactive: true,
          backgroundFill: rangeSelectorPalette.backgroundFill,
          plotFill: rangeSelectorPalette.plotFill,
          plotRadius: 9,
          lineMinStrokeWidth: 1.2,
          lineStrokeWidthScale: 0.52,
          series: {
            portfolio: { opacity: 0.9, strokeWidth: 1.8 },
            benchmark: {
              color: rangeSelectorPalette.benchmarkColor,
              opacity: 0.72,
              strokeDasharray: [4, 4],
              strokeWidth: 1.4
            }
          },
          handleHitSlop: 28,
          handleHeight: 28,
          handleRadius: 5,
          handleWidth: 6,
          handleColor: rangeSelectorPalette.handleColor,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart,
          outsideFill: rangeSelectorPalette.outsideFill,
          outsideOpacity: 0.4,
          windowFill: rangeSelectorPalette.windowFill,
          windowStroke: rangeSelectorPalette.windowStroke,
          windowOpacity: 0.12,
          windowRadius: 9,
          windowStrokeOpacity: 0.72,
          windowStrokeWidth: 1.5,
          renderHandle: ({
            color,
            height,
            opacity,
            radius,
            width: w,
            x,
            y
          }) => (
            <SvgGroup>
              <SvgRect
                x={x}
                y={y}
                width={w}
                height={height}
                rx={radius}
                fill={color}
                opacity={opacity}
              />
              <SvgRect
                x={x + w / 2 - 0.75}
                y={y + 7}
                width={1.5}
                height={height - 14}
                rx={0.75}
                fill={rangeSelectorPalette.handleGripColor}
                opacity={0.68}
              />
            </SvgGroup>
          )
        }}
        curve="monotone"
        showDots={false}
        showHorizontalGridLines
        yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
        formatXLabel={(value) =>
          value instanceof Date
            ? value.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
              })
            : String(value)
        }
        formatYLabel={(value) => `$${Math.round(value)}`}
        series={[
          { yKey: "portfolio", label: "Portfolio", strokeWidth: 3 },
          { yKey: "benchmark", label: "Benchmark", strokeWidth: 2.5 }
        ]}
      />
    </ChartSection>
  );
};

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
  { id: "v2-null-gaps", title: "Null Gaps", Component: V2NullGaps },
  { id: "v2-area", title: "Area Fill", Component: V2AreaFill },
  {
    id: "v2-scrollable-price",
    title: "Scrollable Price",
    Component: V2ScrollablePriceHistory
  },
  {
    id: "v2-scrollable-dense",
    title: "Scrollable Dense",
    Component: V2ScrollableDenseLine
  },
  {
    id: "v2-scrollable-stock-comparison",
    title: "Scrollable Stock Comparison",
    Component: V2ScrollableStockComparison
  },
  {
    id: "v2-range-selector",
    title: "Portfolio Range",
    Component: V2RangeSelectorOverview
  }
];
