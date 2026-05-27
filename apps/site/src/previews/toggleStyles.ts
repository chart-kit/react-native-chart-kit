export const toggleStyles = {
  toggle: {
    alignItems: "center" as const,
    borderRadius: 999,
    borderStyle: "solid" as const,
    borderWidth: 1,
    flexDirection: "row" as const,
    gap: 6,
    height: 28,
    justifyContent: "center" as const,
    paddingBottom: 0,
    paddingHorizontal: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 0
  },
  toggleDark: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.12)"
  },
  toggleLight: {
    backgroundColor: "rgba(16, 18, 23, 0.03)",
    borderColor: "rgba(16, 18, 23, 0.12)"
  },
  toggleRow: {
    alignItems: "center" as const,
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 12
  },
  toggleSwatch: {
    borderRadius: 999,
    height: 7,
    width: 7
  },
  toggleSwatchInactive: {
    opacity: 0.34
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0,
    lineHeight: 14
  },
  toggleTextActiveDark: {
    color: "#f7f8f8"
  },
  toggleTextActiveLight: {
    color: "#101217"
  },
  toggleTextInactiveDark: {
    color: "#8f96a3"
  },
  toggleTextInactiveLight: {
    color: "#697182"
  }
};
