import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  chartThemeChangeEvent,
  getCurrentChartThemePreset,
  type ChartThemePreset
} from "./chartTheme";
import { chartPreviewChartWidth, chartPreviewPaddingX } from "./data";
import { renderChartPreview } from "./examples";

const getThemeMode = (): "dark" | "light" =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

export const ChartPreview = ({ id }: { id: string }) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [chartThemePreset, setChartThemePreset] = useState<ChartThemePreset>(
    () => getCurrentChartThemePreset()
  );
  const [mode, setMode] = useState<"dark" | "light">(() => getThemeMode());
  const [width, setWidth] = useState(chartPreviewChartWidth);

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const resize = () => {
      setWidth(
        Math.max(280, Math.floor(frame.clientWidth - chartPreviewPaddingX * 2))
      );
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);
    resize();

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const updateMode = () => setMode(getThemeMode());
    const themeObserver = new MutationObserver(updateMode);
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["data-theme"]
    });
    updateMode();

    return () => themeObserver.disconnect();
  }, []);

  useEffect(() => {
    const updateChartThemePreset = () =>
      setChartThemePreset(getCurrentChartThemePreset());
    const chartThemeObserver = new MutationObserver(updateChartThemePreset);
    chartThemeObserver.observe(document.documentElement, {
      attributeFilter: ["data-chart-theme"]
    });

    window.addEventListener(chartThemeChangeEvent, updateChartThemePreset);
    updateChartThemePreset();

    return () => {
      chartThemeObserver.disconnect();
      window.removeEventListener(chartThemeChangeEvent, updateChartThemePreset);
    };
  }, []);

  const preview = useMemo(
    () => renderChartPreview({ chartThemePreset, id, mode, width }),
    [chartThemePreset, id, mode, width]
  );

  return (
    <div className="chart-kit-live-preview__frame" ref={frameRef}>
      {preview}
    </div>
  );
};
