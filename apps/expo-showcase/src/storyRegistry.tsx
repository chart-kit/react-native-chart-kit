import type { ComponentType } from "react";

import * as LegacyBarChart from "../../showcase-web/src/charts/bar/BarChart.stories";
import * as LegacyLineChart from "../../showcase-web/src/charts/line/LineChart.stories";
import * as V2LineChart from "../../showcase-web/src/charts/v2-line/ModernLineChart.stories";

export type ShowcaseStory = {
  id: string;
  title: string;
  Component: ComponentType;
};

export type ShowcaseSection = {
  id: string;
  title: string;
  stories: ShowcaseStory[];
};

export const storySections: ShowcaseSection[] = [
  {
    id: "v2-line",
    title: "V2 Line and Area",
    stories: [
      { id: "v2-basic", title: "Basic", Component: V2LineChart.Basic },
      {
        id: "v2-revenue-card",
        title: "Revenue Card",
        Component: V2LineChart.RevenueCard
      },
      {
        id: "v2-bottom-legend",
        title: "Bottom Legend",
        Component: V2LineChart.BottomLegend
      },
      {
        id: "v2-custom-legend",
        title: "Custom Legend",
        Component: V2LineChart.CustomLegend
      },
      {
        id: "v2-custom-typography",
        title: "Custom Typography",
        Component: V2LineChart.CustomTypography
      },
      {
        id: "v2-multi-series",
        title: "Multi Series",
        Component: V2LineChart.MultiSeries
      },
      {
        id: "v2-dot-styles",
        title: "Marker Styles",
        Component: V2LineChart.DotStyles
      },
      {
        id: "v2-selected-tooltip",
        title: "Shared Tooltip",
        Component: V2LineChart.SelectedTooltip
      },
      {
        id: "v2-scrub",
        title: "Tap and Scrub",
        Component: V2LineChart.ScrubInteraction
      },
      {
        id: "v2-while-active",
        title: "Hold to Inspect",
        Component: V2LineChart.WhileActiveScrub
      },
      {
        id: "v2-null-gaps",
        title: "Null Gaps",
        Component: V2LineChart.NullGaps
      },
      { id: "v2-area", title: "Area Fill", Component: V2LineChart.AreaFill },
      {
        id: "v2-dense-labels",
        title: "Dense Labels",
        Component: V2LineChart.DenseLabels
      },
      {
        id: "v2-rotated-labels",
        title: "Rotated Labels",
        Component: V2LineChart.RotatedLabels
      },
      {
        id: "v2-six-labels",
        title: "Six Rotated Labels",
        Component: V2LineChart.RotatedSixLabels
      },
      {
        id: "v2-staggered-labels",
        title: "Staggered Labels",
        Component: V2LineChart.StaggeredLabels
      },
      {
        id: "v2-grid-lines",
        title: "Grid Lines",
        Component: V2LineChart.GridLines
      },
      {
        id: "v2-hidden-labels",
        title: "Hidden Labels",
        Component: V2LineChart.HiddenLabels
      },
      {
        id: "v2-dark-mode",
        title: "Dark Mode",
        Component: V2LineChart.DarkMode
      }
    ]
  },
  {
    id: "legacy-line",
    title: "Compat LineChart",
    stories: [
      {
        id: "line-basic",
        title: "Basic",
        Component: LegacyLineChart.Basic
      },
      {
        id: "line-long-labels",
        title: "Long Labels",
        Component: LegacyLineChart.LongLabels
      },
      {
        id: "line-dense-data",
        title: "Dense Data",
        Component: LegacyLineChart.DenseData
      },
      {
        id: "line-negative-values",
        title: "Negative Values",
        Component: LegacyLineChart.NegativeValues
      },
      {
        id: "line-empty-state",
        title: "Empty State",
        Component: LegacyLineChart.EmptyState
      },
      {
        id: "line-dark-mode",
        title: "Dark Mode",
        Component: LegacyLineChart.DarkMode
      },
      {
        id: "line-tiny-width",
        title: "Tiny Width",
        Component: LegacyLineChart.TinyWidth
      }
    ]
  },
  {
    id: "legacy-bar",
    title: "Compat BarChart",
    stories: [
      {
        id: "bar-basic",
        title: "Basic",
        Component: LegacyBarChart.Basic
      },
      {
        id: "bar-long-labels",
        title: "Long Labels",
        Component: LegacyBarChart.LongLabels
      },
      {
        id: "bar-dense-data",
        title: "Dense Data",
        Component: LegacyBarChart.DenseData
      },
      {
        id: "bar-negative-values",
        title: "Negative Values",
        Component: LegacyBarChart.NegativeValues
      },
      {
        id: "bar-empty-state",
        title: "Empty State",
        Component: LegacyBarChart.EmptyState
      },
      {
        id: "bar-dark-mode",
        title: "Dark Mode",
        Component: LegacyBarChart.DarkMode
      },
      {
        id: "bar-tiny-width",
        title: "Tiny Width",
        Component: LegacyBarChart.TinyWidth
      }
    ]
  }
];

export const stories = storySections.flatMap((section) => section.stories);
