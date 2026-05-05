import { useCallback, useState } from "react";

import { CandlestickChart } from "@chart-kit/react-native";
import type { CandlestickChartViewportConfig } from "@chart-kit/react-native";

import { stockCandles } from "../fixtures/v2Finance";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const formatPrice = (value: number) => `$${Math.round(value)}`;
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
const formatTradingDay = (value: unknown) => {
  if (typeof value !== "string") {
    return `${value}`;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`;
};
const getInitialCandlestickViewport = (): CandlestickChartViewportConfig => ({
  visiblePoints: 6,
  initialIndex: "end"
});

const V2CandlestickPriceAction = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => {
  const [viewport, setViewport] = useState<CandlestickChartViewportConfig>(() =>
    getInitialCandlestickViewport()
  );
  const handleViewportChange = useCallback(
    (event: { viewport: CandlestickChartViewportConfig }) => {
      setViewport(event.viewport);
    },
    []
  );

  return (
    <ChartSection title="Price action" kicker="Candlestick">
      <CandlestickChart
        closeKey="close"
        data={stockCandles}
        downColor="#ef4444"
        formatXLabel={formatTradingDay}
        formatYLabel={formatPrice}
        height={336}
        highKey="high"
        interaction="tap"
        lowKey="low"
        openKey="open"
        defaultSelectedIndex={stockCandles.length - 2}
        onViewportChange={handleViewportChange}
        rangeSelector={{
          height: 62,
          gap: 9,
          interactive: true,
          minVisiblePoints: 4,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart
        }}
        sessionGaps={{ label: true }}
        testID="stock-candlestick-chart"
        tooltip={{ width: 154 }}
        upColor="#16a34a"
        viewport={viewport}
        viewportInteraction={{
          pan: true,
          pinchZoom: true,
          minVisiblePoints: 4,
          onGestureEnd: onScrubEnd,
          onGestureStart: onScrubStart
        }}
        volumeKey="volume"
        width={width}
        xKey="day"
        yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
      />
    </ChartSection>
  );
};

const V2CandlestickScrollable = ({ width }: NativeStoryProps) => (
  <ChartSection title="Scrollable candles" kicker="Candlestick">
    <CandlestickChart
      closeKey="close"
      data={stockCandles}
      downColor="#ef4444"
      formatXLabel={formatTradingDay}
      formatYLabel={formatPrice}
      height={278}
      highKey="high"
      initialIndex="end"
      interaction="tap"
      lowKey="low"
      openKey="open"
      scrollable
      sessionGaps
      testID="scrollable-candlestick-chart"
      tooltip={{ width: 154 }}
      upColor="#16a34a"
      visiblePoints={5}
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
    Component: V2CandlestickPriceAction
  },
  {
    id: "v2-candlestick-scrollable",
    title: "Scrollable Candles",
    Component: V2CandlestickScrollable
  }
];
