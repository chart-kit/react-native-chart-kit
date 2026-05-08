import type { LineChartProps } from "./types";

export const getLineChartOverviewProps = <
  TData extends Record<string, unknown>
>(
  props: LineChartProps<TData>
) => {
  const {
    activeDot: _activeDot,
    crosshair: _crosshair,
    defaultSelectedIndex: _defaultSelectedIndex,
    initialIndex: _initialIndex,
    interaction: _interaction,
    legend: _legend,
    rangeSelector: _rangeSelector,
    selectedIndex: _selectedIndex,
    scrollable: _scrollable,
    tooltip: _tooltip,
    viewport: _viewport,
    visiblePoints: _visiblePoints,
    ...overviewBaseProps
  } = props;

  return overviewBaseProps;
};
