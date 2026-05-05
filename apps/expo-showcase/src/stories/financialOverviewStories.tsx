import { CandlestickChart } from "@chart-kit/react-native-v2";

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
      lowKey="low"
      openKey="open"
      testID="stock-candlestick-chart"
      upColor="#16a34a"
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
