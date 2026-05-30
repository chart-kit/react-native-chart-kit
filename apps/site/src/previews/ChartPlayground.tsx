import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Text, View } from "react-native";
import {
  LiveContext,
  LiveEditor,
  LiveError,
  LivePreview,
  LiveProvider
} from "react-live";

import {
  AreaChart,
  BarChart,
  ChartKitProvider,
  ContributionGraph,
  createChartPreset,
  DonutChart,
  LineChart,
  PieChart,
  ProgressChart,
  ProgressRing,
  StackedBarChart,
  type ChartKitThemeMode
} from "react-native-chart-kit/v2";
import { G, Line as SvgLine, Rect, Text as SvgText } from "react-native-svg";

import {
  chartThemeChangeEvent,
  getCurrentChartThemePreset,
  type ChartThemePreset
} from "./chartTheme";
import {
  acquisitionShare,
  clampChartWidth,
  contributionEndDate,
  contributionNumDays,
  contributionValues,
  money,
  monthRevenue,
  percent,
  platformShare,
  profit,
  progressRings,
  revenueMix,
  signedMoney,
  signups,
  supportVolume
} from "./data";
import { chartPreviewExamples } from "./registry";
import { showcaseCustomPresets } from "./showcaseTheme";

type LiveEditorTheme = NonNullable<
  React.ComponentProps<typeof LiveProvider>["theme"]
>;

const importStatementPattern =
  /^\s*import(?:[\s\S]*?\sfrom\s+["'][^"']+["']|(?:\s+type)?\s+["'][^"']+["']);?\s*/gm;

const explicitThemePattern =
  /\b(?:ChartKitProvider|createChartPreset)\b|\b(?:preset|theme)\s*=/;

const explicitPalettePattern = /\b(?:colorKey|colors)\s*=|\bcolor\s*:/;

const chartKitLightEditorTheme: LiveEditorTheme = {
  plain: {
    backgroundColor: "transparent",
    color: "#071733"
  },
  styles: [
    {
      types: ["comment", "prolog", "cdata"],
      style: { color: "#64748b", fontStyle: "italic" }
    },
    {
      types: ["punctuation", "operator"],
      style: { color: "#334155" }
    },
    {
      types: ["keyword", "boolean", "constant"],
      style: { color: "#7e22ce", fontWeight: "700" }
    },
    {
      types: ["string", "char", "attr-value", "regex"],
      style: { color: "#047857" }
    },
    {
      types: ["number", "builtin", "class-name"],
      style: { color: "#b45309" }
    },
    {
      types: ["function", "method"],
      style: { color: "#1d4ed8" }
    },
    {
      types: ["tag", "selector", "property", "symbol"],
      style: { color: "#be123c" }
    },
    {
      types: ["attr-name", "variable"],
      style: { color: "#0f766e" }
    }
  ]
};

const getThemeMode = (): Exclude<ChartKitThemeMode, "system"> =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

const getComponentName = (code: string) => {
  const declaration =
    code.match(/\bexport\s+default\s+function\s+([A-Z][\w]*)/) ??
    code.match(/\bexport\s+function\s+([A-Z][\w]*)/) ??
    code.match(/\bfunction\s+([A-Z][\w]*)/) ??
    code.match(/\bexport\s+const\s+([A-Z][\w]*)\s*=/) ??
    code.match(/\bconst\s+([A-Z][\w]*)\s*=/);

  return declaration?.[1];
};

const getStatementStyleLiveCode = (code: string) => {
  const lines = code.split("\n");
  const firstJsxLineIndex = lines.findIndex((line) =>
    /^\s*<[A-Z][\w.]*/.test(line)
  );

  if (firstJsxLineIndex === -1) {
    return undefined;
  }

  const setupCode = lines.slice(0, firstJsxLineIndex).join("\n").trim();
  const jsxCode = lines
    .slice(firstJsxLineIndex)
    .join("\n")
    .trim()
    .replace(/(\/>|<\/[A-Z][\w.]*>);/g, "$1");

  return `function ChartKitLiveExample() {
${setupCode ? `${setupCode}\n\n` : ""}return (
  <>
${jsxCode}
  </>
);
}

render(<ChartKitLiveExample />);`;
};

const prepareLiveCode = (code: string) => {
  const componentName = getComponentName(code);
  const runnableCode = code
    .replace(importStatementPattern, "")
    .replace(/\bexport\s+default\s+function\s+/g, "function ")
    .replace(/\bexport\s+function\s+/g, "function ")
    .replace(/\bexport\s+const\s+/g, "const ")
    .replace(/\bexport\s+default\s+/g, "")
    .trim();

  if (/render\s*\(/.test(runnableCode)) {
    return `(() => {\n${runnableCode}\n})();`;
  }

  if (componentName) {
    return `(() => {\n${runnableCode}\n\nrender(<${componentName} />);\n})();`;
  }

  const statementStyleLiveCode = getStatementStyleLiveCode(runnableCode);

  if (statementStyleLiveCode) {
    return `(() => {\n${statementStyleLiveCode}\n})();`;
  }

  return `(() => {\nrender(${runnableCode});\n})();`;
};

const decodeInitialCode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const DEFAULT_EDITOR_SIZE = 50;
const MIN_EDITOR_SIZE = 30;
const MAX_EDITOR_SIZE = 70;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const barPlaygroundData = signups.map((row) => ({
  ...row,
  newCustomers: row.signups,
  organic: row.organic,
  paid: row.paid,
  spend: row.signups,
  week: row.month
}));

const linePlaygroundData = monthRevenue.map((row, index) => {
  const barRow = barPlaygroundData[index % barPlaygroundData.length];

  return {
    ...row,
    actual: row.revenue,
    attainment: row.retention,
    benchmark: row.forecast,
    date: row.month,
    expansion: barRow.expansion,
    newCustomers: barRow.newCustomers,
    organic: barRow.organic,
    paid: barRow.paid,
    portfolio: row.revenue,
    price: row.revenue,
    signups: barRow.signups,
    spend: barRow.spend,
    timestamp: index + 1,
    week: barRow.week
  };
});

const revenueMixPlaygroundData = revenueMix.map((row) => ({
  ...row,
  plan: row.label,
  revenue: row.value
}));

const acquisitionSharePlaygroundData = acquisitionShare.map((row) => ({
  ...row,
  share: row.value
}));

const weeklySpend = [
  18, 52, 26, 74, 31, 88, 43, 96, 39, 108, 57, 121, 44, 132
].map((spend, index) => ({
  spend,
  week: `W${index + 1}`
}));

const weeklyAcquisition = weeklySpend.map((row, index) => ({
  ...row,
  organic: [28, 74, 39, 96, 54, 118, 63, 132, 71, 148, 84, 156, 92, 171][
    index
  ]!,
  paid: [62, 34, 88, 41, 103, 58, 117, 49, 126, 66, 139, 73, 144, 81][index]!
}));

const portfolioHistory = Array.from({ length: 120 }, (_, index) => {
  const portfolio = 62000 + index * 780 + Math.sin(index / 2.1) * 15000;
  const benchmark = 98000 - index * 170 + Math.cos(index / 2.8) * 12000;

  return {
    benchmark,
    date: `Day ${index + 1}`,
    month: `Day ${index + 1}`,
    portfolio,
    price: portfolio,
    timestamp: index + 1
  };
});

const largeData = portfolioHistory.map((row, index) => ({
  ...row,
  price:
    120 + index * 1.2 + Math.sin(index / 1.7) * 38 + Math.cos(index / 5) * 22
}));

const retentionSegments = [
  { accounts: 124, color: "#00163f", status: "Active" },
  { accounts: 46, color: "#2f5f9f", status: "At risk" },
  { accounts: 18, color: "#6f88aa", status: "Paused" }
];

const previewDataById: Record<string, unknown[]> = {
  "bar-grouped": barPlaygroundData,
  "line-multi-series": linePlaygroundData,
  "line-selection": linePlaygroundData
};

const getPreviewData = (id: string) =>
  previewDataById[id] ?? linePlaygroundData;

const writeClipboard = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

const TypeScriptLogo = () => (
  <svg
    aria-hidden="true"
    className="chart-kit-playground__ts-logo"
    focusable="false"
    viewBox="0 0 512 512"
  >
    <rect fill="#3178c6" height="512" rx="50" width="512" />
    <path
      clipRule="evenodd"
      d="m316.939 407.424v50.061c8.138 4.172 17.763 7.3 28.875 9.386s22.823 3.129 35.135 3.129c11.999 0 23.397-1.147 34.196-3.442 10.799-2.294 20.268-6.075 28.406-11.342 8.138-5.266 14.581-12.15 19.328-20.65s7.121-19.007 7.121-31.522c0-9.074-1.356-17.026-4.069-23.857s-6.625-12.906-11.738-18.225c-5.112-5.319-11.242-10.091-18.389-14.315s-15.207-8.213-24.18-11.967c-6.573-2.712-12.468-5.345-17.685-7.9-5.217-2.556-9.651-5.163-13.303-7.822-3.652-2.66-6.469-5.476-8.451-8.448-1.982-2.973-2.974-6.336-2.974-10.091 0-3.441.887-6.544 2.661-9.308s4.278-5.136 7.512-7.118c3.235-1.981 7.199-3.52 11.894-4.615 4.696-1.095 9.912-1.642 15.651-1.642 4.173 0 8.581.313 13.224.938 4.643.626 9.312 1.591 14.008 2.894 4.695 1.304 9.259 2.947 13.694 4.928 4.434 1.982 8.529 4.276 12.285 6.884v-46.776c-7.616-2.92-15.937-5.084-24.962-6.492s-19.381-2.112-31.066-2.112c-11.895 0-23.163 1.278-33.805 3.833s-20.006 6.544-28.093 11.967c-8.086 5.424-14.476 12.333-19.171 20.729-4.695 8.395-7.043 18.433-7.043 30.114 0 14.914 4.304 27.638 12.912 38.172 8.607 10.533 21.675 19.45 39.204 26.751 6.886 2.816 13.303 5.579 19.25 8.291s11.086 5.528 15.415 8.448c4.33 2.92 7.747 6.101 10.252 9.543 2.504 3.441 3.756 7.352 3.756 11.733 0 3.233-.783 6.231-2.348 8.995s-3.939 5.162-7.121 7.196-7.147 3.624-11.894 4.771c-4.748 1.148-10.303 1.721-16.668 1.721-10.851 0-21.597-1.903-32.24-5.71-10.642-3.806-20.502-9.516-29.579-17.13zm-84.159-123.342h64.22v-41.082h-179v41.082h63.906v182.918h50.874z"
      fill="#fff"
      fillRule="evenodd"
    />
  </svg>
);

const CopyIcon = () => (
  <svg
    aria-hidden="true"
    className="chart-kit-playground__copy-icon"
    focusable="false"
    viewBox="0 0 24 24"
  >
    <path d="M8 8.5c0-1.1.9-2 2-2h7.5c1.1 0 2 .9 2 2V16c0 1.1-.9 2-2 2H10c-1.1 0-2-.9-2-2V8.5Z" />
    <path d="M5.5 15.5h-.2c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h7.5c1.1 0 2 .9 2 2v.2" />
  </svg>
);

const CheckIcon = () => (
  <svg
    aria-hidden="true"
    className="chart-kit-playground__copy-icon"
    focusable="false"
    viewBox="0 0 24 24"
  >
    <path d="m20 6-11 11-5-5" />
  </svg>
);

const CodePaneHeader = ({ codeToCopy }: { codeToCopy: string }) => {
  const [copied, setCopied] = useState(false);
  const copiedResetRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (copiedResetRef.current) {
        window.clearTimeout(copiedResetRef.current);
      }
    },
    []
  );

  const copyCode = useCallback(async () => {
    await writeClipboard(codeToCopy).catch(() => undefined);
    setCopied(true);

    if (copiedResetRef.current) {
      window.clearTimeout(copiedResetRef.current);
    }

    copiedResetRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }, [codeToCopy]);

  return (
    <div className="chart-kit-playground__pane-header">
      <span className="chart-kit-playground__language-label">
        <TypeScriptLogo />
        <span>TypeScript</span>
      </span>
      <button
        aria-label={copied ? "Code copied to clipboard" : "Copy code"}
        className="chart-kit-playground__copy-button"
        data-copied={copied || undefined}
        onClick={() => {
          void copyCode();
        }}
        type="button"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span className="chart-kit-playground__copy-tooltip" role="status">
          {copied ? "Copied!" : "Copy to clipboard"}
        </span>
      </button>
    </div>
  );
};

const LiveCodeEditor = ({
  onCodeChange
}: {
  onCodeChange: (value: string) => void;
}) => {
  const { onChange } = useContext(LiveContext);

  return (
    <LiveEditor
      className="chart-kit-playground__editor"
      onChange={(value) => {
        onCodeChange(value);
        onChange(value);
      }}
      tabMode="indentation"
    />
  );
};

export const ChartPlayground = ({ code, id }: { code: string; id: string }) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const previewPaneRef = useRef<HTMLElement | null>(null);
  const [chartThemePreset, setChartThemePreset] = useState<ChartThemePreset>(
    () => getCurrentChartThemePreset()
  );
  const [mode, setMode] = useState<Exclude<ChartKitThemeMode, "system">>(() =>
    getThemeMode()
  );
  const [editorSize, setEditorSize] = useState(DEFAULT_EDITOR_SIZE);
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(420);
  const initialCode = useMemo(() => decodeInitialCode(code), [code]);
  const [currentCode, setCurrentCode] = useState(() => initialCode);
  const example = chartPreviewExamples[id];
  const supportsGlobalChartTheme = useMemo(
    () =>
      !explicitThemePattern.test(initialCode) &&
      !explicitPalettePattern.test(initialCode),
    [initialCode]
  );

  useEffect(() => {
    const previewPane = previewPaneRef.current;

    if (!previewPane) {
      return;
    }

    const resize = () => {
      setWidth(Math.max(280, Math.floor(previewPane.clientWidth - 32)));
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(previewPane);
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

  const scope = useMemo(
    () => ({
      AreaChart,
      BarChart,
      ContributionGraph,
      ChartKitProvider,
      DonutChart,
      G,
      LineChart,
      PieChart,
      ProgressChart,
      ProgressRing,
      React,
      Rect,
      StackedBarChart,
      SvgText,
      Text,
      View,
      acquisitionShare: acquisitionSharePlaygroundData,
      clampChartWidth,
      contributionValues,
      contributionEndDate,
      contributionNumDays,
      chartThemePreset,
      createChartPreset,
      data: getPreviewData(id),
      largeData,
      money,
      monthRevenue,
      percent,
      plans: revenueMixPlaygroundData,
      platformShare,
      portfolioHistory,
      previewWidth: clampChartWidth(width),
      profit,
      progressRings,
      revenueMix: revenueMixPlaygroundData,
      retentionSegments,
      signedMoney,
      signups,
      setHeaderValue: () => undefined,
      setSelectedChannel: () => undefined,
      setSelectedDay: () => undefined,
      setViewport: () => undefined,
      supportVolume,
      SvgLine,
      Line: SvgLine,
      usageDays: contributionValues,
      useState: React.useState,
      values: contributionValues,
      viewport: { endIndex: 90, startIndex: 40 },
      weeklyAcquisition,
      weeklySpend
    }),
    [chartThemePreset, id, width]
  );

  const playgroundStyle = useMemo(
    () =>
      ({
        "--chart-kit-editor-size": `${editorSize}%`
      }) as React.CSSProperties,
    [editorSize]
  );

  const resizeFromClientX = useCallback((clientX: number) => {
    const grid = gridRef.current;

    if (!grid) {
      return;
    }

    const rect = grid.getBoundingClientRect();
    const nextSize = ((clientX - rect.left) / rect.width) * 100;
    setEditorSize(clamp(nextSize, MIN_EDITOR_SIZE, MAX_EDITOR_SIZE));
  }, []);

  const adjustEditorSize = useCallback((delta: number) => {
    setEditorSize((size) =>
      clamp(size + delta, MIN_EDITOR_SIZE, MAX_EDITOR_SIZE)
    );
  }, []);

  const previewPreset = supportsGlobalChartTheme ? chartThemePreset : "default";

  return (
    <div
      className="chart-kit-playground__frame not-content"
      data-resizing={isResizing || undefined}
      ref={frameRef}
    >
      <LiveProvider
        code={initialCode}
        enableTypeScript
        language="tsx"
        noInline
        scope={scope}
        theme={mode === "light" ? chartKitLightEditorTheme : undefined}
        transformCode={prepareLiveCode}
      >
        <div
          className="chart-kit-playground__grid"
          ref={gridRef}
          style={playgroundStyle}
        >
          <section
            aria-label="Editable example code"
            className="chart-kit-playground__editor-pane"
          >
            <CodePaneHeader codeToCopy={currentCode} />
            <LiveCodeEditor onCodeChange={setCurrentCode} />
          </section>

          <button
            aria-label="Resize code and preview panels"
            aria-orientation="vertical"
            aria-valuemax={MAX_EDITOR_SIZE}
            aria-valuemin={MIN_EDITOR_SIZE}
            aria-valuenow={Math.round(editorSize)}
            aria-valuetext={`${Math.round(editorSize)}% code, ${Math.round(
              100 - editorSize
            )}% preview`}
            className="chart-kit-playground__resize-handle"
            onDoubleClick={() => setEditorSize(DEFAULT_EDITOR_SIZE)}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 8 : 4;

              if (event.key === "ArrowLeft") {
                event.preventDefault();
                adjustEditorSize(-step);
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                adjustEditorSize(step);
              } else if (event.key === "Home") {
                event.preventDefault();
                setEditorSize(MIN_EDITOR_SIZE);
              } else if (event.key === "End") {
                event.preventDefault();
                setEditorSize(MAX_EDITOR_SIZE);
              }
            }}
            onLostPointerCapture={() => setIsResizing(false)}
            onPointerCancel={() => setIsResizing(false)}
            onPointerDown={(event) => {
              if (event.button !== 0) {
                return;
              }

              event.currentTarget.setPointerCapture(event.pointerId);
              event.preventDefault();
              setIsResizing(true);
              resizeFromClientX(event.clientX);
            }}
            onPointerMove={(event) => {
              if (!isResizing) {
                return;
              }

              event.preventDefault();
              resizeFromClientX(event.clientX);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }

              setIsResizing(false);
            }}
            role="separator"
            type="button"
          />

          <section
            aria-label="Live chart preview"
            className="chart-kit-playground__preview-pane"
            ref={previewPaneRef}
          >
            <div className="chart-kit-playground__pane-header">
              <span>Preview</span>
              {example ? (
                <span className="chart-kit-playground__preview-title">
                  {example.title}
                </span>
              ) : null}
            </div>
            <ChartKitProvider
              mode={mode}
              preset={previewPreset}
              presets={showcaseCustomPresets}
            >
              <LivePreview className="chart-kit-playground__preview-surface" />
            </ChartKitProvider>
            <LiveError className="chart-kit-playground__error" />
          </section>
        </div>
      </LiveProvider>
    </div>
  );
};
