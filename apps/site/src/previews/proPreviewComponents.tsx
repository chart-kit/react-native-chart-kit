import React from "react";
import { Pressable, Text, View } from "react-native";

import { CandlebarChart, ComboChart } from "@chart-kit/pro";
import {
  resolveCartesianChartThemeConfig,
  useChartKitTheme
} from "react-native-chart-kit/v2";

import {
  candlebarPrices,
  clampChartWidth,
  comboChannelPlan,
  money,
  percent
} from "./data";
import { toggleStyles } from "./toggleStyles";

const formatCandleValue = (value: number) => value.toFixed(1);

const formatSignedCandleValue = (value: number) =>
  `${value >= 0 ? "+" : ""}${formatCandleValue(value)}`;

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

export const CandlebarCrosshairPreview = ({
  isMostMobile,
  mode,
  width
}: {
  isMostMobile: boolean;
  mode: "dark" | "light";
  width: number;
}) => {
  const chartKitTheme = useChartKitTheme();
  const chartWidth = clampChartWidth(width);
  const [selectedIndex, setSelectedIndex] = React.useState(24);
  const [viewport, setViewport] = React.useState<{
    endIndex?: number;
    startIndex?: number;
  }>({
    startIndex: 6,
    endIndex: 35
  });
  const selected =
    crosshairCandlebarPrices[selectedIndex] ??
    crosshairCandlebarPrices[crosshairCandlebarPrices.length - 1]!;
  const resolvedTheme = resolveCartesianChartThemeConfig({
    mode: chartKitTheme.mode,
    preset: chartKitTheme.preset,
    presets: chartKitTheme.presets,
    theme: chartKitTheme.theme
  });
  const isUp = selected.close >= selected.open;
  const upColor =
    resolvedTheme.series[1] ?? (mode === "dark" ? "#22c55e" : "#16a34a");
  const downColor =
    resolvedTheme.series[3] ?? (mode === "dark" ? "#f59e0b" : "#dc2626");
  const directionColor = isUp ? upColor : downColor;
  const headerPaddingX = isMostMobile ? 8 : 10;
  const headerPaddingY = isMostMobile ? 7 : 8;
  const headerGap = isMostMobile ? 7 : 10;
  const chartHeight = isMostMobile ? 312 : 326;
  const rangeSelectorHeight = isMostMobile ? 64 : 70;
  const separatorColor = resolvedTheme.grid;
  const change = selected.close - selected.open;
  const metrics = [
    ["O", formatCandleValue(selected.open)],
    ["H", formatCandleValue(selected.high)],
    ["L", formatCandleValue(selected.low)],
    ["C", formatCandleValue(selected.close)],
    ["VOL", String(selected.volume)]
  ] as const;

  return (
    <View
      style={{
        width: chartWidth,
        overflow: "hidden",
        borderColor: resolvedTheme.axis,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: resolvedTheme.background
      }}
    >
      <View
        style={{
          width: chartWidth,
          borderBottomColor: resolvedTheme.grid,
          borderBottomWidth: 1,
          backgroundColor: resolvedTheme.plotBackground,
          paddingBottom: headerPaddingY,
          paddingLeft: headerPaddingX,
          paddingRight: headerPaddingX,
          paddingTop: headerPaddingY,
          flexDirection: "row",
          alignItems: "center",
          gap: headerGap
        }}
      >
        <View
          style={{
            minWidth: isMostMobile ? 58 : 70,
            flexShrink: 0
          }}
        >
          <Text
            style={{
              color: resolvedTheme.mutedText,
              fontSize: 8,
              fontWeight: "800",
              marginBottom: 2,
              textTransform: "uppercase"
            }}
          >
            {selected.date}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 5
            }}
          >
            <Text
              style={{
                color: resolvedTheme.text,
                fontSize: isMostMobile ? 12 : 13,
                fontWeight: "800"
              }}
            >
              {formatCandleValue(selected.close)}
            </Text>
            <Text
              style={{
                color: directionColor,
                fontSize: 9,
                fontWeight: "800"
              }}
            >
              {formatSignedCandleValue(change)}
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            minWidth: 0,
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
                borderLeftColor: separatorColor,
                borderLeftWidth: index === 0 ? 0 : 1,
                paddingLeft: index === 0 ? 0 : 5
              }}
            >
              <Text
                style={{
                  color: resolvedTheme.mutedText,
                  fontSize: 8,
                  fontWeight: "800",
                  marginBottom: 1,
                  textTransform: "uppercase"
                }}
              >
                {label}
              </Text>
              <Text
                style={{
                  color: label === "C" ? directionColor : resolvedTheme.text,
                  fontSize: isMostMobile ? 10 : 11,
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
        height={chartHeight}
        highKey="high"
        interaction={{
          activation: "longPress",
          mode: "crosshair",
          onSelect: (event) => setSelectedIndex(event.dataIndex)
        }}
        lowKey="low"
        onViewportChange={(event) => setViewport(event.viewport)}
        openKey="open"
        rangeSelector={{
          visible: true,
          height: rangeSelectorHeight
        }}
        selectedIndex={selectedIndex}
        selectionPriceLabel
        showHorizontalGridLines
        showYAxisLabels
        tooltip={false}
        viewport={viewport}
        volumeKey="volume"
        width={chartWidth}
      />
    </View>
  );
};

export const CandlebarRealtimePreview = ({
  isMostMobile,
  mode,
  width
}: {
  isMostMobile: boolean;
  mode: "dark" | "light";
  width: number;
}) => {
  const chartKitTheme = useChartKitTheme();
  const chartWidth = clampChartWidth(width);
  const latest = candlebarPrices[candlebarPrices.length - 1]!;
  const resolvedTheme = resolveCartesianChartThemeConfig({
    mode: chartKitTheme.mode,
    preset: chartKitTheme.preset,
    presets: chartKitTheme.presets,
    theme: chartKitTheme.theme
  });
  const isUp = latest.close >= latest.open;
  const upColor =
    resolvedTheme.series[1] ?? (mode === "dark" ? "#22c55e" : "#16a34a");
  const downColor =
    resolvedTheme.series[3] ?? (mode === "dark" ? "#f59e0b" : "#dc2626");
  const directionColor = isUp ? upColor : downColor;
  const headerPaddingX = isMostMobile ? 8 : 10;
  const headerPaddingY = isMostMobile ? 7 : 8;
  const headerGap = isMostMobile ? 7 : 10;
  const chartHeight = isMostMobile ? 286 : 300;
  const change = latest.close - latest.open;
  const metrics = [
    ["O", formatCandleValue(latest.open)],
    ["H", formatCandleValue(latest.high)],
    ["L", formatCandleValue(latest.low)],
    ["C", formatCandleValue(latest.close)],
    ["VOL", String(latest.volume)]
  ] as const;

  return (
    <View
      style={{
        width: chartWidth,
        overflow: "hidden",
        borderColor: resolvedTheme.axis,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: resolvedTheme.background
      }}
    >
      <View
        style={{
          width: chartWidth,
          borderBottomColor: resolvedTheme.grid,
          borderBottomWidth: 1,
          backgroundColor: resolvedTheme.plotBackground,
          paddingBottom: headerPaddingY,
          paddingLeft: headerPaddingX,
          paddingRight: headerPaddingX,
          paddingTop: headerPaddingY,
          flexDirection: "row",
          alignItems: "center",
          gap: headerGap
        }}
      >
        <View
          style={{
            minWidth: isMostMobile ? 58 : 70,
            flexShrink: 0
          }}
        >
          <Text
            style={{
              color: resolvedTheme.mutedText,
              fontSize: 8,
              fontWeight: "800",
              marginBottom: 2,
              textTransform: "uppercase"
            }}
          >
            {latest.date}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 5
            }}
          >
            <Text
              style={{
                color: resolvedTheme.text,
                fontSize: isMostMobile ? 12 : 13,
                fontWeight: "800"
              }}
            >
              {formatCandleValue(latest.close)}
            </Text>
            <Text
              style={{
                color: directionColor,
                fontSize: 9,
                fontWeight: "800"
              }}
            >
              {formatSignedCandleValue(change)}
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            minWidth: 0,
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
                borderLeftColor: resolvedTheme.grid,
                borderLeftWidth: index === 0 ? 0 : 1,
                paddingLeft: index === 0 ? 0 : 5
              }}
            >
              <Text
                style={{
                  color: resolvedTheme.mutedText,
                  fontSize: 8,
                  fontWeight: "800",
                  marginBottom: 1,
                  textTransform: "uppercase"
                }}
              >
                {label}
              </Text>
              <Text
                style={{
                  color: label === "C" ? directionColor : resolvedTheme.text,
                  fontSize: isMostMobile ? 10 : 11,
                  fontWeight: "800"
                }}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>
        <View
          style={{
            flexShrink: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            borderRadius: 999,
            backgroundColor:
              mode === "dark"
                ? "rgba(20, 184, 166, 0.16)"
                : "rgba(20, 184, 166, 0.1)",
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
              backgroundColor: upColor
            }}
          />
          <Text
            style={{
              color: upColor,
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
        height={chartHeight}
        highKey="high"
        lowKey="low"
        openKey="open"
        volumeKey="volume"
        width={chartWidth}
      />
    </View>
  );
};

const getComboToggleItems = (mode: "dark" | "light") => {
  const series =
    mode === "dark"
      ? [
          { color: "#38bdf8", tint: "rgba(56, 189, 248, 0.12)" },
          { color: "#a78bfa", tint: "rgba(167, 139, 250, 0.12)" },
          { color: "#22c55e", tint: "rgba(34, 197, 94, 0.12)" }
        ]
      : [
          { color: "#2563eb", tint: "rgba(37, 99, 235, 0.08)" },
          { color: "#0891b2", tint: "rgba(8, 145, 178, 0.08)" },
          { color: "#7c3aed", tint: "rgba(124, 58, 237, 0.08)" }
        ];

  return [
    { key: "bar-direct", label: "Direct", ...series[0] },
    { key: "bar-enterprise", label: "Enterprise", ...series[1] },
    { key: "line-margin", label: "Margin", ...series[2] }
  ];
};

export const ComboTogglePreview = ({
  mode,
  width
}: {
  mode: "dark" | "light";
  width: number;
}) => {
  const chartWidth = clampChartWidth(width);
  const [visibleSeriesKeys, setVisibleSeriesKeys] = React.useState([
    "bar-direct",
    "bar-enterprise",
    "line-margin"
  ]);
  const items = getComboToggleItems(mode);

  return (
    <View style={{ width: chartWidth }}>
      <View style={toggleStyles.toggleRow}>
        {items.map((item) => {
          const active = visibleSeriesKeys.includes(item.key);

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={() => {
                setVisibleSeriesKeys((currentKeys) => {
                  const nextKeys = currentKeys.includes(item.key)
                    ? currentKeys.filter((key) => key !== item.key)
                    : [...currentKeys, item.key];

                  return nextKeys.length > 0 ? nextKeys : currentKeys;
                });
              }}
              style={[
                toggleStyles.toggle,
                mode === "dark"
                  ? toggleStyles.toggleDark
                  : toggleStyles.toggleLight,
                active && {
                  backgroundColor: item.tint,
                  borderColor: item.color
                }
              ]}
            >
              <View
                style={[
                  toggleStyles.toggleSwatch,
                  { backgroundColor: item.color },
                  !active && toggleStyles.toggleSwatchInactive
                ]}
              />
              <Text
                style={[
                  toggleStyles.toggleText,
                  active
                    ? mode === "dark"
                      ? toggleStyles.toggleTextActiveDark
                      : toggleStyles.toggleTextActiveLight
                    : mode === "dark"
                      ? toggleStyles.toggleTextInactiveDark
                      : toggleStyles.toggleTextInactiveLight
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <ComboChart
        data={comboChannelPlan}
        formatYLabel={(value) => (value > 40 ? money(value) : percent(value))}
        height={292}
        series={[
          { key: "bar-direct", yKey: "direct", label: "Direct", type: "bar" },
          {
            key: "bar-enterprise",
            yKey: "enterprise",
            label: "Enterprise",
            type: "bar"
          },
          { key: "line-margin", yKey: "margin", label: "Margin", type: "line" }
        ]}
        visibleSeriesKeys={visibleSeriesKeys}
        width={chartWidth}
        xKey="month"
      />
    </View>
  );
};
