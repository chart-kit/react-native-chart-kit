import { Platform, StatusBar, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
    marginBottom: 8
  },
  pageTitle: {
    color: "#101828",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 3
  },
  storyGroup: {
    gap: 8,
    marginTop: 16
  },
  storyGroupHeader: {
    maxWidth: 620
  },
  storyGroupTitle: {
    color: "#101828",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0
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
    paddingTop: 20
  },
  featureTags: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
    paddingHorizontal: 2
  }
});
