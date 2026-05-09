/* eslint-disable react-hooks/refs -- RNGH gesture callbacks store starting scale in refs and read them when the native gesture runs. */
import { useMemo, useRef, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { resolveCartesianChartThemeConfig } from "../../theme/presets";
import { useChartKitTheme } from "../../theme";
import type {
  CartesianChartPresetValue,
  CartesianChartTheme,
  ChartKitThemeMode
} from "../../theme";
import {
  defaultCandlestickPriceScaleMax,
  defaultCandlestickPriceScaleMin,
  defaultCandlestickPriceScaleSensitivity,
  defaultCandlestickPriceScaleTickCount,
  getCandlestickPriceScaleDomain,
  getCandlestickPriceScaleFromDrag,
  getCandlestickPriceScaleTicks,
  type CandlestickPriceDomain
} from "./priceScaleUtils";

export type { CandlestickPriceDomain } from "./priceScaleUtils";
export {
  getCandlestickPriceScaleDomain,
  getCandlestickPriceScaleFromDrag,
  getCandlestickPriceScaleTicks
} from "./priceScaleUtils";

export type CandlestickPriceScaleChangeEvent = {
  domain: [number, number];
  scale: number;
};

export type CandlestickPriceScaleGestureEvent = {
  scale: number;
};

export type CandlestickPriceScaleLabelRenderProps = {
  domain: [number, number];
  formattedValue: string;
  index: number;
  scale: number;
  value: number;
};

export type CandlestickPriceScaleProps = {
  accessibilityLabel?: string;
  baseDomain: CandlestickPriceDomain;
  formatLabel?: (value: number, index: number) => string;
  height: number;
  labelStyle?: StyleProp<TextStyle>;
  maxScale?: number;
  minScale?: number;
  onGestureEnd?: (event: CandlestickPriceScaleGestureEvent) => void;
  onGestureStart?: (event: CandlestickPriceScaleGestureEvent) => void;
  onScaleChange?: (event: CandlestickPriceScaleChangeEvent) => void;
  renderLabel?: (props: CandlestickPriceScaleLabelRenderProps) => ReactNode;
  scale: number;
  scaleLabel?: boolean | ((scale: number) => string);
  sensitivity?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  theme?: ChartKitThemeMode | CartesianChartTheme;
  tickCount?: number;
  width?: number;
  preset?: CartesianChartPresetValue;
};

const defaultWidth = 62;

export const CandlestickPriceScale = ({
  accessibilityLabel = "Price scale",
  baseDomain,
  formatLabel = (value) => `${Math.round(value)}`,
  height,
  labelStyle,
  maxScale = defaultCandlestickPriceScaleMax,
  minScale = defaultCandlestickPriceScaleMin,
  onGestureEnd,
  onGestureStart,
  onScaleChange,
  preset,
  renderLabel,
  scale,
  scaleLabel = true,
  sensitivity = defaultCandlestickPriceScaleSensitivity,
  style,
  testID,
  theme,
  tickCount = defaultCandlestickPriceScaleTickCount,
  width = defaultWidth
}: CandlestickPriceScaleProps) => {
  const chartKitTheme = useChartKitTheme();
  const startScaleRef = useRef(scale);
  const latestScaleRef = useRef(scale);
  const resolvedTheme = useMemo(
    () =>
      resolveCartesianChartThemeConfig({
        mode:
          typeof theme === "string" && theme !== "system"
            ? theme
            : chartKitTheme.mode,
        preset: preset ?? chartKitTheme.preset,
        presets: chartKitTheme.presets,
        theme: typeof theme === "object" ? theme : chartKitTheme.theme
      }),
    [chartKitTheme, preset, theme]
  );
  const domain = useMemo(
    () =>
      getCandlestickPriceScaleDomain({
        baseDomain,
        maxScale,
        minScale,
        scale
      }),
    [baseDomain, maxScale, minScale, scale]
  );
  const ticks = useMemo(
    () => getCandlestickPriceScaleTicks({ domain, tickCount }),
    [domain, tickCount]
  );
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .activeOffsetY([-4, 4])
        .runOnJS(true)
        .onStart(() => {
          startScaleRef.current = scale;
          latestScaleRef.current = scale;
          onGestureStart?.({ scale });
        })
        .onUpdate((event) => {
          const nextScale = getCandlestickPriceScaleFromDrag({
            maxScale,
            minScale,
            sensitivity,
            startScale: startScaleRef.current,
            translationY: event.translationY
          });

          latestScaleRef.current = nextScale;
          onScaleChange?.({
            domain: getCandlestickPriceScaleDomain({
              baseDomain,
              maxScale,
              minScale,
              scale: nextScale
            }),
            scale: nextScale
          });
        })
        .onFinalize(() => {
          onGestureEnd?.({ scale: latestScaleRef.current });
        }),
    [
      baseDomain,
      maxScale,
      minScale,
      onGestureEnd,
      onGestureStart,
      onScaleChange,
      scale,
      sensitivity
    ]
  );
  const scaleLabelText =
    typeof scaleLabel === "function"
      ? scaleLabel(scale)
      : scaleLabel
        ? `${scale.toFixed(2)}x`
        : undefined;

  return (
    <GestureDetector gesture={gesture}>
      <View
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="adjustable"
        style={[
          styles.container,
          {
            backgroundColor: resolvedTheme.plotBackground,
            borderColor: resolvedTheme.grid,
            height,
            width
          },
          style
        ]}
        testID={testID}
      >
        {scaleLabelText ? (
          <Text style={[styles.scaleValue, { color: resolvedTheme.text }]}>
            {scaleLabelText}
          </Text>
        ) : null}
        <View style={styles.tickStack}>
          {ticks.map((tick, index) => {
            const formattedValue = formatLabel(tick, index);
            const labelProps = {
              domain,
              formattedValue,
              index,
              scale,
              value: tick
            };

            return renderLabel ? (
              <View key={`${tick}-${index}`}>{renderLabel(labelProps)}</View>
            ) : (
              <Text
                key={`${tick}-${index}`}
                style={[
                  styles.priceTick,
                  { color: resolvedTheme.mutedText },
                  labelStyle
                ]}
              >
                {formattedValue}
              </Text>
            );
          })}
        </View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  priceTick: {
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
    textAlign: "right"
  },
  scaleValue: {
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right"
  },
  tickStack: {
    flex: 1,
    justifyContent: "space-between",
    marginTop: 12
  }
});
