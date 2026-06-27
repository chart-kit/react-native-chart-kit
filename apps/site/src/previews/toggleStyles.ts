export const toggleStyles = {
  toggle: {
    alignItems: "center" as const,
    borderRadius: 999,
    borderStyle: "solid" as const,
    borderWidth: 1,
    display: "flex" as const,
    flexDirection: "row" as const,
    gap: 5,
    height: 28,
    justifyContent: "center" as const,
    minWidth: 88,
    paddingBottom: 0,
    paddingHorizontal: 11,
    paddingLeft: 11,
    paddingRight: 11,
    paddingTop: 0
  },
  toggleDark: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  toggleLight: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  toggleActiveDark: {
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.18)"
  },
  toggleActiveLight: {
    boxShadow: "0 5px 14px rgba(7, 23, 51, 0.07)"
  },
  toggleRow: {
    alignItems: "center" as const,
    alignSelf: "flex-start" as const,
    borderRadius: 999,
    borderStyle: "solid" as const,
    borderWidth: 1,
    display: "flex" as const,
    flexDirection: "row" as const,
    gap: 2,
    marginBottom: 10,
    padding: 2
  },
  toggleRowDark: {
    backgroundColor: "rgba(255, 255, 255, 0.045)",
    borderColor: "rgba(255, 255, 255, 0.12)"
  },
  toggleRowLight: {
    backgroundColor: "rgba(7, 23, 51, 0.045)",
    borderColor: "rgba(7, 23, 51, 0.1)"
  },
  toggleSwatch: {
    borderColor: "rgba(255, 255, 255, 0.48)",
    borderStyle: "solid" as const,
    borderWidth: 1,
    borderRadius: 999,
    height: 6,
    width: 6
  },
  toggleSwatchInactive: {
    opacity: 0.34
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0,
    lineHeight: 13
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
