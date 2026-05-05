import { useCallback, useState } from "react";

import { CandlestickChart } from "@chart-kit/react-native";
import type { CandlestickChartViewportConfig } from "@chart-kit/react-native";

import { stockCandles } from "../fixtures/v2Finance";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const formatPrice = (value: number) => `$${Math.round(value)}`;
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
        formatYLabel={formatPrice}
        height={278}
        highKey="high"
        interaction="tap"
        lowKey="low"
        openKey="open"
        defaultSelectedIndex={stockCandles.length - 2}
        onViewportChange={handleViewportChange}
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

export const financialOverviewStories = [
  {
    id: "v2-candlestick-price-action",
    title: "Candlestick",
    Component: V2CandlestickPriceAction
  }
];
