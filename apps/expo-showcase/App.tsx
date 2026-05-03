import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";

import {
  ChartKitProvider,
  createChartPreset,
  resolveCartesianChartThemeConfig,
  type CartesianChartPresetName,
  type CartesianChartPresetRegistry,
  type ResolvedChartKitThemeMode
} from "@chart-kit/react-native-v2";

import {
  ShowcaseMode,
  ShowcasePage,
  ShowcaseStory,
  showcaseModes,
  stories,
  storyFeatureTags
} from "./src/storyRegistry";

const defaultStory =
  stories.find((story) => story.id === "v2-basic") ?? stories[0];
const defaultMode = showcaseModes[0];
const showcaseModeOptions: Array<{
  id: ResolvedChartKitThemeMode;
  title: string;
}> = [
  { id: "light", title: "Light" },
  { id: "dark", title: "Dark" }
];
const showcasePresetOptions: Array<{
  id: CartesianChartPresetName | "studio";
  title: string;
}> = [
  { id: "default", title: "Default" },
  { id: "analytics", title: "Analytics" },
  { id: "fintech", title: "Fintech" },
  { id: "health", title: "Health" },
  { id: "minimal", title: "Minimal" },
  { id: "highContrast", title: "High Contrast" },
  { id: "studio", title: "Studio" }
];
const showcaseCustomPresets: CartesianChartPresetRegistry = {
  studio: createChartPreset({
    light: {
      background: "#fffdf8",
      plotBackground: "#ffffff",
      grid: "#eadfca",
      axis: "#dccdaf",
      text: "#18130c",
      mutedText: "#7a6748",
      series: ["#a16207", "#be123c", "#0369a1", "#4d7c0f"],
      typography: {
        axisLabelSize: 11,
        legendLabelSize: 12
      }
    },
    dark: {
      background: "#18130c",
      plotBackground: "#22190f",
      grid: "#574124",
      axis: "#765b34",
      text: "#fff7ed",
      mutedText: "#dbc6a0",
      series: ["#fbbf24", "#fb7185", "#38bdf8", "#a3e635"],
      typography: {
        axisLabelSize: 11,
        legendLabelSize: 12
      }
    }
  })
};

const isWebRuntime = Platform.OS === "web" && typeof window !== "undefined";

const getWebSearchParams = () => {
  if (!isWebRuntime) {
    return null;
  }

  return new URLSearchParams(window.location.search);
};

const getInitialStory = () => {
  const storyId = getWebSearchParams()?.get("story");

  return stories.find((story) => story.id === storyId) ?? defaultStory;
};

const getInitialVisualMode = () => {
  const params = getWebSearchParams();

  return params?.get("visual") === "1" || params?.get("mode") === "visual";
};

type PageSelection = {
  mode: ShowcaseMode;
  page: ShowcasePage;
};

const getPageSelectionForStory = (
  storyId: string | null | undefined
): PageSelection | undefined => {
  if (!storyId) {
    return undefined;
  }

  for (const mode of showcaseModes) {
    for (const page of mode.pages) {
      if (page.storyIds.includes(storyId)) {
        return { mode, page };
      }
    }
  }

  return undefined;
};

const getPageSelection = ({
  pageId,
  storyId,
  viewId
}: {
  pageId?: string | null;
  storyId?: string | null;
  viewId?: string | null;
}): PageSelection => {
  const storySelection = getPageSelectionForStory(storyId);

  if (storySelection) {
    return storySelection;
  }

  const mode =
    showcaseModes.find((currentMode) => currentMode.id === viewId) ??
    defaultMode;
  const page =
    mode.pages.find((currentPage) => currentPage.id === pageId) ??
    mode.pages[0];

  return { mode, page };
};

const getInitialPageSelection = () => {
  const params = getWebSearchParams();

  return getPageSelection({
    pageId: params?.get("page"),
    storyId: params?.get("story"),
    viewId: params?.get("view")
  });
};

const updateShowcaseUrl = (selection: PageSelection, isVisualMode: boolean) => {
  if (!isWebRuntime || isVisualMode) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  params.set("view", selection.mode.id);
  params.set("page", selection.page.id);
  params.delete("story");
  window.history.replaceState(null, "", `?${params.toString()}`);
};

export default function App() {
  const { width } = useWindowDimensions();
  const [isVisualMode] = useState(getInitialVisualMode);
  const [visualStory] = useState<ShowcaseStory>(getInitialStory);
  const [pageSelection, setPageSelection] = useState<PageSelection>(
    getInitialPageSelection
  );
  const [themeMode, setThemeMode] =
    useState<ResolvedChartKitThemeMode>("light");
  const [chartPreset, setChartPreset] = useState<
    CartesianChartPresetName | "studio"
  >("default");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const isDarkApp = themeMode === "dark";
  const appTheme = useMemo(
    () =>
      resolveCartesianChartThemeConfig({
        mode: themeMode,
        preset: chartPreset,
        presets: showcaseCustomPresets
      }),
    [chartPreset, themeMode]
  );
  const selectedControlColor = appTheme.series[0] ?? appTheme.text;
  const selectedControlTextColor = appTheme.background;

  const pageStories = useMemo(
    () =>
      pageSelection.page.storyIds
        .map((storyId) => stories.find((story) => story.id === storyId))
        .filter((story): story is ShowcaseStory => story !== undefined),
    [pageSelection.page.storyIds]
  );

  const isWideLayout = width >= 860;
  const previewWidth = Math.max(
    280,
    Math.min(width - 40, isWideLayout ? 940 : 430)
  );
  const storyGap = 16;
  const storyBlockWidth = isWideLayout
    ? Math.floor((previewWidth - storyGap) / 2)
    : previewWidth;
  const chartWidth = Math.max(256, storyBlockWidth);
  const VisualStoryComponent = visualStory.Component;

  const selectPage = (selection: PageSelection) => {
    setIsScrubbing(false);
    setIsSettingsOpen(false);
    setPageSelection(selection);
    updateShowcaseUrl(selection, isVisualMode);
  };

  const selectMode = (mode: ShowcaseMode) => {
    selectPage({ mode, page: mode.pages[0] });
  };

  if (isVisualMode) {
    const visualWidth = Math.min(previewWidth, 430);

    return (
      <View style={styles.visualRoot}>
        <View
          testID="visual-frame"
          style={[styles.visualFrame, { width: visualWidth }]}
        >
          <VisualStoryComponent width={visualWidth} isVisualMode />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { backgroundColor: appTheme.background }]}>
      <StatusBar barStyle={isDarkApp ? "light-content" : "dark-content"} />
      <View style={styles.appShell}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.eyebrow, { color: appTheme.mutedText }]}>
              React Native Chart Kit
            </Text>
            <Text style={[styles.title, { color: appTheme.text }]}>
              Showcase
            </Text>
          </View>
          <Pressable
            accessibilityLabel={
              isSettingsOpen ? "Hide preview settings" : "Show preview settings"
            }
            accessibilityRole="button"
            accessibilityState={{ expanded: isSettingsOpen }}
            onPress={() => setIsSettingsOpen((current) => !current)}
            style={({ pressed }) => [
              styles.settingsButton,
              {
                backgroundColor: isSettingsOpen
                  ? selectedControlColor
                  : appTheme.text
              },
              pressed && styles.pressed
            ]}
          >
            <Text
              style={[
                styles.settingsButtonIcon,
                { color: selectedControlTextColor }
              ]}
            >
              ⚙
            </Text>
          </Pressable>
        </View>

        {isSettingsOpen ? (
          <View
            style={[
              styles.settingsPanel,
              {
                backgroundColor: appTheme.plotBackground,
                borderColor: appTheme.axis
              }
            ]}
          >
            <View style={styles.settingsGroup}>
              <Text
                style={[styles.settingsLabel, { color: appTheme.mutedText }]}
              >
                Browse
              </Text>
              <View style={styles.settingsOptions}>
                {showcaseModes.map((mode) => {
                  const isSelected = pageSelection.mode.id === mode.id;

                  return (
                    <Pressable
                      key={mode.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => selectMode(mode)}
                      style={({ pressed }) => [
                        styles.settingsOption,
                        {
                          backgroundColor: isSelected
                            ? selectedControlColor
                            : appTheme.background,
                          borderColor: isSelected
                            ? selectedControlColor
                            : appTheme.axis
                        },
                        pressed && styles.pressed
                      ]}
                    >
                      <Text
                        style={[
                          styles.settingsOptionText,
                          {
                            color: isSelected
                              ? selectedControlTextColor
                              : appTheme.text
                          }
                        ]}
                      >
                        {mode.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.settingsGroup}>
              <Text
                style={[styles.settingsLabel, { color: appTheme.mutedText }]}
              >
                Page
              </Text>
              <View style={styles.settingsOptions}>
                {pageSelection.mode.pages.map((page) => {
                  const isSelected = pageSelection.page.id === page.id;

                  return (
                    <Pressable
                      key={page.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() =>
                        selectPage({ mode: pageSelection.mode, page })
                      }
                      style={({ pressed }) => [
                        styles.settingsOption,
                        {
                          backgroundColor: isSelected
                            ? selectedControlColor
                            : appTheme.background,
                          borderColor: isSelected
                            ? selectedControlColor
                            : appTheme.axis
                        },
                        pressed && styles.pressed
                      ]}
                    >
                      <Text
                        style={[
                          styles.settingsOptionText,
                          {
                            color: isSelected
                              ? selectedControlTextColor
                              : appTheme.text
                          }
                        ]}
                      >
                        {page.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.settingsGroup}>
              <Text
                style={[styles.settingsLabel, { color: appTheme.mutedText }]}
              >
                Appearance
              </Text>
              <View style={styles.settingsOptions}>
                {showcaseModeOptions.map((option) => {
                  const isSelected = themeMode === option.id;

                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setThemeMode(option.id)}
                      style={({ pressed }) => [
                        styles.settingsOption,
                        {
                          backgroundColor: isSelected
                            ? selectedControlColor
                            : appTheme.background,
                          borderColor: isSelected
                            ? selectedControlColor
                            : appTheme.axis
                        },
                        pressed && styles.pressed
                      ]}
                    >
                      <Text
                        style={[
                          styles.settingsOptionText,
                          {
                            color: isSelected
                              ? selectedControlTextColor
                              : appTheme.text
                          }
                        ]}
                      >
                        {option.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.settingsGroup}>
              <Text
                style={[styles.settingsLabel, { color: appTheme.mutedText }]}
              >
                Theme
              </Text>
              <View style={styles.settingsOptions}>
                {showcasePresetOptions.map((option) => {
                  const isSelected = chartPreset === option.id;

                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setChartPreset(option.id)}
                      style={({ pressed }) => [
                        styles.settingsOption,
                        {
                          backgroundColor: isSelected
                            ? selectedControlColor
                            : appTheme.background,
                          borderColor: isSelected
                            ? selectedControlColor
                            : appTheme.axis
                        },
                        pressed && styles.pressed
                      ]}
                    >
                      <Text
                        style={[
                          styles.settingsOptionText,
                          {
                            color: isSelected
                              ? selectedControlTextColor
                              : appTheme.text
                          }
                        ]}
                      >
                        {option.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        ) : null}

        <ScrollView
          testID="preview-scroll"
          style={styles.previewScroll}
          contentContainerStyle={styles.previewContent}
          scrollEnabled={!isScrubbing}
          showsVerticalScrollIndicator
        >
          <ChartKitProvider
            mode={themeMode}
            preset={chartPreset}
            presets={showcaseCustomPresets}
          >
            <View style={[styles.pageContent, { width: previewWidth }]}>
              <View style={styles.pageIntro}>
                <Text
                  style={[styles.pageKicker, { color: appTheme.mutedText }]}
                >
                  {pageSelection.mode.title}
                </Text>
                <Text style={[styles.pageTitle, { color: appTheme.text }]}>
                  {pageSelection.page.title}
                </Text>
                <Text
                  style={[
                    styles.pageDescription,
                    { color: appTheme.mutedText }
                  ]}
                >
                  {pageSelection.page.description}
                </Text>
              </View>

              <View style={styles.storyGrid}>
                {pageStories.map((story) => {
                  const StoryComponent = story.Component;
                  const tags = storyFeatureTags[story.id] ?? [];

                  return (
                    <View
                      key={story.id}
                      style={[
                        styles.storyBlock,
                        { borderTopColor: appTheme.grid },
                        { width: storyBlockWidth }
                      ]}
                    >
                      <StoryComponent
                        width={chartWidth}
                        onScrubStart={() => setIsScrubbing(true)}
                        onScrubEnd={() => setIsScrubbing(false)}
                      />
                      {tags.length > 0 ? (
                        <Text
                          style={[
                            styles.featureTags,
                            { color: appTheme.mutedText }
                          ]}
                        >
                          {tags.join(" / ")}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          </ChartKitProvider>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  visualRoot: {
    alignItems: "center",
    backgroundColor: "#f4f7fb",
    justifyContent: "center",
    minHeight: "100%",
    padding: 24
  },
  visualFrame: {
    maxWidth: 430
  },
  safeArea: {
    backgroundColor: "#f4f7fb",
    flex: 1,
    paddingTop:
      Platform.OS === "ios" ? 54 : Math.max(StatusBar.currentHeight ?? 0, 24)
  },
  appShell: {
    alignSelf: "center",
    flex: 1,
    maxWidth: 972,
    paddingHorizontal: 16,
    width: "100%"
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18
  },
  headerText: {
    flexShrink: 1
  },
  eyebrow: {
    color: "#526176",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  title: {
    color: "#101828",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 2
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 44
  },
  settingsButtonIcon: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 24
  },
  settingsPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ef",
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    marginBottom: 14,
    padding: 12
  },
  settingsGroup: {
    gap: 7
  },
  settingsLabel: {
    color: "#526176",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  settingsOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  settingsOption: {
    backgroundColor: "#f8fafc",
    borderColor: "#d9e2ef",
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  settingsOptionText: {
    color: "#344054",
    fontSize: 12,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.72
  },
  previewScroll: {
    flex: 1,
    marginHorizontal: -16
  },
  previewContent: {
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 16
  },
  pageContent: {
    maxWidth: 940
  },
  pageIntro: {
    marginBottom: 14
  },
  pageKicker: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  pageTitle: {
    color: "#101828",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 3
  },
  pageDescription: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 5
  },
  storyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 20
  },
  storyBlock: {
    borderTopColor: "#e6edf6",
    borderTopWidth: 1,
    gap: 12,
    paddingBottom: 22,
    paddingTop: 24
  },
  featureTags: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
    paddingHorizontal: 2
  }
});
