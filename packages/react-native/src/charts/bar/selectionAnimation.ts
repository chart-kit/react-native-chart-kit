import { useEffect, useRef, useState } from "react";

import type { BarChartSelectionAnimationConfig } from "./types";

const defaultSelectionAnimationDuration = 180;
const dimmedBarOpacity = 0.54;
const defaultGridStrokeOpacity = 0.78;
const selectedGridStrokeOpacity = 0;
const selectedStrokeOpacity = 0.32;

export type ResolvedBarChartSelectionAnimationConfig = {
  enabled: boolean;
  duration: number;
};

export type BarChartSelectionAnimationState = {
  fromKey: string | undefined;
  toKey: string | undefined;
  progress: number;
};

export const resolveBarChartSelectionAnimationConfig = (
  animation: boolean | BarChartSelectionAnimationConfig | undefined
): ResolvedBarChartSelectionAnimationConfig => {
  if (animation === false) {
    return { enabled: false, duration: 0 };
  }

  const config = typeof animation === "object" ? animation : {};
  const duration =
    typeof config.duration === "number" && Number.isFinite(config.duration)
      ? Math.max(0, config.duration)
      : defaultSelectionAnimationDuration;

  return {
    enabled: true,
    duration
  };
};

const easeOutCubic = (progress: number) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return 1 - Math.pow(1 - clampedProgress, 3);
};

const interpolate = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

type RgbColor = {
  b: number;
  g: number;
  r: number;
};

const parseHexColor = (color: string): RgbColor | undefined => {
  const normalized = color.trim();
  const hex = normalized.startsWith("#") ? normalized.slice(1) : "";

  if (!/^[\da-f]+$/i.test(hex)) {
    return undefined;
  }

  if (hex.length === 3 || hex.length === 4) {
    const [r, g, b] = hex.split("");

    if (!r || !g || !b) {
      return undefined;
    }

    return {
      b: Number.parseInt(`${b}${b}`, 16),
      g: Number.parseInt(`${g}${g}`, 16),
      r: Number.parseInt(`${r}${r}`, 16)
    };
  }

  if (hex.length === 6 || hex.length === 8) {
    return {
      b: Number.parseInt(hex.slice(4, 6), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      r: Number.parseInt(hex.slice(0, 2), 16)
    };
  }

  return undefined;
};

const parseRgbColor = (color: string): RgbColor | undefined => {
  const match = color
    .trim()
    .match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);

  if (!match) {
    return undefined;
  }

  return {
    b: Number(match[3]),
    g: Number(match[2]),
    r: Number(match[1])
  };
};

const parseColor = (color: string): RgbColor | undefined =>
  parseHexColor(color) ?? parseRgbColor(color);

const clampChannel = (channel: number) =>
  Math.max(0, Math.min(255, Math.round(channel)));

const toHexChannel = (channel: number) =>
  clampChannel(channel).toString(16).padStart(2, "0");

const blendOpaqueColor = ({
  backgroundColor,
  color,
  opacity
}: {
  backgroundColor: string;
  color: string;
  opacity: number;
}) => {
  const foreground = parseColor(color);
  const background = parseColor(backgroundColor);

  if (!foreground || !background) {
    return color;
  }

  const clampedOpacity = Math.max(0, Math.min(1, opacity));

  return `#${toHexChannel(
    foreground.r * clampedOpacity + background.r * (1 - clampedOpacity)
  )}${toHexChannel(
    foreground.g * clampedOpacity + background.g * (1 - clampedOpacity)
  )}${toHexChannel(
    foreground.b * clampedOpacity + background.b * (1 - clampedOpacity)
  )}`;
};

const getOpacityForSelectionKey = ({
  barKey,
  selectedKey
}: {
  barKey: string;
  selectedKey: string | undefined;
}) =>
  selectedKey === undefined || selectedKey === barKey ? 1 : dimmedBarOpacity;

const getStrokeOpacityForSelectionKey = ({
  barKey,
  selectedKey
}: {
  barKey: string;
  selectedKey: string | undefined;
}) => (selectedKey === barKey ? selectedStrokeOpacity : 0);

export const getAnimatedBarSelectionOpacity = ({
  barKey,
  state
}: {
  barKey: string;
  state: BarChartSelectionAnimationState;
}) =>
  interpolate(
    getOpacityForSelectionKey({ barKey, selectedKey: state.fromKey }),
    getOpacityForSelectionKey({ barKey, selectedKey: state.toKey }),
    state.progress
  );

export const getAnimatedBarSelectionFill = ({
  backgroundColor,
  barKey,
  color,
  state
}: {
  backgroundColor: string;
  barKey: string;
  color: string;
  state: BarChartSelectionAnimationState;
}) => {
  const opacity = getAnimatedBarSelectionOpacity({ barKey, state });

  return opacity >= 0.999
    ? color
    : blendOpaqueColor({ backgroundColor, color, opacity });
};

export const getAnimatedBarSelectionStrokeOpacity = ({
  barKey,
  state
}: {
  barKey: string;
  state: BarChartSelectionAnimationState;
}) =>
  interpolate(
    getStrokeOpacityForSelectionKey({ barKey, selectedKey: state.fromKey }),
    getStrokeOpacityForSelectionKey({ barKey, selectedKey: state.toKey }),
    state.progress
  );

export const getAnimatedBarSelectionGridOpacity = ({
  state
}: {
  state: BarChartSelectionAnimationState;
}) => {
  if (state.fromKey !== undefined || state.toKey !== undefined) {
    return selectedGridStrokeOpacity;
  }

  return defaultGridStrokeOpacity;
};

export const useBarChartSelectionAnimation = ({
  animation,
  selectedBarKey
}: {
  animation: boolean | BarChartSelectionAnimationConfig | undefined;
  selectedBarKey: string | undefined;
}): BarChartSelectionAnimationState => {
  const config = resolveBarChartSelectionAnimationConfig(animation);
  const previousTargetRef = useRef(selectedBarKey);
  const [state, setState] = useState<BarChartSelectionAnimationState>({
    fromKey: selectedBarKey,
    toKey: selectedBarKey,
    progress: 1
  });

  useEffect(() => {
    const fromKey = previousTargetRef.current;

    if (fromKey === selectedBarKey) {
      return undefined;
    }

    previousTargetRef.current = selectedBarKey;

    if (!config.enabled || config.duration <= 0) {
      const animationFrame = requestAnimationFrame(() => {
        setState({
          fromKey: selectedBarKey,
          toKey: selectedBarKey,
          progress: 1
        });
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    let animationFrame = 0;
    let startTime: number | undefined;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;

      const rawProgress = Math.min(
        (timestamp - startTime) / config.duration,
        1
      );
      const progress = easeOutCubic(rawProgress);

      setState({
        fromKey,
        toKey: selectedBarKey,
        progress
      });

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame((timestamp) => {
      setState({ fromKey, toKey: selectedBarKey, progress: 0 });
      tick(timestamp);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [config.duration, config.enabled, selectedBarKey]);

  return state;
};
