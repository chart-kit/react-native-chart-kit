import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  CandlestickChart,
  CandlestickPriceScale,
  getCandlestickPriceScaleDomain
} from "@chart-kit/react-native/pro-preview";
import type { CandlestickChartViewportConfig } from "@chart-kit/react-native/pro-preview";

import {
  getStockCandlePriceDomain,
  getStockCandlesForInterval,
  stockCandles
} from "../fixtures/v2Finance";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const weeklyCandles = getStockCandlesForInterval(stockCandles, "1W");
const initialVisibleWeeks = 28;
const minVisibleWeeks = 8;
const priceScaleHeight = 292;
const rangeSelectorGap = 9;
const rangeSelectorHeight = 72;
const priceScaleWidth = 46;
const formatPrice = (value: number) => `$${Math.round(value)}`;

const getInitialViewport = (): CandlestickChartViewportConfig => ({
  endIndex: Math.max(0, weeklyCandles.length - 1),
  startIndex: Math.max(0, weeklyCandles.length - initialVisibleWeeks)
});

const getVisibleCandles = (viewport: CandlestickChartViewportConfig) =>
  weeklyCandles.slice(
    Math.max(0, viewport.startIndex ?? 0),
    Math.min(weeklyCandles.length, (viewport.endIndex ?? 0) + 1)
  );

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
  const [viewport, setViewport] =
    useState<CandlestickChartViewportConfig>(getInitialViewport);
  const visibleCandles = useMemo(() => getVisibleCandles(viewport), [viewport]);
  const baseDomain = useMemo(
    () => getStockCandlePriceDomain(visibleCandles, 0.42),
    [visibleCandles]
  );
  const yDomain = useMemo(
    () =>
      getCandlestickPriceScaleDomain({
        baseDomain,
        scale: priceScale
      }),
    [baseDomain, priceScale]
  );
  const chartWidth = Math.max(220, width - priceScaleWidth - 2);

  return (
    <ChartSection title="Price scale" kicker="Candlestick">
      <View style={styles.row}>
        <CandlestickPriceScale
          baseDomain={baseDomain}
          formatLabel={formatPrice}
          height={priceScaleHeight}
          onGestureEnd={onScrubEnd}
          onGestureStart={onScrubStart}
          onScaleChange={(event) => setPriceScale(event.scale)}
          scale={priceScale}
          testID="price-scale-axis"
          width={priceScaleWidth}
        />
        <CandlestickChart
          candleWidthRatio={0.48}
          closeKey="close"
          data={weeklyCandles}
          downColor="#ef4444"
          formatXLabel={formatTradingWeek}
          formatYLabel={formatPrice}
          height={priceScaleHeight + rangeSelectorGap + rangeSelectorHeight}
          highKey="high"
          interaction="tap"
          lowKey="low"
          onViewportChange={(event) => setViewport(event.viewport)}
          openKey="open"
          rangeSelector={{
            gap: rangeSelectorGap,
            height: rangeSelectorHeight,
            interactive: true,
            minVisiblePoints: minVisibleWeeks,
            onGestureEnd: onScrubEnd,
            onGestureStart: onScrubStart
          }}
          sessionGaps={false}
          showYAxisLabels={false}
          testID="price-scale-candlestick-chart"
          tooltip={false}
          upColor="#16a34a"
          viewport={viewport}
          viewportInteraction={{
            minVisiblePoints: minVisibleWeeks,
            onGestureEnd: onScrubEnd,
            onGestureStart: onScrubStart,
            pan: true,
            pinchZoom: true
          }}
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
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 2
  }
});
