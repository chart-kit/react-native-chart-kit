import {
  BarChart,
  CandlestickChart,
  ChartKitProvider,
  CombinedChart,
  ContributionGraph,
  DonutChart,
  LineChart,
  ProgressRing,
  createChartPreset
} from "../src";

type PortfolioPoint = {
  date: string;
  portfolio: number;
  benchmark: number;
};

type AcquisitionPoint = {
  week: string;
  organic: number;
  paid: number;
};

type RevenuePoint = {
  month: string;
  margin: number;
  revenue: number;
};

type PlanPoint = {
  plan: string;
  revenue: number;
};

type UsageDay = {
  count: number;
  date: string;
};

type CandlePoint = {
  close: number;
  day: string;
  high: number;
  low: number;
  open: number;
};

const portfolioHistory: PortfolioPoint[] = [
  { date: "Jan 1", portfolio: 42_000, benchmark: 40_500 },
  { date: "Jan 2", portfolio: 44_200, benchmark: 41_000 },
  { date: "Jan 3", portfolio: 43_100, benchmark: 41_700 },
  { date: "Jan 4", portfolio: 48_400, benchmark: 42_200 }
];

const weeklyAcquisition: AcquisitionPoint[] = [
  { week: "W1", organic: 42, paid: 28 },
  { week: "W2", organic: 48, paid: 31 },
  { week: "W3", organic: 51, paid: 38 },
  { week: "W4", organic: 57, paid: 44 }
];

const monthlyRevenue: RevenuePoint[] = [
  { month: "Jan", revenue: 128, margin: 18 },
  { month: "Feb", revenue: 146, margin: 21 },
  { month: "Mar", revenue: 181, margin: 24 }
];

const plans: PlanPoint[] = [
  { plan: "Starter", revenue: 42_000 },
  { plan: "Business", revenue: 88_000 },
  { plan: "Enterprise", revenue: 132_000 }
];

const usageDays: UsageDay[] = [
  { date: "2026-04-27", count: 1 },
  { date: "2026-04-28", count: 4 },
  { date: "2026-04-29", count: 2 }
];

const candles: CandlePoint[] = [
  { day: "Jun 3", open: 184, high: 191, low: 181, close: 188 },
  { day: "Jun 4", open: 188, high: 194, low: 185, close: 187 },
  { day: "Jun 5", open: 187, high: 199, low: 186, close: 197 }
];

const viewport = { startIndex: 0, endIndex: 3 };
const brand = createChartPreset({
  light: {
    background: "#ffffff",
    grid: "#e5edf7",
    series: ["#155eef", "#12b76a"]
  }
});

export const docsExampleElements = [
  <ChartKitProvider
    key="provider"
    mode="system"
    preset="brand"
    presets={{ brand }}
  >
    <LineChart
      data={portfolioHistory}
      xKey="date"
      yKey="portfolio"
      width={360}
      height={240}
      preset="analytics"
    />
  </ChartKitProvider>,
  <LineChart
    key="portfolio"
    data={portfolioHistory}
    xKey="date"
    yKeys={["portfolio", "benchmark"]}
    curve="monotone"
    interaction={{
      mode: "scrub",
      selectionPersistence: "whileActive",
      onSelect: (event) => {
        void event.series[0]?.formattedValue;
      }
    }}
    tooltip={{ shared: true, positionAnimationDuration: 360 }}
    crosshair
    viewport={viewport}
    onViewportChange={() => undefined}
    viewportInteraction={{
      pan: true,
      pinchZoom: true,
      lockParentScroll: true
    }}
    rangeSelector={{
      visible: true,
      interactive: true,
      height: 72,
      handleWidth: 18
    }}
    yAxisLabelWidth="stable"
    formatYLabel={(value) => `$${Math.round(value / 1000)}k`}
    width={360}
    height={360}
  />,
  <BarChart
    key="acquisition"
    data={weeklyAcquisition}
    xKey="week"
    series={[
      { yKey: "organic", label: "Organic" },
      { yKey: "paid", label: "Paid" }
    ]}
    scrollable
    visiblePoints={3}
    initialIndex="end"
    interaction={{ mode: "tap", deselectOnOutsidePress: true }}
    tooltip={{ width: 132 }}
    selectionAnimation={{ duration: 220 }}
    width={360}
    height={280}
  />,
  <CombinedChart
    key="revenue"
    data={monthlyRevenue}
    xKey="month"
    bars={[{ yKey: "revenue", label: "Revenue", yAxisId: "left" }]}
    lines={[
      {
        yKey: "margin",
        label: "Margin",
        yAxisId: "right",
        curve: "monotone"
      }
    ]}
    formatLeftYLabel={(value) => `$${value}k`}
    formatRightYLabel={(value) => `${value}%`}
    interaction={{ mode: "tap" }}
    tooltip={{ shared: true }}
    width={360}
    height={280}
  />,
  <DonutChart
    key="donut"
    data={plans}
    valueKey="revenue"
    labelKey="plan"
    legend={{ maxItemWidth: "100%" }}
    centerLabel={({ total }) => `$${Math.round(total / 1000)}k`}
    activeSlice={{ inactiveOpacity: 0.36, strokeWidth: 4 }}
    interaction={{ mode: "tap" }}
    width={360}
    height={260}
  />,
  <ContributionGraph
    key="heatmap"
    values={usageDays}
    endDate="2026-05-05"
    numDays={105}
    weekStartsOn={1}
    onDayPress={(event) => {
      void event.raw;
    }}
    width={360}
    height={190}
  />,
  <ProgressRing
    key="progress"
    value={0.78}
    label="Move"
    width={220}
    height={220}
    centerLabel={({ average }) => `${Math.round(average * 100)}%`}
  />,
  <CandlestickChart
    key="candlestick"
    data={candles}
    xKey="day"
    openKey="open"
    highKey="high"
    lowKey="low"
    closeKey="close"
    viewport={{ visiblePoints: 2, initialIndex: "end" }}
    viewportInteraction={{ pan: true, pinchZoom: true, minVisiblePoints: 2 }}
    onViewportChange={() => undefined}
    yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
    formatYLabel={(value) => `$${Math.round(value)}`}
    width={360}
    height={280}
  />
];
