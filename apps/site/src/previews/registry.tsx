import {
  AreaChart,
  BarChart,
  ContributionGraph,
  DonutChart,
  LineChart,
  PieChart,
  ProgressChart
} from "react-native-chart-kit/v2";
import { CandlebarChart, ComboChart, RadarChart } from "@chart-kit/pro";
import {
  BarChart as LegacyBarChart,
  ContributionGraph as LegacyContributionGraph,
  LineChart as LegacyLineChart,
  PieChart as LegacyPieChart,
  ProgressChart as LegacyProgressChart,
  StackedBarChart as LegacyStackedBarChart
} from "../../../../src";

import type { ChartPreviewExample } from "./examples";
import {
  acquisitionShare,
  candlebarPrices,
  clampChartWidth,
  comboBookings,
  comboProfitRecovery,
  comboRevenue,
  contributionEndDate,
  contributionNumDays,
  contributionValues,
  money,
  monthRevenue,
  percent,
  platformShare,
  profit,
  progressRings,
  radarBenchmarks,
  revenueMix,
  signedMoney,
  signups,
  supportVolume
} from "./data";
import {
  CandlebarCrosshairPreview,
  CandlebarRealtimePreview,
  ComboTogglePreview
} from "./proPreviewComponents";

const legacyLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const legacyValues = [20, 45, 28, 80, 99, 43];

const getLegacyChartConfig = (mode: "dark" | "light") => {
  const isDark = mode === "dark";

  return {
    backgroundGradientFrom: isDark ? "#111827" : "#ffffff",
    backgroundGradientTo: isDark ? "#0f172a" : "#ffffff",
    color: (opacity = 1) =>
      isDark
        ? `rgba(96, 165, 250, ${opacity})`
        : `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDark
        ? `rgba(226, 232, 240, ${opacity})`
        : `rgba(15, 23, 42, ${opacity})`,
    propsForBackgroundLines: {
      stroke: isDark ? "rgba(148, 163, 184, 0.22)" : "rgba(148, 163, 184, 0.3)"
    },
    propsForLabels: {
      fontSize: 10
    }
  };
};

const getLegacyPieData = (mode: "dark" | "light") => {
  const legendFontColor = mode === "dark" ? "#e2e8f0" : "#334155";

  return [
    {
      name: "Organic",
      population: 42,
      color: "#2563eb",
      legendFontColor,
      legendFontSize: 12
    },
    {
      name: "Paid",
      population: 24,
      color: "#0891b2",
      legendFontColor,
      legendFontSize: 12
    },
    {
      name: "Referral",
      population: 18,
      color: "#7c3aed",
      legendFontColor,
      legendFontSize: 12
    }
  ];
};

const legacyContributionValues = [
  { date: "2026-01-02", count: 1 },
  { date: "2026-01-03", count: 4 },
  { date: "2026-01-04", count: 2 },
  { date: "2026-01-07", count: 6 },
  { date: "2026-01-08", count: 3 },
  { date: "2026-01-12", count: 8 },
  { date: "2026-01-15", count: 2 },
  { date: "2026-01-16", count: 5 },
  { date: "2026-01-17", count: 1 },
  { date: "2026-01-24", count: 10 },
  { date: "2026-01-28", count: 4 },
  { date: "2026-01-31", count: 7 },
  { date: "2026-02-01", count: 2 },
  { date: "2026-02-03", count: 9 },
  { date: "2026-02-04", count: 1 },
  { date: "2026-02-10", count: 5 },
  { date: "2026-02-14", count: 11 },
  { date: "2026-02-15", count: 3 },
  { date: "2026-02-18", count: 6 },
  { date: "2026-02-19", count: 2 },
  { date: "2026-02-23", count: 8 },
  { date: "2026-02-27", count: 4 },
  { date: "2026-03-01", count: 12 },
  { date: "2026-03-02", count: 6 },
  { date: "2026-03-05", count: 3 },
  { date: "2026-03-08", count: 9 },
  { date: "2026-03-13", count: 2 },
  { date: "2026-03-14", count: 7 },
  { date: "2026-03-21", count: 5 },
  { date: "2026-03-25", count: 10 },
  { date: "2026-03-29", count: 1 },
  { date: "2026-03-31", count: 6 }
];

const getLegacyContributionChartConfig = (mode: "dark" | "light") => {
  const config = getLegacyChartConfig(mode);

  return {
    ...config,
    color: (opacity = 1) =>
      config.color(Math.max(opacity, mode === "dark" ? 0.35 : 0.28))
  };
};

export const chartPreviewExamples: Record<string, ChartPreviewExample> = {
  "line-basic": {
    eyebrow: "Line",
    id: "line-basic",
    title: "Revenue trend",
    render: ({ width }) => (
      <LineChart
        curve="monotone"
        data={monthRevenue}
        formatYLabel={money}
        height={240}
        width={clampChartWidth(width)}
        xKey="month"
        yKey="revenue"
      />
    )
  },
  "line-area": {
    eyebrow: "Area",
    id: "line-area",
    title: "Pipeline fill",
    render: ({ width }) => (
      <AreaChart
        curve="monotone"
        data={monthRevenue}
        formatYLabel={money}
        height={250}
        showDots={false}
        width={clampChartWidth(width)}
        xKey="month"
        yKey="forecast"
      />
    )
  },
  "line-multi-series": {
    eyebrow: "Series",
    id: "line-multi-series",
    title: "Actual vs forecast",
    render: ({ width }) => (
      <LineChart
        curve="monotone"
        data={monthRevenue}
        formatYLabel={money}
        height={260}
        legend={{ position: "bottom", align: "center", marker: "line" }}
        series={[
          { yKey: "revenue", label: "Actual", strokeWidth: 3 },
          { yKey: "forecast", label: "Forecast", strokeWidth: 2 }
        ]}
        showDots={false}
        width={clampChartWidth(width)}
        xKey="month"
      />
    )
  },
  "line-selection": {
    eyebrow: "Inspect",
    id: "line-selection",
    title: "Persistent tooltip",
    render: ({ width }) => (
      <LineChart
        curve="monotone"
        data={monthRevenue}
        defaultSelectedIndex={3}
        formatYLabel={money}
        height={260}
        interaction="tap"
        tooltip
        width={clampChartWidth(width)}
        xKey="month"
        yKey="revenue"
      />
    )
  },
  "bar-basic": {
    eyebrow: "Bar",
    id: "bar-basic",
    title: "Monthly signups",
    render: ({ width }) => (
      <BarChart
        data={signups}
        formatYLabel={(value) => `${Math.round(value)}`}
        height={240}
        width={clampChartWidth(width)}
        xKey="month"
        yKey="signups"
      />
    )
  },
  "bar-grouped": {
    eyebrow: "Grouped",
    id: "bar-grouped",
    title: "Signups and expansion",
    render: ({ width }) => (
      <BarChart
        data={signups}
        height={260}
        mode="grouped"
        series={[
          { yKey: "signups", label: "Signups" },
          { yKey: "expansion", label: "Expansion" }
        ]}
        width={clampChartWidth(width)}
        xKey="month"
      />
    )
  },
  "bar-negative": {
    eyebrow: "Domain",
    id: "bar-negative",
    title: "Profit recovery",
    render: ({ width }) => (
      <BarChart
        data={profit}
        formatYLabel={signedMoney}
        height={250}
        width={clampChartWidth(width)}
        xKey="month"
        yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
        yKey="profit"
      />
    )
  },
  "bar-horizontal": {
    eyebrow: "Horizontal",
    id: "bar-horizontal",
    title: "Support channels",
    render: ({ width }) => (
      <BarChart
        data={supportVolume}
        height={260}
        orientation="horizontal"
        width={clampChartWidth(width)}
        xKey="channel"
        yKey="tickets"
      />
    )
  },
  "bar-stacked": {
    eyebrow: "Stacked",
    id: "bar-stacked",
    title: "Platform share",
    render: ({ width }) => (
      <BarChart
        data={platformShare}
        formatYLabel={percent}
        height={250}
        mode="stacked100"
        series={[
          { yKey: "ios", label: "iOS" },
          { yKey: "android", label: "Android" },
          { yKey: "web", label: "Web" }
        ]}
        width={clampChartWidth(width)}
        xKey="month"
      />
    )
  },
  "pie-basic": {
    eyebrow: "Pie",
    id: "pie-basic",
    title: "Acquisition mix",
    render: ({ width }) => (
      <PieChart
        data={acquisitionShare}
        height={260}
        labelKey="channel"
        legend={{ maxItemWidth: "45%", reservedHeight: 72 }}
        sliceSeparator
        valueKey="value"
        width={clampChartWidth(width)}
      />
    )
  },
  "donut-basic": {
    eyebrow: "Donut",
    id: "donut-basic",
    title: "Revenue mix",
    render: ({ width }) => (
      <DonutChart
        centerLabel="$1.5M"
        data={revenueMix}
        height={260}
        labelKey="label"
        legend={{ maxItemWidth: "45%", reservedHeight: 64 }}
        sliceSeparator={{ width: 2 }}
        valueKey="value"
        width={clampChartWidth(width)}
      />
    )
  },
  "progress-rings": {
    eyebrow: "Progress",
    id: "progress-rings",
    title: "Release checklist",
    render: ({ width }) => (
      <ProgressChart
        centerLabel={({ average }) => `${Math.round(average * 100)}%`}
        data={progressRings}
        height={260}
        labelKey="label"
        valueKey="value"
        width={clampChartWidth(width)}
      />
    )
  },
  "progress-single": {
    eyebrow: "Single",
    id: "progress-single",
    title: "Release readiness",
    render: ({ width }) => (
      <ProgressChart
        centerLabel="Ready"
        data={[{ label: "Release readiness", value: 0.76 }]}
        height={240}
        labelKey="label"
        valueKey="value"
        width={clampChartWidth(width)}
      />
    )
  },
  "contribution-basic": {
    eyebrow: "Heatmap",
    id: "contribution-basic",
    title: "Usage streak",
    render: ({ width }) => (
      <ContributionGraph
        accessor="count"
        endDate={contributionEndDate}
        height={170}
        numDays={contributionNumDays}
        values={contributionValues}
        width={clampChartWidth(width)}
      />
    )
  },
  "contribution-empty": {
    eyebrow: "Empty",
    id: "contribution-empty",
    title: "No activity",
    render: ({ width }) => (
      <ContributionGraph
        endDate={contributionEndDate}
        height={158}
        numDays={contributionNumDays}
        values={[]}
        width={clampChartWidth(width)}
      />
    )
  },
  "legacy-line": {
    eyebrow: "Legacy",
    id: "legacy-line",
    supportsChartTheme: false,
    title: "Root LineChart",
    render: ({ mode, width }) => (
      <LegacyLineChart
        bezier
        chartConfig={getLegacyChartConfig(mode)}
        data={{
          labels: legacyLabels,
          datasets: [{ data: legacyValues }],
          legend: ["Revenue"]
        }}
        height={240}
        width={clampChartWidth(width)}
      />
    )
  },
  "legacy-bar": {
    eyebrow: "Legacy",
    id: "legacy-bar",
    supportsChartTheme: false,
    title: "Root BarChart",
    render: ({ mode, width }) => (
      <LegacyBarChart
        chartConfig={getLegacyChartConfig(mode)}
        data={{
          labels: legacyLabels,
          datasets: [{ data: legacyValues }]
        }}
        height={240}
        width={clampChartWidth(width)}
        yAxisLabel="$"
        yAxisSuffix="k"
      />
    )
  },
  "legacy-stacked-bar": {
    eyebrow: "Legacy",
    id: "legacy-stacked-bar",
    supportsChartTheme: false,
    title: "Root StackedBarChart",
    render: ({ mode, width }) => (
      <LegacyStackedBarChart
        chartConfig={getLegacyChartConfig(mode)}
        data={{
          labels: ["Q1", "Q2", "Q3", "Q4"],
          legend: ["Direct", "Partner", "Expansion"],
          data: [
            [60, 30, 20],
            [80, 45, 35],
            [70, 55, 40],
            [95, 65, 45]
          ],
          barColors: ["#2563eb", "#0891b2", "#7c3aed"]
        }}
        height={240}
        hideLegend={false}
        width={clampChartWidth(width)}
      />
    )
  },
  "legacy-pie": {
    eyebrow: "Legacy",
    id: "legacy-pie",
    supportsChartTheme: false,
    title: "Root PieChart",
    render: ({ mode, width }) => (
      <LegacyPieChart
        accessor="population"
        backgroundColor={mode === "dark" ? "#111827" : "#ffffff"}
        chartConfig={getLegacyChartConfig(mode)}
        data={getLegacyPieData(mode)}
        height={240}
        paddingLeft="15"
        width={clampChartWidth(width)}
      />
    )
  },
  "legacy-progress": {
    eyebrow: "Legacy",
    id: "legacy-progress",
    supportsChartTheme: false,
    title: "Root ProgressChart",
    render: ({ mode, width }) => (
      <LegacyProgressChart
        chartConfig={getLegacyChartConfig(mode)}
        data={{
          labels: ["Swim", "Bike", "Run"],
          data: [0.4, 0.6, 0.8]
        }}
        height={240}
        width={clampChartWidth(width)}
      />
    )
  },
  "legacy-contribution": {
    eyebrow: "Legacy",
    id: "legacy-contribution",
    supportsChartTheme: false,
    title: "Root ContributionGraph",
    render: ({ mode, width }) => (
      <LegacyContributionGraph
        chartConfig={getLegacyContributionChartConfig(mode)}
        endDate={new Date("2026-03-31")}
        gutterSize={2}
        height={220}
        numDays={90}
        tooltipDataAttrs={() => ({})}
        values={legacyContributionValues}
        width={clampChartWidth(width)}
      />
    )
  },
  "pro-candlebar": {
    ctaHref: "/#pricing",
    description:
      "OHLC inspection, volume context, and mobile-friendly hit targets for trading and market screens.",
    eyebrow: "Financial",
    id: "pro-candlebar",
    tier: "pro",
    title: "Candlebar session",
    render: ({ width }) => (
      <CandlebarChart
        closeKey="close"
        data={candlebarPrices}
        dateKey="date"
        defaultSelectedIndex={12}
        height={300}
        highKey="high"
        interaction="tap"
        lowKey="low"
        openKey="open"
        tooltip
        volumeKey="volume"
        width={clampChartWidth(width)}
      />
    )
  },
  "pro-candlebar-realtime": {
    ctaHref: "/#pricing",
    description:
      "Replace the active candle as ticks arrive and append completed intervals without rebuilding the chart surface.",
    eyebrow: "Realtime",
    id: "pro-candlebar-realtime",
    tier: "pro",
    title: "Realtime candle updates",
    render: ({ isMostMobile, mode, width }) => (
      <CandlebarRealtimePreview
        isMostMobile={isMostMobile}
        mode={mode}
        width={width}
      />
    )
  },
  "pro-candlebar-crosshair": {
    ctaHref: "/#pricing",
    description:
      "Use controlled selection and crosshair mode when a selected candle drives an external OHLCV inspector.",
    eyebrow: "Inspector",
    id: "pro-candlebar-crosshair",
    tier: "pro",
    title: "Crosshair inspector",
    render: ({ isMostMobile, mode, width }) => (
      <CandlebarCrosshairPreview
        isMostMobile={isMostMobile}
        mode={mode}
        width={width}
      />
    )
  },
  "pro-radar": {
    ctaHref: "/#pricing",
    description:
      "Compare multiple KPI profiles with readable axes, polygon fills, and selection-ready metric focus.",
    eyebrow: "Benchmarking",
    id: "pro-radar",
    tier: "pro",
    title: "Release quality radar",
    render: ({ width }) => (
      <RadarChart
        categoryKey="metric"
        data={radarBenchmarks}
        height={330}
        maxValue={100}
        series={[
          { valueKey: "current", label: "Current" },
          { valueKey: "target", label: "Target" },
          { valueKey: "industry", label: "Industry" }
        ]}
        width={clampChartWidth(width)}
      />
    )
  },
  "pro-combo": {
    ctaHref: "/#pricing",
    description:
      "Blend bars and lines on one coordinated surface for revenue, forecast, and margin workflows.",
    eyebrow: "Mixed series",
    id: "pro-combo",
    tier: "pro",
    title: "Revenue operating view",
    render: ({ width }) => (
      <ComboChart
        data={comboRevenue}
        defaultSelectedIndex={5}
        formatYLabel={money}
        height={300}
        series={[
          {
            key: "bar-revenue",
            yKey: "revenue",
            label: "Revenue",
            type: "bar"
          },
          { key: "bar-margin", yKey: "margin", label: "Margin", type: "bar" },
          {
            key: "line-forecast",
            yKey: "forecast",
            label: "Forecast",
            type: "line"
          }
        ]}
        width={clampChartWidth(width)}
        xKey="month"
      />
    )
  },
  "pro-combo-tooltip": {
    ctaHref: "/#pricing",
    description:
      "Open on a meaningful selected period and keep tap inspection anchored to a shared x value.",
    eyebrow: "Shared tooltip",
    id: "pro-combo-tooltip",
    tier: "pro",
    title: "Pipeline inspection",
    render: ({ width }) => (
      <ComboChart
        data={comboBookings}
        defaultSelectedIndex={3}
        formatYLabel={money}
        height={292}
        interaction="tap"
        series={[
          { key: "bar-booked", yKey: "booked", label: "Booked", type: "bar" },
          { key: "line-target", yKey: "target", label: "Target", type: "line" }
        ]}
        tooltip={{ width: 148 }}
        width={clampChartWidth(width)}
        xKey="month"
      />
    )
  },
  "pro-combo-toggles": {
    ctaHref: "/#pricing",
    description:
      "Let product controls show or hide bar and line series without changing the x-axis context.",
    eyebrow: "Controls",
    id: "pro-combo-toggles",
    tier: "pro",
    title: "Channel plan toggles",
    render: ({ mode, width }) => (
      <ComboTogglePreview mode={mode} width={width} />
    )
  },
  "pro-combo-negative": {
    ctaHref: "/#pricing",
    description:
      "Handle recovery views where bars cross zero while the line keeps the selected period in context.",
    eyebrow: "Domain",
    id: "pro-combo-negative",
    tier: "pro",
    title: "Profit recovery",
    render: ({ width }) => (
      <ComboChart
        data={comboProfitRecovery}
        defaultSelectedIndex={4}
        formatYLabel={signedMoney}
        height={292}
        series={[
          { key: "bar-profit", yKey: "profit", label: "Profit", type: "bar" },
          {
            key: "line-cash-flow",
            yKey: "cashFlow",
            label: "Cash flow",
            type: "line"
          }
        ]}
        width={clampChartWidth(width)}
        xKey="month"
        yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
      />
    )
  }
};
