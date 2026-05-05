import React, { useState } from "react";
import {
  ActionSheetIOS,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import type { ShowcasePage } from "./stories/storyPrimitives";

type ShowcaseMenuTheme = {
  axis: string;
  background: string;
  mutedText: string;
  plotBackground: string;
  series: string[];
  text: string;
};

type ShowcaseMenuOption<TValue extends string> = {
  id: TValue;
  title: string;
};

const showIOSPagePicker = ({
  currentPageId,
  onSelectPage,
  pages,
  userInterfaceStyle
}: {
  currentPageId: string;
  onSelectPage: (page: ShowcasePage) => void;
  pages: ShowcasePage[];
  userInterfaceStyle: "dark" | "light";
}) => {
  const cancelButtonIndex = pages.length;

  ActionSheetIOS.showActionSheetWithOptions(
    {
      cancelButtonIndex,
      options: [...pages.map((page) => page.title), "Cancel"],
      title: "Chart pages",
      userInterfaceStyle
    },
    (selectedIndex) => {
      if (selectedIndex === cancelButtonIndex) {
        return;
      }

      const selectedPage = pages[selectedIndex];

      if (selectedPage && selectedPage.id !== currentPageId) {
        onSelectPage(selectedPage);
      }
    }
  );
};

const showIOSOptionPicker = <TValue extends string>({
  currentValue,
  onSelectValue,
  options,
  title,
  userInterfaceStyle
}: {
  currentValue: TValue;
  onSelectValue: (value: TValue) => void;
  options: Array<ShowcaseMenuOption<TValue>>;
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

      if (selectedOption && selectedOption.id !== currentValue) {
        onSelectValue(selectedOption.id);
      }
    }
  );
};

export const ShowcaseMenu = ({
  appTheme,
  chartPreset,
  currentPageId,
  isDark,
  onSelectChartPreset,
  onSelectPage,
  onSelectThemeMode,
  pages,
  presetOptions,
  themeMode,
  themeModeOptions
}: {
  appTheme: ShowcaseMenuTheme;
  chartPreset: string;
  currentPageId: string;
  isDark: boolean;
  onSelectChartPreset: (preset: string) => void;
  onSelectPage: (page: ShowcasePage) => void;
  onSelectThemeMode: (mode: "dark" | "light") => void;
  pages: ShowcasePage[];
  presetOptions: Array<ShowcaseMenuOption<string>>;
  themeMode: "dark" | "light";
  themeModeOptions: Array<ShowcaseMenuOption<"dark" | "light">>;
}) => {
  const [isFallbackOpen, setIsFallbackOpen] = useState(false);
  const selectedControlColor = appTheme.series[0] ?? appTheme.text;
  const selectedControlTextColor = appTheme.background;
  const selectedPage = pages.find((page) => page.id === currentPageId);
  const selectedThemeTitle =
    themeModeOptions.find((option) => option.id === themeMode)?.title ??
    themeMode;
  const selectedPresetTitle =
    presetOptions.find((option) => option.id === chartPreset)?.title ??
    chartPreset;

  const openMenu = () => {
    if (Platform.OS === "ios") {
      const userInterfaceStyle = isDark ? "dark" : "light";

      ActionSheetIOS.showActionSheetWithOptions(
        {
          cancelButtonIndex: 3,
          options: [
            `Page: ${selectedPage?.title ?? "Charts"}`,
            `Theme: ${selectedThemeTitle}`,
            `Preset: ${selectedPresetTitle}`,
            "Cancel"
          ],
          title: "Showcase menu",
          userInterfaceStyle
        },
        (selectedIndex) => {
          if (selectedIndex === 0) {
            showIOSPagePicker({
              currentPageId,
              onSelectPage,
              pages,
              userInterfaceStyle
            });
          }

          if (selectedIndex === 1) {
            showIOSOptionPicker({
              currentValue: themeMode,
              onSelectValue: onSelectThemeMode,
              options: themeModeOptions,
              title: "Theme",
              userInterfaceStyle
            });
          }

          if (selectedIndex === 2) {
            showIOSOptionPicker({
              currentValue: chartPreset,
              onSelectValue: onSelectChartPreset,
              options: presetOptions,
              title: "Theme preset",
              userInterfaceStyle
            });
          }
        }
      );
      return;
    }

    setIsFallbackOpen(true);
  };
  const closeFallback = () => {
    setIsFallbackOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityLabel="Open chart page menu"
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
            accessibilityLabel="Close chart page menu"
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
                Chart pages
              </Text>
              <Pressable onPress={closeFallback}>
                <Text
                  style={[styles.sheetAction, { color: selectedControlColor }]}
                >
                  Done
                </Text>
              </Pressable>
            </View>
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.sheetRows}
              style={styles.sheetRowsScroll}
            >
              <Text
                style={[styles.sectionTitle, { color: appTheme.mutedText }]}
              >
                Chart page
              </Text>
              {pages.map((page) => (
                <FallbackRow
                  key={page.id}
                  appTheme={appTheme}
                  isSelected={page.id === currentPageId}
                  label={page.title}
                  onPress={() => {
                    onSelectPage(page);
                    closeFallback();
                  }}
                />
              ))}
              <Text
                style={[styles.sectionTitle, { color: appTheme.mutedText }]}
              >
                Appearance
              </Text>
              {themeModeOptions.map((option) => (
                <FallbackRow
                  key={option.id}
                  appTheme={appTheme}
                  isSelected={option.id === themeMode}
                  label={option.title}
                  onPress={() => {
                    onSelectThemeMode(option.id);
                    closeFallback();
                  }}
                />
              ))}
              <Text
                style={[styles.sectionTitle, { color: appTheme.mutedText }]}
              >
                Theme preset
              </Text>
              {presetOptions.map((option) => (
                <FallbackRow
                  key={option.id}
                  appTheme={appTheme}
                  isSelected={option.id === chartPreset}
                  label={option.title}
                  onPress={() => {
                    onSelectChartPreset(option.id);
                    closeFallback();
                  }}
                />
              ))}
            </ScrollView>
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
  onPress
}: {
  appTheme: ShowcaseMenuTheme;
  isSelected?: boolean;
  label: string;
  onPress: () => void;
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
    <Text style={[styles.rowLabel, { color: appTheme.text }]}>{label}</Text>
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
    maxHeight: "86%",
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
    gap: 8,
    paddingBottom: 2
  },
  sheetRowsScroll: {
    gap: 8
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 8,
    textTransform: "uppercase"
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
  rowLabel: {
    fontSize: 15,
    fontWeight: "800"
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
