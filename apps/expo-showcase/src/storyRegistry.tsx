import { compatBarStories, compatLineStories } from "./stories/compatStories";
import { lineInteractionStories } from "./stories/lineInteractionStories";
import { lineOverviewStories } from "./stories/lineOverviewStories";
import { lineQaStories } from "./stories/lineQaStories";
import { lineViewportStories } from "./stories/lineViewportStories";
import type { ShowcaseMode, ShowcaseSection } from "./stories/storyPrimitives";

export type {
  NativeStoryProps,
  ShowcaseMode,
  ShowcasePage,
  ShowcaseSection,
  ShowcaseStory
} from "./stories/storyPrimitives";

export const storySections: ShowcaseSection[] = [
  {
    id: "v2-line",
    title: "V2 Line and Area",
    stories: [
      ...lineOverviewStories,
      ...lineInteractionStories,
      ...lineViewportStories,
      ...lineQaStories
    ]
  },
  {
    id: "legacy-line",
    title: "Compat LineChart",
    stories: compatLineStories
  },
  {
    id: "legacy-bar",
    title: "Compat BarChart",
    stories: compatBarStories
  }
];

export const stories = storySections.flatMap((section) => section.stories);

export const showcaseModes: ShowcaseMode[] = [
  {
    id: "charts",
    title: "Charts",
    pages: [
      {
        id: "line-area",
        title: "Line & Area",
        description:
          "Core v2 line and area chart examples across single-series, multi-series, dark mode, and gaps.",
        storyIds: [
          "v2-basic",
          "v2-revenue-card",
          "v2-multi-series",
          "v2-reference-targets",
          "v2-dashed-forecast",
          "v2-null-gaps",
          "v2-area",
          "v2-scrollable-price",
          "v2-scrollable-stock-comparison",
          "v2-viewport-zoom-pan",
          "v2-range-selector",
          "v2-pro-animation"
        ]
      },
      {
        id: "legends-markers",
        title: "Legends & Markers",
        description:
          "Legend layout, dashed series, custom legend rendering, marker shapes, and typography overrides.",
        storyIds: [
          "v2-dashed-forecast",
          "v2-bottom-legend",
          "v2-custom-legend",
          "v2-dot-styles",
          "v2-custom-typography"
        ]
      },
      {
        id: "compat",
        title: "Compatibility",
        description:
          "Legacy LineChart and BarChart facade fixtures kept visible for upgrade review.",
        storyIds: ["line-basic", "bar-basic", "line-dark-mode", "bar-dark-mode"]
      }
    ]
  },
  {
    id: "features",
    title: "Features",
    pages: [
      {
        id: "selection-tooltips",
        title: "Selection & Tooltips",
        description:
          "Controlled selection, persistent scrub, hold-to-inspect, and null-aware inspection.",
        storyIds: [
          "v2-selected-tooltip",
          "v2-scrub",
          "v2-scrollable-stock-comparison",
          "v2-viewport-zoom-pan",
          "v2-while-active",
          "v2-null-gaps"
        ]
      },
      {
        id: "labels-layout",
        title: "Labels & Layout",
        description:
          "Dense labels, rotated labels, staggered labels, grid lines, and hidden-label layouts.",
        storyIds: [
          "v2-dense-labels",
          "v2-rotated-labels",
          "v2-six-labels",
          "v2-scrollable-dense",
          "v2-staggered-labels",
          "v2-grid-lines",
          "v2-hidden-labels"
        ]
      },
      {
        id: "theme-composition",
        title: "Theme & Composition",
        description:
          "Theme overrides, custom SVG legend composition, dark previews, and area fills.",
        storyIds: [
          "v2-custom-typography",
          "v2-custom-legend",
          "v2-revenue-card",
          "v2-area"
        ]
      },
      {
        id: "motion-markers",
        title: "Motion & Markers",
        description:
          "Animation preview, marker styling, active dots, and smoothed tooltip movement.",
        storyIds: [
          "v2-pro-animation",
          "v2-scrollable-price",
          "v2-scrollable-stock-comparison",
          "v2-viewport-zoom-pan",
          "v2-range-selector",
          "v2-dot-styles",
          "v2-scrub",
          "v2-while-active"
        ]
      }
    ]
  },
  {
    id: "qa",
    title: "QA",
    pages: [
      {
        id: "v2-edge-cases",
        title: "V2 Edge Cases",
        description:
          "Stress cases for label density, label policies, null gaps, and minimal axis rendering.",
        storyIds: [
          "v2-dense-labels",
          "v2-rotated-labels",
          "v2-six-labels",
          "v2-scrollable-dense",
          "v2-staggered-labels",
          "v2-null-gaps",
          "v2-hidden-labels",
          "v2-dark-mode"
        ]
      },
      {
        id: "compat-line",
        title: "Compat LineChart",
        description:
          "Legacy line fixtures for upgrade safety: dense data, long labels, negatives, empty state, and tiny width.",
        storyIds: [
          "line-basic",
          "line-long-labels",
          "line-dense-data",
          "line-negative-values",
          "line-empty-state",
          "line-dark-mode",
          "line-tiny-width"
        ]
      },
      {
        id: "compat-bar",
        title: "Compat BarChart",
        description:
          "Legacy bar fixtures for upgrade safety: dense data, long labels, negatives, empty state, and tiny width.",
        storyIds: [
          "bar-basic",
          "bar-long-labels",
          "bar-dense-data",
          "bar-negative-values",
          "bar-empty-state",
          "bar-dark-mode",
          "bar-tiny-width"
        ]
      },
      {
        id: "tiny-empty-negative",
        title: "Tiny, Empty, Negative",
        description:
          "Small containers, empty datasets, and negative values across compatibility charts.",
        storyIds: [
          "line-tiny-width",
          "bar-tiny-width",
          "line-empty-state",
          "bar-empty-state",
          "line-negative-values",
          "bar-negative-values"
        ]
      }
    ]
  }
];

export const storyFeatureTags: Record<string, string[]> = {
  "v2-basic": ["default theme", "auto padding", "monotone curve"],
  "v2-revenue-card": ["multi-series", "currency labels", "theme tokens"],
  "v2-bottom-legend": ["bottom legend", "multi-series", "line markers"],
  "v2-custom-legend": ["custom legend", "SVG render item", "spacing"],
  "v2-custom-typography": ["font tokens", "theme override", "legend labels"],
  "v2-multi-series": ["multi-series", "forecast line", "stroke widths"],
  "v2-reference-targets": ["reference line", "reference band", "target label"],
  "v2-dashed-forecast": ["dashed line", "linear curve", "forecast style"],
  "v2-dot-styles": ["marker styles", "series dots", "diamond marker"],
  "v2-selected-tooltip": [
    "shared tooltip",
    "controlled selection",
    "crosshair"
  ],
  "v2-scrub": ["scrub gesture", "persistent selection", "animated tooltip"],
  "v2-while-active": ["hold to inspect", "while-active", "scroll lock"],
  "v2-null-gaps": ["null gaps", "fixed domain", "selection"],
  "v2-area": ["area fill", "time scale", "price labels"],
  "v2-scrollable-price": ["scrollable", "visible points", "initial end"],
  "v2-scrollable-dense": ["scrollable", "visible points", "dense labels"],
  "v2-scrollable-stock-comparison": [
    "scrollable",
    "two series",
    "scrub tooltip",
    "marker styles"
  ],
  "v2-viewport-zoom-pan": [
    "controlled viewport",
    "zoom helpers",
    "pan helpers"
  ],
  "v2-range-selector": ["viewport", "overview", "range selector"],
  "v2-pro-animation": ["animated data", "fixed domain", "dark theme"],
  "v2-dense-labels": ["dense labels", "auto strategy", "linear curve"],
  "v2-rotated-labels": ["rotated labels", "edge fit", "long range"],
  "v2-six-labels": ["six ticks", "rotation", "edge labels"],
  "v2-staggered-labels": ["staggered labels", "collision policy", "dense axis"],
  "v2-grid-lines": ["horizontal grid", "vertical grid", "opt-in"],
  "v2-hidden-labels": ["hidden labels", "minimal axis", "clean preview"],
  "v2-dark-mode": ["dark theme", "area fill", "multi-series"],
  "line-basic": ["legacy data", "compat facade", "line chart"],
  "line-long-labels": ["long labels", "compat facade", "line chart"],
  "line-dense-data": ["dense data", "compat facade", "line chart"],
  "line-negative-values": ["negative values", "compat facade", "line chart"],
  "line-empty-state": ["empty state", "compat facade", "line chart"],
  "line-dark-mode": ["dark mode", "compat facade", "line chart"],
  "line-tiny-width": ["tiny width", "compat facade", "line chart"],
  "bar-basic": ["legacy data", "compat facade", "bar chart"],
  "bar-long-labels": ["long labels", "compat facade", "bar chart"],
  "bar-dense-data": ["dense data", "compat facade", "bar chart"],
  "bar-negative-values": ["negative values", "compat facade", "bar chart"],
  "bar-empty-state": ["empty state", "compat facade", "bar chart"],
  "bar-dark-mode": ["dark mode", "compat facade", "bar chart"],
  "bar-tiny-width": ["tiny width", "compat facade", "bar chart"]
};
