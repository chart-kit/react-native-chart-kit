import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  resolveChartViewportPresetWindow,
  resolveChartViewportWindow,
  resolveChartViewportWindowFromPanDelta,
  resolveChartViewportWindowFromZoom,
  type ResolvedChartViewportWindow
} from "@chart-kit/core";
import {
  AreaChart,
  LineChart,
  resolveCartesianChartThemeConfig,
  type LineChartViewportChangeEvent,
  type LineChartViewportConfig,
  useChartKitTheme
} from "@chart-kit/react-native-v2";

import {
  denseRevenue,
  msftVsGoogHistory,
  portfolioRangeHistory,
  priceHistory,
  scrollablePriceHistory
} from "../fixtures/v2Line";
import {
  ChartSection,
  type NativeStoryProps,
  type ShowcaseStory
} from "./storyPrimitives";
import {
  createRangeSelectorHandleRenderer,
  createRangeSelectorLineRenderer
} from "./rangeSelectorRenderers";

const V2AreaFill = ({ width }: NativeStoryProps) => (
  <ChartSection title="Price history" kicker="Area chart">
    <AreaChart
      data={priceHistory}
      xKey="date"
      yKey="price"
      width={width}
      height={230}
      curve="monotone"
      areaFill={{ fromOpacity: 0.32, toOpacity: 0.05 }}
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

const V2ScrollableStockComparison = ({ width }: NativeStoryProps) => (
  <ChartSection title="MSFT vs GOOG" kicker="Scrollable">
    <LineChart
      data={msftVsGoogHistory}
      xKey="date"
      width={width}
      height={262}
      scrollable
      visiblePoints={16}
      initialIndex="end"
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
      dots={{ radius: 3.5, strokeWidth: 1.75 }}
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

const rangeSelectorXValues = portfolioRangeHistory.map((point) => point.date);

const getInitialRangeSelectorViewport = (): LineChartViewportConfig =>
  resolveChartViewportPresetWindow({
    preset: "1M",
    xValues: rangeSelectorXValues
  });

const getZoomPanInitialViewport = (): LineChartViewportConfig =>
  resolveChartViewportWindow({
    itemCount: portfolioRangeHistory.length,
    initialIndex: "end",
    visiblePoints: 18
  });

const toViewportConfig = (
  window: ResolvedChartViewportWindow
): LineChartViewportConfig => ({
  startIndex: window.startIndex,
  endIndex: window.endIndex
});

const resolveCurrentViewportWindow = (viewport: LineChartViewportConfig) =>
  resolveChartViewportWindow({
    itemCount: portfolioRangeHistory.length,
    startIndex: viewport.startIndex,
    endIndex: viewport.endIndex,
    visiblePoints: viewport.visiblePoints,
    initialIndex: viewport.initialIndex
  });

const V2ViewportZoomPan = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => {
  const chartKitTheme = useChartKitTheme();
  const resolvedTheme = useMemo(
    () => resolveCartesianChartThemeConfig(chartKitTheme),
    [chartKitTheme]
  );
  const [viewport, setViewport] = useState<LineChartViewportConfig>(() =>
    getZoomPanInitialViewport()
  );
  const buttonStyle = useMemo(
    () => [
      zoomStyles.button,
      {
        backgroundColor: resolvedTheme.plotBackground,
        borderColor: resolvedTheme.grid
      }
    ],
    [resolvedTheme.grid, resolvedTheme.plotBackground]
  );
  const buttonTextStyle = useMemo(
    () => [zoomStyles.buttonText, { color: resolvedTheme.text }],
    [resolvedTheme.text]
  );
  const panViewport = useCallback((deltaPoints: number) => {
    setViewport((current) =>
      toViewportConfig(
        resolveChartViewportWindowFromPanDelta({
          currentWindow: resolveCurrentViewportWindow(current),
          deltaPoints,
          itemCount: portfolioRangeHistory.length
        })
      )
    );
  }, []);
  const zoomViewport = useCallback((zoomFactor: number) => {
    setViewport((current) =>
      toViewportConfig(
        resolveChartViewportWindowFromZoom({
          currentWindow: resolveCurrentViewportWindow(current),
          itemCount: portfolioRangeHistory.length,
          minVisibleCount: 6,
          zoomFactor
        })
      )
    );
  }, []);
  const handleViewportChange = useCallback(
    (event: LineChartViewportChangeEvent) => {
      setViewport(event.viewport);
    },
    []
  );

  return (
    <ChartSection title="Controlled viewport" kicker="Drag or pinch">
      <LineChart
        data={portfolioRangeHistory}
        xKey="date"
        width={width}
        height={248}
        onViewportChange={handleViewportChange}
        testID="viewport-pan-chart"
        viewport={viewport}
        viewportInteraction={{
          pan: true,
          pinchZoom: true,
          minVisiblePoints: 6,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart
        }}
        yAxisLabelWidth="stable"
        axisLabelAnimation={{ duration: 160 }}
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
        referenceLines={[
          {
            y: 900,
            label: "Goal",
            strokeDasharray: [5, 5],
            opacity: 0.78
          }
        ]}
        series={[
          { yKey: "portfolio", label: "Portfolio", strokeWidth: 3 },
          {
            yKey: "benchmark",
            label: "Benchmark",
            strokeDasharray: [4, 4],
            strokeWidth: 2
          }
        ]}
      />
      <View style={zoomStyles.controls}>
        <Pressable style={buttonStyle} onPress={() => panViewport(-4)}>
          <Text style={buttonTextStyle}>Prev</Text>
        </Pressable>
        <Pressable style={buttonStyle} onPress={() => zoomViewport(0.72)}>
          <Text style={buttonTextStyle}>Zoom out</Text>
        </Pressable>
        <Pressable style={buttonStyle} onPress={() => zoomViewport(1.4)}>
          <Text style={buttonTextStyle}>Zoom in</Text>
        </Pressable>
        <Pressable style={buttonStyle} onPress={() => panViewport(4)}>
          <Text style={buttonTextStyle}>Next</Text>
        </Pressable>
      </View>
    </ChartSection>
  );
};

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
        yAxisLabelWidth="stable"
        axisLabelAnimation={{ duration: 180 }}
        interaction={{
          mode: "scrub",
          selectionPersistence: "persist",
          deselectOnOutsidePress: true,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart
        }}
        crosshair={{ strokeDasharray: [4, 4] }}
        tooltip={{ positionAnimationDuration: 260, width: 168 }}
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
          renderLine: createRangeSelectorLineRenderer(),
          renderHandle: createRangeSelectorHandleRenderer({
            handleGripColor: rangeSelectorPalette.handleGripColor
          })
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

export const lineViewportStories: ShowcaseStory[] = [
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
    title: "Scrollable",
    Component: V2ScrollableStockComparison
  },
  {
    id: "v2-viewport-zoom-pan",
    title: "Zoom and Pan",
    Component: V2ViewportZoomPan
  },
  {
    id: "v2-range-selector",
    title: "Portfolio Range",
    Component: V2RangeSelectorOverview
  }
];

const zoomStyles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 10
  },
  button: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 32,
    paddingHorizontal: 10
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "800"
  }
});
