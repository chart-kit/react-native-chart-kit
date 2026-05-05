import { CandlestickChart } from "@chart-kit/react-native";

import { stockCandles } from "../fixtures/v2Finance";
import { ChartSection, type NativeStoryProps } from "./storyPrimitives";

const formatPrice = (value: number) => `$${Math.round(value)}`;

const V2CandlestickPriceAction = ({ width }: NativeStoryProps) => (
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
      testID="stock-candlestick-chart"
      tooltip={{ width: 154 }}
      upColor="#16a34a"
      viewport={{ visiblePoints: 6, initialIndex: "end" }}
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
  }
];
