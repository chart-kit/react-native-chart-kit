import React, { useState } from "react";
import {
  ActionSheetIOS,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import type { ShowcaseMode, ShowcasePage } from "./stories/storyPrimitives";
import {
  showcaseModeOptions,
  showcasePresetOptions,
  type ShowcasePresetId,
  type ShowcaseThemeMode
} from "./showcaseTheme";

type ShowcaseMenuTheme = {
  axis: string;
  background: string;
  mutedText: string;
  plotBackground: string;
  series: string[];
  text: string;
};

type PageSelection = {
  mode: ShowcaseMode;
  page: ShowcasePage;
};

type MenuGroup = "browse" | "page" | "appearance" | "theme";

type SelectOption<TId extends string> = {
  id: TId;
  title: string;
};

const rootOptions: Array<{ id: MenuGroup; title: string }> = [
  { id: "browse", title: "Browse" },
  { id: "page", title: "Page" },
  { id: "appearance", title: "Appearance" },
  { id: "theme", title: "Theme" }
];

const showIOSOptions = <TId extends string>({
  currentId,
  onSelect,
  options,
  title,
  userInterfaceStyle
}: {
  currentId: TId;
  onSelect: (id: TId) => void;
  options: Array<SelectOption<TId>>;
  title: string;
  userInterfaceStyle: "dark" | "light";
}) => {
  const cancelButtonIndex = options.length;

  ActionSheetIOS.showActionSheetWithOptions(
    {
      cancelButtonIndex,
      options: [...options.map((option) => option.title), "Cancel"],
      title,
      userInterfaceStyle
    },
    (selectedIndex) => {
      if (selectedIndex === cancelButtonIndex) {
        return;
      }

      const selectedOption = options[selectedIndex];

      if (selectedOption && selectedOption.id !== currentId) {
        onSelect(selectedOption.id);
      }
    }
  );
};

export const ShowcaseMenu = ({
  appTheme,
  chartPreset,
  pageSelection,
  selectMode,
  selectPage,
  setChartPreset,
  setThemeMode,
  showcaseModes,
  themeMode
}: {
  appTheme: ShowcaseMenuTheme;
  chartPreset: ShowcasePresetId;
  pageSelection: PageSelection;
  selectMode: (mode: ShowcaseMode) => void;
  selectPage: (selection: PageSelection) => void;
  setChartPreset: (preset: ShowcasePresetId) => void;
  setThemeMode: (mode: ShowcaseThemeMode) => void;
  showcaseModes: ShowcaseMode[];
  themeMode: ShowcaseThemeMode;
}) => {
  const [isFallbackOpen, setIsFallbackOpen] = useState(false);
  const [fallbackGroup, setFallbackGroup] = useState<MenuGroup | undefined>();
  const selectedControlColor = appTheme.series[0] ?? appTheme.text;
  const selectedControlTextColor = appTheme.background;
  const userInterfaceStyle = themeMode === "dark" ? "dark" : "light";

  const showIOSRootMenu = () => {
    const cancelButtonIndex = rootOptions.length;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        cancelButtonIndex,
        options: [
          `Browse: ${pageSelection.mode.title}`,
          `Page: ${pageSelection.page.title}`,
          `Appearance: ${themeMode === "dark" ? "Dark" : "Light"}`,
          `Theme: ${
            showcasePresetOptions.find((option) => option.id === chartPreset)
              ?.title ?? "Default"
          }`,
          "Cancel"
        ],
        title: "Preview menu",
        userInterfaceStyle
      },
      (selectedIndex) => {
        if (selectedIndex === cancelButtonIndex) {
          return;
        }

        const selectedGroup = rootOptions[selectedIndex];

        if (selectedGroup) {
          showIOSGroup(selectedGroup.id);
        }
      }
    );
  };

  const showIOSGroup = (group: MenuGroup) => {
    if (group === "browse") {
      showIOSOptions({
        currentId: pageSelection.mode.id,
        onSelect: (modeId) => {
          const mode = showcaseModes.find((item) => item.id === modeId);

          if (mode) {
            selectMode(mode);
          }
        },
        options: showcaseModes.map((mode) => ({
          id: mode.id,
          title: mode.title
        })),
        title: "Browse",
        userInterfaceStyle
      });
      return;
    }

    if (group === "page") {
      showIOSOptions({
        currentId: pageSelection.page.id,
        onSelect: (pageId) => {
          const page = pageSelection.mode.pages.find(
            (item) => item.id === pageId
          );

          if (page) {
            selectPage({ mode: pageSelection.mode, page });
          }
        },
        options: pageSelection.mode.pages.map((page) => ({
          id: page.id,
          title: page.title
        })),
        title: "Page",
        userInterfaceStyle
      });
      return;
    }

    if (group === "appearance") {
      showIOSOptions({
        currentId: themeMode,
        onSelect: setThemeMode,
        options: showcaseModeOptions,
        title: "Appearance",
        userInterfaceStyle
      });
      return;
    }

    showIOSOptions({
      currentId: chartPreset,
      onSelect: setChartPreset,
      options: showcasePresetOptions,
      title: "Theme",
      userInterfaceStyle
    });
  };

  const openMenu = () => {
    if (Platform.OS === "ios") {
      showIOSRootMenu();
      return;
    }

    setFallbackGroup(undefined);
    setIsFallbackOpen(true);
  };

  const closeFallback = () => {
    setIsFallbackOpen(false);
    setFallbackGroup(undefined);
  };

  const renderFallbackRows = () => {
    if (!fallbackGroup) {
      return rootOptions.map((option) => (
        <FallbackRow
          key={option.id}
          appTheme={appTheme}
          label={option.title}
          value={
            option.id === "browse"
              ? pageSelection.mode.title
              : option.id === "page"
                ? pageSelection.page.title
                : option.id === "appearance"
                  ? themeMode === "dark"
                    ? "Dark"
                    : "Light"
                  : showcasePresetOptions.find(
                      (item) => item.id === chartPreset
                    )?.title
          }
          onPress={() => setFallbackGroup(option.id)}
        />
      ));
    }

    if (fallbackGroup === "browse") {
      return showcaseModes.map((mode) => (
        <FallbackRow
          key={mode.id}
          appTheme={appTheme}
          isSelected={mode.id === pageSelection.mode.id}
          label={mode.title}
          onPress={() => {
            selectMode(mode);
            closeFallback();
          }}
        />
      ));
    }

    if (fallbackGroup === "page") {
      return pageSelection.mode.pages.map((page) => (
        <FallbackRow
          key={page.id}
          appTheme={appTheme}
          isSelected={page.id === pageSelection.page.id}
          label={page.title}
          onPress={() => {
            selectPage({ mode: pageSelection.mode, page });
            closeFallback();
          }}
        />
      ));
    }

    if (fallbackGroup === "appearance") {
      return showcaseModeOptions.map((option) => (
        <FallbackRow
          key={option.id}
          appTheme={appTheme}
          isSelected={option.id === themeMode}
          label={option.title}
          onPress={() => {
            setThemeMode(option.id);
            closeFallback();
          }}
        />
      ));
    }

    return showcasePresetOptions.map((option) => (
      <FallbackRow
        key={option.id}
        appTheme={appTheme}
        isSelected={option.id === chartPreset}
        label={option.title}
        onPress={() => {
          setChartPreset(option.id);
          closeFallback();
        }}
      />
    ));
  };

  return (
    <>
      <Pressable
        accessibilityLabel="Open preview menu"
        accessibilityRole="button"
        onPress={openMenu}
        style={({ pressed }) => [
          styles.menuButton,
          { backgroundColor: appTheme.text },
          pressed && styles.pressed
        ]}
      >
        <Text
          style={[styles.menuButtonText, { color: selectedControlTextColor }]}
        >
          Menu
        </Text>
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={closeFallback}
        transparent
        visible={isFallbackOpen}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close preview menu"
            style={StyleSheet.absoluteFill}
            onPress={closeFallback}
          />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: appTheme.plotBackground,
                borderColor: appTheme.axis
              }
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: appTheme.text }]}>
                {fallbackGroup
                  ? rootOptions.find((option) => option.id === fallbackGroup)
                      ?.title
                  : "Preview menu"}
              </Text>
              {fallbackGroup ? (
                <Pressable onPress={() => setFallbackGroup(undefined)}>
                  <Text
                    style={[
                      styles.sheetAction,
                      { color: selectedControlColor }
                    ]}
                  >
                    Back
                  </Text>
                </Pressable>
              ) : (
                <Pressable onPress={closeFallback}>
                  <Text
                    style={[
                      styles.sheetAction,
                      { color: selectedControlColor }
                    ]}
                  >
                    Done
                  </Text>
                </Pressable>
              )}
            </View>
            <View style={styles.sheetRows}>{renderFallbackRows()}</View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const FallbackRow = ({
  appTheme,
  isSelected = false,
  label,
  onPress,
  value
}: {
  appTheme: ShowcaseMenuTheme;
  isSelected?: boolean;
  label: string;
  onPress: () => void;
  value?: string;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected: isSelected }}
    onPress={onPress}
    style={({ pressed }) => [
      styles.row,
      { borderColor: appTheme.axis },
      pressed && styles.pressed
    ]}
  >
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, { color: appTheme.text }]}>{label}</Text>
      {value ? (
        <Text style={[styles.rowValue, { color: appTheme.mutedText }]}>
          {value}
        </Text>
      ) : null}
    </View>
    {isSelected ? (
      <Text style={[styles.rowSelected, { color: appTheme.series[0] }]}>
        Selected
      </Text>
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  menuButton: {
    alignItems: "center",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 14
  },
  menuButtonText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0
  },
  modalRoot: {
    backgroundColor: "rgba(15, 23, 42, 0.26)",
    flex: 1,
    justifyContent: "flex-end"
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    gap: 10,
    paddingBottom: 18,
    paddingHorizontal: 14,
    paddingTop: 12
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 32
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "900"
  },
  sheetAction: {
    fontSize: 14,
    fontWeight: "800"
  },
  sheetRows: {
    gap: 8
  },
  row: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  rowText: {
    flexShrink: 1,
    gap: 2
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "800"
  },
  rowValue: {
    fontSize: 12,
    fontWeight: "700"
  },
  rowSelected: {
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 12,
    textTransform: "uppercase"
  },
  pressed: {
    opacity: 0.72
  }
});
