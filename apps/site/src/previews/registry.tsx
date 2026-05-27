import React from "react";

import {
  AreaChart,
  BarChart,
  ContributionGraph,
  DonutChart,
  LineChart,
  PieChart,
  ProgressChart
} from "react-native-chart-kit/v2";

import type { ChartPreviewExample } from "./examples";
import {
  acquisitionShare,
  clampChartWidth,
  contributionValues,
  money,
  monthRevenue,
  percent,
  platformShare,
  profit,
  progressRings,
  revenueMix,
  signedMoney,
  signups,
  supportVolume
} from "./data";

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
        centerLabel="100%"
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
    title: "Activation health",
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
        data={[{ label: "Qa", value: 0.82, color: "#00163f" }]}
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
        endDate="2026-03-25"
        height={170}
        numDays={84}
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
        endDate="2026-03-25"
        height={158}
        numDays={70}
        values={[]}
        width={clampChartWidth(width)}
      />
    )
  }
};
