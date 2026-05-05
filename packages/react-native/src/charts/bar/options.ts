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
      backgroundColor: themeTooltip.background,
      borderColor: themeTooltip.border,
      borderRadius: themeTooltip.borderRadius,
      fontFamily: undefined,
      fontSize: themeTooltip.fontSize,
      labelColor: themeTooltip.mutedText,
      labelFontSize: themeTooltip.labelFontSize,
      padding: themeTooltip.padding,
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
    backgroundColor: config.backgroundColor ?? themeTooltip.background,
    borderColor: config.borderColor ?? themeTooltip.border,
    borderRadius: config.borderRadius ?? themeTooltip.borderRadius,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize ?? themeTooltip.fontSize,
    labelColor: config.labelColor ?? themeTooltip.mutedText,
    labelFontSize: config.labelFontSize ?? themeTooltip.labelFontSize,
    padding: config.padding ?? themeTooltip.padding,
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
