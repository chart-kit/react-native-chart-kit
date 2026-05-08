export const storyFeatureTags: Record<string, string[]> = {
  "v2-basic": ["default theme", "auto padding", "monotone curve"],
  "v2-revenue-card": ["multi-series", "currency labels", "theme tokens"],
  "v2-bottom-legend": ["bottom legend", "multi-series", "line markers"],
  "v2-custom-legend": ["custom legend", "SVG render item", "spacing"],
  "v2-custom-typography": ["font tokens", "theme override", "legend labels"],
  "v2-multi-series": ["multi-series", "forecast line", "stroke widths"],
  "v2-reference-targets": ["reference line", "reference band", "target label"],
  "v2-threshold-colors": ["threshold colors", "area fill", "reference line"],
  "v2-dashed-forecast": ["dashed line", "linear curve", "forecast style"],
  "v2-dot-styles": ["marker styles", "series dots", "diamond marker"],
  "v2-selected-tooltip": [
    "pro candidate",
    "shared tooltip",
    "controlled selection",
    "crosshair"
  ],
  "v2-selection-scope": [
    "pro candidate",
    "selection provider",
    "cross-chart dismissal",
    "external value"
  ],
  "v2-custom-crosshair": [
    "pro candidate",
    "custom crosshair",
    "axis badges",
    "render prop"
  ],
  "v2-scrub": [
    "pro candidate",
    "scrub gesture",
    "persistent selection",
    "animated tooltip"
  ],
  "v2-while-active": [
    "pro candidate",
    "hold to inspect",
    "while-active",
    "scroll lock"
  ],
  "v2-null-gaps": ["null gaps", "fixed domain", "selection"],
  "v2-area": ["area fill", "time scale", "price labels"],
  "v2-scrollable-price": ["scrollable", "visible points", "initial end"],
  "v2-scrollable-dense": ["scrollable", "visible points", "dense labels"],
  "v2-scrollable-stock-comparison": [
    "pro candidate",
    "scrollable",
    "two series",
    "marker styles"
  ],
  "v2-viewport-zoom-pan": [
    "pro candidate",
    "controlled viewport",
    "pinch zoom",
    "touch pan"
  ],
  "v2-range-selector": [
    "pro candidate",
    "viewport",
    "overview",
    "range selector"
  ],
  "v2-pro-animation": [
    "pro candidate",
    "animated data",
    "fixed domain",
    "dark theme"
  ],
  "v2-dense-labels": ["dense labels", "auto strategy", "linear curve"],
  "v2-rotated-labels": ["rotated labels", "edge fit", "long range"],
  "v2-six-labels": ["six ticks", "rotation", "edge labels"],
  "v2-staggered-labels": ["staggered labels", "collision policy", "dense axis"],
  "v2-grid-lines": ["horizontal grid", "vertical grid", "opt-in"],
  "v2-debug-layout": ["debug overlay", "layout boxes", "visual QA"],
  "v2-hidden-labels": ["hidden labels", "minimal axis", "clean preview"],
  "v2-dark-mode": ["dark theme", "area fill", "multi-series"],
  "v2-bar-grouped": [
    "pro candidate",
    "grouped bars",
    "value labels",
    "theme preset"
  ],
  "v2-bar-selection": [
    "pro candidate",
    "tap selection",
    "bar tooltip",
    "highlight state"
  ],
  "v2-bar-animation": [
    "pro candidate",
    "animated data",
    "single series",
    "bar chart"
  ],
  "v2-bar-grouped-animation": [
    "pro candidate",
    "animated data",
    "grouped bars",
    "vertical bars"
  ],
  "v2-bar-scrollable": ["scrollable", "visible points", "sticky y-axis"],
  "v2-bar-scrollable-selection": [
    "pro candidate",
    "scrollable",
    "tap selection",
    "animated tooltip"
  ],
  "v2-bar-custom-renderer": [
    "pro candidate",
    "renderBar",
    "custom styling",
    "built-in layout"
  ],
  "v2-bar-horizontal": [
    "pro candidate",
    "horizontal bars",
    "category axis",
    "value labels"
  ],
  "v2-bar-negative": ["negative values", "baseline", "value labels"],
  "v2-bar-stacked-percent": [
    "pro candidate",
    "stacked100",
    "percentage labels",
    "bar chart"
  ],
  "v2-combined-revenue-margin": [
    "pro candidate",
    "combined chart",
    "dual axis",
    "bar + line"
  ],
  "v2-combined-shared-tooltip": [
    "pro candidate",
    "shared tooltip",
    "tap selection",
    "dual axis"
  ],
  "v2-combined-legend-toggles": [
    "pro candidate",
    "series visibility",
    "legend toggles",
    "domain updates"
  ],
  "v2-combined-negative-values": [
    "pro candidate",
    "negative values",
    "zero baseline",
    "dual axis"
  ],
  "v2-candlestick-price-action": [
    "pro candidate",
    "OHLC",
    "candlesticks",
    "range selector",
    "viewport pan",
    "session gaps"
  ],
  "v2-candlestick-legend-inspector": [
    "pro candidate",
    "OHLC",
    "controlled selection",
    "top legend",
    "zoom cap"
  ],
  "v2-candlestick-scrollable": [
    "pro candidate",
    "OHLC",
    "scrollable",
    "volume overlay",
    "session gaps"
  ],
  "v2-candlestick-session-events": [
    "pro candidate",
    "OHLC",
    "early close",
    "emergency closure",
    "session markers"
  ],
  "v2-pie-acquisition": ["pie chart", "bottom legend", "percentage labels"],
  "v2-pie-external-labels": [
    "external labels",
    "connector lines",
    "small-slice filter"
  ],
  "v2-pie-selection": ["tap selection", "active slice", "animated selection"],
  "v2-donut-revenue": ["donut chart", "center label", "bottom legend"],
  "v2-donut-selection": ["tap selection", "active slice", "center label"],
  "v2-donut-custom-legend": [
    "custom legend",
    "rich center label",
    "zero slice"
  ],
  "v2-progress-activity": ["progress rings", "theme preset", "center label"],
  "v2-progress-single": ["single ring", "completion", "center label"],
  "v2-progress-zero-missing": ["zero value", "missing ring", "clamped value"],
  "v2-contribution-usage": ["calendar heatmap", "month labels", "date cells"],
  "v2-contribution-empty": ["empty values", "zero cells", "date range"],
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
  "stacked-bar-basic": ["legacy data", "compat facade", "stacked bar"],
  "stacked-bar-percentile": ["percentile", "compat facade", "stacked bar"],
  "bar-negative-values": ["negative values", "compat facade", "bar chart"],
  "bar-empty-state": ["empty state", "compat facade", "bar chart"],
  "bar-dark-mode": ["dark mode", "compat facade", "bar chart"],
  "bar-tiny-width": ["tiny width", "compat facade", "bar chart"]
};
