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

import type { ShowcasePage } from "./stories/storyPrimitives";

type ShowcaseMenuTheme = {
  axis: string;
  background: string;
  mutedText: string;
  plotBackground: string;
  series: string[];
  text: string;
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

export const ShowcaseMenu = ({
  appTheme,
  currentPageId,
  isDark,
  onSelectPage,
  pages
}: {
  appTheme: ShowcaseMenuTheme;
  currentPageId: string;
  isDark: boolean;
  onSelectPage: (page: ShowcasePage) => void;
  pages: ShowcasePage[];
}) => {
  const [isFallbackOpen, setIsFallbackOpen] = useState(false);
  const selectedControlColor = appTheme.series[0] ?? appTheme.text;
  const selectedControlTextColor = appTheme.background;

  const openMenu = () => {
    if (Platform.OS === "ios") {
      showIOSPagePicker({
        currentPageId,
        onSelectPage,
        pages,
        userInterfaceStyle: isDark ? "dark" : "light"
      });
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
            <View style={styles.sheetRows}>
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
            </View>
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
