import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { View } from "react-native";
import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";

import {
  getScopedChartSelectionClearReason,
  shouldClearScopedChartSelection,
  type ChartSelectionClearReason,
  type ChartSelectionDismissReason,
  type ChartSelectionScopeState
} from "./scope";

export type ChartSelectionProviderProps = {
  children: ReactNode;
  dismissOnPressOutside?: boolean;
  style?: StyleProp<ViewStyle>;
};

export type ChartSelectionContextValue = ChartSelectionScopeState & {
  dismissSelection: (reason?: ChartSelectionDismissReason) => void;
  selectChart: (chartId: string) => void;
};

export type ScopedChartSelectionOptions = {
  chartId: string;
  controlled: boolean;
  hasSelection: boolean;
  onClear: (reason: ChartSelectionClearReason) => void;
};

const ChartSelectionContext = createContext<
  ChartSelectionContextValue | undefined
>(undefined);

export const ChartSelectionProvider = ({
  children,
  dismissOnPressOutside = false,
  style
}: ChartSelectionProviderProps) => {
  const [state, setState] = useState<ChartSelectionScopeState>({
    activeChartId: undefined,
    dismissRevision: 0
  });
  const selectChart = useCallback((chartId: string) => {
    setState((current) =>
      current.activeChartId === chartId
        ? current
        : { ...current, activeChartId: chartId }
    );
  }, []);
  const dismissSelection = useCallback(() => {
    setState((current) => ({
      activeChartId: undefined,
      dismissRevision: current.dismissRevision + 1
    }));
  }, []);
  const handleStartShouldSetResponderCapture = useCallback(
    (_event: GestureResponderEvent) => {
      dismissSelection();

      return false;
    },
    [dismissSelection]
  );
  const value = useMemo<ChartSelectionContextValue>(
    () => ({
      ...state,
      dismissSelection,
      selectChart
    }),
    [dismissSelection, selectChart, state]
  );

  return (
    <ChartSelectionContext.Provider value={value}>
      {dismissOnPressOutside ? (
        <View
          collapsable={false}
          onStartShouldSetResponderCapture={
            handleStartShouldSetResponderCapture
          }
          style={style}
        >
          {children}
        </View>
      ) : (
        children
      )}
    </ChartSelectionContext.Provider>
  );
};

export const useChartSelection = () => useContext(ChartSelectionContext);

export const useDismissChartSelection = () => {
  const context = useChartSelection();

  return useCallback(
    (reason?: ChartSelectionDismissReason) => {
      context?.dismissSelection(reason);
    },
    [context]
  );
};

export const useScopedChartSelection = ({
  chartId,
  controlled,
  hasSelection,
  onClear
}: ScopedChartSelectionOptions) => {
  const context = useChartSelection();
  const lastDismissRevisionRef = useRef(context?.dismissRevision ?? 0);

  useEffect(() => {
    if (!context) {
      return;
    }

    const lastDismissRevision = lastDismissRevisionRef.current;
    const shouldClear =
      !controlled &&
      shouldClearScopedChartSelection({
        activeChartId: context.activeChartId,
        chartId,
        dismissRevision: context.dismissRevision,
        hasSelection,
        lastDismissRevision
      });

    lastDismissRevisionRef.current = context.dismissRevision;

    if (shouldClear) {
      onClear(
        getScopedChartSelectionClearReason({
          activeChartId: context.activeChartId,
          chartId,
          dismissRevision: context.dismissRevision,
          lastDismissRevision
        }) ?? "programmatic"
      );
    }
  }, [chartId, context, controlled, hasSelection, onClear]);

  return useMemo(
    () => ({
      dismissSelection: context?.dismissSelection,
      selectChart: () => {
        context?.selectChart(chartId);
      }
    }),
    [chartId, context]
  );
};

export type {
  ChartSelectionClearReason,
  ChartSelectionDismissReason
} from "./scope";
