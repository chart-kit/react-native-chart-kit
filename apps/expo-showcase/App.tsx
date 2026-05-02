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
  const [isScrubbing, setIsScrubbing] = useState(false);
  const isDarkApp = themeMode === "dark";

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
  const chartWidth = Math.max(256, storyBlockWidth - 24);
  const VisualStoryComponent = visualStory.Component;

  const selectPage = (selection: PageSelection) => {
    setIsScrubbing(false);
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
          <VisualStoryComponent width={visualWidth - 24} isVisualMode />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, isDarkApp && styles.safeAreaDark]}>
      <StatusBar barStyle={isDarkApp ? "light-content" : "dark-content"} />
      <View style={styles.appShell}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.eyebrow, isDarkApp && styles.darkEyebrow]}>
              React Native Chart Kit
            </Text>
            <Text style={[styles.title, isDarkApp && styles.darkTitle]}>
              Showcase
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{pageStories.length}</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          style={styles.modeTabsScroller}
          contentContainerStyle={styles.modeTabs}
          showsHorizontalScrollIndicator={false}
        >
          {showcaseModes.map((mode) => {
            const isSelected = pageSelection.mode.id === mode.id;

            return (
              <Pressable
                key={mode.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => selectMode(mode)}
                style={({ pressed }) => [
                  styles.modeTab,
                  isDarkApp && styles.navButtonDark,
                  isSelected && styles.modeTabSelected,
                  pressed && styles.pressed
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    isDarkApp && styles.navButtonTextDark,
                    isSelected && styles.modeTabTextSelected
                  ]}
                >
                  {mode.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View
          style={[styles.themeControls, isDarkApp && styles.themeControlsDark]}
        >
          <View style={styles.themeControlGroup}>
            <Text
              style={[
                styles.themeControlLabel,
                isDarkApp && styles.themeControlLabelDark
              ]}
            >
              Mode
            </Text>
            <View style={styles.segmentedControl}>
              {showcaseModeOptions.map((option) => {
                const isSelected = themeMode === option.id;

                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setThemeMode(option.id)}
                    style={({ pressed }) => [
                      styles.segmentButton,
                      isDarkApp && styles.segmentButtonDark,
                      isSelected && styles.segmentButtonSelected,
                      pressed && styles.pressed
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentButtonText,
                        isDarkApp && styles.segmentButtonTextDark,
                        isSelected && styles.segmentButtonTextSelected
                      ]}
                    >
                      {option.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.themeControlGroup, styles.presetControlGroup]}>
            <Text
              style={[
                styles.themeControlLabel,
                isDarkApp && styles.themeControlLabelDark
              ]}
            >
              Preset
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetOptions}
            >
              {showcasePresetOptions.map((option) => {
                const isSelected = chartPreset === option.id;

                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setChartPreset(option.id)}
                    style={({ pressed }) => [
                      styles.segmentButton,
                      isDarkApp && styles.segmentButtonDark,
                      isSelected && styles.segmentButtonSelected,
                      pressed && styles.pressed
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentButtonText,
                        isDarkApp && styles.segmentButtonTextDark,
                        isSelected && styles.segmentButtonTextSelected
                      ]}
                    >
                      {option.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <ScrollView
          horizontal
          style={styles.pageTabsScroller}
          contentContainerStyle={styles.pageTabs}
          showsHorizontalScrollIndicator={false}
        >
          {pageSelection.mode.pages.map((page) => {
            const isSelected = pageSelection.page.id === page.id;

            return (
              <Pressable
                key={page.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => selectPage({ mode: pageSelection.mode, page })}
                style={({ pressed }) => [
                  styles.pageButton,
                  isDarkApp && styles.navButtonDark,
                  isSelected && styles.pageButtonSelected,
                  pressed && styles.pressed
                ]}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    isDarkApp && styles.navButtonTextDark,
                    isSelected && styles.pageButtonTextSelected
                  ]}
                >
                  {page.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
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
                  style={[
                    styles.pageKicker,
                    isDarkApp && styles.pageKickerDark
                  ]}
                >
                  {pageSelection.mode.title}
                </Text>
                <Text
                  style={[styles.pageTitle, isDarkApp && styles.pageTitleDark]}
                >
                  {pageSelection.page.title}
                </Text>
                <Text
                  style={[
                    styles.pageDescription,
                    isDarkApp && styles.pageDescriptionDark
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
                      style={[styles.storyBlock, { width: storyBlockWidth }]}
                    >
                      <StoryComponent
                        width={chartWidth}
                        onScrubStart={() => setIsScrubbing(true)}
                        onScrubEnd={() => setIsScrubbing(false)}
                      />
                      {tags.length > 0 ? (
                        <View style={styles.featureTags}>
                          {tags.map((tag) => (
                            <View
                              key={tag}
                              style={[
                                styles.featureTag,
                                isDarkApp && styles.featureTagDark
                              ]}
                            >
                              <Text
                                style={[
                                  styles.featureTagText,
                                  isDarkApp && styles.featureTagTextDark
                                ]}
                              >
                                {tag}
                              </Text>
                            </View>
                          ))}
                        </View>
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
  safeAreaDark: {
    backgroundColor: "#050914"
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
  darkEyebrow: {
    color: "#8fa2bd"
  },
  title: {
    color: "#101828",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 2
  },
  darkTitle: {
    color: "#f8fafc"
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    minWidth: 58,
    paddingHorizontal: 14
  },
  countText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900"
  },
  modeTabsScroller: {
    flexGrow: 0,
    height: 48,
    marginBottom: 6
  },
  modeTabs: {
    alignItems: "center",
    gap: 8,
    height: 48
  },
  modeTab: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ef",
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  navButtonDark: {
    backgroundColor: "#101827",
    borderColor: "#223149"
  },
  modeTabSelected: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a"
  },
  modeTabText: {
    color: "#344054",
    fontSize: 13,
    fontWeight: "800"
  },
  navButtonTextDark: {
    color: "#dbe7f7"
  },
  modeTabTextSelected: {
    color: "#ffffff"
  },
  themeControls: {
    backgroundColor: "#eaf1fa",
    borderColor: "#d8e3f1",
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
    padding: 10
  },
  themeControlsDark: {
    backgroundColor: "#0b1220",
    borderColor: "#1f2d44"
  },
  themeControlGroup: {
    gap: 6
  },
  presetControlGroup: {
    marginRight: -10
  },
  themeControlLabel: {
    color: "#526176",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  themeControlLabelDark: {
    color: "#8fa2bd"
  },
  segmentedControl: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  presetOptions: {
    gap: 6,
    paddingRight: 10
  },
  segmentButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d1ddea",
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  segmentButtonDark: {
    backgroundColor: "#111827",
    borderColor: "#2a3950"
  },
  segmentButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb"
  },
  segmentButtonText: {
    color: "#344054",
    fontSize: 12,
    fontWeight: "900"
  },
  segmentButtonTextDark: {
    color: "#dbe7f7"
  },
  segmentButtonTextSelected: {
    color: "#ffffff"
  },
  pageTabsScroller: {
    flexGrow: 0,
    height: 54,
    marginBottom: 12
  },
  pageTabs: {
    alignItems: "center",
    gap: 8,
    height: 54
  },
  pageButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ef",
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 13
  },
  pageButtonSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb"
  },
  pageButtonText: {
    color: "#344054",
    fontSize: 14,
    fontWeight: "800"
  },
  pageButtonTextSelected: {
    color: "#1d4ed8"
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
  pageKickerDark: {
    color: "#8fa2bd"
  },
  pageTitle: {
    color: "#101828",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 3
  },
  pageTitleDark: {
    color: "#f8fafc"
  },
  pageDescription: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 5
  },
  pageDescriptionDark: {
    color: "#b7c5d8"
  },
  storyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16
  },
  storyBlock: {
    gap: 8
  },
  featureTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 4
  },
  featureTag: {
    backgroundColor: "#e8eef7",
    borderColor: "#d6e0ec",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  featureTagDark: {
    backgroundColor: "#111827",
    borderColor: "#2a3950"
  },
  featureTagText: {
    color: "#344054",
    fontSize: 11,
    fontWeight: "800"
  },
  featureTagTextDark: {
    color: "#cbd5e1"
  }
});
