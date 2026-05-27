import type {
  SvgMeasuredText,
  SvgTextMeasurementOptions,
  SvgTextMeasurer
} from "./types";

const DEFAULT_FONT_SIZE = 12;
const DEFAULT_WIDTH_FACTOR = 0.56;
const BOLD_WIDTH_FACTOR = 0.6;

const isBold = (fontWeight: SvgTextMeasurementOptions["fontWeight"]) => {
  if (fontWeight === undefined || fontWeight === "normal") {
    return false;
  }

  if (fontWeight === "bold") {
    return true;
  }

  return Number(fontWeight) >= 600;
};

export const measureSvgTextFallback = (
  text: string,
  options: SvgTextMeasurementOptions = {}
): SvgMeasuredText => {
  const fontSize = options.fontSize ?? DEFAULT_FONT_SIZE;
  const lineHeight = options.lineHeight ?? fontSize * 1.2;
  const letterSpacing = options.letterSpacing ?? 0;
  const widthFactor = isBold(options.fontWeight)
    ? BOLD_WIDTH_FACTOR
    : DEFAULT_WIDTH_FACTOR;
  const lines = text.length > 0 ? text.split("\n") : [""];
  const rawWidth = lines.reduce((max, line) => {
    const spacing = Math.max(0, line.length - 1) * letterSpacing;
    return Math.max(max, line.length * fontSize * widthFactor + spacing);
  }, 0);

  return {
    width:
      options.maxWidth === undefined
        ? rawWidth
        : Math.min(rawWidth, options.maxWidth),
    height: lines.length * lineHeight
  };
};

export const createSvgTextMeasurer = (
  defaults: SvgTextMeasurementOptions = {}
): SvgTextMeasurer => {
  return (text, options = {}) =>
    measureSvgTextFallback(text, {
      ...defaults,
      ...options
    });
};
