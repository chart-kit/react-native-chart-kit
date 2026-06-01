import React from "react";
import { Text, View } from "react-native";

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

import type { ChartPreviewExample } from "./examples";
import {
  acquisitionShare,
  candlebarPrices,
  clampChartWidth,
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

const formatCandleValue = (value: number) => value.toFixed(1);

const crosshairCandlebarPrices = Array.from({ length: 40 }, (_, index) => {
  const open = 184 + Math.sin(index * 0.55) * 6 + index * 1.4;
  const move = Math.cos(index * 0.75) * 7;
  const close = open + move;
  const wick = 3 + Math.abs(move) * 0.35;

  return {
    date: `T${index + 1}`,
    open,
    high: Math.max(open, close) + wick,
    low: Math.min(open, close) - wick,
    close,
    volume: Math.round(48 + Math.abs(move) * 9 + index * 3)
  };
});

const CandlebarCrosshairPreview = ({
  mode,
  width
}: {
  mode: "dark" | "light";
  width: number;
}) => {
  const chartWidth = clampChartWidth(width, 540);
  const [selectedIndex, setSelectedIndex] = React.useState(24);
  const selected =
    crosshairCandlebarPrices[selectedIndex] ??
    crosshairCandlebarPrices[crosshairCandlebarPrices.length - 1]!;
  const isDark = mode === "dark";
  const borderColor = isDark
    ? "rgba(216, 230, 255, 0.16)"
    : "rgba(15, 58, 120, 0.14)";
  const metrics = [
    ["O", formatCandleValue(selected.open)],
    ["H", formatCandleValue(selected.high)],
    ["L", formatCandleValue(selected.low)],
    ["C", formatCandleValue(selected.close)],
    ["VOL", String(selected.volume)]
  ] as const;

  return (
    <View style={{ gap: 12, width: chartWidth }}>
      <View
        style={{
          width: chartWidth,
          borderWidth: 1,
          borderColor,
          borderStyle: "solid",
          borderRadius: 8,
          backgroundColor: isDark ? "#111827" : "#f8fbff",
          paddingBottom: 7,
          paddingLeft: 9,
          paddingRight: 9,
          paddingTop: 7
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "stretch"
          }}
        >
          {metrics.map(([label, value], index) => (
            <View
              key={label}
              style={{
                flex: 1,
                minWidth: 0,
                alignItems: "center",
                borderLeftColor: borderColor,
                borderLeftWidth: index === 0 ? 0 : 1,
                paddingLeft: index === 0 ? 0 : 6
              }}
            >
              <Text
                style={{
                  color: isDark ? "rgba(248, 250, 252, 0.48)" : "#64748b",
                  fontSize: 8,
                  fontWeight: "800",
                  marginBottom: 2,
                  textTransform: "uppercase"
                }}
              >
                {label}
              </Text>
              <Text
                style={{
                  color: isDark ? "rgba(248, 250, 252, 0.82)" : "#334155",
                  fontSize: 12,
                  fontWeight: "800"
                }}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <CandlebarChart
        closeKey="close"
        data={crosshairCandlebarPrices}
        dateKey="date"
        defaultSelectedIndex={24}
        height={340}
        highKey="high"
        interaction={{
          mode: "crosshair",
          onSelect: (event) => setSelectedIndex(event.dataIndex)
        }}
        lowKey="low"
        openKey="open"
        rangeSelector={{
          visible: true,
          height: 28,
          startIndex: 6,
          endIndex: 35
        }}
        selectedIndex={selectedIndex}
        selectionPriceLabel
        showHorizontalGridLines
        showYAxisLabels
        tooltip={false}
        volumeKey="volume"
        width={chartWidth}
      />
    </View>
  );
};

const CandlebarRealtimePreview = ({
  mode,
  width
}: {
  mode: "dark" | "light";
  width: number;
}) => {
  const chartWidth = clampChartWidth(width, 540);
  const latest = candlebarPrices[candlebarPrices.length - 1]!;
  const isDark = mode === "dark";
  const isUp = latest.close >= latest.open;

  return (
    <View style={{ gap: 10, width: chartWidth }}>
      <View
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(216, 230, 255, 0.16)"
            : "rgba(15, 58, 120, 0.14)",
          borderStyle: "solid",
          borderRadius: 8,
          backgroundColor: isDark ? "#111827" : "#f8fbff",
          paddingBottom: 6,
          paddingLeft: 9,
          paddingRight: 9,
          paddingTop: 6,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8
        }}
      >
        <View
          style={{
            flex: 1,
            minWidth: 0,
            flexDirection: "row",
            alignItems: "baseline",
            gap: 5
          }}
        >
          <Text
            style={{
              color: isDark ? "rgba(248, 250, 252, 0.52)" : "#64748b",
              fontSize: 8,
              fontWeight: "800",
              textTransform: "uppercase"
            }}
          >
            Latest close
          </Text>
          <Text
            style={{
              color: isDark ? "#f8fafc" : "#0f172a",
              fontSize: 13,
              fontWeight: "800"
            }}
          >
            {formatCandleValue(latest.close)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            borderRadius: 999,
            backgroundColor: isUp
              ? "rgba(20, 184, 166, 0.14)"
              : "rgba(244, 63, 94, 0.14)",
            paddingBottom: 2,
            paddingLeft: 6,
            paddingRight: 6,
            paddingTop: 2
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              backgroundColor: isUp ? "#14b8a6" : "#f43f5e"
            }}
          />
          <Text
            style={{
              color: isUp ? "#0f766e" : "#be123c",
              fontSize: 10,
              fontWeight: "800",
              textTransform: "uppercase"
            }}
          >
            Live
          </Text>
        </View>
      </View>
      <CandlebarChart
        closeKey="close"
        data={candlebarPrices}
        dateKey="date"
        defaultSelectedIndex={candlebarPrices.length - 1}
        height={300}
        highKey="high"
        lowKey="low"
        openKey="open"
        volumeKey="volume"
        width={chartWidth}
      />
    </View>
  );
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
        colorKey="color"
        data={acquisitionShare}
        height={260}
        labelKey="channel"
        legend={{ maxItemWidth: "45%", reservedHeight: 72 }}
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
        colorKey="color"
        data={revenueMix}
        height={260}
        labelKey="label"
        legend={{ maxItemWidth: "45%", reservedHeight: 64 }}
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
        colorKey="color"
        data={progressRings}
        height={260}
        labelKey="label"
        valueKey="value"
        width={clampChartWidth(width, 360)}
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
        data={[{ label: "Release readiness", value: 0.76, color: "#00163f" }]}
        height={240}
        labelKey="label"
        valueKey="value"
        width={clampChartWidth(width, 340)}
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
        lowKey="low"
        openKey="open"
        volumeKey="volume"
        width={clampChartWidth(width, 540)}
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
    render: ({ mode, width }) => (
      <CandlebarRealtimePreview mode={mode} width={width} />
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
    render: ({ mode, width }) => (
      <CandlebarCrosshairPreview mode={mode} width={width} />
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
        width={clampChartWidth(width, 520)}
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
        height={300}
        series={[
          { yKey: "revenue", label: "Revenue", type: "bar" },
          { yKey: "margin", label: "Margin", type: "bar" },
          { yKey: "forecast", label: "Forecast", type: "line" }
        ]}
        width={clampChartWidth(width, 540)}
        xKey="month"
      />
    )
  }
};
