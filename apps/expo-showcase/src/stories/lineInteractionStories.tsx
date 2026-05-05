import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ChartSelectionProvider,
  LineChart,
  useDismissChartSelection
} from "@chart-kit/react-native/pro-preview";
import { useChartKitTheme } from "@chart-kit/react-native";
import { SvgGroup, SvgLine, SvgRect, SvgText } from "@chart-kit/svg-renderer";

import { multiSeriesRevenue, revenueWithGaps } from "../fixtures/v2Line";
import {
  ChartSection,
  type NativeStoryProps,
  type ShowcaseStory
} from "./storyPrimitives";

const ScopeDismissButton = ({ onDismiss }: { onDismiss: () => void }) => {
  const dismissChartSelection = useDismissChartSelection();
  const { mode } = useChartKitTheme();
  const isDark = mode === "dark";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        dismissChartSelection();
        onDismiss();
      }}
      style={({ pressed }) => [
        scopeStyles.button,
        isDark && scopeStyles.darkButton,
        pressed && scopeStyles.buttonPressed
      ]}
    >
      <Text style={[scopeStyles.buttonText, isDark && scopeStyles.darkText]}>
        Clear
      </Text>
    </Pressable>
  );
};

const V2SelectedTooltip = ({ width }: NativeStoryProps) => (
  <ChartSection title="Shared tooltip" kicker="Selection model">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      selectedIndex={2}
      crosshair={{ strokeDasharray: [4, 4] }}
      tooltip={{ width: 138 }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        { yKey: "actual", label: "Actual", strokeWidth: 3 },
        { yKey: "forecast", label: "Forecast", strokeWidth: 2 }
      ]}
    />
  </ChartSection>
);

const V2ScrubInteraction = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => (
  <ChartSection title="Tap and scrub" kicker="Persistent selection">
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
      crosshair={{ strokeDasharray: [4, 4] }}
      tooltip={{ width: 138, positionAnimationDuration: 260 }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        { yKey: "actual", label: "Actual", strokeWidth: 3 },
        { yKey: "forecast", label: "Forecast", strokeWidth: 2 }
      ]}
    />
  </ChartSection>
);

const V2WhileActiveScrub = ({
  onScrubEnd,
  onScrubStart,
  width
}: NativeStoryProps) => (
  <ChartSection title="Hold to inspect" kicker="While-active selection">
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
      crosshair={{ strokeDasharray: [4, 4] }}
      tooltip={{ width: 138, positionAnimationDuration: 240 }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        { yKey: "actual", label: "Actual", strokeWidth: 3 },
        { yKey: "forecast", label: "Forecast", strokeWidth: 2 }
      ]}
    />
  </ChartSection>
);

const V2SelectionScope = ({ width }: NativeStoryProps) => {
  const [summary, setSummary] = useState("Tap or scrub either chart");
  const { mode } = useChartKitTheme();
  const isDark = mode === "dark";

  return (
    <ChartSection title="Selection scope" kicker="Cross-chart dismissal">
      <ChartSelectionProvider
        dismissOnPressOutside
        style={[scopeStyles.scope, { width }]}
      >
        <View style={scopeStyles.scopeHeader}>
          <Text
            style={[scopeStyles.scopeSummary, isDark && scopeStyles.darkText]}
          >
            {summary}
          </Text>
          <ScopeDismissButton
            onDismiss={() => {
              setSummary("Selection cleared");
            }}
          />
        </View>
        <LineChart
          id="portfolio-scope"
          data={multiSeriesRevenue}
          xKey="month"
          width={width}
          height={210}
          showDots={false}
          curve="monotone"
          interaction={{
            mode: "scrub",
            onDeselect: () => {
              setSummary("Selection cleared");
            },
            onSelect: (event) => {
              setSummary(
                `Portfolio ${event.xLabel}: ${
                  event.series[0]?.formattedValue ?? "—"
                }`
              );
            }
          }}
          crosshair={{ strokeDasharray: [4, 4] }}
          tooltip={{ width: 138 }}
          activeDot={{ radius: 5.5, fill: "background", strokeWidth: 2.5 }}
          series={[
            { yKey: "actual", label: "Actual", strokeWidth: 3 },
            { yKey: "forecast", label: "Forecast", strokeWidth: 2 }
          ]}
        />
        <LineChart
          id="gap-scope"
          data={revenueWithGaps}
          xKey="month"
          yKey="actual"
          width={width}
          height={196}
          yDomain={[0, "dataMax"]}
          interaction={{
            mode: "tap",
            onDeselect: () => {
              setSummary("Selection cleared");
            },
            onSelect: (event) => {
              setSummary(
                `Readings ${event.xLabel}: ${
                  event.series[0]?.formattedValue ?? "—"
                }`
              );
            }
          }}
          crosshair={{ strokeDasharray: [4, 4] }}
          tooltip={{ width: 128 }}
        />
      </ChartSelectionProvider>
    </ChartSection>
  );
};

const V2CustomCrosshair = ({ width }: NativeStoryProps) => (
  <ChartSection title="Custom cursor" kicker="Composable crosshair">
    <LineChart
      data={multiSeriesRevenue}
      xKey="month"
      width={width}
      height={238}
      showDots={false}
      curve="monotone"
      selectedIndex={4}
      crosshair={{ opacity: 0.72, strokeDasharray: [3, 4] }}
      tooltip={false}
      formatYLabel={(value) => `$${Math.round(value)}k`}
      renderCrosshair={({ config, plot, series, theme, x, xLabel, y }) => {
        const valueLabel = series[0]
          ? `${series[0].label} ${series[0].formattedValue}`
          : "";
        const fontSize = theme.typography.axisLabelSize;
        const xBadgeWidth = Math.max(44, xLabel.length * fontSize * 0.56 + 18);
        const yBadgeWidth = Math.max(
          66,
          valueLabel.length * fontSize * 0.56 + 18
        );
        const badgeHeight = 24;
        const placeValueBadgeOnLeft = x > plot.x + plot.width * 0.56;
        const xBadgeX = Math.min(
          Math.max(4, x - xBadgeWidth / 2),
          plot.x + plot.width - xBadgeWidth
        );
        const yBadgeX = placeValueBadgeOnLeft
          ? plot.x + 6
          : plot.x + plot.width - yBadgeWidth - 6;
        const yBadgeY = Math.min(
          Math.max(plot.y + 6, y - badgeHeight / 2),
          plot.y + plot.height - badgeHeight - 6
        );
        const xBadgeY = plot.y + plot.height - badgeHeight - 6;

        return (
          <SvgGroup>
            <SvgLine
              x1={x}
              x2={x}
              y1={plot.y}
              y2={plot.y + plot.height}
              stroke={config.color}
              strokeOpacity={config.opacity}
              strokeWidth={config.strokeWidth}
              strokeDasharray={config.strokeDasharray}
            />
            <SvgLine
              x1={plot.x}
              x2={plot.x + plot.width}
              y1={y}
              y2={y}
              stroke={config.color}
              strokeOpacity={0.22}
              strokeWidth={1}
            />
            <SvgRect
              x={xBadgeX}
              y={xBadgeY}
              width={xBadgeWidth}
              height={badgeHeight}
              rx={8}
              fill={theme.tooltip.background}
              stroke={theme.tooltip.border}
            />
            <SvgText
              x={xBadgeX + xBadgeWidth / 2}
              y={xBadgeY + 16}
              fill={theme.tooltip.text}
              fontSize={fontSize}
              fontWeight="700"
              textAnchor="middle"
            >
              {xLabel}
            </SvgText>
            <SvgRect
              x={yBadgeX}
              y={yBadgeY}
              width={yBadgeWidth}
              height={badgeHeight}
              rx={8}
              fill={series[0]?.color ?? theme.tooltip.background}
              opacity={0.94}
            />
            <SvgText
              x={yBadgeX + yBadgeWidth / 2}
              y={yBadgeY + 16}
              fill={theme.background}
              fontSize={fontSize}
              fontWeight="800"
              textAnchor="middle"
            >
              {valueLabel}
            </SvgText>
          </SvgGroup>
        );
      }}
      activeDot={{
        radius: 5.5,
        fill: "background",
        strokeWidth: 2.5
      }}
      series={[
        { yKey: "actual", label: "Actual", strokeWidth: 3 },
        { yKey: "forecast", label: "Forecast", strokeWidth: 2 }
      ]}
    />
  </ChartSection>
);

const V2NullGaps = ({ width }: NativeStoryProps) => (
  <ChartSection title="Missing readings" kicker="Null gap handling">
    <LineChart
      data={revenueWithGaps}
      xKey="month"
      yKey="actual"
      width={width}
      height={230}
      yDomain={[0, "dataMax"]}
      showDots
      selectedIndex={3}
      crosshair={{ strokeDasharray: [4, 4] }}
      tooltip
    />
  </ChartSection>
);

export const lineInteractionStories: ShowcaseStory[] = [
  {
    id: "v2-selected-tooltip",
    title: "Shared Tooltip",
    Component: V2SelectedTooltip
  },
  { id: "v2-scrub", title: "Tap and Scrub", Component: V2ScrubInteraction },
  {
    id: "v2-while-active",
    title: "While Active Scrub",
    Component: V2WhileActiveScrub
  },
  {
    id: "v2-selection-scope",
    title: "Selection Scope",
    Component: V2SelectionScope
  },
  {
    id: "v2-custom-crosshair",
    title: "Custom Crosshair",
    Component: V2CustomCrosshair
  },
  { id: "v2-null-gaps", title: "Null Gaps", Component: V2NullGaps }
];

const scopeStyles = StyleSheet.create({
  scope: {
    gap: 14
  },
  scopeHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  scopeSummary: {
    color: "#334155",
    flex: 1,
    fontSize: 14,
    fontWeight: "700"
  },
  button: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ed",
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    minWidth: 72,
    paddingHorizontal: 14
  },
  darkButton: {
    backgroundColor: "#111827",
    borderColor: "#334155"
  },
  buttonPressed: {
    opacity: 0.72
  },
  buttonText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800"
  },
  darkText: {
    color: "#e5e7eb"
  }
});
