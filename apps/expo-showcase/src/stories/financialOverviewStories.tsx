import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useChartKitTheme } from "@chart-kit/react-native";
import {
  CandlestickChart,
  getCandlestickChartDataTable,
  getCandlestickEmergencyClosureSessions
} from "@chart-kit/react-native/pro-preview";
import type { CandlestickChartViewportConfig } from "@chart-kit/react-native/pro-preview";

import {
  getStockCandlePriceDomain,
  getStockCandlesForInterval,
  stockCandles,
  type StockCandleInterval
} from "../fixtures/v2Finance";
import { V2CandlestickLegendInspector } from "./financialInspectorStory";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";
import { ChartDataDetails } from "./dataDetails";

const formatPrice = (value: number) => `$${Math.round(value)}`;
const intervalLabels: Array<{ label: string; value: StockCandleInterval }> = [
  { label: "1 Day", value: "1D" },
  { label: "1 Week", value: "1W" },
  { label: "1 Month", value: "1M" }
];
const intervalVisiblePoints: Record<StockCandleInterval, number> = {
  "1D": 72,
  "1M": 12,
  "1W": 28
};
const intervalMinimumVisiblePoints: Record<StockCandleInterval, number> = {
  "1D": 18,
  "1M": 4,
  "1W": 8
};
const intervalCandleWidthRatio: Record<StockCandleInterval, number> = {
  "1D": 0.36,
  "1M": 0.58,
  "1W": 0.46
};
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
const formatTradingDay = (
  value: unknown,
  interval: StockCandleInterval = "1D"
) => {
  if (typeof value !== "string") {
    return `${value}`;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  const month = monthNames[date.getUTCMonth()];

  if (interval === "1M") {
    return `${month} '${`${date.getUTCFullYear()}`.slice(2)}`;
  }

  return `${month} ${date.getUTCDate()}`;
};
const getInitialCandlestickViewport = (
  pointCount: number,
  interval: StockCandleInterval
): CandlestickChartViewportConfig => {
  const visiblePoints = Math.min(pointCount, intervalVisiblePoints[interval]);

  return {
    endIndex: Math.max(0, pointCount - 1),
    startIndex: Math.max(0, pointCount - visiblePoints)
  };
};
const CandleIntervalControl = ({
  onChange,
  value
}: {
  onChange: (value: StockCandleInterval) => void;
  value: StockCandleInterval;
}) => {
  const { mode } = useChartKitTheme();
  const isDark = mode === "dark";

  return (
    <View style={styles.intervalControls}>
      {intervalLabels.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.intervalButton,
              isDark && styles.darkIntervalButton,
              isSelected && styles.activeIntervalButton,
              isDark && isSelected && styles.darkActiveIntervalButton
            ]}
          >
            <Text
              style={[
                styles.intervalButtonText,
                isDark && styles.darkIntervalButtonText,
                isSelected && styles.activeIntervalButtonText,
                isDark && isSelected && styles.darkActiveIntervalButtonText
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
const sessionEventCandles = [
  { day: "2026-11-25", open: 212, high: 219, low: 208, close: 216, volume: 86 },
  { day: "2026-11-27", open: 216, high: 224, low: 213, close: 222, volume: 58 },
  { day: "2026-11-30", open: 222, high: 225, low: 214, close: 217, volume: 94 },
  {
    day: "2026-12-01",
    open: 217,
    high: 229,
    low: 216,
    close: 227,
    volume: 104
  },
  { day: "2026-12-02", open: 227, high: 231, low: 220, close: 224, volume: 98 }
];
const sessionEventClosures = getCandlestickEmergencyClosureSessions([
  { date: "2026-11-26", reason: "Closed" }
]);
const priceActionTable = getCandlestickChartDataTable({
  closeKey: "close",
  data: stockCandles,
  formatXLabel: (value) => formatTradingDay(value),
  formatYLabel: formatPrice,
  highKey: "high",
  lowKey: "low",
  openKey: "open",
  xKey: "day"
});
const priceActionDetails = {
  columns: [
    { key: "day", label: "Day" },
    { key: "open", label: "Open" },
    { key: "high", label: "High" },
    { key: "low", label: "Low" },
    { key: "close", label: "Close" }
  ],
  rows: priceActionTable.rows.slice(-8).map((row) => ({
    key: `${row.index}`,
    values: [
      row.xLabel,
      row.formattedOpen,
      row.formattedHigh,
      row.formattedLow,
      row.formattedClose
    ]
  }))
};

const V2CandlestickPriceAction = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => {
  const [candleInterval, setCandleInterval] =
    useState<StockCandleInterval>("1D");
  const candleData = useMemo(
    () => getStockCandlesForInterval(stockCandles, candleInterval),
    [candleInterval]
  );
  const candleYDomain = useMemo(
    () => getStockCandlePriceDomain(candleData),
    [candleData]
  );
  const [viewport, setViewport] = useState<CandlestickChartViewportConfig>(() =>
    getInitialCandlestickViewport(stockCandles.length, "1D")
  );
  const handleViewportChange = useCallback(
    (event: { viewport: CandlestickChartViewportConfig }) => {
      setViewport(event.viewport);
    },
    []
  );
  const handleCandleIntervalChange = useCallback(
    (nextInterval: StockCandleInterval) => {
      const nextData = getStockCandlesForInterval(stockCandles, nextInterval);

      setCandleInterval(nextInterval);
      setViewport(getInitialCandlestickViewport(nextData.length, nextInterval));
    },
    []
  );

  return (
    <ChartSection title="One-year candles" kicker="Candlestick">
      <CandleIntervalControl
        value={candleInterval}
        onChange={handleCandleIntervalChange}
      />
      <CandlestickChart
        key={candleInterval}
        candleWidthRatio={intervalCandleWidthRatio[candleInterval]}
        closeKey="close"
        data={candleData}
        downColor="#ef4444"
        formatXLabel={(value) => formatTradingDay(value, candleInterval)}
        formatYLabel={formatPrice}
        height={336}
        highKey="high"
        interaction="tap"
        lowKey="low"
        openKey="open"
        defaultSelectedIndex={Math.max(0, candleData.length - 2)}
        onViewportChange={handleViewportChange}
        rangeSelector={{
          gap: 9,
          height: 72,
          interactive: true,
          minVisiblePoints: intervalMinimumVisiblePoints[candleInterval],
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart
        }}
        sessionGaps={false}
        testID="stock-candlestick-chart"
        tooltip={{ width: 154 }}
        upColor="#16a34a"
        viewport={viewport}
        viewportInteraction={{
          pan: true,
          pinchZoom: true,
          minVisiblePoints: intervalMinimumVisiblePoints[candleInterval],
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart
        }}
        volumeKey="volume"
        width={width}
        xKey="day"
        yDomain={candleYDomain}
      />
    </ChartSection>
  );
};

const V2CandlestickPriceActionDetails = () => (
  <ChartDataDetails title="Price action" {...priceActionDetails} />
);

const V2CandlestickScrollable = ({ width }: NativeStoryProps) => (
  <ChartSection title="Scrollable candles" kicker="Candlestick">
    <CandlestickChart
      closeKey="close"
      data={stockCandles}
      downColor="#ef4444"
      candleWidthRatio={0.4}
      formatXLabel={(value) => formatTradingDay(value)}
      formatYLabel={formatPrice}
      height={278}
      highKey="high"
      initialIndex="end"
      interaction="tap"
      lowKey="low"
      openKey="open"
      scrollable
      sessionGaps={{ exchange: "nyse" }}
      testID="scrollable-candlestick-chart"
      tooltip={{ width: 154 }}
      upColor="#16a34a"
      visiblePoints={48}
      volumeKey="volume"
      width={width}
      xKey="day"
      yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
    />
  </ChartSection>
);

const V2CandlestickSessionEvents = ({ width }: NativeStoryProps) => (
  <ChartSection title="Market sessions" kicker="Candlestick">
    <CandlestickChart
      closeKey="close"
      data={sessionEventCandles}
      downColor="#ef4444"
      formatXLabel={(value) => formatTradingDay(value)}
      formatYLabel={formatPrice}
      height={278}
      highKey="high"
      interaction="tap"
      lowKey="low"
      openKey="open"
      sessionGaps={{
        earlyCloses: true,
        exchange: "nyse",
        label: true,
        specialSessions: sessionEventClosures
      }}
      testID="session-events-candlestick-chart"
      tooltip={{ width: 154 }}
      upColor="#16a34a"
      volumeKey="volume"
      width={width}
      xKey="day"
      yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
    />
  </ChartSection>
);

export const financialOverviewStories = [
  {
    id: "v2-candlestick-price-action",
    title: "Candlestick",
    Component: V2CandlestickPriceAction,
    Details: V2CandlestickPriceActionDetails
  },
  {
    id: "v2-candlestick-legend-inspector",
    title: "Market Inspector",
    Component: V2CandlestickLegendInspector
  },
  {
    id: "v2-candlestick-scrollable",
    title: "Scrollable Candles",
    Component: V2CandlestickScrollable
  },
  {
    id: "v2-candlestick-session-events",
    title: "Market Sessions",
    Component: V2CandlestickSessionEvents
  }
];

const styles = StyleSheet.create({
  activeIntervalButton: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a"
  },
  activeIntervalButtonText: {
    color: "#ffffff"
  },
  darkActiveIntervalButton: {
    backgroundColor: "#f8fafc",
    borderColor: "#f8fafc"
  },
  darkActiveIntervalButtonText: {
    color: "#0f172a"
  },
  darkIntervalButton: {
    backgroundColor: "#111827",
    borderColor: "#334155"
  },
  darkIntervalButtonText: {
    color: "#cbd5e1"
  },
  intervalButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ef",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 32,
    paddingHorizontal: 12
  },
  intervalButtonText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800"
  },
  intervalControls: {
    alignSelf: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10
  }
});
