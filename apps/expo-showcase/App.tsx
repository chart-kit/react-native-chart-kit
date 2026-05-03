import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  useWindowDimensions,
  View
} from "react-native";

import {
  ChartKitProvider,
  resolveCartesianChartThemeConfig
} from "@chart-kit/react-native-v2";

import { styles } from "./src/appStyles";
import {
  ShowcaseMode,
  ShowcasePage,
  ShowcaseStory,
  showcaseModes,
  stories,
  storyFeatureTags
} from "./src/storyRegistry";
import {
  showcaseCustomPresets,
  showcaseModeOptions,
  showcasePresetOptions,
  type ShowcasePresetId,
  type ShowcaseThemeMode
} from "./src/showcaseTheme";

const defaultStory =
  stories.find((story) => story.id === "v2-basic") ?? stories[0];
const defaultMode = showcaseModes[0];

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
  const [themeMode, setThemeMode] = useState<ShowcaseThemeMode>("light");
  const [chartPreset, setChartPreset] = useState<ShowcasePresetId>("default");
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
