export type ChartSelectionDismissReason = "outsidePress" | "programmatic";
export type ChartSelectionClearReason =
  | ChartSelectionDismissReason
  | "scopeChange";

export type ChartSelectionScopeState = {
  activeChartId: string | undefined;
  dismissRevision: number;
};

export type ScopedChartSelectionClearInput = {
  activeChartId: string | undefined;
  chartId: string;
  dismissRevision: number;
  hasSelection: boolean;
  lastDismissRevision: number;
};

export const shouldClearScopedChartSelection = ({
  activeChartId,
  chartId,
  dismissRevision,
  hasSelection,
  lastDismissRevision
}: ScopedChartSelectionClearInput) => {
  if (!hasSelection) {
    return false;
  }

  if (dismissRevision !== lastDismissRevision) {
    return true;
  }

  return activeChartId !== undefined && activeChartId !== chartId;
};

export const getScopedChartSelectionClearReason = ({
  activeChartId,
  chartId,
  dismissRevision,
  lastDismissRevision
}: Omit<ScopedChartSelectionClearInput, "hasSelection">):
  | ChartSelectionClearReason
  | undefined => {
  if (dismissRevision !== lastDismissRevision) {
    return "programmatic";
  }

  if (activeChartId !== undefined && activeChartId !== chartId) {
    return "scopeChange";
  }

  return undefined;
};
