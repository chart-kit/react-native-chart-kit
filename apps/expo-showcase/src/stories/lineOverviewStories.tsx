import { LineChart, getLineChartDataTable } from "@chart-kit/react-native";
import { SvgCircle, SvgGroup, SvgRect, SvgText } from "@chart-kit/svg-renderer";

import {
  basicRevenue,
  multiSeriesRevenue,
  planAttainment,
  subscriptionMetrics
} from "../fixtures/v2Line";
import {
  ChartSection,
  type NativeStoryProps,
  type ShowcaseStory
} from "./storyPrimitives";
import { ChartDataDetails, createFormattedValueDetails } from "./dataDetails";

const V2Basic = ({ width }: NativeStoryProps) => (
  <ChartSection title="Revenue" kicker="Basic">
    <LineChart
      data={basicRevenue}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      curve="monotone"
    />
  </ChartSection>
);

const basicRevenueDetails = createFormattedValueDetails({
  categoryLabel: "Month",
  table: getLineChartDataTable({
    data: basicRevenue,
    formatYLabel: (value) => `$${value}k`,
    xKey: "month",
    yKeys: ["actual"]
  })
});

const V2BasicDetails = () => (
  <ChartDataDetails title="Revenue" {...basicRevenueDetails} />
);

const V2RevenueCard = ({ width }: NativeStoryProps) => (
  <ChartSection title="MRR growth" kicker="Multi-metric">
    <LineChart
      data={subscriptionMetrics}
      xKey="month"
      width={width}
      height={230}
      showDots={false}
      curve="monotone"
      formatYLabel={(value) => `$${Math.round(value)}k`}
      series={[
        { yKey: "revenue", label: "Revenue" },
        {
          yKey: "netRetention",
          label: "Retention",
          strokeWidth: 2
        }
      ]}
    />
  </ChartSection>
);

const V2BottomLegend = ({ width }: NativeStoryProps) => (
  <ChartSection title="Plan vs actual" kicker="Bottom legend">
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
        { yKey: "actual", label: "Actual" },
        {
          yKey: "forecast",
          label: "Forecast",
          strokeWidth: 2
        }
      ]}
    />
  </ChartSection>
);

const V2CustomLegend = ({ width }: NativeStoryProps) => (
  <ChartSection title="Custom legend" kicker="Composable legend item">
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
        { yKey: "actual", label: "Actual", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          strokeWidth: 2
        }
      ]}
    />
  </ChartSection>
);

const V2CustomTypography = ({ width }: NativeStoryProps) => (
  <ChartSection title="Typography" kicker="Font token mapping">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      theme={{
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
        { yKey: "actual", label: "Actual", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          strokeWidth: 2
        }
      ]}
    />
  </ChartSection>
);

const V2MultiSeries = ({ width }: NativeStoryProps) => (
  <ChartSection title="Plan vs actual" kicker="Multi-series">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      series={[
        { yKey: "actual", label: "Actual", strokeWidth: 3 },
        {
          yKey: "forecast",
          label: "Forecast",
          strokeWidth: 2
        }
      ]}
    />
  </ChartSection>
);

const V2ReferenceTargets = ({ width }: NativeStoryProps) => (
  <ChartSection title="Quota attainment" kicker="Reference overlays">
    <LineChart
      data={planAttainment}
      xKey="month"
      yKey="attainment"
      width={width}
      height={238}
      curve="monotone"
      showDots={false}
      showHorizontalGridLines
      yDomain={[80, 115]}
      formatYLabel={(value) => `${Math.round(value)}%`}
      referenceBands={[
        {
          y1: 90,
          y2: 110,
          label: "Target range",
          opacity: 0.09
        }
      ]}
      referenceLines={[
        {
          y: 100,
          label: "Plan",
          labelOffset: 12,
          labelPlacement: "below",
          labelPosition: "end",
          strokeDasharray: [5, 5],
          strokeWidth: 1.25
        }
      ]}
    />
  </ChartSection>
);

const V2ThresholdColors = ({ width }: NativeStoryProps) => (
  <ChartSection title="Plan health" kicker="Threshold coloring">
    <LineChart
      data={planAttainment}
      xKey="month"
      yKey="attainment"
      width={width}
      height={238}
      area
      curve="monotone"
      showDots={false}
      showHorizontalGridLines
      yDomain={[80, 115]}
      formatYLabel={(value) => `${Math.round(value)}%`}
      series={[
        {
          yKey: "attainment",
          label: "Attainment",
          strokeWidth: 3,
          threshold: {
            y: 100,
            aboveColor: "#16A34A",
            belowColor: "#DC2626",
            areaAboveColor: "#22C55E",
            areaBelowColor: "#EF4444",
            areaOpacity: 0.11
          }
        }
      ]}
      referenceLines={[
        {
          y: 100,
          label: "Plan",
          labelOffset: 12,
          labelPlacement: "below",
          labelPosition: "end",
          strokeDasharray: [5, 5],
          strokeWidth: 1.25
        }
      ]}
    />
  </ChartSection>
);

const V2DashedForecast = ({ width }: NativeStoryProps) => (
  <ChartSection title="Forecast variance" kicker="Straight and dashed lines">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="linear"
      legend={{
        marker: "line",
        itemGap: 18
      }}
      series={[
        {
          yKey: "actual",
          label: "Actual",
          strokeWidth: 3,
          strokeLinecap: "round"
        },
        {
          yKey: "forecast",
          label: "Forecast",
          color: "#64748B",
          strokeDasharray: [6, 5],
          strokeLinecap: "butt",
          strokeOpacity: 0.82,
          strokeWidth: 2.5
        }
      ]}
    />
  </ChartSection>
);

const V2DotStyles = ({ width }: NativeStoryProps) => (
  <ChartSection title="Marker styles" kicker="Circle and diamond markers">
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
          label: "Actual",
          strokeWidth: 3,
          dot: {
            shape: "circle",
            radius: 4.5
          }
        },
        {
          yKey: "forecast",
          label: "Forecast",
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
  </ChartSection>
);

export const lineOverviewStories: ShowcaseStory[] = [
  {
    id: "v2-basic",
    title: "Basic",
    Component: V2Basic,
    Details: V2BasicDetails
  },
  { id: "v2-revenue-card", title: "MRR Growth", Component: V2RevenueCard },
  { id: "v2-bottom-legend", title: "Bottom Legend", Component: V2BottomLegend },
  { id: "v2-custom-legend", title: "Custom Legend", Component: V2CustomLegend },
  {
    id: "v2-custom-typography",
    title: "Custom Typography",
    Component: V2CustomTypography
  },
  { id: "v2-multi-series", title: "Multi Series", Component: V2MultiSeries },
  {
    id: "v2-reference-targets",
    title: "Reference Targets",
    Component: V2ReferenceTargets
  },
  {
    id: "v2-threshold-colors",
    title: "Threshold Colors",
    Component: V2ThresholdColors
  },
  {
    id: "v2-dashed-forecast",
    title: "Dashed Forecast",
    Component: V2DashedForecast
  },
  { id: "v2-dot-styles", title: "Marker Styles", Component: V2DotStyles }
];
