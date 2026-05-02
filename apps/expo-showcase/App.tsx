import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";

import {
  ShowcaseSection,
  ShowcaseStory,
  stories,
  storySections
} from "./src/storyRegistry";

const initialStory =
  stories.find((story) => story.id === "v2-basic") ?? stories[0];

export default function App() {
  const [selectedStory, setSelectedStory] =
    useState<ShowcaseStory>(initialStory);

  const selectedSection = useMemo(
    () =>
      storySections.find((section) =>
        section.stories.some((story) => story.id === selectedStory.id)
      ),
    [selectedStory.id]
  );

  const StoryComponent = selectedStory.Component;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.appShell}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>React Native Chart Kit</Text>
            <Text style={styles.title}>Showcase</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{stories.length}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <ScrollView
            style={styles.sidebar}
            contentContainerStyle={styles.sidebarContent}
            showsVerticalScrollIndicator={false}
          >
            {storySections.map((section) => (
              <StorySection
                key={section.id}
                section={section}
                selectedStoryId={selectedStory.id}
                onSelect={setSelectedStory}
              />
            ))}
          </ScrollView>

          <View style={styles.previewPanel}>
            <View style={styles.previewHeader}>
              <View>
                <Text style={styles.previewSection}>
                  {selectedSection?.title ?? "Chart"}
                </Text>
                <Text style={styles.previewTitle}>{selectedStory.title}</Text>
              </View>
            </View>

            <ScrollView
              style={styles.previewScroll}
              contentContainerStyle={styles.previewScrollContent}
              showsVerticalScrollIndicator
            >
              <ScrollView
                horizontal
                contentContainerStyle={styles.storyCanvas}
                showsHorizontalScrollIndicator
              >
                <StoryComponent />
              </ScrollView>
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type StorySectionProps = {
  section: ShowcaseSection;
  selectedStoryId: string;
  onSelect: (story: ShowcaseStory) => void;
};

const StorySection = ({
  section,
  selectedStoryId,
  onSelect
}: StorySectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{section.title}</Text>
    <View style={styles.storyList}>
      {section.stories.map((story) => {
        const isSelected = selectedStoryId === story.id;

        return (
          <Pressable
            key={story.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(story)}
            style={({ pressed }) => [
              styles.storyButton,
              isSelected && styles.storyButtonSelected,
              pressed && styles.storyButtonPressed
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
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#f4f7fb",
    flex: 1
  },
  appShell: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 2
  },
  eyebrow: {
    color: "#526176",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  title: {
    color: "#101828",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    minWidth: 48,
    paddingHorizontal: 12
  },
  countText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800"
  },
  body: {
    flex: 1
  },
  sidebar: {
    flexGrow: 0,
    maxHeight: 250
  },
  sidebarContent: {
    paddingBottom: 8
  },
  section: {
    marginBottom: 13
  },
  sectionTitle: {
    color: "#344054",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8
  },
  storyList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  storyButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ef",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 8
  },
  storyButtonSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb"
  },
  storyButtonPressed: {
    opacity: 0.72
  },
  storyButtonText: {
    color: "#344054",
    fontSize: 13,
    fontWeight: "700"
  },
  storyButtonTextSelected: {
    color: "#1d4ed8"
  },
  previewPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dde6f2",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    marginBottom: 12,
    overflow: "hidden"
  },
  previewHeader: {
    borderBottomColor: "#e4ebf4",
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  previewSection: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  previewTitle: {
    color: "#101828",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2
  },
  previewScroll: {
    backgroundColor: "#e9eff7",
    flex: 1
  },
  previewScrollContent: {
    minHeight: "100%"
  },
  storyCanvas: {
    minHeight: "100%",
    minWidth: "100%"
  }
});
