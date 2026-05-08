import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  resolveCartesianChartThemeConfig,
  useChartKitTheme
} from "@chart-kit/react-native";
import { CandlestickChart } from "@chart-kit/react-native/pro-preview";
import type { CandlestickChartViewportConfig } from "@chart-kit/react-native/pro-preview";

import {
  getStockCandlesForInterval,
  stockCandles,
  type StockCandlePoint
} from "../fixtures/v2Finance";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const weeklyCandles = getStockCandlesForInterval(stockCandles, "1W");
const initialVisibleWeeks = 28;
const minVisibleWeeks = 8;
const initialSelectedIndex = Math.max(0, weeklyCandles.length - 2);
const upColor = "#16a34a";
const downColor = "#ef4444";

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
  candle
}: {
  candle: StockCandlePoint | undefined;
}) => {
  const chartKitTheme = useChartKitTheme();
  const resolvedTheme = useMemo(
    () => resolveCartesianChartThemeConfig(chartKitTheme),
    [chartKitTheme]
  );

  if (!candle) {
    return null;
  }

  const move = getCandleMove(candle);
  const isPositive = move.value >= 0;
  const moveColor = isPositive ? upColor : downColor;
  const moveSign = isPositive ? "+" : "-";
  const moveLabel = `${moveSign}${formatPrice(
    Math.abs(move.value)
  )} (${moveSign}${Math.round(Math.abs(move.percent) * 1000) / 10}%)`;
  const metrics = [
    { label: "Open", value: formatPrice(candle.open) },
    { label: "High", value: formatPrice(candle.high) },
    { label: "Low", value: formatPrice(candle.low) },
    { label: "Close", value: formatPrice(candle.close) },
    { label: "Volume", value: formatVolume(candle.volume) }
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
            AAPL weekly selection
          </Text>
          <Text style={[styles.selectedDate, { color: resolvedTheme.text }]}>
            Week of {formatTradingWeek(candle.day)}
          </Text>
        </View>
        <View
          style={[
            styles.movePill,
            { borderColor: moveColor, backgroundColor: "transparent" }
          ]}
        >
          <Text style={[styles.moveText, { color: moveColor }]}>
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
          pinchZoom: true,
          smoothPan: true
        }}
        volumeKey="volume"
        width={width}
        xKey="day"
        yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
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
