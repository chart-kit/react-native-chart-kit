import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  resolveCartesianChartThemeConfig,
  useChartKitTheme
} from "@chart-kit/react-native";
import { CandlestickChart } from "@chart-kit/react-native/pro-preview";
import type { CandlestickChartViewportConfig } from "@chart-kit/react-native/pro-preview";

import {
  getStockCandlePriceDomain,
  getStockCandlesForInterval,
  stockCandles,
  type StockCandlePoint
} from "../fixtures/v2Finance";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const weeklyCandles = getStockCandlesForInterval(stockCandles, "1W");
const weeklyYDomain = getStockCandlePriceDomain(weeklyCandles);
const initialVisibleWeeks = 28;
const minVisibleWeeks = 8;
const initialSelectedIndex = Math.max(0, weeklyCandles.length - 2);
const upColor = "#16a34a";
const downColor = "#ef4444";
const notAvailableLabel = "n/a";

const formatPrice = (value: number) => `$${Math.round(value)}`;

const formatTradingWeek = (value: unknown) => {
  if (typeof value !== "string") {
    return `${value}`;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
};

const formatVolume = (value: number) => `${Math.round(value)}k`;

const getInitialViewport = (): CandlestickChartViewportConfig => ({
  endIndex: Math.max(0, weeklyCandles.length - 1),
  startIndex: Math.max(0, weeklyCandles.length - initialVisibleWeeks)
});

const getCandleMove = (candle: StockCandlePoint) => {
  const value = candle.close - candle.open;
  const percent = candle.open === 0 ? 0 : value / candle.open;

  return { percent, value };
};

const SelectedWeekLegend = ({
  candle,
  eyebrow = "AAPL weekly selection"
}: {
  candle: StockCandlePoint | undefined;
  eyebrow?: string;
}) => {
  const chartKitTheme = useChartKitTheme();
  const resolvedTheme = useMemo(
    () => resolveCartesianChartThemeConfig(chartKitTheme),
    [chartKitTheme]
  );

  const move = candle ? getCandleMove(candle) : undefined;
  const isPositive = (move?.value ?? 0) >= 0;
  const moveColor = move ? (isPositive ? upColor : downColor) : undefined;
  const moveSign = isPositive ? "+" : "-";
  const moveLabel = move
    ? `${moveSign}${formatPrice(Math.abs(move.value))} (${moveSign}${
        Math.round(Math.abs(move.percent) * 1000) / 10
      }%)`
    : notAvailableLabel;
  const metrics = [
    {
      label: "Open",
      value: candle ? formatPrice(candle.open) : notAvailableLabel
    },
    {
      label: "High",
      value: candle ? formatPrice(candle.high) : notAvailableLabel
    },
    {
      label: "Low",
      value: candle ? formatPrice(candle.low) : notAvailableLabel
    },
    {
      label: "Close",
      value: candle ? formatPrice(candle.close) : notAvailableLabel
    },
    {
      label: "Volume",
      value: candle ? formatVolume(candle.volume) : notAvailableLabel
    }
  ];

  return (
    <View
      style={[
        styles.legendPanel,
        {
          backgroundColor: resolvedTheme.plotBackground,
          borderColor: resolvedTheme.grid
        }
      ]}
    >
      <View style={styles.legendHeader}>
        <View>
          <Text style={[styles.eyebrow, { color: resolvedTheme.mutedText }]}>
            {eyebrow}
          </Text>
          <Text style={[styles.selectedDate, { color: resolvedTheme.text }]}>
            {candle
              ? `Week of ${formatTradingWeek(candle.day)}`
              : notAvailableLabel}
          </Text>
        </View>
        <View
          style={[
            styles.movePill,
            {
              backgroundColor: "transparent",
              borderColor: moveColor ?? resolvedTheme.grid
            }
          ]}
        >
          <Text
            style={[
              styles.moveText,
              { color: moveColor ?? resolvedTheme.mutedText }
            ]}
          >
            {moveLabel}
          </Text>
        </View>
      </View>
      <View style={styles.metrics}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricItem}>
            <Text
              style={[styles.metricLabel, { color: resolvedTheme.mutedText }]}
            >
              {metric.label}
            </Text>
            <Text style={[styles.metricValue, { color: resolvedTheme.text }]}>
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const V2CandlestickCrosshairInspector = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [viewport, setViewport] =
    useState<CandlestickChartViewportConfig>(getInitialViewport);
  const selectedCandle =
    selectedIndex === undefined ? undefined : weeklyCandles[selectedIndex];
  const handleViewportChange = useCallback(
    (event: { viewport: CandlestickChartViewportConfig }) => {
      setViewport(event.viewport);
    },
    []
  );
  const handleDeselect = useCallback(() => {
    setSelectedIndex(undefined);
  }, []);

  return (
    <ChartSection title="Crosshair inspector" kicker="Inspection mode">
      <SelectedWeekLegend candle={selectedCandle} eyebrow="AAPL inspector" />
      <CandlestickChart
        candleWidthRatio={0.52}
        closeKey="close"
        data={weeklyCandles}
        downColor={downColor}
        formatXLabel={formatTradingWeek}
        formatYLabel={formatPrice}
        height={286}
        highKey="high"
        interaction={{
          activation: "longPress",
          deselectOnOutsidePress: true,
          longPressDelayMs: 720,
          longPressMoveTolerance: 12,
          mode: "crosshair",
          onDeselect: handleDeselect,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart,
          onSelect: (event) => setSelectedIndex(event.dataIndex)
        }}
        lowKey="low"
        openKey="open"
        onViewportChange={handleViewportChange}
        rangeSelector={{
          gap: 9,
          height: 66,
          interactive: selectedIndex === undefined,
          minVisiblePoints: minVisibleWeeks,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart
        }}
        selectedIndex={selectedIndex}
        selectionPriceLabel={false}
        sessionGaps={false}
        testID="crosshair-inspector-candlestick-chart"
        tooltip={false}
        upColor={upColor}
        viewport={viewport}
        viewportInteraction={{
          minVisiblePoints: minVisibleWeeks,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart,
          pan: true,
          pinchZoom: true
        }}
        volumeKey="volume"
        width={width}
        xKey="day"
        yDomain={weeklyYDomain}
      />
    </ChartSection>
  );
};

export const V2CandlestickLegendInspector = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [viewport, setViewport] =
    useState<CandlestickChartViewportConfig>(getInitialViewport);
  const selectedCandle = weeklyCandles[selectedIndex];
  const handleViewportChange = useCallback(
    (event: { viewport: CandlestickChartViewportConfig }) => {
      setViewport(event.viewport);
    },
    []
  );

  return (
    <ChartSection title="Market inspector" kicker="Top legend selection">
      <SelectedWeekLegend candle={selectedCandle} />
      <CandlestickChart
        candleWidthRatio={0.46}
        closeKey="close"
        data={weeklyCandles}
        downColor={downColor}
        formatXLabel={formatTradingWeek}
        formatYLabel={formatPrice}
        height={312}
        highKey="high"
        interaction={{
          mode: "tap",
          onSelect: (event) => setSelectedIndex(event.dataIndex)
        }}
        lowKey="low"
        onViewportChange={handleViewportChange}
        openKey="open"
        selectedIndex={selectedIndex}
        selectionPriceLabel={false}
        sessionGaps={false}
        testID="legend-inspector-candlestick-chart"
        tooltip={false}
        upColor={upColor}
        viewport={viewport}
        viewportInteraction={{
          maxVisiblePoints: initialVisibleWeeks,
          minVisiblePoints: minVisibleWeeks,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart,
          pan: true,
          pinchZoom: true
        }}
        volumeKey="volume"
        width={width}
        xKey="day"
        yDomain={weeklyYDomain}
      />
    </ChartSection>
  );
};

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  legendHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  legendPanel: {
    alignSelf: "stretch",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12
  },
  metricItem: {
    gap: 3,
    minWidth: 58
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700"
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "800"
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12
  },
  movePill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  moveText: {
    fontSize: 12,
    fontWeight: "800"
  },
  selectedDate: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2
  }
});
