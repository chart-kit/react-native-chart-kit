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
