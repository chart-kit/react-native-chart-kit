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

import { ShowcaseStory, stories, storySections } from "./src/storyRegistry";

const defaultStory =
  stories.find((story) => story.id === "v2-basic") ?? stories[0];

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

const updateStoryUrl = (story: ShowcaseStory, isVisualMode: boolean) => {
  if (!isWebRuntime || isVisualMode) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  params.set("story", story.id);
  window.history.replaceState(null, "", `?${params.toString()}`);
};

export default function App() {
  const { width } = useWindowDimensions();
  const [isVisualMode] = useState(getInitialVisualMode);
  const [selectedStory, setSelectedStory] =
    useState<ShowcaseStory>(getInitialStory);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const selectedSection = useMemo(
    () =>
      storySections.find((section) =>
        section.stories.some((story) => story.id === selectedStory.id)
      ) ?? storySections[0],
    [selectedStory.id]
  );

  const previewWidth = Math.max(280, Math.min(width - 40, 430));
  const StoryComponent = selectedStory.Component;
  const selectStory = (story: ShowcaseStory) => {
    setIsScrubbing(false);
    setSelectedStory(story);
    updateStoryUrl(story, isVisualMode);
  };

  if (isVisualMode) {
    return (
      <View style={styles.visualRoot}>
        <View
          testID="visual-frame"
          style={[styles.visualFrame, { width: previewWidth }]}
        >
          <StoryComponent width={previewWidth - 24} isVisualMode />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.appShell}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>React Native Chart Kit</Text>
            <Text style={styles.title}>Showcase</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{stories.length}</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          style={styles.sectionTabsScroller}
          contentContainerStyle={styles.sectionTabs}
          showsHorizontalScrollIndicator={false}
        >
          {storySections.map((section) => {
            const isSelected = selectedSection?.id === section.id;

            return (
              <Pressable
                key={section.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => selectStory(section.stories[0])}
                style={({ pressed }) => [
                  styles.sectionTab,
                  isSelected && styles.sectionTabSelected,
                  pressed && styles.pressed
                ]}
              >
                <Text
                  style={[
                    styles.sectionTabText,
                    isSelected && styles.sectionTabTextSelected
                  ]}
                >
                  {section.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {selectedSection ? (
          <ScrollView
            horizontal
            style={styles.storyTabsScroller}
            contentContainerStyle={styles.storyTabs}
            showsHorizontalScrollIndicator={false}
          >
            {selectedSection.stories.map((story) => {
              const isSelected = selectedStory.id === story.id;

              return (
                <Pressable
                  key={story.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => selectStory(story)}
                  style={({ pressed }) => [
                    styles.storyButton,
                    isSelected && styles.storyButtonSelected,
                    pressed && styles.pressed
                  ]}
                >
                  <Text
                    style={[
                      styles.storyButtonText,
                      isSelected && styles.storyButtonTextSelected
                    ]}
                  >
                    {story.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        <ScrollView
          style={styles.previewScroll}
          contentContainerStyle={styles.previewContent}
          scrollEnabled={!isScrubbing}
          showsVerticalScrollIndicator
        >
          <View style={[styles.previewWidth, { width: previewWidth }]}>
            <StoryComponent
              width={previewWidth - 24}
              onScrubStart={() => setIsScrubbing(true)}
              onScrubEnd={() => setIsScrubbing(false)}
            />
          </View>
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
    flex: 1,
    paddingHorizontal: 16
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
  sectionTabsScroller: {
    flexGrow: 0,
    height: 48,
    marginBottom: 6
  },
  sectionTabs: {
    alignItems: "center",
    gap: 8,
    height: 48
  },
  sectionTab: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ef",
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  sectionTabSelected: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a"
  },
  sectionTabText: {
    color: "#344054",
    fontSize: 13,
    fontWeight: "800"
  },
  sectionTabTextSelected: {
    color: "#ffffff"
  },
  storyTabsScroller: {
    flexGrow: 0,
    height: 54,
    marginBottom: 12
  },
  storyTabs: {
    alignItems: "center",
    gap: 8,
    height: 54
  },
  storyButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ef",
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 13
  },
  storyButtonSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb"
  },
  storyButtonText: {
    color: "#344054",
    fontSize: 14,
    fontWeight: "800"
  },
  storyButtonTextSelected: {
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
  previewWidth: {
    maxWidth: 430
  }
});
