import {
  compatBarStories,
  compatLineStories,
  compatStackedBarStories
} from "./stories/compatStories";
import { barOverviewStories } from "./stories/barOverviewStories";
import { contributionOverviewStories } from "./stories/contributionOverviewStories";
import { lineInteractionStories } from "./stories/lineInteractionStories";
import { lineOverviewStories } from "./stories/lineOverviewStories";
import { lineQaStories } from "./stories/lineQaStories";
import { lineViewportStories } from "./stories/lineViewportStories";
import { pieOverviewStories } from "./stories/pieOverviewStories";
import { progressOverviewStories } from "./stories/progressOverviewStories";
import type {
  ShowcaseMode,
  ShowcasePage,
  ShowcaseSection,
  ShowcaseStoryGroup
} from "./stories/storyPrimitives";

export type {
  NativeStoryProps,
  ShowcaseMode,
  ShowcasePage,
  ShowcaseSection,
  ShowcaseStoryGroup,
  ShowcaseStory
} from "./stories/storyPrimitives";

export { storyFeatureTags } from "./storyFeatureTags";

export const getShowcasePageStoryIds = (page: ShowcasePage) =>
  page.storyGroups?.flatMap((group) => group.storyIds) ?? page.storyIds ?? [];

export const getShowcasePageStoryGroups = (
  page: ShowcasePage
): ShowcaseStoryGroup[] =>
  page.storyGroups ?? [
    {
      id: `${page.id}-stories`,
      title: "",
      storyIds: page.storyIds ?? []
    }
  ];

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
    id: "v2-bar",
    title: "V2 Bar",
    stories: barOverviewStories
  },
  {
    id: "v2-pie",
    title: "V2 Pie and Donut",
    stories: pieOverviewStories
  },
  {
    id: "v2-progress",
    title: "V2 Progress",
    stories: progressOverviewStories
  },
  {
    id: "v2-contribution",
    title: "V2 Contribution",
    stories: contributionOverviewStories
  },
  {
    id: "legacy-line",
    title: "Compat LineChart",
    stories: compatLineStories
  },
  {
    id: "legacy-bar",
    title: "Compat BarChart",
    stories: [...compatBarStories, ...compatStackedBarStories]
  }
];

export const stories = storySections.flatMap((section) => section.stories);

export const publicChartMode: ShowcaseMode = {
  id: "preview",
  title: "Charts",
  pages: [
    {
      id: "line-charts",
      title: "Line Charts",
      description:
        "Public v2 line and area chart previews with interaction, viewport, marker, tooltip, and theme examples.",
      storyGroups: [
        {
          id: "line-showpieces",
          title: "Showpieces",
          description:
            "The demos that should immediately sell motion, viewport control, and production polish.",
          storyIds: [
            "v2-pro-animation",
            "v2-range-selector",
            "v2-revenue-card",
            "v2-viewport-zoom-pan"
          ]
        },
        {
          id: "line-interaction",
          title: "Interaction",
          description:
            "Selection, tooltip, crosshair, scrolling, and multi-series inspection behavior.",
          storyIds: [
            "v2-selected-tooltip",
            "v2-custom-crosshair",
            "v2-scrollable-stock-comparison",
            "v2-scrollable-price"
          ]
        },
        {
          id: "line-composition",
          title: "Composition",
          description:
            "Area fills, thresholds, dashed lines, marker styles, references, and baseline multi-series charts.",
          storyIds: [
            "v2-area",
            "v2-threshold-colors",
            "v2-dashed-forecast",
            "v2-dot-styles",
            "v2-multi-series",
            "v2-reference-targets",
            "v2-basic"
          ]
        }
      ]
    },
    {
      id: "bar-charts",
      title: "Bar Charts",
      description:
        "Public v2 bar chart previews for grouped, selectable, scrollable, horizontal, negative, and stacked percentage bars.",
      storyGroups: [
        {
          id: "bar-showpieces",
          title: "Showpieces",
          description:
            "The primary bar-chart demos for acquisition, selection, and ranked horizontal comparisons.",
          storyIds: [
            "v2-bar-grouped",
            "v2-bar-selection",
            "v2-bar-animation",
            "v2-bar-grouped-animation",
            "v2-bar-horizontal"
          ]
        },
        {
          id: "bar-production-cases",
          title: "Production Cases",
          description:
            "Long datasets, negative values, and percentage composition examples.",
          storyIds: [
            "v2-bar-scrollable",
            "v2-bar-scrollable-selection",
            "v2-bar-negative",
            "v2-bar-stacked-percent"
          ]
        }
      ]
    },
    {
      id: "pie-donut",
      title: "Pie & Donut",
      description:
        "Public v2 slice charts for acquisition share, revenue mix, legends, and center labels.",
      storyGroups: [
        {
          id: "pie-showpieces",
          title: "Showpieces",
          description:
            "Modern pie and donut previews built on renderer-agnostic arc geometry.",
          storyIds: [
            "v2-pie-acquisition",
            "v2-pie-external-labels",
            "v2-donut-revenue",
            "v2-donut-selection",
            "v2-donut-custom-legend"
          ]
        }
      ]
    },
    {
      id: "progress",
      title: "Progress",
      description:
        "Public v2 progress rings for health, onboarding, completion, and goal tracking surfaces.",
      storyGroups: [
        {
          id: "progress-showpieces",
          title: "Showpieces",
          description:
            "Modern concentric progress rings built on renderer-agnostic progress geometry.",
          storyIds: ["v2-progress-activity", "v2-progress-single"]
        }
      ]
    },
    {
      id: "heatmaps",
      title: "Heatmaps",
      description:
        "Public v2 contribution heatmap previews for product usage and activity calendars.",
      storyGroups: [
        {
          id: "heatmap-showpieces",
          title: "Showpieces",
          description:
            "Calendar-style heatmaps with stable date mapping and theme-aware density.",
          storyIds: ["v2-contribution-usage"]
        }
      ]
    }
  ]
};

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
          "v2-threshold-colors",
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
        id: "bar",
        title: "Bar",
        description:
          "Modern v2 bar chart examples across grouped, selectable, scrollable, horizontal, negative, and stacked percentage modes.",
        storyIds: [
          "v2-bar-grouped",
          "v2-bar-selection",
          "v2-bar-animation",
          "v2-bar-grouped-animation",
          "v2-bar-scrollable",
          "v2-bar-scrollable-selection",
          "v2-bar-horizontal",
          "v2-bar-negative",
          "v2-bar-stacked-percent"
        ]
      },
      {
        id: "pie-donut",
        title: "Pie & Donut",
        description:
          "Modern pie and donut examples with legends and center labels.",
        storyIds: [
          "v2-pie-acquisition",
          "v2-pie-external-labels",
          "v2-donut-revenue",
          "v2-donut-selection",
          "v2-donut-custom-legend"
        ]
      },
      {
        id: "progress",
        title: "Progress",
        description:
          "Modern progress chart examples for multi-ring and single-ring completion states.",
        storyIds: ["v2-progress-activity", "v2-progress-single"]
      },
      {
        id: "heatmaps",
        title: "Heatmaps",
        description:
          "Modern contribution heatmap examples with month labels, weekday labels, and stable date cells.",
        storyIds: ["v2-contribution-usage"]
      },
      {
        id: "compat",
        title: "Compatibility",
        description:
          "Legacy LineChart, BarChart, and StackedBarChart facade fixtures kept visible for upgrade review.",
        storyIds: [
          "line-basic",
          "bar-basic",
          "stacked-bar-basic",
          "line-dark-mode",
          "bar-dark-mode"
        ]
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
          "v2-custom-crosshair",
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
          "Legacy bar fixtures for upgrade safety: dense data, long labels, negatives, empty state, stacked bars, and tiny width.",
        storyIds: [
          "bar-basic",
          "bar-long-labels",
          "bar-dense-data",
          "stacked-bar-basic",
          "stacked-bar-percentile",
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
