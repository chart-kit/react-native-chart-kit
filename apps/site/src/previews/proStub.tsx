import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText
} from "react-native-svg";

type ChartDatum = Record<string, unknown>;

type ProChartBaseProps<TData extends ChartDatum = ChartDatum> = {
  data: TData[];
  defaultSelectedIndex?: number;
  height: number;
  width: number;
};

type CandlebarChartProps<TData extends ChartDatum = ChartDatum> =
  ProChartBaseProps<TData> & {
    closeKey?: string;
    dateKey?: string;
    highKey?: string;
    lowKey?: string;
    openKey?: string;
    volumeKey?: string;
  };

type RadarSeries = {
  color?: string;
  label?: string;
  valueKey: string;
};

type RadarChartProps<TData extends ChartDatum = ChartDatum> =
  ProChartBaseProps<TData> & {
    categoryKey?: string;
    maxValue?: number;
    series?: RadarSeries[];
  };

type ComboSeries = {
  color?: string;
  label?: string;
  type: "bar" | "line";
  yKey: string;
};

type ComboChartProps<TData extends ChartDatum = ChartDatum> =
  ProChartBaseProps<TData> & {
    series?: ComboSeries[];
    xKey?: string;
  };

type ThemeMode = "dark" | "light";

const proPalette = ["#4f8cff", "#18b7a0", "#f59e0b", "#d946ef"];

const getThemeMode = (): ThemeMode =>
  typeof document !== "undefined" &&
  document.documentElement.dataset.theme === "light"
    ? "light"
    : "dark";

const useThemeMode = () => {
  const [mode, setMode] = useState<ThemeMode>(() => getThemeMode());

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const updateMode = () => setMode(getThemeMode());
    const observer = new MutationObserver(updateMode);
    observer.observe(document.documentElement, {
      attributeFilter: ["data-theme"]
    });
    updateMode();

    return () => observer.disconnect();
  }, []);

  return mode;
};

const getTheme = (mode: ThemeMode) =>
  mode === "light"
    ? {
        axis: "rgba(7, 23, 51, 0.22)",
        card: "rgba(7, 23, 51, 0.04)",
        grid: "rgba(7, 23, 51, 0.09)",
        label: "rgba(7, 23, 51, 0.52)",
        muted: "rgba(7, 23, 51, 0.42)",
        negative: "#e14d4d",
        positive: "#17a37b",
        text: "#071733",
        tooltip: "#ffffff"
      }
    : {
        axis: "rgba(255, 255, 255, 0.24)",
        card: "rgba(255, 255, 255, 0.055)",
        grid: "rgba(255, 255, 255, 0.1)",
        label: "rgba(255, 255, 255, 0.62)",
        muted: "rgba(255, 255, 255, 0.42)",
        negative: "#ff6b72",
        positive: "#2dd4a7",
        text: "#f7f8f8",
        tooltip: "#111827"
      };

const toNumber = (value: unknown, fallback = 0) => {
  const number = typeof value === "number" ? value : Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const toLabel = (value: unknown) =>
  value === undefined || value === null ? "" : String(value);

const clampIndex = (index: number | undefined, length: number) =>
  Math.min(
    Math.max(index ?? Math.floor(length / 2), 0),
    Math.max(length - 1, 0)
  );

const linePath = (points: Array<{ x: number; y: number }>) =>
  points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(" ");

const chartShellStyle = {
  alignItems: "center" as const,
  gap: 10,
  justifyContent: "center" as const
};

const captionStyle = (mode: ThemeMode) => ({
  color: getTheme(mode).label,
  fontSize: 12,
  fontWeight: "600" as const
});

export const CandlebarChart = <TData extends ChartDatum>({
  closeKey = "close",
  data,
  dateKey = "date",
  defaultSelectedIndex,
  height,
  highKey = "high",
  lowKey = "low",
  openKey = "open",
  volumeKey = "volume",
  width
}: CandlebarChartProps<TData>) => {
  const mode = useThemeMode();
  const theme = getTheme(mode);
  const [selectedIndex, setSelectedIndex] = useState(() =>
    clampIndex(defaultSelectedIndex, data.length)
  );
  const selected = data[selectedIndex];
  const frame = {
    bottom: height - 50,
    left: 44,
    right: width - 18,
    top: 20
  };
  const plotHeight = frame.bottom - frame.top;
  const values = data.flatMap((row) => [
    toNumber(row[highKey], 0),
    toNumber(row[lowKey], 0)
  ]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);
  const step = data.length > 1 ? (frame.right - frame.left) / data.length : 22;
  const candleWidth = Math.max(8, Math.min(18, step * 0.58));
  const y = (value: number) =>
    frame.top + ((maxValue - value) / range) * plotHeight;
  const maxVolume = Math.max(
    1,
    ...data.map((row) => toNumber(row[volumeKey], 0))
  );

  return (
    <View style={chartShellStyle}>
      <Svg height={height} width={width}>
        <Rect
          fill={theme.card}
          height={height - 2}
          rx={8}
          stroke={theme.axis}
          width={width - 2}
          x={1}
          y={1}
        />
        {[0, 0.5, 1].map((tick) => {
          const tickY = frame.top + tick * plotHeight;

          return (
            <G key={tick}>
              <Line
                stroke={theme.grid}
                strokeWidth={1}
                x1={frame.left}
                x2={frame.right}
                y1={tickY}
                y2={tickY}
              />
              <SvgText
                fill={theme.muted}
                fontSize={10}
                fontWeight="600"
                textAnchor="end"
                x={frame.left - 8}
                y={tickY + 4}
              >
                {Math.round(maxValue - tick * range)}
              </SvgText>
            </G>
          );
        })}
        {data.map((row, index) => {
          const open = toNumber(row[openKey]);
          const close = toNumber(row[closeKey]);
          const high = toNumber(row[highKey]);
          const low = toNumber(row[lowKey]);
          const volume = toNumber(row[volumeKey]);
          const centerX = frame.left + index * step + step / 2;
          const top = Math.min(y(open), y(close));
          const bodyHeight = Math.max(Math.abs(y(open) - y(close)), 3);
          const rising = close >= open;
          const color = rising ? theme.positive : theme.negative;
          const selectedCandle = index === selectedIndex;
          const volumeHeight = (volume / maxVolume) * 28;

          return (
            <G
              key={`${toLabel(row[dateKey])}-${index}`}
              onPress={() => setSelectedIndex(index)}
            >
              <Rect
                fill="transparent"
                height={height}
                width={step}
                x={frame.left + index * step}
                y={0}
              />
              <Rect
                fill={color}
                fillOpacity={selectedCandle ? 0.34 : 0.14}
                height={volumeHeight}
                rx={2}
                width={Math.max(4, candleWidth * 0.7)}
                x={centerX - (candleWidth * 0.7) / 2}
                y={height - 18 - volumeHeight}
              />
              <Line
                stroke={color}
                strokeOpacity={selectedCandle ? 1 : 0.72}
                strokeWidth={selectedCandle ? 2 : 1.35}
                x1={centerX}
                x2={centerX}
                y1={y(high)}
                y2={y(low)}
              />
              <Rect
                fill={rising ? color : "transparent"}
                height={bodyHeight}
                rx={3}
                stroke={color}
                strokeWidth={selectedCandle ? 2 : 1.35}
                width={candleWidth}
                x={centerX - candleWidth / 2}
                y={top}
              />
            </G>
          );
        })}
        {selected ? (
          <G>
            <Line
              stroke={theme.axis}
              strokeDasharray="4 5"
              x1={frame.left + selectedIndex * step + step / 2}
              x2={frame.left + selectedIndex * step + step / 2}
              y1={frame.top}
              y2={frame.bottom}
            />
            <Rect
              fill={theme.tooltip}
              height={45}
              rx={7}
              stroke={theme.axis}
              width={126}
              x={Math.min(
                Math.max(frame.left + selectedIndex * step - 34, 8),
                width - 134
              )}
              y={10}
            />
            <SvgText
              fill={theme.text}
              fontSize={11}
              fontWeight="700"
              x={Math.min(
                Math.max(frame.left + selectedIndex * step - 22, 20),
                width - 122
              )}
              y={28}
            >
              {toLabel(selected[dateKey])}
            </SvgText>
            <SvgText
              fill={theme.label}
              fontSize={10}
              fontWeight="600"
              x={Math.min(
                Math.max(frame.left + selectedIndex * step - 22, 20),
                width - 122
              )}
              y={43}
            >
              O {toNumber(selected[openKey])} / C {toNumber(selected[closeKey])}
            </SvgText>
          </G>
        ) : null}
      </Svg>
      <Text style={captionStyle(mode)}>Tap candles to inspect OHLC values</Text>
    </View>
  );
};

export const CandlestickChart = CandlebarChart;

export const RadarChart = <TData extends ChartDatum>({
  categoryKey = "metric",
  data,
  height,
  maxValue,
  series = [
    { color: proPalette[0], label: "Current", valueKey: "current" },
    { color: proPalette[1], label: "Target", valueKey: "target" }
  ] as RadarSeries[],
  width
}: RadarChartProps<TData>) => {
  const mode = useThemeMode();
  const theme = getTheme(mode);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const center = { x: width / 2, y: height / 2 + 6 };
  const radius = Math.min(width, height) * 0.32;
  const max =
    maxValue ??
    Math.max(
      1,
      ...data.flatMap((row) =>
        series.map((item) => toNumber(row[item.valueKey], 0))
      )
    );
  const pointFor = (index: number, value: number) => {
    const angle = -Math.PI / 2 + (index / data.length) * Math.PI * 2;
    const distance = (value / max) * radius;

    return {
      x: center.x + Math.cos(angle) * distance,
      y: center.y + Math.sin(angle) * distance
    };
  };
  const axisPoint = (index: number, distance = radius) => {
    const angle = -Math.PI / 2 + (index / data.length) * Math.PI * 2;

    return {
      x: center.x + Math.cos(angle) * distance,
      y: center.y + Math.sin(angle) * distance
    };
  };

  return (
    <View style={chartShellStyle}>
      <Svg height={height} width={width}>
        <Rect
          fill={theme.card}
          height={height - 2}
          rx={8}
          stroke={theme.axis}
          width={width - 2}
          x={1}
          y={1}
        />
        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <Polygon
            key={ring}
            fill="transparent"
            points={data
              .map((_, index) => {
                const point = axisPoint(index, radius * ring);

                return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
              })
              .join(" ")}
            stroke={theme.grid}
            strokeWidth={1}
          />
        ))}
        {data.map((row, index) => {
          const point = axisPoint(index);
          const labelPoint = axisPoint(index, radius + 20);

          return (
            <G key={`${toLabel(row[categoryKey])}-${index}`}>
              <Line
                stroke={theme.grid}
                x1={center.x}
                x2={point.x}
                y1={center.y}
                y2={point.y}
              />
              <Circle
                cx={point.x}
                cy={point.y}
                fill="transparent"
                onPress={() => setSelectedIndex(index)}
                r={20}
              />
              <SvgText
                fill={index === selectedIndex ? theme.text : theme.label}
                fontSize={10}
                fontWeight={index === selectedIndex ? "800" : "650"}
                textAnchor="middle"
                x={labelPoint.x}
                y={labelPoint.y + 4}
              >
                {toLabel(row[categoryKey])}
              </SvgText>
            </G>
          );
        })}
        {series.map((item, seriesIndex) => {
          const points = data.map((row, index) =>
            pointFor(index, toNumber(row[item.valueKey]))
          );
          const pathPoints = points
            .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
            .join(" ");

          return (
            <G key={`${String(item.valueKey)}-${seriesIndex}`}>
              <Polygon
                fill={item.color ?? proPalette[seriesIndex % proPalette.length]}
                fillOpacity={seriesIndex === 0 ? 0.2 : 0.1}
                points={pathPoints}
                stroke={
                  item.color ?? proPalette[seriesIndex % proPalette.length]
                }
                strokeWidth={seriesIndex === 0 ? 2.5 : 1.8}
              />
              {points.map((point, index) => (
                <Circle
                  key={`${String(item.valueKey)}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  fill={
                    item.color ?? proPalette[seriesIndex % proPalette.length]
                  }
                  r={index === selectedIndex ? 4 : 2.5}
                />
              ))}
            </G>
          );
        })}
        <SvgText
          fill={theme.text}
          fontSize={13}
          fontWeight="800"
          textAnchor="middle"
          x={center.x}
          y={height - 24}
        >
          {toLabel(data[selectedIndex]?.[categoryKey])}
        </SvgText>
      </Svg>
      <Text style={captionStyle(mode)}>Tap an axis to focus a KPI</Text>
    </View>
  );
};

export const ComboChart = <TData extends ChartDatum>({
  data,
  defaultSelectedIndex,
  height,
  series = [
    { color: proPalette[0], label: "Revenue", type: "bar", yKey: "revenue" },
    { color: proPalette[2], label: "Forecast", type: "line", yKey: "forecast" }
  ] as ComboSeries[],
  width,
  xKey = "month"
}: ComboChartProps<TData>) => {
  const mode = useThemeMode();
  const theme = getTheme(mode);
  const [selectedIndex, setSelectedIndex] = useState(() =>
    clampIndex(defaultSelectedIndex, data.length)
  );
  const frame = {
    bottom: height - 36,
    left: 42,
    right: width - 18,
    top: 20
  };
  const plotHeight = frame.bottom - frame.top;
  const values = data.flatMap((row) =>
    series.map((item) => toNumber(row[item.yKey], 0))
  );
  const maxValue = Math.max(1, ...values);
  const step = data.length > 1 ? (frame.right - frame.left) / data.length : 28;
  const y = (value: number) =>
    frame.top + ((maxValue - value) / maxValue) * plotHeight;
  const barSeries = series.filter((item) => item.type === "bar");
  const lineSeries = series.filter((item) => item.type === "line");
  const barWidth = Math.max(10, Math.min(26, step * 0.5));
  const selected = data[selectedIndex];
  const tooltipX = Math.min(
    Math.max(frame.left + selectedIndex * step - 20, 8),
    width - 128
  );

  const lineModels = lineSeries.map((item) => ({
    item,
    points: data.map((row, index) => ({
      x: frame.left + index * step + step / 2,
      y: y(toNumber(row[item.yKey]))
    }))
  }));

  return (
    <View style={chartShellStyle}>
      <Svg height={height} width={width}>
        <Rect
          fill={theme.card}
          height={height - 2}
          rx={8}
          stroke={theme.axis}
          width={width - 2}
          x={1}
          y={1}
        />
        {[0, 0.33, 0.66, 1].map((tick) => {
          const tickY = frame.top + tick * plotHeight;

          return (
            <Line
              key={tick}
              stroke={theme.grid}
              strokeWidth={1}
              x1={frame.left}
              x2={frame.right}
              y1={tickY}
              y2={tickY}
            />
          );
        })}
        {data.map((row, index) => {
          const x = frame.left + index * step + step / 2;

          return (
            <G key={`${toLabel(row[xKey])}-${index}`}>
              <Rect
                fill="transparent"
                height={height}
                onPress={() => setSelectedIndex(index)}
                width={step}
                x={frame.left + index * step}
                y={0}
              />
              {barSeries.map((item, barIndex) => {
                const value = toNumber(row[item.yKey]);
                const barHeight = frame.bottom - y(value);
                const xOffset =
                  x - (barWidth * barSeries.length) / 2 + barIndex * barWidth;

                return (
                  <Rect
                    key={`${String(item.yKey)}-${index}`}
                    fill={item.color ?? proPalette[barIndex]}
                    fillOpacity={index === selectedIndex ? 1 : 0.68}
                    height={barHeight}
                    rx={4}
                    width={barWidth - 3}
                    x={xOffset}
                    y={y(value)}
                  />
                );
              })}
              <SvgText
                fill={index === selectedIndex ? theme.text : theme.muted}
                fontSize={10}
                fontWeight={index === selectedIndex ? "800" : "600"}
                textAnchor="middle"
                x={x}
                y={height - 14}
              >
                {toLabel(row[xKey])}
              </SvgText>
            </G>
          );
        })}
        {lineModels.map(({ item, points }, index) => (
          <G key={`${String(item.yKey)}-${index}`}>
            <Path
              d={linePath(points)}
              fill="transparent"
              stroke={item.color ?? proPalette[index + 1]}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
            />
            {points.map((point, pointIndex) => (
              <Circle
                key={`${String(item.yKey)}-${pointIndex}`}
                cx={point.x}
                cy={point.y}
                fill={item.color ?? proPalette[index + 1]}
                r={pointIndex === selectedIndex ? 4 : 2.4}
              />
            ))}
          </G>
        ))}
        {selected ? (
          <G>
            <Line
              stroke={theme.axis}
              strokeDasharray="4 5"
              x1={frame.left + selectedIndex * step + step / 2}
              x2={frame.left + selectedIndex * step + step / 2}
              y1={frame.top}
              y2={frame.bottom}
            />
            <Rect
              fill={theme.tooltip}
              height={42}
              rx={7}
              stroke={theme.axis}
              width={120}
              x={tooltipX}
              y={12}
            />
            <SvgText
              fill={theme.text}
              fontSize={11}
              fontWeight="800"
              x={tooltipX + 10}
              y={29}
            >
              {toLabel(selected[xKey])}
            </SvgText>
            <SvgText
              fill={theme.label}
              fontSize={10}
              fontWeight="600"
              x={tooltipX + 10}
              y={44}
            >
              {series
                .slice(0, 2)
                .map(
                  (item) =>
                    `${item.label ?? String(item.yKey)} ${selected ? toNumber(selected[item.yKey]) : 0}`
                )
                .join(" / ")}
            </SvgText>
          </G>
        ) : null}
      </Svg>
      <Text style={captionStyle(mode)}>
        Tap a month to inspect blended series
      </Text>
    </View>
  );
};
