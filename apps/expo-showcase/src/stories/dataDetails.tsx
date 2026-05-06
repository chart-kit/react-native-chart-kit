import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useChartKitTheme } from "@chart-kit/react-native";

export type ChartDataDetailsColumn = {
  key: string;
  label: string;
};

export type ChartDataDetailsRow = {
  key: string;
  values: string[];
};

type FormattedValueTable = {
  columns: ChartDataDetailsColumn[];
  rows: Array<{
    formattedValues: Record<string, string>;
    index?: number;
    xLabel?: string;
  }>;
};

export const createFormattedValueDetails = ({
  categoryLabel,
  maxRows = 8,
  table
}: {
  categoryLabel: string;
  maxRows?: number;
  table: FormattedValueTable;
}) => ({
  columns: [{ key: "category", label: categoryLabel }, ...table.columns],
  rows: table.rows.slice(0, maxRows).map((row, index) => ({
    key: `${row.index ?? index}`,
    values: [
      row.xLabel ?? `${index + 1}`,
      ...table.columns.map(
        (column) => row.formattedValues[column.key] ?? "No value"
      )
    ]
  }))
});

export const ChartDataDetails = ({
  columns,
  rows,
  title
}: {
  columns: ChartDataDetailsColumn[];
  rows: ChartDataDetailsRow[];
  title: string;
}) => {
  const { mode } = useChartKitTheme();
  const [expanded, setExpanded] = useState(false);
  const isDark = mode === "dark";

  return (
    <View style={detailsStyles.root}>
      <Pressable
        accessibilityLabel={`${expanded ? "Hide" : "Show"} ${title} data table`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [
          detailsStyles.toggle,
          isDark && detailsStyles.darkToggle,
          pressed && detailsStyles.pressed
        ]}
      >
        <Text
          style={[detailsStyles.toggleText, isDark && detailsStyles.darkText]}
        >
          {expanded ? "Hide data details" : "Data details"}
        </Text>
      </Pressable>
      {expanded ? (
        <View
          accessibilityLabel={`${title} data table`}
          style={[detailsStyles.table, isDark && detailsStyles.darkTable]}
        >
          <View style={detailsStyles.row}>
            {columns.map((column) => (
              <Text
                key={column.key}
                numberOfLines={1}
                style={[
                  detailsStyles.headerCell,
                  isDark && detailsStyles.darkMutedText
                ]}
              >
                {column.label}
              </Text>
            ))}
          </View>
          {rows.map((row) => (
            <View key={row.key} style={detailsStyles.row}>
              {columns.map((column, index) => (
                <Text
                  key={`${row.key}-${column.key}`}
                  numberOfLines={1}
                  style={[detailsStyles.cell, isDark && detailsStyles.darkText]}
                >
                  {row.values[index] ?? ""}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const detailsStyles = StyleSheet.create({
  cell: {
    color: "#475569",
    flex: 1,
    fontSize: 11,
    minWidth: 0
  },
  darkMutedText: {
    color: "#94a3b8"
  },
  darkTable: {
    backgroundColor: "#0f172a",
    borderColor: "#334155"
  },
  darkText: {
    color: "#e2e8f0"
  },
  darkToggle: {
    borderColor: "#334155"
  },
  headerCell: {
    color: "#64748b",
    flex: 1,
    fontSize: 10,
    fontWeight: "800",
    minWidth: 0,
    textTransform: "uppercase"
  },
  pressed: {
    opacity: 0.7
  },
  root: {
    marginTop: 10,
    width: "100%"
  },
  row: {
    flexDirection: "row",
    gap: 8,
    minHeight: 20
  },
  table: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 8,
    padding: 10
  },
  toggle: {
    alignSelf: "flex-start",
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  toggleText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800"
  }
});
