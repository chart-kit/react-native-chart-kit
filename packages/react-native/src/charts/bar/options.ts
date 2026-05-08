import type { ResolvedCartesianChartTheme } from "../../theme/presets";
import type {
  BarChartTooltipConfig,
  ResolvedBarChartTooltipConfig
} from "./types";

export const getBarChartTooltipConfig = ({
  themeTooltip,
  tooltip
}: {
  themeTooltip: ResolvedCartesianChartTheme["tooltip"];
  tooltip: boolean | BarChartTooltipConfig | undefined;
}): ResolvedBarChartTooltipConfig => {
  if (!tooltip) {
    return {
      anchor: "bar",
      backgroundColor: themeTooltip.background,
      borderColor: themeTooltip.border,
      borderRadius: themeTooltip.borderRadius,
      edgePadding: 4,
      fontFamily: undefined,
      fontSize: themeTooltip.fontSize,
      labelColor: themeTooltip.mutedText,
      labelFontSize: themeTooltip.labelFontSize,
      offset: 8,
      padding: themeTooltip.padding,
      placement: "auto",
      positionAnimationDuration: 0,
      shadowColor: themeTooltip.shadowColor,
      shadowOffsetX: themeTooltip.shadowOffsetX,
      shadowOffsetY: themeTooltip.shadowOffsetY,
      shadowOpacity: themeTooltip.shadowOpacity,
      textColor: themeTooltip.text,
      visible: false,
      width: 126
    };
  }

  const config = typeof tooltip === "object" ? tooltip : {};

  return {
    anchor: config.anchor ?? "bar",
    backgroundColor: config.backgroundColor ?? themeTooltip.background,
    borderColor: config.borderColor ?? themeTooltip.border,
    borderRadius: config.borderRadius ?? themeTooltip.borderRadius,
    edgePadding: Math.max(0, config.edgePadding ?? 4),
    fontFamily: config.fontFamily,
    fontSize: config.fontSize ?? themeTooltip.fontSize,
    labelColor: config.labelColor ?? themeTooltip.mutedText,
    labelFontSize: config.labelFontSize ?? themeTooltip.labelFontSize,
    offset: Math.max(0, config.offset ?? 8),
    padding: config.padding ?? themeTooltip.padding,
    placement: config.placement ?? "auto",
    positionAnimationDuration: config.positionAnimationDuration ?? 180,
    shadowColor: config.shadowColor ?? themeTooltip.shadowColor,
    shadowOffsetX: config.shadowOffsetX ?? themeTooltip.shadowOffsetX,
    shadowOffsetY: config.shadowOffsetY ?? themeTooltip.shadowOffsetY,
    shadowOpacity: config.shadowOpacity ?? themeTooltip.shadowOpacity,
    textColor: config.textColor ?? themeTooltip.text,
    visible: config.visible ?? true,
    width: config.width ?? 126
  };
};
