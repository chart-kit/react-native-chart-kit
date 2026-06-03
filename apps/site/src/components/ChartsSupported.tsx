import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import {
  ChartIllustration,
  clamp,
  easeOutCubic,
  easeOutQuart,
  lerp
} from "./ChartsSupportedArtwork";
import type { ChartKind, ThemeMode } from "./ChartsSupportedArtwork";

type ChartType = {
  docsHref?: string;
  kind: ChartKind;
  pro?: boolean;
  title: string;
  subtitle?: string;
};

const docsBaseHref = "/docs/react-native";

const chartTypes: ChartType[] = [
  {
    docsHref: `${docsBaseHref}/charts/line/`,
    kind: "line",
    title: "Line Chart"
  },
  {
    docsHref: `${docsBaseHref}/charts/area/`,
    kind: "area",
    title: "Area Chart"
  },
  { docsHref: `${docsBaseHref}/charts/bar/`, kind: "bar", title: "Bar Chart" },
  {
    docsHref: `${docsBaseHref}/charts/bar/#stacked-bars`,
    kind: "stackedBar",
    title: "Stacked Bar Chart"
  },
  { docsHref: `${docsBaseHref}/charts/pie/`, kind: "pie", title: "Pie Chart" },
  {
    docsHref: `${docsBaseHref}/charts/donut/`,
    kind: "donut",
    title: "Donut Chart"
  },
  {
    docsHref: `${docsBaseHref}/charts/progress/`,
    kind: "progress",
    title: "Progress Circle"
  },
  {
    docsHref: `${docsBaseHref}/charts/contribution-heatmap/`,
    kind: "heatmap",
    title: "Contribution Heatmap"
  },
  {
    docsHref: `${docsBaseHref}/charts/radar/`,
    kind: "radar",
    pro: true,
    title: "Radar Chart"
  },
  {
    docsHref: `${docsBaseHref}/charts/combo/`,
    kind: "combined",
    pro: true,
    title: "Combo Chart"
  },
  {
    docsHref: `${docsBaseHref}/charts/candlebar/`,
    kind: "candlestick",
    pro: true,
    title: "Candlebar Chart"
  },
  { kind: "more", title: "More charts", subtitle: "coming soon" }
];

const getThemeMode = (): ThemeMode =>
  typeof document !== "undefined" &&
  document.documentElement.dataset.theme === "light"
    ? "light"
    : "dark";

const useThemeMode = () => {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const updateMode = () => setMode(getThemeMode());
    const observer = new MutationObserver(updateMode);

    updateMode();
    observer.observe(document.documentElement, {
      attributeFilter: ["data-theme"]
    });

    return () => observer.disconnect();
  }, []);

  return mode;
};

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(mediaQuery.matches);

    updateMotion();
    mediaQuery.addEventListener("change", updateMotion);

    return () => mediaQuery.removeEventListener("change", updateMotion);
  }, []);

  return reducedMotion;
};

const getThemeStyles = (mode: ThemeMode) => {
  const isLight = mode === "light";

  return {
    section: {
      backgroundColor: isLight ? "#ffffff" : "#000000",
      borderColor: isLight
        ? "rgba(0, 0, 0, 0.08)"
        : "rgba(255, 255, 255, 0.08)",
      color: isLight ? "#050505" : "#ffffff"
    },
    copy: {
      color: isLight ? "rgba(0, 0, 0, 0.52)" : "rgba(255, 255, 255, 0.52)"
    },
    label: {
      color: isLight ? "rgba(0, 0, 0, 0.68)" : "rgba(255, 255, 255, 0.72)"
    },
    pro: {
      backgroundColor: isLight
        ? "rgba(0, 0, 0, 0.045)"
        : "rgba(255, 255, 255, 0.075)",
      borderColor: isLight
        ? "rgba(0, 0, 0, 0.12)"
        : "rgba(255, 255, 255, 0.14)",
      color: isLight ? "rgba(0, 0, 0, 0.62)" : "rgba(255, 255, 255, 0.76)"
    },
    separator: {
      background: isLight
        ? "linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.09) 20%, rgba(0, 0, 0, 0.09) 80%, transparent)"
        : "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.11) 20%, rgba(255, 255, 255, 0.11) 80%, transparent)"
    },
    separatorHorizontal: {
      background: isLight
        ? "linear-gradient(to right, transparent, rgba(0, 0, 0, 0.09) 16%, rgba(0, 0, 0, 0.09) 84%, transparent)"
        : "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.11) 16%, rgba(255, 255, 255, 0.11) 84%, transparent)"
    }
  } satisfies Record<string, CSSProperties>;
};

const useHoverProgress = (
  active: boolean,
  reducedMotion: boolean,
  enterDuration = 620,
  exitDuration = 260
) => {
  const target = active ? 1 : 0;
  const [progress, setProgress] = useState(target);
  const progressRef = useRef(target);

  useEffect(() => {
    if (reducedMotion) {
      progressRef.current = target;
      return;
    }

    const start = progressRef.current;
    const distance = Math.abs(target - start);

    if (distance < 0.001) {
      return;
    }

    const duration = Math.max(
      140,
      (active ? enterDuration : exitDuration) * distance
    );
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = clamp((now - startedAt) / duration);
      const eased = active ? easeOutQuart(elapsed) : easeOutCubic(elapsed);
      const next = lerp(start, target, eased);

      progressRef.current = next;
      setProgress(next);

      if (elapsed < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        progressRef.current = target;
        setProgress(target);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [active, enterDuration, exitDuration, reducedMotion, target]);

  return reducedMotion ? target : progress;
};

const ChartTile = ({
  chart,
  index,
  lastFourColumnRowStart,
  lastTwoColumnRowStart,
  mode,
  reducedMotion,
  theme
}: {
  chart: ChartType;
  index: number;
  lastFourColumnRowStart: number;
  lastTwoColumnRowStart: number;
  mode: ThemeMode;
  reducedMotion: boolean;
  theme: ReturnType<typeof getThemeStyles>;
}) => {
  const [active, setActive] = useState(false);
  const enterDuration = chart.kind === "heatmap" ? 1180 : 620;
  const exitDuration = chart.kind === "heatmap" ? 360 : 260;
  const progress = useHoverProgress(
    active,
    reducedMotion,
    enterDuration,
    exitDuration
  );
  const tileClassName =
    "group relative block min-w-0 text-current no-underline outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white/45 [html[data-theme='light']_&]:focus-visible:outline-black/40";
  const tileEvents = {
    onBlur: () => setActive(false),
    onFocus: () => setActive(true),
    onPointerEnter: () => setActive(true),
    onPointerLeave: () => setActive(false)
  };

  const content = (
    <>
      {index % 2 === 0 && index < chartTypes.length - 1 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-7 right-0 bottom-7 w-px lg:hidden"
          style={theme.separator}
        />
      )}
      {index % 4 !== 3 && index < chartTypes.length - 1 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-8 right-0 bottom-8 hidden w-px lg:block"
          style={theme.separator}
        />
      )}
      {index < lastTwoColumnRowStart && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-6 bottom-0 left-6 h-px lg:hidden"
          style={theme.separatorHorizontal}
        />
      )}
      {index < lastFourColumnRowStart && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-8 bottom-0 left-8 hidden h-px lg:block"
          style={theme.separatorHorizontal}
        />
      )}

      <div className="px-5 py-9 sm:px-8 sm:py-11 lg:px-10 lg:py-12">
        <div className="relative mx-auto h-24 max-w-[168px] text-current sm:h-28 sm:max-w-[188px]">
          {chart.pro && (
            <span
              className="absolute -top-4 right-3 z-10 inline-flex h-[17px] min-w-[34px] items-center justify-center rounded-full border px-[6px] text-[8.5px] font-bold leading-none tracking-[0.12em] uppercase transition-colors duration-300"
              style={theme.pro}
            >
              Pro
            </span>
          )}
          <ChartIllustration
            kind={chart.kind}
            mode={mode}
            progress={progress}
            title={chart.title}
          />
        </div>
        <h3
          className="mt-5 truncate text-center text-xs font-medium tracking-[-0.005em] transition-colors duration-300 sm:text-[13px]"
          style={theme.label}
        >
          {chart.title}
        </h3>
        {chart.subtitle && (
          <p
            className="mt-1 text-center text-[11px] font-medium transition-colors duration-300"
            style={theme.copy}
          >
            {chart.subtitle}
          </p>
        )}
      </div>
    </>
  );

  if (!chart.docsHref) {
    return (
      <article className={tileClassName} {...tileEvents}>
        {content}
      </article>
    );
  }

  return (
    <a
      aria-label={`${chart.title} docs`}
      className={tileClassName}
      href={chart.docsHref}
      {...tileEvents}
    >
      {content}
    </a>
  );
};

export default function ChartsSupported() {
  const mode = useThemeMode();
  const reducedMotion = useReducedMotion();
  const theme = getThemeStyles(mode);
  const lastTwoColumnRowStart =
    chartTypes.length - (chartTypes.length % 2 || 2);
  const lastFourColumnRowStart =
    chartTypes.length - (chartTypes.length % 4 || 4);

  return (
    <section
      id="charts"
      className="scroll-mt-20 py-24 transition-colors duration-300 sm:py-28"
      style={theme.section}
    >
      <div className="mx-auto max-w-[1320px] px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-xl text-center lg:max-w-none">
          <h2 className="text-[clamp(34px,6vw,56px)] font-semibold leading-[1.04] tracking-[-0.025em]">
            Various charts supported
          </h2>
          <p
            className="mx-auto mt-5 max-w-md text-base font-light leading-7 transition-colors duration-300 lg:max-w-none"
            style={theme.copy}
          >
            Types of charts for trends, comparisons, progress, and contribution
            maps.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4">
          {chartTypes.map((chart, index) => (
            <ChartTile
              chart={chart}
              index={index}
              key={chart.kind}
              lastFourColumnRowStart={lastFourColumnRowStart}
              lastTwoColumnRowStart={lastTwoColumnRowStart}
              mode={mode}
              reducedMotion={reducedMotion}
              theme={theme}
            />
          ))}
        </div>

        <div className="mt-7 flex justify-center">
          <a
            href={`${docsBaseHref}/charts/line`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold tracking-[-0.01em] text-white/78 transition-colors hover:border-white/28 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/45 [html[data-theme='light']_&]:border-black/15 [html[data-theme='light']_&]:text-black/70 [html[data-theme='light']_&]:hover:border-black/28 [html[data-theme='light']_&]:hover:text-black [html[data-theme='light']_&]:focus-visible:outline-black/40"
          >
            Read docs
          </a>
        </div>
      </div>
    </section>
  );
}
