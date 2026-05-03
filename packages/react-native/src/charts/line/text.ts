import { createSvgTextMeasurer } from "@chart-kit/svg-renderer";

export const measureLineChartText = createSvgTextMeasurer({
  lineHeight: 14
});

export const getFontFamilyProps = (fontFamily: string | undefined) => {
  return fontFamily ? { fontFamily } : {};
};
