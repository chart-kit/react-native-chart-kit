import type { ReactNode } from "react";

export type ChartKind =
  | "line"
  | "area"
  | "bar"
  | "stackedBar"
  | "pie"
  | "donut"
  | "progress"
  | "heatmap"
  | "radar"
  | "combined"
  | "candlestick"
  | "more";

export type ThemeMode = "dark" | "light";

type ChartArtworkProps = {
  kind: ChartKind;
  mode: ThemeMode;
  progress: number;
  title: string;
};

const barsA = [44, 58, 76, 64, 92, 118];
const barsB = [58, 46, 94, 74, 108, 86];
const stackedA = [
  [38, 28, 18],
  [48, 34, 24],
  [30, 42, 26],
  [64, 30, 20],
  [42, 50, 24]
];
const stackedB = [
  [46, 23, 24],
  [40, 42, 18],
  [34, 34, 34],
  [56, 38, 24],
  [50, 42, 30]
];
const heatmapHot = new Set([2, 6, 10, 13, 17, 24, 26, 31, 37, 41]);
const heatmapWarm = new Set([4, 8, 15, 20, 27, 33, 38, 44]);
const heatmapActive = new Set([1, 7, 11, 18, 22, 29, 34, 40, 43]);

export const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
export const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;
export const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
export const easeOutQuart = (value: number) => 1 - Math.pow(1 - value, 4);
const numberPattern = /-?\d*\.?\d+/g;

const formatSvgNumber = (value: number) => Number(value.toFixed(2)).toString();

const interpolatePath = (base: string, hover: string, progress: number) => {
  const baseNumbers = base.match(numberPattern)?.map(Number) ?? [];
  const hoverNumbers = hover.match(numberPattern)?.map(Number) ?? [];
  const segments = base.split(numberPattern);

  if (baseNumbers.length !== hoverNumbers.length) {
    return progress > 0.5 ? hover : base;
  }

  return segments
    .map((segment, index) => {
      if (index >= baseNumbers.length) {
        return segment;
      }

      return `${segment}${formatSvgNumber(
        lerp(baseNumbers[index], hoverNumbers[index], progress)
      )}`;
    })
    .join("");
};

const staggerProgress = (progress: number, index: number, step = 0.055) => {
  const delay = index * step;
  return easeOutCubic(clamp((progress - delay) / Math.max(1 - delay, 0.001)));
};

const polarPoint = (angle: number, radius = 48) => {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: 120 + radius * Math.cos(radians),
    y: 75 + radius * Math.sin(radians)
  };
};

const pieSlicePath = (startAngle: number, endAngle: number) => {
  const start = polarPoint(startAngle);
  const end = polarPoint(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    "M120 75",
    `L${formatSvgNumber(start.x)} ${formatSvgNumber(start.y)}`,
    `A48 48 0 ${largeArc} 1 ${formatSvgNumber(end.x)} ${formatSvgNumber(end.y)}`,
    "Z"
  ].join("");
};

const getArtworkFilter = (mode: ThemeMode) =>
  mode === "light"
    ? "drop-shadow(0 16px 24px rgba(0, 0, 0, 0.08))"
    : "drop-shadow(0 16px 24px rgba(255, 255, 255, 0.10))";

const SvgFrame = ({
  children,
  label,
  mode
}: {
  children: ReactNode;
  label: string;
  mode: ThemeMode;
}) => (
  <svg
    className="h-full w-full overflow-visible transition duration-300"
    style={{ filter: getArtworkFilter(mode) }}
    viewBox="0 0 240 150"
    role="img"
    aria-label={label}
  >
    {children}
  </svg>
);

const MorphPath = ({
  base,
  fill,
  hover,
  opacity = 1,
  progress,
  stroke,
  strokeLinecap,
  strokeLinejoin,
  strokeWidth
}: {
  base: string;
  fill: string;
  hover: string;
  opacity?: number;
  progress: number;
  stroke?: string;
  strokeLinecap?: "round";
  strokeLinejoin?: "round";
  strokeWidth?: string;
}) => (
  <path
    d={interpolatePath(base, hover, progress)}
    fill={fill}
    opacity={opacity}
    stroke={stroke}
    strokeLinecap={strokeLinecap}
    strokeLinejoin={strokeLinejoin}
    strokeWidth={strokeWidth}
  />
);

const ChartArtwork = ({ kind, mode, progress, title }: ChartArtworkProps) => {
  const scopedId = (id: string) => `${id}-${kind}`;

  switch (kind) {
    case "line":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <defs>
            <linearGradient
              id={scopedId("chart-line-fade")}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop stopColor="currentColor" stopOpacity="0.42" />
              <stop offset="0.72" stopColor="currentColor" stopOpacity="0.06" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <MorphPath
            base="M28 106C48 82 62 76 78 88C94 100 101 54 122 60C141 65 145 104 166 82C184 63 197 56 214 48V124H28Z"
            fill={`url(#${scopedId("chart-line-fade")})`}
            hover="M28 112C48 62 62 114 78 68C94 22 104 100 122 42C141 11 148 118 166 72C184 26 198 84 214 30V124H28Z"
            progress={progress}
          />
          <MorphPath
            base="M28 106C48 82 62 76 78 88C94 100 101 54 122 60C141 65 145 104 166 82C184 63 197 56 214 48"
            fill="none"
            hover="M28 112C48 62 62 114 78 68C94 22 104 100 122 42C141 11 148 118 166 72C184 26 198 84 214 30"
            progress={progress}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.6"
          />
          <circle
            cx="214"
            cy={lerp(48, 30, progress)}
            r={lerp(4, 4.8, staggerProgress(progress, 2))}
            fill="currentColor"
            opacity="0.95"
          />
        </SvgFrame>
      );
    case "area":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <defs>
            <linearGradient
              id={scopedId("chart-area-fade")}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop stopColor="currentColor" stopOpacity="0.62" />
              <stop offset="0.58" stopColor="currentColor" stopOpacity="0.16" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <MorphPath
            base="M26 110C44 91 58 78 76 72C92 67 100 76 114 57C126 39 138 37 152 64C164 88 176 92 190 72C201 56 210 45 219 34V126H26Z"
            fill={`url(#${scopedId("chart-area-fade")})`}
            hover="M26 116C44 60 58 104 76 55C92 20 100 92 114 38C126 72 139 18 152 48C164 106 176 34 190 92C201 118 210 44 219 24V126H26Z"
            progress={progress}
          />
          <MorphPath
            base="M26 110C44 91 58 78 76 72C92 67 100 76 114 57C126 39 138 37 152 64C164 88 176 92 190 72C201 56 210 45 219 34"
            fill="none"
            hover="M26 116C44 60 58 104 76 55C92 20 100 92 114 38C126 72 139 18 152 48C164 106 176 34 190 92C201 118 210 44 219 24"
            progress={progress}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          />
        </SvgFrame>
      );
    case "bar":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <defs>
            <linearGradient
              id={scopedId("chart-bar-fade")}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop stopColor="currentColor" stopOpacity="0.96" />
              <stop offset="0.58" stopColor="currentColor" stopOpacity="0.34" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <g>
            {barsA.map((baseHeight, index) => {
              const localProgress = staggerProgress(progress, index);
              const height = lerp(baseHeight, barsB[index], localProgress);

              return (
                <rect
                  key={index}
                  x={43 + index * 27}
                  y={124 - height}
                  width="12"
                  height={height}
                  rx="1.5"
                  fill={`url(#${scopedId("chart-bar-fade")})`}
                />
              );
            })}
          </g>
        </SvgFrame>
      );
    case "stackedBar":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <defs>
            <linearGradient
              id={scopedId("chart-stacked-fade")}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop stopColor="currentColor" stopOpacity="1" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <g>
            {stackedA.map((segments, index) => {
              const x = 46 + index * 34;
              let cursor = 124;

              return segments.map((baseHeight, segmentIndex) => {
                const localProgress = staggerProgress(
                  progress,
                  index * 2 + segmentIndex,
                  0.035
                );
                const height = lerp(
                  baseHeight,
                  stackedB[index][segmentIndex],
                  localProgress
                );

                cursor -= height;

                return (
                  <rect
                    key={`${index}-${segmentIndex}`}
                    x={x}
                    y={cursor}
                    width="16"
                    height={Math.max(height - 2, 1)}
                    rx="1.5"
                    fill={`url(#${scopedId("chart-stacked-fade")})`}
                    opacity={[0.28, 0.5, 0.85][segmentIndex]}
                  />
                );
              });
            })}
          </g>
        </SvgFrame>
      );
    case "pie": {
      const firstShare = lerp(0.34, 0.39, progress);
      const secondShare = lerp(0.38, 0.3, progress);
      const firstEnd = firstShare * 360;
      const secondEnd = (firstShare + secondShare) * 360;

      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <defs>
            <clipPath id={scopedId("chart-pie-round-clip")}>
              <circle cx="120" cy="75" r="48" />
            </clipPath>
          </defs>
          <circle cx="120" cy="75" r="48" fill="currentColor" opacity="0.1" />
          <g clipPath={`url(#${scopedId("chart-pie-round-clip")})`}>
            <path
              d={pieSlicePath(0, firstEnd)}
              fill="currentColor"
              opacity="0.9"
            />
            <path
              d={pieSlicePath(firstEnd, secondEnd)}
              fill="currentColor"
              opacity="0.48"
            />
            <path
              d={pieSlicePath(secondEnd, 360)}
              fill="currentColor"
              opacity="0.24"
            />
          </g>
        </SvgFrame>
      );
    }
    case "donut":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <circle
            cx="120"
            cy="75"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            opacity="0.13"
          />
          <g transform={`rotate(${lerp(0, 18, progress)} 120 75)`}>
            <circle
              cx="120"
              cy="75"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${formatSvgNumber(lerp(176, 190, progress))} 290`}
              strokeLinecap="round"
              strokeWidth="16"
              opacity="0.9"
              transform="rotate(-90 120 75)"
            />
            <circle
              cx="120"
              cy="75"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${formatSvgNumber(lerp(54, 72, progress))} 290`}
              strokeLinecap="round"
              strokeWidth="16"
              opacity={lerp(0.34, 0.44, progress)}
              transform="rotate(128 120 75)"
            />
          </g>
        </SvgFrame>
      );
    case "progress":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <circle
            cx="120"
            cy="75"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
            opacity="0.12"
          />
          <circle
            cx="120"
            cy="75"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeDasharray={`${formatSvgNumber(lerp(178, 246, progress))} 302`}
            strokeLinecap="round"
            strokeWidth="9"
            opacity="0.86"
            transform="rotate(-80 120 75)"
          />
        </SvgFrame>
      );
    case "heatmap":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <g>
            {Array.from({ length: 45 }).map((_, index) => {
              const column = index % 9;
              const row = Math.floor(index / 9);
              const x = 50 + column * 16;
              const y = 38 + row * 16;
              const opacity = heatmapHot.has(index)
                ? 0.82
                : heatmapWarm.has(index)
                  ? 0.43
                  : 0.12;
              const activeOpacity = heatmapActive.has(index)
                ? 0.92
                : heatmapHot.has(index)
                  ? 0.36
                  : heatmapWarm.has(index)
                    ? 0.24
                    : opacity;
              const localProgress = staggerProgress(
                progress,
                column + row * 1.35,
                0.032
              );

              return (
                <rect
                  key={index}
                  x={x}
                  y={y}
                  width="12"
                  height="12"
                  rx="1.5"
                  fill="currentColor"
                  opacity={lerp(opacity, activeOpacity, localProgress)}
                />
              );
            })}
          </g>
        </SvgFrame>
      );
    case "radar":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <g
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            opacity={lerp(0.24, 0.3, progress)}
          >
            <path d="M120 27L166 60L148 116H92L74 60Z" />
            <path d="M120 45L148 65L137 99H103L92 65Z" opacity="0.76" />
            <path d="M120 75L120 27" />
            <path d="M120 75L166 60" />
            <path d="M120 75L148 116" />
            <path d="M120 75L92 116" />
            <path d="M120 75L74 60" />
          </g>
          <MorphPath
            base="M120 39L153 66L139 106L98 94L88 62Z"
            fill="currentColor"
            hover="M120 32L160 72L130 111L96 86L82 67Z"
            opacity={0.18}
            progress={progress}
          />
          <MorphPath
            base="M120 39L153 66L139 106L98 94L88 62Z"
            fill="none"
            hover="M120 32L160 72L130 111L96 86L82 67Z"
            opacity={0.82}
            progress={progress}
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2.1"
          />
          {[
            [120, 39, 120, 32],
            [153, 66, 160, 72],
            [139, 106, 130, 111],
            [98, 94, 96, 86],
            [88, 62, 82, 67]
          ].map(([baseX, baseY, hoverX, hoverY], index) => {
            const localProgress = staggerProgress(progress, index, 0.04);

            return (
              <circle
                key={index}
                cx={lerp(baseX, hoverX, localProgress)}
                cy={lerp(baseY, hoverY, localProgress)}
                r={lerp(3, 3.3, localProgress)}
                fill="currentColor"
                opacity="0.9"
              />
            );
          })}
        </SvgFrame>
      );
    case "combined":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <defs>
            <linearGradient
              id={scopedId("chart-combined-fade")}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop stopColor="currentColor" stopOpacity="0.62" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <g opacity="0.58">
            {[46, 72, 54, 86, 68].map((baseHeight, index) => {
              const localProgress = staggerProgress(progress, index, 0.045);
              const height = lerp(
                baseHeight,
                [68, 52, 74, 62, 94][index],
                localProgress
              );

              return (
                <rect
                  key={index}
                  x={52 + index * 30}
                  y={124 - height}
                  width="12"
                  height={height}
                  rx="1.5"
                  fill={`url(#${scopedId("chart-combined-fade")})`}
                />
              );
            })}
          </g>
          <MorphPath
            base="M50 103C68 85 82 92 96 71C111 48 128 58 142 78C158 102 174 72 192 50"
            fill="none"
            hover="M50 94C68 78 82 82 96 91C111 105 128 49 142 56C158 64 174 82 192 40"
            progress={progress}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <circle
            cx="142"
            cy={lerp(78, 56, staggerProgress(progress, 3))}
            r={lerp(3.6, 4.6, progress)}
            fill="currentColor"
          />
        </SvgFrame>
      );
    case "candlestick":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <g
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
            opacity={lerp(0.55, 0.38, progress)}
          >
            {[
              [52, 48, 116, 60, 120],
              [82, 36, 104, 58, 118],
              [112, 56, 126, 42, 116],
              [142, 42, 108, 50, 114],
              [172, 60, 118, 48, 108],
              [202, 34, 94, 62, 112]
            ].map(([x, y1, y2, activeY1, activeY2], index) => {
              const localProgress = staggerProgress(progress, index, 0.035);

              return (
                <path
                  d={`M${x} ${formatSvgNumber(lerp(y1, activeY1, localProgress))}V${formatSvgNumber(lerp(y2, activeY2, localProgress))}`}
                  key={index}
                />
              );
            })}
          </g>
          <g fill="currentColor">
            {[
              [43, 72, 26, 82, 24, 0.34, 0.26],
              [73, 52, 38, 64, 30, 0.9, 0.74],
              [103, 82, 28, 60, 40, 0.34, 0.42],
              [133, 58, 32, 42, 48, 0.9, 0.95],
              [163, 82, 24, 50, 44, 0.34, 0.48],
              [193, 48, 30, 70, 28, 0.9, 0.62]
            ].map(
              (
                [x, y, height, activeY, activeHeight, opacity, activeOpacity],
                index
              ) => {
                const localProgress = staggerProgress(progress, index, 0.04);

                return (
                  <rect
                    key={index}
                    x={x}
                    y={lerp(y, activeY, localProgress)}
                    width="18"
                    height={lerp(height, activeHeight, localProgress)}
                    rx="1.5"
                    opacity={lerp(opacity, activeOpacity, localProgress)}
                  />
                );
              }
            )}
          </g>
        </SvgFrame>
      );
    case "more":
      return (
        <SvgFrame label={`${title} illustration`} mode={mode}>
          <g transform={`rotate(${lerp(0, 24, progress)} 120 75)`}>
            <circle
              cx="120"
              cy="75"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeDasharray="3 10"
              strokeLinecap="round"
              strokeWidth="2"
              opacity={lerp(0.26, 0.36, progress)}
            />
          </g>
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
          >
            <path d="M120 58V92" opacity={lerp(0.82, 0.48, progress)} />
            <path d="M103 75H137" opacity={lerp(0.82, 0.48, progress)} />
          </g>
          <g fill="currentColor">
            {[
              [72, 75, 84, 75],
              [168, 75, 156, 75],
              [120, 27, 120, 39],
              [120, 123, 120, 111]
            ].map(([baseX, baseY, hoverX, hoverY], index) => {
              const localProgress = staggerProgress(progress, index, 0.05);

              return (
                <circle
                  key={`${baseX}-${baseY}`}
                  cx={lerp(baseX, hoverX, localProgress)}
                  cy={lerp(baseY, hoverY, localProgress)}
                  r={lerp(3, 3.4, localProgress)}
                  opacity={lerp(0.22, 0.44, localProgress)}
                />
              );
            })}
          </g>
        </SvgFrame>
      );
  }
};

export const ChartIllustration = ({
  kind,
  mode,
  progress,
  title
}: ChartArtworkProps) => (
  <div
    className="relative h-full w-full"
    data-chart-progress={formatSvgNumber(progress)}
  >
    <ChartArtwork kind={kind} mode={mode} progress={progress} title={title} />
  </div>
);
