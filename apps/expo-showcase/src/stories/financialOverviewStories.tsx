import { useCallback, useState } from "react";

import {
  CandlestickChart,
  getCandlestickEmergencyClosureSessions
} from "@chart-kit/react-native";
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
        sessionGaps={{ exchange: "nyse", label: true }}
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
      sessionGaps={{ exchange: "nyse" }}
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

const V2CandlestickSessionEvents = ({ width }: NativeStoryProps) => (
  <ChartSection title="Market sessions" kicker="Candlestick">
    <CandlestickChart
      closeKey="close"
      data={sessionEventCandles}
      downColor="#ef4444"
      formatXLabel={formatTradingDay}
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
    Component: V2CandlestickPriceAction
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
