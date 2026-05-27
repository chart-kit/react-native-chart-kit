import React, { useEffect, useMemo, useRef, useState } from "react";

import { renderChartPreview } from "./examples";

const getThemeMode = (): "dark" | "light" =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

export const ChartPreview = ({ id }: { id: string }) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<"dark" | "light">(() => getThemeMode());
  const [width, setWidth] = useState(460);

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const resize = () => {
      setWidth(Math.max(280, Math.floor(frame.clientWidth - 36)));
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

  const preview = useMemo(
    () => renderChartPreview({ id, mode, width }),
    [id, mode, width]
  );

  return (
    <div className="chart-kit-live-preview__frame" ref={frameRef}>
      {preview}
    </div>
  );
};
