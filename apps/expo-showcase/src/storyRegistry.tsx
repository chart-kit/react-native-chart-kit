import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  BarChart as CompatBarChart,
  LineChart as CompatLineChart
} from "@chart-kit/react-native";
import { AreaChart, LineChart } from "@chart-kit/react-native-v2";
import { SvgCircle, SvgGroup, SvgRect, SvgText } from "@chart-kit/svg-renderer";

import { BarChartFixture, fixtures as barFixtures } from "./fixtures/compatBar";
import {
  LineChartFixture,
  fixtures as lineFixtures
} from "./fixtures/compatLine";
import {
  basicRevenue,
  campaignAttribution,
  denseRevenue,
  hourlyTraffic,
  multiSeriesRevenue,
  payrollRunway,
  priceHistory,
  revenueWithGaps,
  subscriptionMetrics
} from "./fixtures/v2Line";

export type NativeStoryProps = {
  onScrubEnd?: () => void;
  onScrubStart?: () => void;
  width: number;
};

export type StoryBrowseMode = "scenario" | "example";

export type ShowcaseStory = {
  id: string;
  title: string;
  example?: string;
  features?: string[];
  scenario?: string;
  Component: React.ComponentType<NativeStoryProps>;
};

export type ShowcaseSection = {
  id: string;
  title: string;
  browseModes?: StoryBrowseMode[];
  stories: ShowcaseStory[];
};

const ChartCard = ({
  children,
  isDark = false,
  kicker,
  title
}: {
  children: React.ReactNode;
  isDark?: boolean;
  kicker?: string;
  title: string;
}) => (
  <View style={[styles.card, isDark && styles.darkCard]}>
    {kicker ? (
      <Text style={[styles.kicker, isDark && styles.darkKicker]}>{kicker}</Text>
    ) : null}
    <Text style={[styles.cardTitle, isDark && styles.darkCardTitle]}>
      {title}
    </Text>
    <View style={styles.chartSlot}>{children}</View>
  </View>
);

const EmptyState = ({ copy, height }: { copy: string; height: number }) => (
  <View style={[styles.emptyState, { height }]}>
    <Text style={styles.emptyTitle}>No chart data</Text>
    <Text style={styles.emptyCopy}>{copy}</Text>
  </View>
);

const V2Basic = ({ width }: NativeStoryProps) => (
  <ChartCard title="Net revenue" kicker="Stripe-style billing dashboard">
    <LineChart
      data={basicRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      curve="monotone"
    />
  </ChartCard>
);

const V2RevenueCard = ({ width }: NativeStoryProps) => (
  <ChartCard title="MRR and retention" kicker="SaaS board report">
    <LineChart
      data={subscriptionMetrics}
      xKey="month"
      width={width}
      height={230}
      showDots={false}
      curve="monotone"
      formatYLabel={(value) => `$${Math.round(value)}k`}
      series={[
        { yKey: "revenue", label: "Revenue", color: "#2563eb" },
        {
          yKey: "netRetention",
          label: "Retention",
          color: "#10b981",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2BottomLegend = ({ width }: NativeStoryProps) => (
  <ChartCard title="Pipeline forecast" kicker="Sales planning">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={248}
      showDots={false}
      curve="monotone"
      legend={{
        position: "bottom",
        align: "center",
        marker: "line",
        itemGap: 18,
        fontSize: 12
      }}
      series={[
        { yKey: "actual", label: "Closed won", color: "#2563eb" },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#7c3aed",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2CustomLegend = ({ width }: NativeStoryProps) => (
  <ChartCard title="Opportunity mix" kicker="CRM pipeline health">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      legend={{
        align: "center",
        marker: "circle",
        fontSize: 12,
        itemGap: 18,
        itemPaddingHorizontal: 10,
        itemPaddingVertical: 4,
        renderItem: (item) => (
          <SvgGroup key={item.key}>
            <SvgRect
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              rx={8}
              fill={item.color}
              opacity={0.1}
            />
            <SvgCircle
              cx={item.contentX + item.markerSize / 2}
              cy={item.contentY + item.contentHeight / 2}
              r={item.markerSize / 2}
              fill={item.color}
            />
            <SvgText
              x={item.contentX + item.markerSize + item.labelGap}
              y={item.contentY + item.contentHeight / 2 + item.fontSize * 0.36}
              fill={item.color}
              fontSize={item.fontSize}
              fontWeight="600"
            >
              {item.label}
            </SvgText>
          </SvgGroup>
        )
      }}
      series={[
        {
          yKey: "actual",
          label: "Enterprise",
          color: "#2563eb",
          strokeWidth: 3
        },
        {
          yKey: "forecast",
          label: "SMB",
          color: "#7c3aed",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2CustomTypography = ({ width }: NativeStoryProps) => (
  <ChartCard title="Cash runway" kicker="Banking and treasury app">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      theme={{
        background: "#ffffff",
        plotBackground: "#ffffff",
        grid: "#e2e8f0",
        axis: "#e2e8f0",
        text: "#172033",
        mutedText: "#475569",
        series: ["#0f766e", "#2563eb"],
        typography: {
          fontFamily: "Georgia",
          axisLabelSize: 12,
          legendLabelSize: 13
        }
      }}
      legend={{
        align: "center",
        marker: "circle"
      }}
      series={[
        { yKey: "actual", label: "Cash", color: "#0f766e", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Burn",
          color: "#2563eb",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2MultiSeries = ({ width }: NativeStoryProps) => (
  <ChartCard title="Active users and signups" kicker="Google Analytics-style">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      series={[
        {
          yKey: "actual",
          label: "Active users",
          color: "#2563eb",
          strokeWidth: 3
        },
        {
          yKey: "forecast",
          label: "Signups",
          color: "#0891b2",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2DotStyles = ({ width }: NativeStoryProps) => (
  <ChartCard title="Cycle signals" kicker="Period tracking app">
    <LineChart
      data={multiSeriesRevenue.map((point) => ({
        ...point,
        forecast:
          typeof point.forecast === "number"
            ? point.forecast - 8
            : point.forecast
      }))}
      xKey="month"
      width={width}
      height={238}
      curve="monotone"
      dots={{
        radius: 4,
        fill: "background",
        strokeWidth: 2
      }}
      series={[
        {
          yKey: "actual",
          label: "Symptoms",
          color: "#2563eb",
          strokeWidth: 3,
          dot: {
            shape: "circle",
            radius: 4.5
          }
        },
        {
          yKey: "forecast",
          label: "Energy",
          color: "#0891b2",
          strokeWidth: 2,
          dot: {
            shape: "diamond",
            radius: 4,
            fill: "series",
            stroke: "background",
            strokeWidth: 1.5
          }
        }
      ]}
    />
  </ChartCard>
);

const V2SelectedTooltip = ({ width }: NativeStoryProps) => (
  <ChartCard title="Portfolio drilldown" kicker="Wealthsimple-style">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      selectedIndex={2}
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip={{
        width: 138
      }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        {
          yKey: "actual",
          label: "Portfolio",
          color: "#2563eb",
          strokeWidth: 3
        },
        {
          yKey: "forecast",
          label: "Deposits",
          color: "#0891b2",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2ScrubInteraction = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => (
  <ChartCard title="Portfolio history" kicker="Scrub to inspect balance">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      defaultSelectedIndex={3}
      interaction={{
        mode: "scrub",
        selectionPersistence: "persist",
        deselectOnOutsidePress: true,
        onGestureEnd: onScrubEnd,
        onGestureStart: onScrubStart
      }}
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip={{
        width: 138
      }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        {
          yKey: "actual",
          label: "Portfolio",
          color: "#2563eb",
          strokeWidth: 3
        },
        {
          yKey: "forecast",
          label: "Deposits",
          color: "#0891b2",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2WhileActiveScrub = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => (
  <ChartCard
    title="Live balance preview"
    kicker="Selection only while touching"
  >
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      interaction={{
        mode: "scrub",
        selectionPersistence: "whileActive",
        deselectOnOutsidePress: true,
        onGestureEnd: onScrubEnd,
        onGestureStart: onScrubStart
      }}
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip={{
        width: 138
      }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        {
          yKey: "actual",
          label: "Portfolio",
          color: "#2563eb",
          strokeWidth: 3
        },
        {
          yKey: "forecast",
          label: "Deposits",
          color: "#0891b2",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const V2NullGaps = ({ width }: NativeStoryProps) => (
  <ChartCard title="Sensor readings" kicker="Glucose monitor gaps">
    <LineChart
      data={revenueWithGaps}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      yDomain={[0, "dataMax"]}
      showDots
      selectedIndex={3}
      crosshair={{
        strokeDasharray: [4, 4]
      }}
      tooltip
    />
  </ChartCard>
);

const V2AreaFill = ({ width }: NativeStoryProps) => (
  <ChartCard title="Stock price" kicker="Robinhood-style dark chart" isDark>
    <AreaChart
      data={priceHistory}
      xKey="date"
      yKey="price"
      width={width}
      height={230}
      theme="dark"
      curve="monotone"
      formatYLabel={(value) => `$${Math.round(value)}`}
    />
  </ChartCard>
);

const V2DenseLabels = ({ width }: NativeStoryProps) => (
  <ChartCard title="Hourly traffic" kicker="Product analytics">
    <LineChart
      data={hourlyTraffic}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      showDots={false}
      curve="linear"
    />
  </ChartCard>
);

const V2RotatedLabels = ({ width }: NativeStoryProps) => (
  <ChartCard title="Campaign attribution" kicker="Marketing analytics">
    <LineChart
      data={campaignAttribution}
      xKey="month"
      yKey="actual"
      width={width}
      height={260}
      showDots={false}
      curve="monotone"
      labelStrategy="rotate"
      labelRotation={-35}
    />
  </ChartCard>
);

const V2RotatedSixLabels = ({ width }: NativeStoryProps) => (
  <ChartCard title="Payroll runway" kicker="Finance operations">
    <LineChart
      data={payrollRunway}
      xKey="month"
      yKey="actual"
      width={width}
      height={250}
      showDots={false}
      curve="monotone"
      labelStrategy="rotate"
      labelRotation={-70}
      labelMinGap={0}
    />
  </ChartCard>
);

const V2StaggeredLabels = ({ width }: NativeStoryProps) => (
  <ChartCard title="Retention cohort" kicker="Subscription analytics">
    <LineChart
      data={denseRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={248}
      showDots={false}
      curve="monotone"
      labelStrategy="stagger"
    />
  </ChartCard>
);

const V2GridLines = ({ width }: NativeStoryProps) => (
  <ChartCard title="API latency" kicker="Ops monitoring">
    <LineChart
      data={basicRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      curve="monotone"
      showDots={false}
      showHorizontalGridLines
      showVerticalGridLines
    />
  </ChartCard>
);

const V2HiddenLabels = ({ width }: NativeStoryProps) => (
  <ChartCard title="KPI sparkline" kicker="Executive dashboard card">
    <LineChart
      data={denseRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={220}
      showDots={false}
      curve="monotone"
      labelStrategy="hide"
    />
  </ChartCard>
);

const V2DarkMode = ({ width }: NativeStoryProps) => (
  <ChartCard
    title="Portfolio vs benchmark"
    kicker="Dark fintech dashboard"
    isDark
  >
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      theme="dark"
      curve="monotone"
      area
      series={[
        {
          yKey: "actual",
          label: "Portfolio",
          color: "#38bdf8",
          strokeWidth: 3
        },
        {
          yKey: "forecast",
          label: "Benchmark",
          color: "#a78bfa",
          strokeWidth: 2
        }
      ]}
    />
  </ChartCard>
);

const hasLineData = (fixture: LineChartFixture) =>
  fixture.data.datasets.some((dataset) => dataset.data.length > 0);

const hasBarData = (fixture: BarChartFixture) =>
  fixture.data.datasets.some((dataset) => dataset.data.length > 0);

const resolveLegacyWidth = (
  availableWidth: number,
  fixture: Pick<LineChartFixture | BarChartFixture, "width">
) => Math.min(availableWidth, fixture.width);

const legacyChartStyle = (
  fixture: Pick<LineChartFixture | BarChartFixture, "style">
) => ({
  ...fixture.style,
  paddingRight: Math.min(fixture.style?.paddingRight ?? 28, 28),
  width: undefined
});

const CompatLineStory = ({
  fixture,
  title
}: {
  fixture: LineChartFixture;
  title: string;
}) => {
  const Story = ({ width }: NativeStoryProps) => {
    const chartWidth = resolveLegacyWidth(width, fixture);
    const isDark = title === "Dark Mode";

    return (
      <ChartCard title={title} kicker="Compat LineChart" isDark={isDark}>
        {hasLineData(fixture) ? (
          <CompatLineChart
            data={fixture.data}
            width={chartWidth}
            height={fixture.height}
            chartConfig={fixture.chartConfig}
            style={legacyChartStyle(fixture)}
            segments={fixture.segments}
            bezier={fixture.bezier}
            fromZero={fixture.fromZero}
            withDots={fixture.withDots}
            withInnerLines={fixture.withInnerLines}
            withOuterLines={fixture.withOuterLines}
            verticalLabelRotation={fixture.verticalLabelRotation}
            xLabelsOffset={fixture.xLabelsOffset}
            yAxisSuffix={fixture.yAxisSuffix}
          />
        ) : (
          <EmptyState
            copy="The compatibility fixture contains zero points."
            height={fixture.height}
          />
        )}
      </ChartCard>
    );
  };

  return Story;
};

const CompatBarStory = ({
  fixture,
  title
}: {
  fixture: BarChartFixture;
  title: string;
}) => {
  const Story = ({ width }: NativeStoryProps) => {
    const chartWidth = resolveLegacyWidth(width, fixture);
    const isDark = title === "Dark Mode";

    return (
      <ChartCard title={title} kicker="Compat BarChart" isDark={isDark}>
        {hasBarData(fixture) ? (
          <CompatBarChart
            data={fixture.data}
            width={chartWidth}
            height={fixture.height}
            chartConfig={fixture.chartConfig}
            style={legacyChartStyle(fixture)}
            fromZero={fixture.fromZero}
            flatColor={fixture.flatColor}
            horizontalLabelRotation={fixture.horizontalLabelRotation}
            segments={fixture.segments}
            showBarTops={fixture.showBarTops}
            showValuesOnTopOfBars={fixture.showValuesOnTopOfBars}
            verticalLabelRotation={fixture.verticalLabelRotation}
            withCustomBarColorFromData={fixture.withCustomBarColorFromData}
            withHorizontalLabels={fixture.withHorizontalLabels}
            withInnerLines={fixture.withInnerLines}
            withVerticalLabels={fixture.withVerticalLabels}
            yAxisLabel={fixture.yAxisLabel ?? ""}
            yAxisSuffix={fixture.yAxisSuffix ?? ""}
          />
        ) : (
          <EmptyState
            copy="The compatibility fixture contains zero bars."
            height={fixture.height}
          />
        )}
      </ChartCard>
    );
  };

  return Story;
};

export const storySections: ShowcaseSection[] = [
  {
    id: "v2-line",
    title: "V2 Line and Area",
    browseModes: ["scenario", "example"],
    stories: [
      {
        id: "v2-basic",
        title: "Stripe revenue",
        scenario: "SaaS and billing",
        example: "Starter chart",
        features: ["single series", "monotone curve", "card-safe layout"],
        Component: V2Basic
      },
      {
        id: "v2-revenue-card",
        title: "MRR report",
        scenario: "SaaS and billing",
        example: "Multi-metric card",
        features: [
          "multi-series",
          "custom y-axis formatter",
          "per-series colors"
        ],
        Component: V2RevenueCard
      },
      {
        id: "v2-bottom-legend",
        title: "Sales forecast",
        scenario: "Sales and CRM",
        example: "Bottom legend",
        features: ["multi-series", "bottom legend", "line legend markers"],
        Component: V2BottomLegend
      },
      {
        id: "v2-custom-legend",
        title: "CRM pipeline",
        scenario: "Sales and CRM",
        example: "Custom legend",
        features: [
          "custom legend renderer",
          "legend item padding",
          "SVG renderer primitives"
        ],
        Component: V2CustomLegend
      },
      {
        id: "v2-custom-typography",
        title: "Cash runway",
        scenario: "Finance operations",
        example: "Typography tokens",
        features: ["custom theme", "font family", "axis label sizing"],
        Component: V2CustomTypography
      },
      {
        id: "v2-multi-series",
        title: "GA4 acquisition",
        scenario: "Product analytics",
        example: "Multi-series",
        features: ["multi-series", "series labels", "per-series stroke width"],
        Component: V2MultiSeries
      },
      {
        id: "v2-dot-styles",
        title: "Cycle tracking",
        scenario: "Health and wellness",
        example: "Marker styles",
        features: ["marker shapes", "per-series dots", "diamond markers"],
        Component: V2DotStyles
      },
      {
        id: "v2-selected-tooltip",
        title: "Portfolio point",
        scenario: "Investing",
        example: "Controlled selection",
        features: ["controlled selection", "shared tooltip", "crosshair"],
        Component: V2SelectedTooltip
      },
      {
        id: "v2-scrub",
        title: "Portfolio scrub",
        scenario: "Investing",
        example: "Tap and scrub",
        features: [
          "scrub interaction",
          "persistent selection",
          "outside deselect"
        ],
        Component: V2ScrubInteraction
      },
      {
        id: "v2-while-active",
        title: "Balance preview",
        scenario: "Investing",
        example: "While-active selection",
        features: ["scrub interaction", "while-active selection", "onDeselect"],
        Component: V2WhileActiveScrub
      },
      {
        id: "v2-null-gaps",
        title: "Glucose readings",
        scenario: "Health and wellness",
        example: "Null gaps",
        features: ["null gap handling", "explicit y-domain", "selected point"],
        Component: V2NullGaps
      },
      {
        id: "v2-area",
        title: "Stock price",
        scenario: "Investing",
        example: "Area fill",
        features: ["AreaChart", "time x-values", "dark theme"],
        Component: V2AreaFill
      },
      {
        id: "v2-dense-labels",
        title: "Hourly traffic",
        scenario: "Product analytics",
        example: "Dense labels",
        features: ["dense x labels", "linear curve", "auto layout"],
        Component: V2DenseLabels
      },
      {
        id: "v2-rotated-labels",
        title: "Campaign labels",
        scenario: "Marketing analytics",
        example: "Rotated labels",
        features: ["rotated labels", "long labels", "label collision strategy"],
        Component: V2RotatedLabels
      },
      {
        id: "v2-six-labels",
        title: "Payroll runway",
        scenario: "Finance operations",
        example: "Steep rotation",
        features: ["six labels", "steep rotation", "label gap control"],
        Component: V2RotatedSixLabels
      },
      {
        id: "v2-staggered-labels",
        title: "Retention cohort",
        scenario: "Product analytics",
        example: "Staggered labels",
        features: ["staggered labels", "dense weekly labels", "monotone curve"],
        Component: V2StaggeredLabels
      },
      {
        id: "v2-grid-lines",
        title: "API latency",
        scenario: "Operations",
        example: "Grid lines",
        features: [
          "horizontal grid lines",
          "vertical grid lines",
          "opt-in grid"
        ],
        Component: V2GridLines
      },
      {
        id: "v2-hidden-labels",
        title: "KPI sparkline",
        scenario: "Executive dashboards",
        example: "Hidden labels",
        features: ["hidden labels", "compact chart", "sparkline layout"],
        Component: V2HiddenLabels
      },
      {
        id: "v2-dark-mode",
        title: "Dark portfolio",
        scenario: "Investing",
        example: "Dark mode",
        features: ["dark theme", "area fill", "multi-series"],
        Component: V2DarkMode
      }
    ]
  },
  {
    id: "legacy-line",
    title: "Compat LineChart",
    stories: [
      {
        id: "line-basic",
        title: "Basic",
        Component: CompatLineStory({
          fixture: lineFixtures.basic,
          title: "Basic"
        })
      },
      {
        id: "line-long-labels",
        title: "Long Labels",
        Component: CompatLineStory({
          fixture: lineFixtures.longLabels,
          title: "Long Labels"
        })
      },
      {
        id: "line-dense-data",
        title: "Dense Data",
        Component: CompatLineStory({
          fixture: lineFixtures.denseData,
          title: "Dense Data"
        })
      },
      {
        id: "line-negative-values",
        title: "Negative Values",
        Component: CompatLineStory({
          fixture: lineFixtures.negativeValues,
          title: "Negative Values"
        })
      },
      {
        id: "line-empty-state",
        title: "Empty State",
        Component: CompatLineStory({
          fixture: lineFixtures.emptyState,
          title: "Empty State"
        })
      },
      {
        id: "line-dark-mode",
        title: "Dark Mode",
        Component: CompatLineStory({
          fixture: lineFixtures.darkMode,
          title: "Dark Mode"
        })
      },
      {
        id: "line-tiny-width",
        title: "Tiny Width",
        Component: CompatLineStory({
          fixture: lineFixtures.tinyWidth,
          title: "Tiny Width"
        })
      }
    ]
  },
  {
    id: "legacy-bar",
    title: "Compat BarChart",
    stories: [
      {
        id: "bar-basic",
        title: "Basic",
        Component: CompatBarStory({
          fixture: barFixtures.basic,
          title: "Basic"
        })
      },
      {
        id: "bar-long-labels",
        title: "Long Labels",
        Component: CompatBarStory({
          fixture: barFixtures.longLabels,
          title: "Long Labels"
        })
      },
      {
        id: "bar-dense-data",
        title: "Dense Data",
        Component: CompatBarStory({
          fixture: barFixtures.denseData,
          title: "Dense Data"
        })
      },
      {
        id: "bar-negative-values",
        title: "Negative Values",
        Component: CompatBarStory({
          fixture: barFixtures.negativeValues,
          title: "Negative Values"
        })
      },
      {
        id: "bar-empty-state",
        title: "Empty State",
        Component: CompatBarStory({
          fixture: barFixtures.emptyState,
          title: "Empty State"
        })
      },
      {
        id: "bar-dark-mode",
        title: "Dark Mode",
        Component: CompatBarStory({
          fixture: barFixtures.darkMode,
          title: "Dark Mode"
        })
      },
      {
        id: "bar-tiny-width",
        title: "Tiny Width",
        Component: CompatBarStory({
          fixture: barFixtures.tinyWidth,
          title: "Tiny Width"
        })
      }
    ]
  }
];

export const stories = storySections.flatMap((section) => section.stories);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#dde6f2",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12
  },
  darkCard: {
    backgroundColor: "#020617",
    borderColor: "#1e293b"
  },
  kicker: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 4,
    textTransform: "uppercase"
  },
  darkKicker: {
    color: "#94a3b8"
  },
  cardTitle: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 14
  },
  darkCardTitle: {
    color: "#f8fafc"
  },
  chartSlot: {
    alignItems: "center",
    overflow: "hidden"
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    justifyContent: "center",
    width: "100%"
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8
  },
  emptyCopy: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center"
  }
});
