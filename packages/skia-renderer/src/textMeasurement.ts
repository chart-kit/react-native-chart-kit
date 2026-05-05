import type {
  SkiaFontLike,
  SkiaMeasuredText,
  SkiaTextMeasurementOptions,
  SkiaTextMeasurer
} from "./types";

const fallbackMeasureText = (
  text: string,
  options: SkiaTextMeasurementOptions = {}
): SkiaMeasuredText => {
  const fontSize = options.fontSize ?? 12;
  const width = Math.min(
    options.maxWidth ?? Number.POSITIVE_INFINITY,
    text.length * fontSize * 0.58
  );

  return {
    height: options.lineHeight ?? fontSize * 1.2,
    width
  };
};

export const createSkiaTextMeasurer = (
  font?: SkiaFontLike
): SkiaTextMeasurer => {
  if (!font?.measureText) {
    return fallbackMeasureText;
  }

  return (text, options = {}) => {
    const measured = font.measureText?.(text);
    const fontSize = options.fontSize ?? font.getSize?.() ?? 12;

    return {
      height: measured?.height ?? options.lineHeight ?? fontSize * 1.2,
      width: Math.min(
        options.maxWidth ?? Number.POSITIVE_INFINITY,
        measured?.width ?? fallbackMeasureText(text, options).width
      )
    };
  };
};
