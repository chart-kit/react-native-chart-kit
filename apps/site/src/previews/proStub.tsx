import React, { useRef, useState } from "react";
import { Text, View, type GestureResponderEvent } from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText
} from "react-native-svg";
import {
  resolveCartesianChartThemeConfig,
  useChartKitTheme,
  type ResolvedCartesianChartTheme
} from "react-native-chart-kit/v2";

type ChartDatum = Record<string, unknown>;

type ProChartBaseProps<TData extends ChartDatum = ChartDatum> = {
  data: TData[];
  defaultSelectedIndex?: number;
  height: number;
  width: number;
};

type CandlebarRangeSelectorConfig = {
  endIndex?: number;
  gap?: number;
  height?: number;
  interactive?: boolean;
  minVisiblePoints?: number;
  startIndex?: number;
  visible?: boolean;
};

type CandlebarChartProps<TData extends ChartDatum = ChartDatum> =
  ProChartBaseProps<TData> & {
    accessibilityLabel?: string;
    closeKey?: string;
    dateKey?: string;
    formatYLabel?: (value: number) => string;
    highKey?: string;
    interaction?:
      | boolean
      | {
          activation?: "longPress" | "tap";
          deselectOnOutsidePress?: boolean;
          longPressDelayMs?: number;
          longPressMoveTolerance?: number;
          mode?: "crosshair" | "tap";
          onGestureEnd?: () => void;
          onGestureStart?: () => void;
          onSelect?: (event: {
            dataIndex: number;
            datum: TData;
            value: number;
            x: number;
            y: number;
          }) => void;
        };
    lowKey?: string;
    openKey?: string;
    rangeSelector?: boolean | CandlebarRangeSelectorConfig;
    selectedIndex?: number;
    selectionPriceLabel?: boolean;
    showHorizontalGridLines?: boolean;
    showYAxisLabels?: boolean;
    tooltip?: boolean;
    volumeHeightRatio?: number;
    volumeKey?: string;
    yDomain?: [number, number];
    yTickCount?: number;
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

const useResolvedProChartTheme = () => {
  const chartKitTheme = useChartKitTheme();

  return resolveCartesianChartThemeConfig({
    mode: chartKitTheme.mode,
    preset: chartKitTheme.preset,
    presets: chartKitTheme.presets,
    theme: chartKitTheme.theme
  });
};

const getSeriesColor = (theme: ResolvedCartesianChartTheme, index: number) =>
  theme.series[index % theme.series.length] ?? theme.text;

const getFontFamilyProps = (theme: ResolvedCartesianChartTheme) =>
  theme.typography.fontFamily
    ? { fontFamily: theme.typography.fontFamily }
    : {};

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

const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const linePath = (points: Array<{ x: number; y: number }>) =>
  points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(" ");

const estimateSvgTextWidth = (value: string, fontSize: number) =>
  Math.ceil(value.length * fontSize * 0.58);

const fitSvgLabel = (value: string, maxWidth: number, fontSize: number) => {
  const maxCharacters = Math.max(4, Math.floor(maxWidth / (fontSize * 0.58)));

  if (value.length <= maxCharacters) {
    return value;
  }

  return `${value.slice(0, Math.max(1, maxCharacters - 3))}...`;
};

const chartShellStyle = {
  alignItems: "center" as const,
  gap: 10,
  justifyContent: "center" as const
};

const captionStyle = (theme: ResolvedCartesianChartTheme) => ({
  color: theme.mutedText,
  fontSize: theme.typography.legendLabelSize,
  fontWeight: "600" as const
});

const chartGestureSurfaceStyle = ({
  height,
  isInteractive,
  width
}: {
  height: number;
  isInteractive: boolean;
  width: number;
}) =>
  ({
    cursor: isInteractive ? "crosshair" : "default",
    height,
    touchAction: isInteractive ? "none" : "auto",
    userSelect: "none",
    width
  }) as unknown as React.ComponentProps<typeof View>["style"];

export const CandlebarChart = <TData extends ChartDatum>({
  closeKey = "close",
  data,
  dateKey = "date",
  defaultSelectedIndex,
  formatYLabel,
  height,
  highKey = "high",
  interaction,
  lowKey = "low",
  openKey = "open",
  rangeSelector,
  selectedIndex: controlledSelectedIndex,
  selectionPriceLabel = false,
  showHorizontalGridLines = true,
  showYAxisLabels = true,
  tooltip = true,
  volumeHeightRatio = 0.14,
  volumeKey = "volume",
  width,
  yDomain,
  yTickCount = 3
}: CandlebarChartProps<TData>) => {
  const theme = useResolvedProChartTheme();
  const dragActiveRef = useRef(false);
  const rangeDragRef = useRef<
    | {
        mode: "move";
        offset: number;
        span: number;
      }
    | {
        anchorIndex: number;
        mode: "end" | "start";
      }
    | undefined
  >(undefined);
  const [gestureSelectedIndex, setGestureSelectedIndex] = useState(() =>
    clampIndex(defaultSelectedIndex, data.length)
  );
  const [rangeSelection, setRangeSelection] = useState<
    { endIndex: number; startIndex: number } | undefined
  >();
  const [crosshairPoint, setCrosshairPoint] = useState<
    { x: number; y: number } | undefined
  >();
  const interactionConfig =
    typeof interaction === "object" ? interaction : undefined;
  const showCrosshair = interactionConfig?.mode === "crosshair";
  const rangeSelectorConfig: CandlebarRangeSelectorConfig =
    typeof rangeSelector === "object" ? rangeSelector : {};
  const showRangeSelector =
    data.length > 1 &&
    (typeof rangeSelector === "boolean"
      ? rangeSelector
      : rangeSelector !== undefined && rangeSelectorConfig.visible !== false);
  const rangeSelectorInteractive =
    showRangeSelector && rangeSelectorConfig.interactive !== false;
  const rangeSelectorHeight = showRangeSelector
    ? clampValue(rangeSelectorConfig.height ?? 48, 24, 72)
    : 0;
  const rangeSelectorGap = showRangeSelector
    ? clampValue(rangeSelectorConfig.gap ?? 12, 8, 18)
    : 0;
  const frame = {
    bottom: Math.max(
      118,
      height -
        (showRangeSelector ? rangeSelectorHeight + rangeSelectorGap + 38 : 50)
    ),
    left: 44,
    right: width - 18,
    top: 20
  };
  const plotHeight = frame.bottom - frame.top;
  const values = data.length
    ? data.flatMap((row) => [
        toNumber(row[highKey], 0),
        toNumber(row[lowKey], 0)
      ])
    : [0, 1];
  const initialRangeStartIndex = clampIndex(
    rangeSelectorConfig.startIndex ?? Math.max(0, data.length - 12),
    data.length
  );
  const initialRangeEndIndex = clampIndex(
    rangeSelectorConfig.endIndex ?? data.length - 1,
    data.length
  );
  const rangeStartIndex = clampIndex(
    rangeSelection?.startIndex ?? initialRangeStartIndex,
    data.length
  );
  const rangeEndIndex = clampIndex(
    rangeSelection?.endIndex ?? initialRangeEndIndex,
    data.length
  );
  const rangeBrushStartIndex = showRangeSelector
    ? Math.min(rangeStartIndex, rangeEndIndex)
    : 0;
  const rangeBrushEndIndex = showRangeSelector
    ? Math.max(rangeStartIndex, rangeEndIndex)
    : Math.max(data.length - 1, 0);
  const visibleStartIndex = showRangeSelector ? rangeBrushStartIndex : 0;
  const visibleEndIndex = showRangeSelector
    ? rangeBrushEndIndex
    : Math.max(data.length - 1, 0);
  const visibleData = data.slice(visibleStartIndex, visibleEndIndex + 1);
  const visibleValues = visibleData.length
    ? visibleData.flatMap((row) => [
        toNumber(row[highKey], 0),
        toNumber(row[lowKey], 0)
      ])
    : values;
  const rawSelectedIndex = clampIndex(
    controlledSelectedIndex ?? gestureSelectedIndex,
    data.length
  );
  const selectedIndex = showRangeSelector
    ? clampValue(rawSelectedIndex, visibleStartIndex, visibleEndIndex)
    : rawSelectedIndex;
  const selectedVisibleIndex = clampIndex(
    selectedIndex - visibleStartIndex,
    visibleData.length
  );
  const selected = data[selectedIndex];
  const fullMinValue = yDomain?.[0] ?? Math.min(...values);
  const fullMaxValue = yDomain?.[1] ?? Math.max(...values);
  const fullRange = Math.max(fullMaxValue - fullMinValue, 1);
  const minValue = yDomain?.[0] ?? Math.min(...visibleValues);
  const maxValue = yDomain?.[1] ?? Math.max(...visibleValues);
  const range = Math.max(maxValue - minValue, 1);
  const step =
    visibleData.length > 1
      ? (frame.right - frame.left) / visibleData.length
      : 22;
  const candleWidth = Math.max(8, Math.min(18, step * 0.58));
  const y = (value: number) =>
    frame.top + ((maxValue - value) / range) * plotHeight;
  const valueForY = (positionY: number) =>
    maxValue - ((positionY - frame.top) / plotHeight) * range;
  const resolvedTickCount = Math.max(2, yTickCount);
  const ticks = Array.from(
    { length: resolvedTickCount },
    (_, index) => index / (resolvedTickCount - 1)
  );
  const maxVolume = Math.max(
    1,
    ...visibleData.map((row) => toNumber(row[volumeKey], 0))
  );
  const maxVolumeHeight = Math.max(12, plotHeight * volumeHeightRatio);
  const formatAxisValue = (value: number) =>
    formatYLabel ? formatYLabel(value) : String(Math.round(value));
  const selectedOpen = selected ? toNumber(selected[openKey]) : 0;
  const selectedHigh = selected ? toNumber(selected[highKey]) : 0;
  const selectedLow = selected ? toNumber(selected[lowKey]) : 0;
  const selectedClose = selected ? toNumber(selected[closeKey]) : 0;
  const selectedY = y(selectedClose);
  const selectedX = frame.left + selectedVisibleIndex * step + step / 2;
  const selectedBodyTopY = selected
    ? Math.min(y(selectedOpen), selectedY)
    : selectedY;
  const selectedColor =
    selectedClose >= selectedOpen
      ? getSeriesColor(theme, 0)
      : getSeriesColor(theme, 1);
  const activeCrosshairPoint = crosshairPoint ?? {
    x: selectedX,
    y: selectedY
  };
  const crosshairX = clampValue(
    activeCrosshairPoint.x,
    frame.left,
    frame.right
  );
  const crosshairY = clampValue(
    activeCrosshairPoint.y,
    frame.top,
    frame.bottom
  );
  const priceLabelY = showCrosshair ? crosshairY : selectedY;
  const priceLabelValue = showCrosshair ? valueForY(crosshairY) : selectedClose;
  const priceLabelText = formatAxisValue(priceLabelValue);
  const priceLabelFontSize = theme.tooltip.labelFontSize;
  const priceLabelWidth = Math.min(
    Math.max(54, estimateSvgTextWidth(priceLabelText, priceLabelFontSize) + 18),
    Math.max(54, frame.right - frame.left)
  );
  const priceLabelX = clampValue(
    width - priceLabelWidth - 18,
    frame.left,
    frame.right - priceLabelWidth
  );
  const candleTooltipTitle = selected ? toLabel(selected[dateKey]) : "";
  const candleTooltipPairs = selected
    ? [
        { label: "O", value: formatAxisValue(selectedOpen) },
        { label: "H", value: formatAxisValue(selectedHigh) },
        { label: "L", value: formatAxisValue(selectedLow) },
        { label: "C", value: formatAxisValue(selectedClose) }
      ]
    : [];
  const candleTooltipMaxWidth = Math.max(96, width - 16);
  const candleTooltipValueWidth = Math.max(
    0,
    ...candleTooltipPairs.map((item) =>
      estimateSvgTextWidth(item.value, theme.tooltip.labelFontSize)
    )
  );
  const candleTooltipColumnBaseWidth = Math.max(
    52,
    candleTooltipValueWidth + 18
  );
  const candleTooltipContentWidth = Math.max(
    estimateSvgTextWidth(candleTooltipTitle, 11),
    candleTooltipColumnBaseWidth * 2 + 12
  );
  const candleTooltipWidth = Math.min(
    candleTooltipMaxWidth,
    Math.max(146, candleTooltipContentWidth + 20)
  );
  const candleTooltipX = clampValue(
    selectedX - candleTooltipWidth / 2,
    8,
    width - candleTooltipWidth - 8
  );
  const candleTooltipTextX = candleTooltipX + 10;
  const candleTooltipColumnWidth = (candleTooltipWidth - 20) / 2;
  const rangeFrame = showRangeSelector
    ? {
        bottom: height - 22,
        left: frame.left,
        right: frame.right,
        top: height - 22 - rangeSelectorHeight
      }
    : undefined;
  const miniPlotHeight = rangeFrame ? rangeFrame.bottom - rangeFrame.top : 0;
  const miniStep =
    rangeFrame && data.length > 0
      ? (rangeFrame.right - rangeFrame.left) / data.length
      : 0;
  const miniCandleWidth = miniStep
    ? Math.max(2, Math.min(6, miniStep * 0.46))
    : 0;
  const miniY = (value: number) =>
    rangeFrame
      ? rangeFrame.top + ((fullMaxValue - value) / fullRange) * miniPlotHeight
      : 0;
  const rangeBrushX = rangeFrame
    ? rangeFrame.left + rangeBrushStartIndex * miniStep
    : 0;
  const rangeBrushWidth =
    rangeFrame && miniStep
      ? Math.max(18, (rangeBrushEndIndex - rangeBrushStartIndex + 1) * miniStep)
      : 0;
  const rangeBrushEndX = rangeBrushX + rangeBrushWidth;
  const rangeHandleHitWidth = Math.max(12, Math.min(18, miniStep * 1.1 || 12));
  const minRangeSpan = Math.max(
    1,
    Math.min(
      data.length - 1,
      Math.round(rangeSelectorConfig.minVisiblePoints ?? 6) - 1
    )
  );
  const caption = showCrosshair
    ? showRangeSelector
      ? "Drag the chart to inspect; move or resize the mini range"
      : "Press and drag across candles to move the crosshair inspector"
    : "Tap candles to inspect OHLC values";
  const selectIndex = (index: number) => {
    const nextIndex = clampIndex(index, data.length);
    const row = data[nextIndex];

    if (!row) {
      return;
    }

    const close = toNumber(row[closeKey]);

    if (controlledSelectedIndex === undefined) {
      setGestureSelectedIndex(nextIndex);
    }

    interactionConfig?.onSelect?.({
      dataIndex: nextIndex,
      datum: row,
      value: close,
      x:
        frame.left +
        clampValue(nextIndex - visibleStartIndex, 0, visibleData.length - 1) *
          step +
        step / 2,
      y: y(close)
    });
  };

  const isPointInRangeSelector = ({ locationY }: { locationY: number }) =>
    Boolean(
      rangeSelectorInteractive &&
      rangeFrame &&
      locationY >= rangeFrame.top - 8 &&
      locationY <= rangeFrame.bottom + 8
    );

  const updateRangeFromPointer = ({ locationX }: { locationX: number }) => {
    if (!rangeFrame || !miniStep || data.length < 2) {
      return;
    }

    const drag = rangeDragRef.current;
    const pointerX = clampValue(locationX, rangeFrame.left, rangeFrame.right);
    const pointerIndex = clampIndex(
      Math.floor((pointerX - rangeFrame.left) / miniStep),
      data.length
    );
    let nextStartIndex = rangeBrushStartIndex;
    let nextEndIndex = rangeBrushEndIndex;

    if (drag?.mode === "start") {
      const maxStartIndex = Math.max(0, drag.anchorIndex - minRangeSpan);
      nextStartIndex = Math.round(clampValue(pointerIndex, 0, maxStartIndex));
      nextEndIndex = drag.anchorIndex;
    } else if (drag?.mode === "end") {
      const minEndIndex = Math.min(
        data.length - 1,
        drag.anchorIndex + minRangeSpan
      );
      nextStartIndex = drag.anchorIndex;
      nextEndIndex = Math.round(
        clampValue(pointerIndex, minEndIndex, data.length - 1)
      );
    } else {
      const span =
        drag?.mode === "move"
          ? drag.span
          : rangeBrushEndIndex - rangeBrushStartIndex;
      const offset = drag?.mode === "move" ? drag.offset : Math.round(span / 2);
      const maxStartIndex = Math.max(0, data.length - span - 1);
      nextStartIndex = Math.round(
        clampValue(pointerIndex - offset, 0, maxStartIndex)
      );
      nextEndIndex = Math.min(data.length - 1, nextStartIndex + span);
    }

    setRangeSelection({
      endIndex: nextEndIndex,
      startIndex: nextStartIndex
    });

    const nextSelectedIndex = clampValue(
      selectedIndex,
      nextStartIndex,
      nextEndIndex
    );

    if (nextSelectedIndex !== selectedIndex) {
      selectIndex(nextSelectedIndex);
    }
  };

  const beginRangeDrag = ({ locationX }: { locationX: number }) => {
    if (!rangeFrame || !miniStep) {
      return;
    }

    const pointerX = clampValue(locationX, rangeFrame.left, rangeFrame.right);
    const pointerIndex = clampIndex(
      Math.floor((pointerX - rangeFrame.left) / miniStep),
      data.length
    );
    const span = rangeBrushEndIndex - rangeBrushStartIndex;
    const nearStartHandle =
      Math.abs(pointerX - rangeBrushX) <= rangeHandleHitWidth;
    const nearEndHandle =
      Math.abs(pointerX - rangeBrushEndX) <= rangeHandleHitWidth;
    const insideBrush = pointerX >= rangeBrushX && pointerX <= rangeBrushEndX;

    if (nearStartHandle) {
      rangeDragRef.current = {
        anchorIndex: rangeBrushEndIndex,
        mode: "start"
      };
    } else if (nearEndHandle) {
      rangeDragRef.current = {
        anchorIndex: rangeBrushStartIndex,
        mode: "end"
      };
    } else {
      const offset = insideBrush
        ? clampValue(pointerIndex - rangeBrushStartIndex, 0, span)
        : Math.round(span / 2);

      rangeDragRef.current = { mode: "move", offset, span };
    }

    updateRangeFromPointer({ locationX });
  };

  const selectFromPointer = ({
    locationX,
    locationY
  }: {
    locationX: number;
    locationY: number;
  }) => {
    if (isPointInRangeSelector({ locationY })) {
      updateRangeFromPointer({ locationX });
      return;
    }

    if (!showCrosshair) {
      return;
    }

    const pointerX = clampValue(locationX, frame.left, frame.right);
    const pointerY = clampValue(locationY, frame.top, frame.bottom);
    const nextVisibleIndex = clampIndex(
      Math.floor((pointerX - frame.left) / step),
      visibleData.length
    );
    const nextIndex = visibleStartIndex + nextVisibleIndex;

    setCrosshairPoint({ x: pointerX, y: pointerY });
    selectIndex(nextIndex);
  };

  const beginDrag = (event: GestureResponderEvent) => {
    event.preventDefault();
    dragActiveRef.current = true;

    if (isPointInRangeSelector(event.nativeEvent)) {
      beginRangeDrag(event.nativeEvent);
      return;
    }

    interactionConfig?.onGestureStart?.();
    selectFromPointer(event.nativeEvent);
  };

  const updateDrag = (event: GestureResponderEvent) => {
    if (!dragActiveRef.current) {
      return;
    }

    event.preventDefault();

    if (rangeDragRef.current) {
      updateRangeFromPointer(event.nativeEvent);
      return;
    }

    selectFromPointer(event.nativeEvent);
  };

  const endDrag = () => {
    if (!dragActiveRef.current) {
      return;
    }

    const wasRangeDrag = rangeDragRef.current !== undefined;
    dragActiveRef.current = false;
    rangeDragRef.current = undefined;

    if (!wasRangeDrag) {
      interactionConfig?.onGestureEnd?.();
    }
  };

  const handlePress = (index: number) => {
    interactionConfig?.onGestureStart?.();
    selectIndex(index);
    interactionConfig?.onGestureEnd?.();
  };

  const shouldUseResponder = (event: GestureResponderEvent) =>
    showCrosshair || isPointInRangeSelector(event.nativeEvent);
  const crosshairResponderProps: React.ComponentProps<typeof View> =
    showCrosshair || rangeSelectorInteractive
      ? {
          onMoveShouldSetResponder: shouldUseResponder,
          onResponderGrant: beginDrag,
          onResponderMove: updateDrag,
          onResponderRelease: endDrag,
          onResponderTerminate: endDrag,
          onResponderTerminationRequest: () => false,
          onStartShouldSetResponder: shouldUseResponder
        }
      : {};
  const gestureSurfaceStyle = chartGestureSurfaceStyle({
    height,
    isInteractive: showCrosshair || rangeSelectorInteractive,
    width
  });

  return (
    <View style={chartShellStyle}>
      <View {...crosshairResponderProps} style={gestureSurfaceStyle}>
        <Svg height={height} width={width}>
          <Rect
            fill={theme.background}
            height={height - 2}
            rx={8}
            stroke={theme.axis}
            width={width - 2}
            x={1}
            y={1}
          />
          {ticks.map((tick) => {
            const tickY = frame.top + tick * plotHeight;
            const tickValue = maxValue - tick * range;

            return (
              <G key={tick}>
                {showHorizontalGridLines ? (
                  <Line
                    stroke={theme.grid}
                    strokeWidth={1}
                    x1={frame.left}
                    x2={frame.right}
                    y1={tickY}
                    y2={tickY}
                  />
                ) : null}
                {showYAxisLabels ? (
                  <SvgText
                    fill={theme.mutedText}
                    fontSize={theme.typography.axisLabelSize}
                    fontWeight="600"
                    textAnchor="end"
                    x={frame.left - 8}
                    y={tickY + 4}
                    {...getFontFamilyProps(theme)}
                  >
                    {formatAxisValue(tickValue)}
                  </SvgText>
                ) : null}
              </G>
            );
          })}
          {visibleData.map((row, index) => {
            const dataIndex = visibleStartIndex + index;
            const open = toNumber(row[openKey]);
            const close = toNumber(row[closeKey]);
            const high = toNumber(row[highKey]);
            const low = toNumber(row[lowKey]);
            const volume = toNumber(row[volumeKey]);
            const centerX = frame.left + index * step + step / 2;
            const top = Math.min(y(open), y(close));
            const bodyHeight = Math.max(Math.abs(y(open) - y(close)), 3);
            const rising = close >= open;
            const color = rising
              ? getSeriesColor(theme, 0)
              : getSeriesColor(theme, 1);
            const selectedCandle = dataIndex === selectedIndex;
            const volumeHeight = (volume / maxVolume) * maxVolumeHeight;
            const volumeBaseline = frame.bottom - 8;

            return (
              <G
                key={`${toLabel(row[dateKey])}-${index}`}
                onPress={() => {
                  if (!showCrosshair) {
                    handlePress(dataIndex);
                  }
                }}
              >
                <Rect
                  fill="transparent"
                  height={frame.bottom}
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
                  y={volumeBaseline - volumeHeight}
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
                  fill={color}
                  fillOpacity={selectedCandle ? 1 : 0.86}
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
          {selected && showCrosshair ? (
            <G>
              <Line
                stroke={theme.axis}
                strokeDasharray="4 5"
                x1={frame.left}
                x2={frame.right}
                y1={crosshairY}
                y2={crosshairY}
              />
              <Line
                stroke={theme.axis}
                strokeDasharray="4 5"
                x1={crosshairX}
                x2={crosshairX}
                y1={frame.top}
                y2={frame.bottom}
              />
              <Circle
                cx={crosshairX}
                cy={crosshairY}
                fill={theme.background}
                r={4}
                stroke={theme.axis}
                strokeWidth={1.5}
              />
              <Circle
                cx={selectedX}
                cy={selectedBodyTopY}
                fill={theme.background}
                r={6}
                stroke={selectedColor}
                strokeWidth={2}
              />
              <Circle
                cx={selectedX}
                cy={selectedBodyTopY}
                fill={selectedColor}
                r={2.5}
              />
            </G>
          ) : null}
          {selected ? (
            <G>
              {!showCrosshair ? (
                <Line
                  stroke={theme.axis}
                  strokeDasharray="4 5"
                  x1={selectedX}
                  x2={selectedX}
                  y1={frame.top}
                  y2={frame.bottom}
                />
              ) : null}
              {selectionPriceLabel ? (
                <G>
                  <Rect
                    fill={theme.tooltip.background}
                    height={22}
                    rx={6}
                    stroke={theme.tooltip.border}
                    width={priceLabelWidth}
                    x={priceLabelX}
                    y={Math.max(
                      frame.top + 4,
                      Math.min(priceLabelY - 11, frame.bottom - 26)
                    )}
                  />
                  <SvgText
                    fill={theme.tooltip.text}
                    fontSize={theme.tooltip.labelFontSize}
                    fontWeight="700"
                    textAnchor="middle"
                    x={priceLabelX + priceLabelWidth / 2}
                    y={Math.max(
                      frame.top + 19,
                      Math.min(priceLabelY + 4, frame.bottom - 11)
                    )}
                    {...getFontFamilyProps(theme)}
                  >
                    {priceLabelText}
                  </SvgText>
                </G>
              ) : null}
              {tooltip ? (
                <G>
                  <Rect
                    fill={theme.tooltip.background}
                    height={68}
                    rx={7}
                    stroke={theme.tooltip.border}
                    width={candleTooltipWidth}
                    x={candleTooltipX}
                    y={10}
                  />
                  <SvgText
                    fill={theme.tooltip.text}
                    fontSize={11}
                    fontWeight="700"
                    x={candleTooltipTextX}
                    y={28}
                    {...getFontFamilyProps(theme)}
                  >
                    {fitSvgLabel(
                      candleTooltipTitle,
                      candleTooltipWidth - 20,
                      11
                    )}
                  </SvgText>
                  {candleTooltipPairs.map((item, index) => {
                    const columnIndex = index % 2;
                    const rowIndex = Math.floor(index / 2);
                    const columnX =
                      candleTooltipTextX +
                      columnIndex * candleTooltipColumnWidth;
                    const rowY = 47 + rowIndex * 15;

                    return (
                      <G key={item.label}>
                        <SvgText
                          fill={theme.tooltip.mutedText}
                          fontSize={theme.tooltip.labelFontSize}
                          fontWeight="800"
                          x={columnX}
                          y={rowY}
                          {...getFontFamilyProps(theme)}
                        >
                          {item.label}
                        </SvgText>
                        <SvgText
                          fill={theme.tooltip.text}
                          fontSize={theme.tooltip.labelFontSize}
                          fontWeight="700"
                          x={columnX + 14}
                          y={rowY}
                          {...getFontFamilyProps(theme)}
                        >
                          {fitSvgLabel(
                            item.value,
                            candleTooltipColumnWidth - 18,
                            theme.tooltip.labelFontSize
                          )}
                        </SvgText>
                      </G>
                    );
                  })}
                </G>
              ) : null}
            </G>
          ) : null}
          {rangeFrame ? (
            <G>
              <Rect
                fill={theme.grid}
                fillOpacity={0.24}
                height={rangeSelectorHeight}
                rx={7}
                width={rangeFrame.right - rangeFrame.left}
                x={rangeFrame.left}
                y={rangeFrame.top}
              />
              {data.map((row, index) => {
                const open = toNumber(row[openKey]);
                const close = toNumber(row[closeKey]);
                const high = toNumber(row[highKey]);
                const low = toNumber(row[lowKey]);
                const centerX =
                  rangeFrame.left + index * miniStep + miniStep / 2;
                const top = Math.min(miniY(open), miniY(close));
                const bodyHeight = Math.max(
                  Math.abs(miniY(open) - miniY(close)),
                  2
                );
                const color =
                  close >= open
                    ? getSeriesColor(theme, 0)
                    : getSeriesColor(theme, 1);

                return (
                  <G key={`range-${toLabel(row[dateKey])}-${index}`}>
                    <Line
                      stroke={color}
                      strokeOpacity={0.68}
                      strokeWidth={1}
                      x1={centerX}
                      x2={centerX}
                      y1={miniY(high)}
                      y2={miniY(low)}
                    />
                    <Rect
                      fill={color}
                      fillOpacity={0.68}
                      height={bodyHeight}
                      rx={1.5}
                      width={miniCandleWidth}
                      x={centerX - miniCandleWidth / 2}
                      y={top}
                    />
                  </G>
                );
              })}
              <Rect
                fill={theme.background}
                fillOpacity={0.38}
                height={rangeSelectorHeight - 4}
                rx={6}
                stroke={theme.axis}
                strokeWidth={1.3}
                width={rangeBrushWidth}
                x={rangeBrushX}
                y={rangeFrame.top + 2}
              />
              {[rangeBrushX, rangeBrushEndX].map((handleX) => (
                <G key={`range-handle-${handleX}`}>
                  <Rect
                    fill={theme.tooltip.background}
                    height={rangeSelectorHeight - 16}
                    rx={5}
                    stroke={theme.tooltip.border}
                    strokeWidth={1}
                    width={10}
                    x={handleX - 5}
                    y={rangeFrame.top + 8}
                  />
                  <Line
                    stroke={theme.text}
                    strokeLinecap="round"
                    strokeOpacity={0.86}
                    strokeWidth={1.4}
                    x1={handleX - 1.8}
                    x2={handleX - 1.8}
                    y1={rangeFrame.top + 18}
                    y2={rangeFrame.bottom - 18}
                  />
                  <Line
                    stroke={theme.text}
                    strokeLinecap="round"
                    strokeOpacity={0.86}
                    strokeWidth={1.4}
                    x1={handleX + 1.8}
                    x2={handleX + 1.8}
                    y1={rangeFrame.top + 18}
                    y2={rangeFrame.bottom - 18}
                  />
                </G>
              ))}
            </G>
          ) : null}
        </Svg>
      </View>
      <Text style={captionStyle(theme)}>{caption}</Text>
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
    { label: "Current", valueKey: "current" },
    { label: "Target", valueKey: "target" }
  ] as RadarSeries[],
  width
}: RadarChartProps<TData>) => {
  const theme = useResolvedProChartTheme();
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
          fill={theme.background}
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
                fill={index === selectedIndex ? theme.text : theme.mutedText}
                fontSize={theme.typography.axisLabelSize}
                fontWeight={index === selectedIndex ? "800" : "650"}
                textAnchor="middle"
                x={labelPoint.x}
                y={labelPoint.y + 4}
                {...getFontFamilyProps(theme)}
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
                fill={item.color ?? getSeriesColor(theme, seriesIndex)}
                fillOpacity={seriesIndex === 0 ? 0.2 : 0.1}
                points={pathPoints}
                stroke={item.color ?? getSeriesColor(theme, seriesIndex)}
                strokeWidth={seriesIndex === 0 ? 2.5 : 1.8}
              />
              {points.map((point, index) => (
                <Circle
                  key={`${String(item.valueKey)}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  fill={item.color ?? getSeriesColor(theme, seriesIndex)}
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
          {...getFontFamilyProps(theme)}
        >
          {toLabel(data[selectedIndex]?.[categoryKey])}
        </SvgText>
      </Svg>
      <Text style={captionStyle(theme)}>Tap an axis to focus a KPI</Text>
    </View>
  );
};

export const ComboChart = <TData extends ChartDatum>({
  data,
  defaultSelectedIndex,
  height,
  series = [
    { label: "Revenue", type: "bar", yKey: "revenue" },
    { label: "Forecast", type: "line", yKey: "forecast" }
  ] as ComboSeries[],
  width,
  xKey = "month"
}: ComboChartProps<TData>) => {
  const theme = useResolvedProChartTheme();
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
  const tooltipTitle = selected ? toLabel(selected[xKey]) : "";
  const tooltipRows = selected
    ? series.slice(0, 3).map((item) => ({
        label: item.label ?? String(item.yKey),
        value: String(toNumber(selected[item.yKey]))
      }))
    : [];
  const tooltipMaxWidth = Math.max(112, width - 16);
  const tooltipLabelWidth = Math.max(
    0,
    ...tooltipRows.map((row) =>
      estimateSvgTextWidth(row.label, theme.tooltip.labelFontSize)
    )
  );
  const tooltipValueWidth = Math.max(
    0,
    ...tooltipRows.map((row) =>
      estimateSvgTextWidth(row.value, theme.tooltip.labelFontSize)
    )
  );
  const tooltipContentWidth = Math.max(
    estimateSvgTextWidth(tooltipTitle, 11),
    tooltipLabelWidth + tooltipValueWidth + 28
  );
  const tooltipWidth = Math.min(
    tooltipMaxWidth,
    Math.max(128, tooltipContentWidth + 20)
  );
  const tooltipHeight = 26 + tooltipRows.length * 15;
  const tooltipX = clampValue(
    frame.left + selectedIndex * step + step / 2 - tooltipWidth / 2,
    8,
    width - tooltipWidth - 8
  );
  const tooltipTextX = tooltipX + 10;
  const tooltipValueX = tooltipX + tooltipWidth - 10;
  const tooltipLabelMaxWidth = Math.max(
    40,
    tooltipWidth - tooltipValueWidth - 30
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
          fill={theme.background}
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
                    fill={item.color ?? getSeriesColor(theme, barIndex)}
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
                fill={index === selectedIndex ? theme.text : theme.mutedText}
                fontSize={theme.typography.axisLabelSize}
                fontWeight={index === selectedIndex ? "800" : "600"}
                textAnchor="middle"
                x={x}
                y={height - 14}
                {...getFontFamilyProps(theme)}
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
              stroke={
                item.color ?? getSeriesColor(theme, barSeries.length + index)
              }
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
            />
            {points.map((point, pointIndex) => (
              <Circle
                key={`${String(item.yKey)}-${pointIndex}`}
                cx={point.x}
                cy={point.y}
                fill={
                  item.color ?? getSeriesColor(theme, barSeries.length + index)
                }
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
              fill={theme.tooltip.background}
              height={tooltipHeight}
              rx={7}
              stroke={theme.tooltip.border}
              width={tooltipWidth}
              x={tooltipX}
              y={12}
            />
            <SvgText
              fill={theme.tooltip.text}
              fontSize={11}
              fontWeight="800"
              x={tooltipTextX}
              y={29}
              {...getFontFamilyProps(theme)}
            >
              {fitSvgLabel(tooltipTitle, tooltipWidth - 20, 11)}
            </SvgText>
            {tooltipRows.map((row, index) => (
              <G key={row.label}>
                <SvgText
                  fill={theme.tooltip.mutedText}
                  fontSize={theme.tooltip.labelFontSize}
                  fontWeight="600"
                  x={tooltipTextX}
                  y={44 + index * 15}
                  {...getFontFamilyProps(theme)}
                >
                  {fitSvgLabel(
                    row.label,
                    tooltipLabelMaxWidth,
                    theme.tooltip.labelFontSize
                  )}
                </SvgText>
                <SvgText
                  fill={theme.tooltip.text}
                  fontSize={theme.tooltip.labelFontSize}
                  fontWeight="700"
                  textAnchor="end"
                  x={tooltipValueX}
                  y={44 + index * 15}
                  {...getFontFamilyProps(theme)}
                >
                  {fitSvgLabel(
                    row.value,
                    Math.max(28, tooltipValueWidth),
                    theme.tooltip.labelFontSize
                  )}
                </SvgText>
              </G>
            ))}
          </G>
        ) : null}
      </Svg>
      <Text style={captionStyle(theme)}>
        Tap a month to inspect blended series
      </Text>
    </View>
  );
};
