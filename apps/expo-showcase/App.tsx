import React, { useMemo, useState } from "react";
import {
  Platform,
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
  getShowcasePageStoryGroups,
  getShowcasePageStoryIds,
  publicChartMode,
  showcaseModes,
  stories,
  storyFeatureTags
} from "./src/storyRegistry";
import {
  showcaseCustomPresets,
  type ShowcasePresetId,
  type ShowcaseThemeMode
} from "./src/showcaseTheme";
import { ShowcaseMenu } from "./src/ShowcaseMenu";

const defaultStory =
  stories.find((story) => story.id === "v2-basic") ?? stories[0];
const defaultMode = publicChartMode;
const allShowcaseModes = [publicChartMode, ...showcaseModes];

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

const getInitialThemeMode = (): ShowcaseThemeMode => {
  const theme = getWebSearchParams()?.get("theme");

  return theme === "dark" ? "dark" : "light";
};

const getInitialPreset = (): ShowcasePresetId => {
  const preset = getWebSearchParams()?.get("preset");

  return preset === "analytics" ||
    preset === "fintech" ||
    preset === "health" ||
    preset === "minimal" ||
    preset === "highContrast" ||
    preset === "studio"
    ? preset
    : "default";
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

  for (const mode of allShowcaseModes) {
    for (const page of mode.pages) {
      if (getShowcasePageStoryIds(page).includes(storyId)) {
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
    allShowcaseModes.find((currentMode) => currentMode.id === viewId) ??
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
  const [themeMode] = useState<ShowcaseThemeMode>(getInitialThemeMode);
  const [chartPreset] = useState<ShowcasePresetId>(getInitialPreset);
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

  const pageStoryGroups = useMemo(
    () =>
      getShowcasePageStoryGroups(pageSelection.page).map((group) => ({
        ...group,
        stories: group.storyIds
          .map((storyId) => stories.find((story) => story.id === storyId))
          .filter((story): story is ShowcaseStory => story !== undefined)
      })),
    [pageSelection.page]
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
    setPageSelection(selection);
    updateShowcaseUrl(selection, isVisualMode);
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
          <ShowcaseMenu
            appTheme={appTheme}
            currentPageId={pageSelection.page.id}
            isDark={isDarkApp}
            onSelectPage={(page) => selectPage({ mode: publicChartMode, page })}
            pages={publicChartMode.pages}
          />
        </View>

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

              {pageStoryGroups.map((group) => (
                <View key={group.id} style={styles.storyGroup}>
                  {group.title ? (
                    <View style={styles.storyGroupHeader}>
                      <Text
                        style={[
                          styles.storyGroupTitle,
                          { color: appTheme.text }
                        ]}
                      >
                        {group.title}
                      </Text>
                      {group.description ? (
                        <Text
                          style={[
                            styles.storyGroupDescription,
                            { color: appTheme.mutedText }
                          ]}
                        >
                          {group.description}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                  <View style={styles.storyGrid}>
                    {group.stories.map((story) => {
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
              ))}
            </View>
          </ChartKitProvider>
        </ScrollView>
      </View>
    </View>
  );
}
