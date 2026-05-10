import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  eyebrow = "AAPL weekly selection",
  placeholder = "Drag to inspect"
}: {
  candle: StockCandlePoint | undefined;
  eyebrow?: string;
  placeholder?: string;
}) => {
  const chartKitTheme = useChartKitTheme();
  const resolvedTheme = useMemo(
    () => resolveCartesianChartThemeConfig(chartKitTheme),
    [chartKitTheme]
  );

  const move = candle ? getCandleMove(candle) : undefined;
  const isPositive = (move?.value ?? 0) >= 0;
  const moveColor = isPositive ? upColor : downColor;
  const moveSign = isPositive ? "+" : "-";
  const moveLabel = `${moveSign}${formatPrice(
    Math.abs(move?.value ?? 0)
  )} (${moveSign}${Math.round(Math.abs(move?.percent ?? 0) * 1000) / 10}%)`;
  const metrics = candle
    ? [
        { label: "Open", value: formatPrice(candle.open) },
        { label: "High", value: formatPrice(candle.high) },
        { label: "Low", value: formatPrice(candle.low) },
        { label: "Close", value: formatPrice(candle.close) },
        { label: "Volume", value: formatVolume(candle.volume) }
      ]
    : [];

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
            {candle ? `Week of ${formatTradingWeek(candle.day)}` : placeholder}
          </Text>
        </View>
        {candle ? (
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
        ) : null}
      </View>
      {metrics.length > 0 ? (
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
      ) : null}
    </View>
  );
};

const InspectorModeControl = ({
  inspectMode,
  onInspectModeChange
}: {
  inspectMode: boolean;
  onInspectModeChange: (value: boolean) => void;
}) => {
  const chartKitTheme = useChartKitTheme();
  const resolvedTheme = useMemo(
    () => resolveCartesianChartThemeConfig(chartKitTheme),
    [chartKitTheme]
  );
  const items = [
    { label: "Move", value: false },
    { label: "Inspect", value: true }
  ];

  return (
    <View
      style={[
        styles.modeControl,
        {
          backgroundColor: resolvedTheme.plotBackground,
          borderColor: resolvedTheme.grid
        }
      ]}
    >
      {items.map((item) => {
        const isSelected = inspectMode === item.value;

        return (
          <Pressable
            accessibilityRole="button"
            key={item.label}
            onPress={() => onInspectModeChange(item.value)}
            style={[
              styles.modeButton,
              isSelected
                ? { backgroundColor: resolvedTheme.text }
                : { backgroundColor: "transparent" }
            ]}
          >
            <Text
              style={[
                styles.modeButtonText,
                {
                  color: isSelected
                    ? resolvedTheme.background
                    : resolvedTheme.mutedText
                }
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const V2CandlestickCrosshairInspector = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => {
  const [inspectMode, setInspectMode] = useState(true);
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
  const handleInspectModeChange = useCallback((value: boolean) => {
    setInspectMode(value);

    if (!value) {
      setSelectedIndex(undefined);
    }
  }, []);
  const handleDeselect = useCallback(() => {
    setSelectedIndex(undefined);
    setInspectMode(false);
  }, []);

  return (
    <ChartSection title="Crosshair inspector" kicker="Inspection mode">
      <SelectedWeekLegend
        candle={selectedCandle}
        eyebrow={inspectMode ? "AAPL inspect mode" : "AAPL move mode"}
        placeholder={inspectMode ? "Drag to inspect" : "Pan or pinch to zoom"}
      />
      <InspectorModeControl
        inspectMode={inspectMode}
        onInspectModeChange={handleInspectModeChange}
      />
      <CandlestickChart
        candleWidthRatio={0.52}
        closeKey="close"
        data={weeklyCandles}
        downColor={downColor}
        formatXLabel={formatTradingWeek}
        formatYLabel={formatPrice}
        height={286}
        highKey="high"
        interaction={
          inspectMode
            ? {
                deselectOnOutsidePress: true,
                mode: "crosshair",
                onDeselect: handleDeselect,
                onGestureEnd: onScrubEnd,
                onGestureStart: onScrubStart,
                onSelect: (event) => setSelectedIndex(event.dataIndex)
              }
            : "none"
        }
        lowKey="low"
        openKey="open"
        onViewportChange={handleViewportChange}
        rangeSelector={{
          gap: 9,
          height: 66,
          interactive: !inspectMode,
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
        viewportInteraction={
          inspectMode
            ? false
            : {
                minVisiblePoints: minVisibleWeeks,
                onGestureEnd: onScrubEnd,
                onGestureStart: onScrubStart,
                pan: true,
                pinchZoom: true
              }
        }
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
  modeButton: {
    alignItems: "center",
    borderRadius: 7,
    minWidth: 74,
    paddingHorizontal: 13,
    paddingVertical: 8
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: "800"
  },
  modeControl: {
    alignSelf: "flex-start",
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: "row",
    gap: 2,
    marginBottom: 10,
    padding: 2
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
