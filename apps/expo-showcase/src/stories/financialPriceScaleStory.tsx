/* eslint-disable react-hooks/refs -- RNGH gesture callbacks store the starting scale in refs and read them when the native gesture runs. */
import { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import {
  resolveCartesianChartThemeConfig,
  useChartKitTheme
} from "@chart-kit/react-native";
import { CandlestickChart } from "@chart-kit/react-native/pro-preview";

import {
  getStockCandlePriceDomain,
  getStockCandlesForInterval,
  stockCandles
} from "../fixtures/v2Finance";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const weeklyCandles = getStockCandlesForInterval(stockCandles, "1W");
const visibleWeeks = weeklyCandles.slice(-28);
const basePriceDomain = getStockCandlePriceDomain(visibleWeeks, 0.42);
const scaleMin = 0.72;
const scaleMax = 2.1;
const priceScaleWidth = 62;
const formatPrice = (value: number) => `$${Math.round(value)}`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getScaledDomain = (scale: number): [number, number] => {
  const [min, max] = basePriceDomain;
  const center = (min + max) / 2;
  const span = (max - min) / scale;

  return [center - span / 2, center + span / 2];
};

const getPriceTicks = (domain: [number, number], count = 6) => {
  const [min, max] = domain;
  const steps = Math.max(1, count - 1);

  return Array.from({ length: count }, (_, index) => {
    const ratio = index / steps;

    return max - (max - min) * ratio;
  });
};

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

export const V2CandlestickPriceScale = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => {
  const [priceScale, setPriceScale] = useState(1);
  const startScaleRef = useRef(priceScale);
  const chartKitTheme = useChartKitTheme();
  const resolvedTheme = useMemo(
    () => resolveCartesianChartThemeConfig(chartKitTheme),
    [chartKitTheme]
  );
  const yDomain = useMemo(() => getScaledDomain(priceScale), [priceScale]);
  const priceTicks = useMemo(() => getPriceTicks(yDomain), [yDomain]);
  const chartWidth = Math.max(220, width - priceScaleWidth - 8);
  const scaleGesture = useMemo(
    () =>
      Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .activeOffsetY([-4, 4])
        .runOnJS(true)
        .onStart(() => {
          startScaleRef.current = priceScale;
          onScrubStart?.();
        })
        .onUpdate((event) => {
          const nextScale = clamp(
            startScaleRef.current * Math.exp(-event.translationY / 190),
            scaleMin,
            scaleMax
          );

          setPriceScale(nextScale);
        })
        .onEnd(() => onScrubEnd?.())
        .onFinalize(() => onScrubEnd?.()),
    [onScrubEnd, onScrubStart, priceScale]
  );

  return (
    <ChartSection title="Price scale" kicker="Candlestick">
      <View style={styles.row}>
        <GestureDetector gesture={scaleGesture}>
          <View
            accessibilityLabel="Drag the price scale up or down"
            accessibilityRole="adjustable"
            style={[
              styles.priceScale,
              {
                backgroundColor: resolvedTheme.plotBackground,
                borderColor: resolvedTheme.grid
              }
            ]}
          >
            <Text style={[styles.scaleValue, { color: resolvedTheme.text }]}>
              {priceScale.toFixed(2)}x
            </Text>
            <View style={styles.tickStack}>
              {priceTicks.map((tick) => (
                <Text
                  key={tick}
                  style={[styles.priceTick, { color: resolvedTheme.mutedText }]}
                >
                  {formatPrice(tick)}
                </Text>
              ))}
            </View>
          </View>
        </GestureDetector>
        <CandlestickChart
          candleWidthRatio={0.48}
          closeKey="close"
          data={visibleWeeks}
          downColor="#ef4444"
          formatXLabel={formatTradingWeek}
          formatYLabel={formatPrice}
          height={292}
          highKey="high"
          interaction="tap"
          lowKey="low"
          openKey="open"
          rangeSelector={false}
          sessionGaps={false}
          showYAxisLabels={false}
          testID="price-scale-candlestick-chart"
          tooltip={false}
          upColor="#16a34a"
          volumeKey="volume"
          width={chartWidth}
          xKey="day"
          yDomain={yDomain}
        />
      </View>
    </ChartSection>
  );
};

const styles = StyleSheet.create({
  priceScale: {
    alignItems: "stretch",
    borderRadius: 8,
    borderWidth: 1,
    height: 292,
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
    width: priceScaleWidth
  },
  priceTick: {
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
    textAlign: "right"
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  scaleValue: {
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right"
  },
  tickStack: {
    flex: 1,
    justifyContent: "space-between",
    marginTop: 12
  }
});
